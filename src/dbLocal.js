// ─── Local Data Layer (demo) ──────────────────────────────────────────────────
// Speiler API-et i dbSupabase.js nøyaktig, men lagrer i localStorage.
// Formålet er at demoen og live-appen skal kjøre NØYAKTIG samme grensesnitt –
// tidligere fantes det to separate UI-filer som uunngåelig divergerte.
//
// Regel ved endringer: legger du til en funksjon i dbSupabase.js, må den også
// finnes her med samme signatur og samme returform.

import { PHASES } from './constants.js'

const KEY = 'ub_demo_v2'

// ── Lagring ───────────────────────────────────────────────────────────────────

function blank() {
  return { profiles: {}, companies: {}, members: [], tasks: [], assignments: [], crm: [], activities: [], sessionUserId: null }
}

function read() {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw)
  } catch { /* ødelagt lagring – bygg på nytt */ }
  const seeded = seed()
  write(seeded)
  return seeded
}

function write(db) {
  try { localStorage.setItem(KEY, JSON.stringify(db)) } catch { /* full disk e.l. */ }
}

function mutate(fn) {
  const db = read()
  const result = fn(db)
  write(db)
  return result
}

const uid = () => 'd' + Math.random().toString(36).slice(2, 10)
const nowISO = () => new Date().toISOString()
const clone = o => JSON.parse(JSON.stringify(o))

function code6() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

function daysFromNow(n) {
  const d = new Date()
  d.setDate(d.getDate() + n)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

// ── Demodata ──────────────────────────────────────────────────────────────────
// Bevisst satt opp så demoen viser appen i bruk, ikke tom: oppstartsfasen er
// ferdig godkjent (så faselåsing og fasefeiring er synlig), og CRM har både
// vunne og tapte saker (så konverteringskortet har noe å regne på).

function seed() {
  const db = blank()
  const school = 'Vennesla videregående skole'

  const teacher = { id: uid(), name: 'Kari Lærer', role: 'teacher', school, company_id: null, email: 'larer@demo.no' }
  const students = ['Sara Nilsen', 'Jonas Berg', 'Amina Haugen', 'Ola Strand', 'Mia Lie']
    .map((name, i) => ({
      id: uid(), name, role: 'student', school, company_id: null,
      email: `elev${i + 1}@demo.no`,
      memberRole: ['Daglig leder', 'Økonomiansvarlig', 'Markedsansvarlig', 'Produksjonsansvarlig', 'Salgsansvarlig'][i],
    }))

  db.profiles[teacher.id] = teacher
  students.forEach(s => { db.profiles[s.id] = s })

  const company = {
    id: uid(), name: 'ReStil UB', code: code6(), school,
    created_by: students[0].id, created_at: nowISO(),
  }
  db.companies[company.id] = company

  students.forEach(s => {
    s.company_id = company.id
    db.members.push({ id: uid(), company_id: company.id, user_id: s.id, role: s.memberRole })
  })

  // Oppgaver fra PHASES – samme kilde som live-appen bruker ved registrering
  let order = 0
  PHASES.forEach(p => {
    p.defaultTasks.forEach((t, i) => {
      const done = p.id === 'oppstart' || (p.id === 'ideutvikling' && i < 4)
      db.tasks.push({
        id: uid(), company_id: company.id, phase: p.id,
        text: t.text, info: t.info || null, link: t.link || null,
        is_submission: !!t.isSubmission, recurring: !!t.recurring,
        done, done_by: done ? students[i % students.length].name : null,
        // Hele oppstart er godkjent → idéutvikling er åpnet, resten er grå
        approved_by: p.id === 'oppstart' ? teacher.name : null,
        sort_order: order++, created_at: nowISO(),
      })
    })
  })

  // Noen tilordninger så "tildelt deg" ikke er tomt
  db.tasks.filter(t => t.phase === 'ideutvikling').slice(0, 3).forEach((t, i) => {
    db.assignments.push({ task_id: t.id, user_id: students[i].id })
  })

  const mkContact = (name, type, status, value, followupDays, lost) => ({
    id: uid(), company_id: company.id, name, type,
    email: null, phone: null, status,
    note: null, assigned_to: students[Math.floor(Math.random() * students.length)].id,
    value_nok: value, next_followup: followupDays == null ? null : daysFromNow(followupDays),
    last_contact: nowISO(), lost_reason: lost || null, created_at: nowISO(),
  })

  db.crm.push(
    mkContact('Vennesla Sportsklubb', 'Bedrift', 'kunde', 2400, null),
    mkContact('Bakeriet i sentrum', 'Bedrift', 'kunde', 1200, null),
    mkContact('Familien Nilsen', 'Privatperson', 'kunde', 450, null),
    mkContact('Kulturhuset', 'Bedrift', 'tilbud', 3200, 3),
    mkContact('Nabolagsbutikken', 'Bedrift', 'tilbud', 900, -2),
    mkContact('Idrettslaget', 'Bedrift', 'kontaktet', 1500, -5),
    mkContact('Frisøren på hjørnet', 'Bedrift', 'lead', null, 7),
    mkContact('Onkel Per', 'Privatperson', 'lead', null, null),
    mkContact('Byggmester Olsen', 'Bedrift', 'tapt', 5000, null, 'For dyrt'),
    mkContact('Kaféen ved torget', 'Bedrift', 'tapt', 800, null, 'Fikk aldri svar'),
    mkContact('Blomsterbutikken', 'Bedrift', 'tapt', 600, null, 'Fikk aldri svar'),
    mkContact('Tannlegen', 'Bedrift', 'tapt', 1100, null, 'Valgte konkurrent'),
  )

  const first = db.crm[0]
  db.activities.push(
    { id: uid(), contact_id: first.id, company_id: company.id, author_id: students[0].id, author_name: students[0].name, text: 'Ringte og avtalte møte på tirsdag.', created_at: nowISO() },
    { id: uid(), contact_id: first.id, company_id: company.id, author_id: students[4].id, author_name: students[4].name, text: 'Møtte styret. De vil ha 40 stk til sesongstart.', created_at: nowISO() },
  )

  return db
}

// ── Auth ──────────────────────────────────────────────────────────────────────

let authListener = null

function fireAuth(session) {
  if (authListener) authListener(session)
}

export async function signUp({ name, email, password, role, school }) {
  return mutate(db => {
    if (Object.values(db.profiles).some(p => p.email === email)) {
      throw new Error('E-posten er allerede i bruk i demoen.')
    }
    const id = uid()
    db.profiles[id] = { id, name, role, school, company_id: null, email }
    db.sessionUserId = id
    setTimeout(() => fireAuth({ user: { id } }), 0)
    return { id, email }
  })
}

export async function signIn({ email, password }) {
  return mutate(db => {
    const p = Object.values(db.profiles).find(x => x.email === email)
    if (!p) throw new Error('Fant ingen bruker med den e-posten i demoen.')
    db.sessionUserId = p.id
    setTimeout(() => fireAuth({ user: { id: p.id } }), 0)
    return { id: p.id, email }
  })
}

export async function signOut() {
  mutate(db => { db.sessionUserId = null })
  fireAuth(null)
}

export async function getSession() {
  const db = read()

  // Automatisk innlogging via ?demo=1&role=student|teacher
  const role = new URLSearchParams(window.location.search).get('role')
  if (role && !db.sessionUserId) {
    const p = Object.values(db.profiles).find(x => x.role === role)
    if (p) {
      db.sessionUserId = p.id
      write(db)
      return { user: { id: p.id } }
    }
  }

  return db.sessionUserId ? { user: { id: db.sessionUserId } } : null
}

export function onAuthStateChange(callback) {
  authListener = callback
  return { data: { subscription: { unsubscribe: () => { authListener = null } } } }
}

// Passordhåndtering finnes ikke i demoen, men må eksisterte så grensesnittet
// kan kalle den uten særbehandling.
export async function requestPasswordReset() {
  throw new Error('Passord kan ikke tilbakestilles i demoversjonen.')
}

export async function updatePassword() {
  throw new Error('Passord kan ikke endres i demoversjonen.')
}

// ── Profil ────────────────────────────────────────────────────────────────────

export async function getProfile(userId) {
  const db = read()
  const p = db.profiles[userId]
  if (!p) throw new Error('Fant ikke profilen.')
  return clone(p)
}

export async function updateProfile(userId, updates) {
  mutate(db => { Object.assign(db.profiles[userId], updates) })
}

// ── Bedrifter ─────────────────────────────────────────────────────────────────

function withMembers(db, company) {
  return {
    ...clone(company),
    company_members: db.members
      .filter(m => m.company_id === company.id)
      .map(m => ({
        user_id: m.user_id,
        role: m.role,
        profiles: db.profiles[m.user_id] ? clone(db.profiles[m.user_id]) : null,
      })),
  }
}

export async function createCompany({ name, school, userId, memberRole, initialTasks }) {
  return mutate(db => {
    const company = { id: uid(), name, school, code: code6(), created_by: userId, created_at: nowISO() }
    db.companies[company.id] = company
    db.members.push({ id: uid(), company_id: company.id, user_id: userId, role: memberRole })
    if (db.profiles[userId]) db.profiles[userId].company_id = company.id
    ;(initialTasks || []).forEach((t, i) => {
      db.tasks.push({
        id: uid(), company_id: company.id, phase: t.phase, text: t.text,
        info: t.info || null, link: t.link || null,
        is_submission: !!t.isSubmission, recurring: !!t.recurring,
        done: false, done_by: null, approved_by: null,
        sort_order: i, created_at: nowISO(),
      })
    })
    return clone(company)
  })
}

export async function joinCompany({ code, userId, memberRole }) {
  return mutate(db => {
    const company = Object.values(db.companies).find(c => c.code === code.toUpperCase())
    if (!company) throw new Error('Fant ingen bedrift med den koden.')
    if (!db.members.some(m => m.company_id === company.id && m.user_id === userId)) {
      db.members.push({ id: uid(), company_id: company.id, user_id: userId, role: memberRole })
    }
    if (db.profiles[userId]) db.profiles[userId].company_id = company.id
    return clone(company)
  })
}

export async function getCompany(companyId) {
  const db = read()
  const c = db.companies[companyId]
  if (!c) throw new Error('Fant ikke bedriften.')
  return withMembers(db, c)
}

export async function getCompaniesForTeacher(school) {
  const db = read()
  return Object.values(db.companies).filter(c => c.school === school).map(c => withMembers(db, c))
}

export async function updateCompanyName(companyId, name) {
  mutate(db => { if (db.companies[companyId]) db.companies[companyId].name = name })
}

export async function moveStudent({ userId, fromCompanyId, toCompanyId, memberRole = 'Andre stillinger' }) {
  mutate(db => {
    if (fromCompanyId) {
      const oldTaskIds = db.tasks.filter(t => t.company_id === fromCompanyId).map(t => t.id)
      db.assignments = db.assignments.filter(a => !(a.user_id === userId && oldTaskIds.includes(a.task_id)))
      db.crm.forEach(c => {
        if (c.company_id === fromCompanyId && c.assigned_to === userId) c.assigned_to = null
      })
      db.members = db.members.filter(m => !(m.company_id === fromCompanyId && m.user_id === userId))
    }
    if (toCompanyId && !db.members.some(m => m.company_id === toCompanyId && m.user_id === userId)) {
      db.members.push({ id: uid(), company_id: toCompanyId, user_id: userId, role: memberRole })
    }
    if (db.profiles[userId]) db.profiles[userId].company_id = toCompanyId || null
  })
}

// ── Oppgaver ──────────────────────────────────────────────────────────────────

export async function getTasks(companyId) {
  const db = read()
  return db.tasks
    .filter(t => t.company_id === companyId)
    .sort((a, b) => a.phase.localeCompare(b.phase) || a.sort_order - b.sort_order)
    .map(t => ({
      ...clone(t),
      assignedTo: db.assignments.filter(a => a.task_id === t.id).map(a => a.user_id),
    }))
}

export async function getTasksForCompanies(companyIds) {
  if (!companyIds || companyIds.length === 0) return []
  const db = read()
  return db.tasks
    .filter(t => companyIds.includes(t.company_id))
    .map(t => ({ id: t.id, company_id: t.company_id, done: t.done, approved_by: t.approved_by }))
}

export async function addTask({ companyId, phase, text, info = null, link = null, isSubmission = false, sortOrder = 999 }) {
  return mutate(db => {
    const t = {
      id: uid(), company_id: companyId, phase, text, info, link,
      is_submission: isSubmission, recurring: false,
      done: false, done_by: null, approved_by: null,
      sort_order: sortOrder, created_at: nowISO(),
    }
    db.tasks.push(t)
    return { ...clone(t), assignedTo: [] }
  })
}

export async function updateTask(taskId, updates) {
  mutate(db => {
    const { assignedTo, ...fields } = updates
    const t = db.tasks.find(x => x.id === taskId)
    if (t) Object.assign(t, fields)
  })
  return true
}

export async function deleteTask(taskId) {
  mutate(db => {
    db.tasks = db.tasks.filter(t => t.id !== taskId)
    db.assignments = db.assignments.filter(a => a.task_id !== taskId)
  })
}

export async function toggleTaskAssignment(taskId, userId) {
  mutate(db => {
    const i = db.assignments.findIndex(a => a.task_id === taskId && a.user_id === userId)
    if (i >= 0) db.assignments.splice(i, 1)
    else db.assignments.push({ task_id: taskId, user_id: userId })
  })
}

// ── CRM ───────────────────────────────────────────────────────────────────────

export async function getCrmContacts(companyId) {
  const db = read()
  return db.crm
    .filter(c => c.company_id === companyId)
    .sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''))
    .map(clone)
}

// Samme feltavbildning som i dbSupabase.js – camelCase inn, snake_case lagret
function toCrmRow(c) {
  const row = {}
  if (c.name !== undefined) row.name = c.name
  if (c.type !== undefined) row.type = c.type
  if (c.email !== undefined) row.email = c.email || null
  if (c.phone !== undefined) row.phone = c.phone || null
  if (c.status !== undefined) row.status = c.status
  if (c.note !== undefined) row.note = c.note || null
  if (c.assignedTo !== undefined) row.assigned_to = c.assignedTo || null
  if (c.valueNok !== undefined) row.value_nok = c.valueNok === '' || c.valueNok == null ? null : Number(c.valueNok)
  if (c.nextFollowup !== undefined) row.next_followup = c.nextFollowup || null
  if (c.lastContact !== undefined) row.last_contact = c.lastContact || null
  if (c.status !== undefined) row.lost_reason = c.status === 'tapt' ? (c.lostReason || null) : null
  return row
}

export async function upsertCrmContact(companyId, contact) {
  return mutate(db => {
    const { id, previousStatus } = contact
    const row = toCrmRow(contact)
    if (contact.status !== undefined && contact.status !== previousStatus) {
      row.last_contact = nowISO()
    }
    if (id) {
      const c = db.crm.find(x => x.id === id)
      if (!c) throw new Error('Fant ikke kontakten.')
      Object.assign(c, row)
      return clone(c)
    }
    const c = {
      id: uid(), company_id: companyId, created_at: nowISO(),
      name: '', type: 'Privatperson', email: null, phone: null, status: 'lead',
      note: null, assigned_to: null, value_nok: null, next_followup: null,
      last_contact: nowISO(), lost_reason: null,
      ...row,
    }
    db.crm.unshift(c)
    return clone(c)
  })
}

export async function deleteCrmContact(contactId) {
  mutate(db => {
    db.crm = db.crm.filter(c => c.id !== contactId)
    db.activities = db.activities.filter(a => a.contact_id !== contactId)
  })
}

export async function getCrmActivities(contactId) {
  const db = read()
  return db.activities
    .filter(a => a.contact_id === contactId)
    .sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''))
    .map(clone)
}

export async function addCrmActivity({ contactId, companyId, authorId, authorName, text }) {
  return mutate(db => {
    const a = { id: uid(), contact_id: contactId, company_id: companyId, author_id: authorId, author_name: authorName, text, created_at: nowISO() }
    db.activities.push(a)
    const c = db.crm.find(x => x.id === contactId)
    if (c) c.last_contact = nowISO()
    return clone(a)
  })
}

export async function getCrmForCompanies(companyIds) {
  if (!companyIds || companyIds.length === 0) return []
  const db = read()
  return db.crm.filter(c => companyIds.includes(c.company_id)).map(clone)
}

// ── Realtime ──────────────────────────────────────────────────────────────────
// Demoen har én bruker per fane, så det finnes ingen endringer utenfra å lytte
// på. Vi returnerer en tom opprydding slik at grensesnittet kan kalle den likt.

export function subscribeToCompany() {
  return () => {}
}

// ── Nullstilling ──────────────────────────────────────────────────────────────

export function resetDemo() {
  try { localStorage.removeItem(KEY) } catch { /* ignorer */ }
}

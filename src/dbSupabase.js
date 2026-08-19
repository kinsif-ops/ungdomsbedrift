// ─── Supabase Data Layer ──────────────────────────────────────────────────────
// Ekte database-operasjoner mot Supabase.
// Importeres ikke direkte av grensesnittet – gå via db.js, som velger mellom
// denne og dbLocal.js avhengig av om appen kjører i demomodus.

import { supabase } from './supabaseClient.js'

// ── Auth ──────────────────────────────────────────────────────────────────────

export async function signUp({ name, email, password, role, school }) {
  const { data: authData, error: authError } = await supabase.auth.signUp({ email, password })
  if (authError) throw authError

  const { error: profileError } = await supabase.from('profiles').insert({
    id: authData.user.id,
    name,
    role,
    school,
  })
  if (profileError) throw profileError

  return authData.user
}

export async function signIn({ email, password }) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data.user
}

// Sender e-post med lenke til nytt passord. redirectTo må ligge under
// "Redirect URLs" i Supabase → Authentication → URL Configuration,
// ellers avvises lenken når eleven klikker på den.
export async function requestPasswordReset(email) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/?nyttpassord=1`,
  })
  if (error) throw error
}

// Brukes etter at eleven har klikket lenken i e-posten. Supabase har da
// opprettet en midlertidig sesjon, så updateUser treffer riktig bruker.
export async function updatePassword(newPassword) {
  const { error } = await supabase.auth.updateUser({ password: newPassword })
  if (error) throw error
}

export async function signOut() {
  await supabase.auth.signOut()
}

export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

export function onAuthStateChange(callback) {
  return supabase.auth.onAuthStateChange((_event, session) => {
    callback(session)
  })
}

// ── Profile ───────────────────────────────────────────────────────────────────

export async function getProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  if (error) throw error
  return data
}

export async function updateProfile(userId, updates) {
  const { error } = await supabase.from('profiles').update(updates).eq('id', userId)
  if (error) throw error
}

// ── Companies ─────────────────────────────────────────────────────────────────

export async function createCompany({ name, school, userId, memberRole, initialTasks }) {
  const code = generateCode()

  const { data: company, error: companyError } = await supabase
    .from('companies')
    .insert({ name, school, code, created_by: userId })
    .select()
    .single()
  if (companyError) throw companyError

  // Add creator as member
  const { error: memberError } = await supabase
    .from('company_members')
    .insert({ company_id: company.id, user_id: userId, role: memberRole })
  if (memberError) throw memberError

  // Update profile with company_id
  await updateProfile(userId, { company_id: company.id })

  // Insert default tasks
  if (initialTasks && initialTasks.length > 0) {
    const { error: taskError } = await supabase.from('tasks').insert(
      initialTasks.map((t, i) => ({
        company_id: company.id,
        phase: t.phase,
        text: t.text,
        info: t.info || null,
        link: t.link || null,
        is_submission: t.isSubmission || false,
        sort_order: i,
      }))
    )
    if (taskError) throw taskError
  }

  return company
}

export async function joinCompany({ code, userId, memberRole }) {
  const { data: company, error } = await supabase
    .from('companies')
    .select('id')
    .eq('code', code.toUpperCase())
    .single()
  if (error) throw new Error('Fant ingen bedrift med den koden.')

  const { error: memberError } = await supabase
    .from('company_members')
    .insert({ company_id: company.id, user_id: userId, role: memberRole })
  if (memberError) throw memberError

  await updateProfile(userId, { company_id: company.id })

  return company
}

export async function getCompany(companyId) {
  const { data, error } = await supabase
    .from('companies')
    .select(`
      *,
      company_members (
        user_id,
        role,
        profiles ( id, name, school, role )
      )
    `)
    .eq('id', companyId)
    .single()
  if (error) throw error
  return data
}

export async function getCompaniesForTeacher(school) {
  const { data, error } = await supabase
    .from('companies')
    .select(`
      *,
      company_members (
        user_id,
        role,
        profiles ( id, name, school, role )
      )
    `)
    .eq('school', school)
  if (error) throw error
  return data || []
}

export async function updateCompanyName(companyId, name) {
  const { error } = await supabase.from('companies').update({ name }).eq('id', companyId)
  if (error) throw error
}

// Flytter en elev fra én bedrift til en annen. Rydder samtidig opp i alt som
// peker på eleven i den gamle bedriften – ellers blir de stående som ansvarlig
// for oppgaver og kunder i en bedrift de ikke er med i lenger.
export async function moveStudent({ userId, fromCompanyId, toCompanyId, memberRole = 'Andre stillinger' }) {
  if (fromCompanyId) {
    // Fjern oppgavetilordninger i den gamle bedriften
    const { data: oldTasks } = await supabase
      .from('tasks').select('id').eq('company_id', fromCompanyId)
    const oldIds = (oldTasks || []).map(t => t.id)
    if (oldIds.length > 0) {
      const { error } = await supabase
        .from('task_assignments').delete().eq('user_id', userId).in('task_id', oldIds)
      if (error) throw error
    }

    // Løsne eleven fra CRM-kontakter i den gamle bedriften
    const { error: crmErr } = await supabase
      .from('crm_contacts').update({ assigned_to: null })
      .eq('company_id', fromCompanyId).eq('assigned_to', userId)
    if (crmErr) throw crmErr

    // Meld ut av gammelt medlemskap
    const { error: memErr } = await supabase
      .from('company_members').delete()
      .eq('company_id', fromCompanyId).eq('user_id', userId)
    if (memErr) throw memErr
  }

  if (toCompanyId) {
    const { error } = await supabase
      .from('company_members')
      .insert({ company_id: toCompanyId, user_id: userId, role: memberRole })
    if (error) throw error
  }

  await updateProfile(userId, { company_id: toCompanyId || null })
}

// ── Tasks ─────────────────────────────────────────────────────────────────────

export async function getTasks(companyId) {
  const { data, error } = await supabase
    .from('tasks')
    .select(`
      *,
      task_assignments ( user_id )
    `)
    .eq('company_id', companyId)
    .order('phase')
    .order('sort_order')
  if (error) throw error
  return (data || []).map(t => ({
    ...t,
    assignedTo: (t.task_assignments || []).map(a => a.user_id),
  }))
}

// Henter oppgaver for flere bedrifter samtidig – brukes av lærerdashbordet for
// å vise hvor mange godkjenninger som venter i hver bedrift.
export async function getTasksForCompanies(companyIds) {
  if (!companyIds || companyIds.length === 0) return []
  const { data, error } = await supabase
    .from('tasks')
    .select('id, company_id, done, approved_by')
    .in('company_id', companyIds)
  if (error) throw error
  return data || []
}

export async function addTask({ companyId, phase, text, info = null, link = null, isSubmission = false, sortOrder = 999 }) {
  const { data, error } = await supabase
    .from('tasks')
    .insert({ company_id: companyId, phase, text, info, link, is_submission: isSubmission, sort_order: sortOrder })
    .select()
    .single()
  if (error) throw error
  return { ...data, assignedTo: [] }
}

export async function updateTask(taskId, updates) {
  // Separate assignedTo from DB columns
  const { assignedTo, ...dbUpdates } = updates
  if (Object.keys(dbUpdates).length > 0) {
    const { error } = await supabase.from('tasks').update(dbUpdates).eq('id', taskId)
    if (error) throw error
  }
  return true
}

export async function deleteTask(taskId) {
  const { error } = await supabase.from('tasks').delete().eq('id', taskId)
  if (error) throw error
}

export async function toggleTaskAssignment(taskId, userId) {
  // Check if already assigned
  const { data: existing } = await supabase
    .from('task_assignments')
    .select('task_id')
    .eq('task_id', taskId)
    .eq('user_id', userId)
    .maybeSingle()

  if (existing) {
    const { error } = await supabase
      .from('task_assignments')
      .delete()
      .eq('task_id', taskId)
      .eq('user_id', userId)
    if (error) throw error
  } else {
    const { error } = await supabase
      .from('task_assignments')
      .insert({ task_id: taskId, user_id: userId })
    if (error) throw error
  }
}

// ── CRM ───────────────────────────────────────────────────────────────────────

export async function getCrmContacts(companyId) {
  const { data, error } = await supabase
    .from('crm_contacts')
    .select('*')
    .eq('company_id', companyId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}

// Bygger en rad med KUN ekte kolonnenavn. Tidligere ble hele objektet spredt
// inn, slik at camelCase-feltet assignedTo ble sendt som kolonne og PostgREST
// svarte "Could not find the 'assignedTo' column".
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
  // Årsak gir bare mening på tapte kontakter – nullstilles hvis status endres tilbake
  if (c.status !== undefined) row.lost_reason = c.status === 'tapt' ? (c.lostReason || null) : null
  return row
}

export async function upsertCrmContact(companyId, contact) {
  const { id, previousStatus } = contact
  const row = toCrmRow(contact)

  // Sist kontakt settes automatisk når statusen faktisk endrer seg
  if (contact.status !== undefined && contact.status !== previousStatus) {
    row.last_contact = new Date().toISOString()
  }

  if (id) {
    const { data, error } = await supabase
      .from('crm_contacts').update(row).eq('id', id).select().single()
    if (error) throw error
    return data
  }
  const { data, error } = await supabase
    .from('crm_contacts')
    .insert({ company_id: companyId, last_contact: new Date().toISOString(), ...row })
    .select().single()
  if (error) throw error
  return data
}

// ── CRM-aktiviteter (logg) ────────────────────────────────────────────────────

export async function getCrmActivities(contactId) {
  const { data, error } = await supabase
    .from('crm_activities')
    .select('*')
    .eq('contact_id', contactId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}

export async function addCrmActivity({ contactId, companyId, authorId, authorName, text }) {
  const { data, error } = await supabase
    .from('crm_activities')
    .insert({ contact_id: contactId, company_id: companyId, author_id: authorId, author_name: authorName, text })
    .select().single()
  if (error) throw error
  // Et loggført notat teller som kontakt
  await supabase.from('crm_contacts')
    .update({ last_contact: new Date().toISOString() })
    .eq('id', contactId)
  return data
}

// ── CRM på tvers av bedrifter (lærerdashbord) ────────────────────────────────

export async function getCrmForCompanies(companyIds) {
  if (!companyIds || companyIds.length === 0) return []
  const { data, error } = await supabase
    .from('crm_contacts')
    .select('*')
    .in('company_id', companyIds)
  if (error) throw error
  return data || []
}

export async function deleteCrmContact(contactId) {
  const { error } = await supabase.from('crm_contacts').delete().eq('id', contactId)
  if (error) throw error
}

// ── Realtime subscription ─────────────────────────────────────────────────────

export function subscribeToCompany(companyId, onTaskChange, onCrmChange) {
  const channel = supabase
    .channel(`company:${companyId}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks', filter: `company_id=eq.${companyId}` }, onTaskChange)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'task_assignments' }, onTaskChange)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'crm_contacts', filter: `company_id=eq.${companyId}` }, onCrmChange)
    .subscribe()
  return () => supabase.removeChannel(channel)
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function generateCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

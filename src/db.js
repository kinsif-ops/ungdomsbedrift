// ─── Supabase Data Layer ──────────────────────────────────────────────────────
// Alle database-operasjoner samlet på ett sted.
// Importeres fra App.jsx og erstatter localStorage-logikken.

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

export async function addTask({ companyId, phase, text, info = null, sortOrder = 999 }) {
  const { data, error } = await supabase
    .from('tasks')
    .insert({ company_id: companyId, phase, text, info, sort_order: sortOrder })
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

export async function upsertCrmContact(companyId, contact) {
  const { id, ...fields } = contact
  if (id) {
    const { data, error } = await supabase
      .from('crm_contacts')
      .update({ ...fields, assigned_to: fields.assignedTo || null })
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data
  } else {
    const { data, error } = await supabase
      .from('crm_contacts')
      .insert({ company_id: companyId, ...fields, assigned_to: fields.assignedTo || null })
      .select()
      .single()
    if (error) throw error
    return data
  }
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

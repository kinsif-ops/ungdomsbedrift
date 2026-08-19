// ─── Datalag – velger backend ────────────────────────────────────────────────
// Grensesnittet (AppSupabase.jsx) importerer BARE denne fila og vet ingenting
// om hvor dataene kommer fra. Det er poenget: én UI, to datakilder.
//
// Tidligere fantes det to komplette grensesnittfiler – AppLocal.jsx for demo og
// AppSupabase.jsx for ekte bruk – og de divergerte uunngåelig, fordi enhver
// endring måtte gjøres to steder. Nå finnes forskjellen kun her.
//
// VED ENDRINGER: legger du til en funksjon i dbSupabase.js, MÅ den også legges
// til i dbLocal.js og i listen nederst. Ellers krasjer demoen.

import * as supabaseImpl from './dbSupabase.js'
import * as localImpl from './dbLocal.js'

export const IS_DEMO = new URLSearchParams(window.location.search).get('demo') === '1'

const impl = IS_DEMO ? localImpl : supabaseImpl

// Sjekker at de to implementasjonene har samme funksjoner. Kjores kun i
// utvikling, slik at et avvik oppdages med en gang og ikke som hvit skjerm.
if (import.meta.env?.DEV) {
  const a = Object.keys(supabaseImpl).sort()
  const b = Object.keys(localImpl).sort()
  const mangler = a.filter(k => !b.includes(k))
  if (mangler.length) console.warn('dbLocal.js mangler:', mangler.join(', '))
}

export const {
  signUp,
  signIn,
  signOut,
  getSession,
  onAuthStateChange,
  requestPasswordReset,
  updatePassword,
  getProfile,
  updateProfile,
  createCompany,
  joinCompany,
  getCompany,
  getCompaniesForTeacher,
  updateCompanyName,
  moveStudent,
  getTasks,
  getTasksForCompanies,
  addTask,
  updateTask,
  deleteTask,
  toggleTaskAssignment,
  getCrmContacts,
  upsertCrmContact,
  deleteCrmContact,
  getCrmActivities,
  addCrmActivity,
  getCrmForCompanies,
  subscribeToCompany,
} = impl

// Finnes bare i demoen - brukes av nullstillingsknappen i demobanneret.
export const resetDemo = localImpl.resetDemo

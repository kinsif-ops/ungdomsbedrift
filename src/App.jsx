// App.jsx – starter med Supabase hvis miljøvariabler er satt,
// faller tilbake til localStorage-versjon ellers (nyttig under utvikling)

const hasSupabase =
  import.meta.env.VITE_SUPABASE_URL &&
  import.meta.env.VITE_SUPABASE_URL !== 'https://din-prosjekt-id.supabase.co'

let AppComponent

if (hasSupabase) {
  const { default: SupabaseApp } = await import('./AppSupabase.jsx')
  AppComponent = SupabaseApp
} else {
  console.info('ℹ️  Kjører i lokal modus (localStorage). Sett opp .env for Supabase.')
  const { default: LocalApp } = await import('./AppLocal.jsx')
  AppComponent = LocalApp
}

export default AppComponent

import { lazy, Suspense } from 'react'

const isDemo = new URLSearchParams(window.location.search).get('demo') === '1'

const hasSupabase =
  !isDemo &&
  import.meta.env.VITE_SUPABASE_URL &&
  import.meta.env.VITE_SUPABASE_URL !== 'https://din-prosjekt-id.supabase.co'

const AppComponent = hasSupabase
  ? lazy(() => import('./AppSupabase.jsx'))
  : lazy(() => import('./AppLocal.jsx'))

export default function App() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <div style={{ color: '#fff', fontSize: 18, fontWeight: 700 }}>🎓 Laster...</div>
      </div>
    }>
      <AppComponent />
    </Suspense>
  )
}

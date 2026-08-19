// Én app, uansett datakilde. Valget mellom Supabase og localStorage skjer i
// db.js, ikke her – slik at demoen og live-appen alltid kjører samme kode.
import { lazy, Suspense } from 'react'

const AppComponent = lazy(() => import('./AppSupabase.jsx'))

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

// AppSupabase.jsx – Supabase-tilkoblet versjon av Ungdomsbedrift-appen
// Bruker samme UI som AppLocal.jsx, men all data lagres i Supabase.

import { useState, useEffect, useCallback } from 'react'
import * as db from './db.js'
import { supabase } from './supabaseClient.js'

const APP_VERSION = '1.3.1'
import { PHASES, ROLES, CRM_STATUSES, OPPSTART_TASKS, LOST_REASONS } from './constants.js'

// ─── Main App ─────────────────────────────────────────────────────────────────

export default function App() {
  const [session, setSession] = useState(null)
  const [user, setUser] = useState(null)       // Supabase auth user
  const [profile, setProfile] = useState(null) // profiles row
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState('login')    // login | register
  // Eleven kommer hit via lenken i e-posten. Supabase har da laget en
  // midlertidig sesjon, så vi må vise passordskjemaet FØR vanlig ruting.
  const [resetMode, setResetMode] = useState(
    () => new URLSearchParams(window.location.search).get('nyttpassord') === '1'
  )

  useEffect(() => {
    db.getSession().then(s => {
      setSession(s)
      if (s) loadProfile(s.user.id)
      else setLoading(false)
    })
    const { data: { subscription } } = db.onAuthStateChange(s => {
      setSession(s)
      if (s) loadProfile(s.user.id)
      else { setProfile(null); setLoading(false) }
    })
    return () => subscription.unsubscribe()
  }, [])

  async function loadProfile(userId) {
    try {
      const p = await db.getProfile(userId)
      setProfile(p)
    } catch {
      setProfile(null)
    } finally {
      setLoading(false)
    }
  }

  async function logout() {
    await db.signOut()
    setProfile(null)
    setView('login')
  }

  if (loading) return <LoadingScreen />

  if (resetMode) {
    return <NewPassword onDone={() => {
      // Rydd bort parameteren så en refresh ikke sender eleven tilbake hit
      window.history.replaceState({}, '', window.location.pathname)
      setResetMode(false)
    }} />
  }

  if (!session || !profile) {
    return view === 'register'
      ? <RegisterScreen onSuccess={() => setView('login')} onBack={() => setView('login')} />
      : <LoginScreen onRegister={() => setView('register')} />
  }

  if (profile.role === 'teacher') return <TeacherDashboard profile={profile} onLogout={logout} />
  return <StudentApp profile={profile} onLogout={logout} />
}

// ─── Auth Screens ─────────────────────────────────────────────────────────────

function LoadingScreen() {
  return (
    <div style={{ ...S.authBg, flexDirection: 'column', gap: 16 }}>
      <div style={{ fontSize: 48 }}>🎓</div>
      <p style={{ color: '#fff', fontWeight: 700 }}>Laster...</p>
    </div>
  )
}

function LoginScreen({ onRegister }) {
  const [email, setEmail] = useState('')
  const [pw, setPw] = useState('')
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)
  const [demoLoading, setDemoLoading] = useState(null)
  const [installPrompt, setInstallPrompt] = useState(null)
  const [installed, setInstalled] = useState(false)

  // Fang opp nettleserens install-prompt
  useEffect(() => {
    const handler = e => { e.preventDefault(); setInstallPrompt(e); }
    window.addEventListener('beforeinstallprompt', handler)
    window.addEventListener('appinstalled', () => setInstalled(true))
    // Sjekk om allerede installert (standalone modus)
    if (window.matchMedia('(display-mode: standalone)').matches) setInstalled(true)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  async function installApp() {
    if (!installPrompt) return
    installPrompt.prompt()
    const { outcome } = await installPrompt.userChoice
    if (outcome === 'accepted') setInstalled(true)
    setInstallPrompt(null)
  }

  const [forgot, setForgot] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setLoading(true); setErr('')
    try { await db.signIn({ email, password: pw }) }
    catch (e) { setErr('Feil e-post eller passord.') }
    finally { setLoading(false) }
  }

  function loginAsDemo(role) {
    setDemoLoading(role)
    // Send til demo-modus (AppLocal med localStorage, isolert fra Supabase)
    window.location.href = `/?demo=1&role=${role}`
  }

  return (
    <div style={S.authBg}><div style={S.authCard}>
      <div style={S.authLogo}>🎓</div>
      <h1 style={S.authTitle}>Ungdomsbedrift</h1>
      <p style={S.authSub}>Logg inn for å fortsette</p>
      <form onSubmit={submit} style={S.form}>
        <input style={S.input} type="email" placeholder="E-post" value={email} onChange={e => setEmail(e.target.value)} required autoFocus />
        <input style={S.input} type="password" placeholder="Passord" value={pw} onChange={e => setPw(e.target.value)} required />
        {err && <p style={S.error}>{err}</p>}
        <button style={{ ...S.btnPrimary, opacity: loading ? 0.7 : 1 }} type="submit" disabled={loading}>
          {loading ? 'Logger inn...' : 'Logg inn'}
        </button>
      </form>
      <p style={{ ...S.authSwitch, marginBottom: 4 }}>
        <button style={S.linkBtn} onClick={() => setForgot(true)}>Glemt passordet?</button>
      </p>
      <p style={S.authSwitch}>Ingen konto? <button style={S.linkBtn} onClick={onRegister}>Registrer deg</button></p>

      {forgot && <ForgotPassword defaultEmail={email} onClose={() => setForgot(false)} />}

      {/* Demo-modus */}
      <div style={{ borderTop: '1px solid #e2e8f0', marginTop: 20, paddingTop: 18 }}>
        <div style={{ background: 'linear-gradient(135deg, #f0fdf4, #eff6ff)', borderRadius: 14, padding: '16px 14px', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <span style={{ fontSize: 18 }}>🎮</span>
            <span style={{ fontSize: 13, fontWeight: 800, color: '#1e293b' }}>Prøv demo – ingen registrering</span>
          </div>
          <p style={{ fontSize: 12, color: '#64748b', margin: '0 0 12px', lineHeight: 1.6 }}>
            Utforsk appen som elev eller lærer med ferdig eksempeldata. Helt isolert – påvirker ingen ekte brukere.
          </p>
          <div style={{ display: 'flex', gap: 8 }}>
            {[{ role: 'student', emoji: '🧑‍💼', label: 'Elev', name: 'Kari Nordmann' }, { role: 'teacher', emoji: '👩‍🏫', label: 'Lærer', name: 'Ola Hansen' }].map(d => (
              <button key={d.role} onClick={() => loginAsDemo(d.role)} disabled={!!demoLoading}
                style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '12px 8px', borderRadius: 12, border: '1.5px solid #e2e8f0', cursor: 'pointer', background: '#fff', fontFamily: 'inherit', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', opacity: demoLoading && demoLoading !== d.role ? 0.5 : 1 }}>
                <span style={{ fontSize: 24 }}>{d.emoji}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b' }}>{demoLoading === d.role ? 'Laster...' : d.label}</span>
                <span style={{ fontSize: 11, color: '#94a3b8' }}>{d.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Installer app-knapp */}
      {!installed && (
        <div style={{ marginTop: 16 }}>
          {installPrompt ? (
            <button onClick={installApp}
              style={{ width: '100%', padding: '13px', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg, #22c55e, #16a34a)', color: '#fff', fontWeight: 800, fontSize: 15, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              📲 Installer app på telefonen
            </button>
          ) : (
            <div style={{ background: '#f8fafc', borderRadius: 12, padding: '12px 14px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
              <p style={{ fontSize: 12, color: '#64748b', margin: '0 0 6px', fontWeight: 600 }}>📲 Installer appen</p>
              <p style={{ fontSize: 11, color: '#94a3b8', margin: 0, lineHeight: 1.5 }}>
                <strong>Android:</strong> Trykk ⋮ → "Installer app"<br/>
                <strong>iPhone:</strong> Trykk Del 🔗 → "Legg til på hjem-skjerm"
              </p>
            </div>
          )}
        </div>
      )}
      {installed && (
        <div style={{ marginTop: 16, background: '#f0fdf4', borderRadius: 12, padding: '10px 14px', textAlign: 'center' }}>
          <p style={{ fontSize: 13, color: '#16a34a', fontWeight: 700, margin: 0 }}>✅ Appen er installert!</p>
        </div>
      )}

      {/* Versjon */}
      <div style={{ textAlign: 'center', marginTop: 14 }}>
        <p style={{ fontSize: 11, color: '#94a3b8', marginBottom: 3 }}>
          Utviklet ved <strong style={{ color: '#6366f1' }}>Vennesla vgs</strong>
        </p>
        <p style={{ fontSize: 10, color: '#cbd5e1', margin: 0 }}>v{APP_VERSION}</p>
      </div>
    </div></div>
  )
}

// ─── Glemt passord ────────────────────────────────────────────────────────────

function ForgotPassword({ defaultEmail, onClose }) {
  const [email, setEmail] = useState(defaultEmail || '')
  const [sent, setSent] = useState(false)
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(e) {
    e.preventDefault()
    if (!email.trim()) return
    setLoading(true); setErr('')
    try {
      await db.requestPasswordReset(email.trim())
      setSent(true)
    } catch (e) {
      setErr('Kunne ikke sende e-post. Prøv igjen, eller si det til læreren din.')
    } finally { setLoading(false) }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 18 }}>
      <div style={{ background: '#fff', borderRadius: 18, padding: '24px 22px', width: '100%', maxWidth: 400 }}>
        {sent ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 38 }}>📧</div>
            <h2 style={{ fontSize: 17, fontWeight: 800, color: '#1e293b', margin: '10px 0 8px' }}>Sjekk e-posten</h2>
            <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.6, margin: '0 0 16px' }}>
              Vi har sendt en lenke til <strong>{email}</strong>. Klikk på den for å velge nytt passord.
              Sjekk søppelpost hvis den ikke kommer.
            </p>
            <button onClick={onClose} style={{ ...S.btnPrimary, marginTop: 0 }}>Lukk</button>
          </div>
        ) : (
          <>
            <h2 style={{ fontSize: 17, fontWeight: 800, color: '#1e293b', margin: '0 0 6px' }}>Glemt passordet?</h2>
            <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.6, margin: '0 0 16px' }}>
              Skriv inn e-posten du registrerte deg med, så sender vi en lenke for å lage nytt passord.
            </p>
            <form onSubmit={submit} style={S.form}>
              <input style={S.input} type="email" placeholder="E-post" value={email} onChange={e => setEmail(e.target.value)} required autoFocus />
              {err && <p style={S.error}>{err}</p>}
              <div style={{ display: 'flex', gap: 8 }}>
                <button type="button" onClick={onClose} style={{ flex: 1, padding: '11px', borderRadius: 12, border: '1.5px solid #e2e8f0', background: '#f8fafc', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600, color: '#64748b' }}>Avbryt</button>
                <button type="submit" disabled={loading} style={{ ...S.btnPrimary, flex: 2, marginTop: 0, opacity: loading ? 0.7 : 1 }}>
                  {loading ? 'Sender...' : 'Send lenke'}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  )
}

// ─── Nytt passord ─────────────────────────────────────────────────────────────
// Vises når eleven kommer tilbake via lenken i e-posten (?nyttpassord=1).

function NewPassword({ onDone }) {
  const [pw, setPw] = useState('')
  const [pw2, setPw2] = useState('')
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(e) {
    e.preventDefault()
    if (pw.length < 6) return setErr('Passordet må være minst 6 tegn.')
    if (pw !== pw2) return setErr('Passordene er ikke like.')
    setLoading(true); setErr('')
    try {
      await db.updatePassword(pw)
      onDone()
    } catch (e) {
      setErr('Lenken kan være utløpt. Be om en ny fra innloggingssiden.')
    } finally { setLoading(false) }
  }

  return (
    <div style={S.authBg}><div style={S.authCard}>
      <div style={S.authLogo}>🔑</div>
      <h1 style={S.authTitle}>Nytt passord</h1>
      <p style={S.authSub}>Velg et passord du husker</p>
      <form onSubmit={submit} style={S.form}>
        <input style={S.input} type="password" placeholder="Nytt passord (min. 6 tegn)" value={pw} onChange={e => setPw(e.target.value)} required autoFocus />
        <input style={S.input} type="password" placeholder="Gjenta passordet" value={pw2} onChange={e => setPw2(e.target.value)} required />
        {err && <p style={S.error}>{err}</p>}
        <button style={{ ...S.btnPrimary, opacity: loading ? 0.7 : 1 }} type="submit" disabled={loading}>
          {loading ? 'Lagrer...' : 'Lagre nytt passord'}
        </button>
      </form>
    </div></div>
  )
}

function RegisterScreen({ onSuccess, onBack }) {
  const [step, setStep] = useState(1)
  const [role, setRole] = useState('student')
  const [companyMode, setCompanyMode] = useState(null) // 'new' | 'join'
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [pw, setPw] = useState('')
  const [countyId, setCountyId] = useState('')
  const [schoolId, setSchoolId] = useState('')
  const [sRole, setSRole] = useState('Daglig leder')
  const [companyName, setCompanyName] = useState('')
  const [joinCode, setJoinCode] = useState('')
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)
  const [counties, setCounties] = useState([])
  const [schools, setSchools] = useState([])
  const [generatedCode, setGeneratedCode] = useState(null)

  // Last fylker ved oppstart
  useEffect(() => {
    supabase.from('counties').select('*').order('sort_order')
      .then(({ data }) => setCounties(data || []))
  }, [])

  // Last skoler når fylke velges
  useEffect(() => {
    if (!countyId) { setSchools([]); setSchoolId(''); return }
    supabase.from('schools').select('*')
      .eq('county_id', countyId).eq('active', true).order('name')
      .then(({ data }) => setSchools(data || []))
  }, [countyId])

  const selectedSchool = schools.find(s => s.id === schoolId)

  async function submit(e) {
    e.preventDefault()
    if (!name || !email || !pw || !schoolId) { setErr('Fyll inn alle feltene.'); return }
    if (pw.length < 6) { setErr('Passordet må være minst 6 tegn.'); return }
    if (role === 'student' && !companyMode) { setErr('Velg om du oppretter eller blir med i en bedrift.'); return }
    if (role === 'student' && companyMode === 'new' && !companyName.trim()) { setErr('Skriv inn bedriftsnavn.'); return }
    if (role === 'student' && companyMode === 'join' && !joinCode.trim()) { setErr('Skriv inn tilkoblingskoden.'); return }
    setLoading(true); setErr('')
    try {
      const authUser = await db.signUp({ name, email, password: pw, role, school: selectedSchool?.name || '' })
      if (role === 'student') {
        if (companyMode === 'join') {
          await db.joinCompany({ code: joinCode.toUpperCase(), userId: authUser.id, memberRole: sRole })
        } else {
          const allTasks = PHASES.flatMap(p =>
            p.defaultTasks.map((t, i) => ({
              phase: p.id,
              text: typeof t === 'string' ? t : t.text,
              info: typeof t === 'object' ? t.info : null,
              link: typeof t === 'object' ? t.link : null,
              isSubmission: typeof t === 'object' ? !!t.isSubmission : false,
              sortOrder: i,
            }))
          )
          const company = await db.createCompany({
            name: companyName.trim(),
            school: selectedSchool?.name || '',
            userId: authUser.id,
            memberRole: sRole,
            initialTasks: allTasks
          })
          setGeneratedCode(company.code)
          setLoading(false)
          return // Vis koden før vi går videre
        }
      }
      onSuccess()
    } catch (e) {
      setErr(e.message || 'Noe gikk galt. Prøv igjen.')
    } finally {
      setLoading(false)
    }
  }

  // Steg 1 – Velg rolle
  if (step === 1) return (
    <div style={S.authBg}><div style={S.authCard}>
      <button style={S.backBtn} onClick={onBack}>← Tilbake</button>
      <div style={S.authLogo}>🎓</div>
      <h1 style={S.authTitle}>Opprett konto</h1>
      <p style={S.authSub}>Hvem er du?</p>
      <div style={S.roleRow}>
        {[{ v: 'student', e: '🧑', l: 'Elev' }, { v: 'teacher', e: '👩', l: 'Lærer' }].map(r => (
          <button key={r.v} onClick={() => setRole(r.v)}
            style={{ ...S.roleCard, ...(role === r.v ? S.roleCardActive : {}) }}>
            <span style={{ fontSize: 36 }}>{r.e}</span>
            <span style={{ fontWeight: 700 }}>{r.l}</span>
          </button>
        ))}
      </div>
      <button style={S.btnPrimary} onClick={() => setStep(2)}>Fortsett</button>
    </div></div>
  )

  // Steg 2 – For elever: opprett eller bli med
  if (step === 2 && role === 'student') return (
    <div style={S.authBg}><div style={S.authCard}>
      <button style={S.backBtn} onClick={() => setStep(1)}>← Tilbake</button>
      <div style={S.authLogo}>🏢</div>
      <h1 style={S.authTitle}>Din bedrift</h1>
      <p style={S.authSub}>Skal du opprette en ny bedrift eller bli med i en eksisterende?</p>
      <div style={S.roleRow}>
        <button onClick={() => setCompanyMode('new')}
          style={{ ...S.roleCard, ...(companyMode === 'new' ? S.roleCardActive : {}) }}>
          <span style={{ fontSize: 32 }}>🆕</span>
          <span style={{ fontWeight: 700, fontSize: 13 }}>Opprett ny bedrift</span>
          <span style={{ fontSize: 11, color: '#94a3b8' }}>Du er den første</span>
        </button>
        <button onClick={() => setCompanyMode('join')}
          style={{ ...S.roleCard, ...(companyMode === 'join' ? S.roleCardActive : {}) }}>
          <span style={{ fontSize: 32 }}>🔗</span>
          <span style={{ fontWeight: 700, fontSize: 13 }}>Bli med i bedrift</span>
          <span style={{ fontSize: 11, color: '#94a3b8' }}>Du har en kode</span>
        </button>
      </div>
      <button style={{ ...S.btnPrimary, opacity: companyMode ? 1 : 0.5 }}
        disabled={!companyMode} onClick={() => setStep(3)}>Fortsett</button>
    </div></div>
  )

  // Steg etter rolle for lærere går rett til steg 3
  // Steg 3 – Personlig info + skole
  if ((step === 2 && role === 'teacher') || (step === 3 && role === 'student')) return (
    <div style={S.authBg}><div style={{ ...S.authCard, maxHeight: '90vh', overflowY: 'auto' }}>
      <button style={S.backBtn} onClick={() => role === 'teacher' ? setStep(1) : setStep(2)}>← Tilbake</button>
      <div style={S.authLogo}>{role === 'teacher' ? '👩' : '🧑'}</div>
      <h1 style={S.authTitle}>{role === 'teacher' ? 'Ny lærer' : 'Ny elev'}</h1>

      {/* Vis generert kode etter opprettelse */}
      {generatedCode && (
        <div style={{ background: '#f0fdf4', border: '2px solid #22c55e', borderRadius: 16, padding: '20px 16px', textAlign: 'center', marginBottom: 16 }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: '#16a34a', marginBottom: 8 }}>🎉 Bedriften er opprettet!</div>
          <div style={{ fontSize: 13, color: '#374151', marginBottom: 12 }}>Del denne koden med resten av gruppen:</div>
          <div style={{ fontSize: 32, fontWeight: 900, letterSpacing: 8, color: '#6366f1', fontFamily: 'monospace', background: '#eef2ff', borderRadius: 12, padding: '12px 16px', marginBottom: 12 }}>{generatedCode}</div>
          <button onClick={onSuccess} style={{ ...S.btnPrimary, marginTop: 0 }}>Gå til appen →</button>
        </div>
      )}

      {!generatedCode && (
        <form onSubmit={submit} style={S.form}>
          <input style={S.input} placeholder="Fullt navn *" value={name} onChange={e => setName(e.target.value)} required autoFocus />
          <input style={S.input} type="email" placeholder="E-post *" value={email} onChange={e => setEmail(e.target.value)} required />
          <input style={S.input} type="password" placeholder="Passord (min. 6 tegn) *" value={pw} onChange={e => setPw(e.target.value)} required />

          <div style={S.divider}><span style={S.dividerText}>Fylke og skole</span></div>
          <select style={S.select} value={countyId} onChange={e => { setCountyId(e.target.value); setSchoolId(''); }} required>
            <option value="">Velg fylke...</option>
            {counties.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          {countyId && (
            <select style={S.select} value={schoolId} onChange={e => setSchoolId(e.target.value)} required>
              <option value="">Velg skole...</option>
              {schools.length === 0
                ? <option disabled>Ingen aktive skoler i dette fylket</option>
                : schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)
              }
            </select>
          )}
          {countyId && schools.length === 0 && (
            <p style={{ fontSize: 11, color: '#f97316', textAlign: 'center' }}>
              Ingen skoler er aktivert i dette fylket ennå. Kontakt administrator.
            </p>
          )}

          {role === 'student' && <>
            <div style={S.divider}><span style={S.dividerText}>Din rolle i bedriften</span></div>
            <select style={S.select} value={sRole} onChange={e => setSRole(e.target.value)}>
              {ROLES.map(r => <option key={r}>{r}</option>)}
            </select>

            {companyMode === 'new' && <>
              <div style={S.divider}><span style={S.dividerText}>Bedriftsnavn</span></div>
              <input style={S.input} placeholder="F.eks. Fryz UB *" value={companyName} onChange={e => setCompanyName(e.target.value)} required />
            </>}

            {companyMode === 'join' && <>
              <div style={S.divider}><span style={S.dividerText}>Tilkoblingskode</span></div>
              <input style={{ ...S.input, letterSpacing: 6, textTransform: 'uppercase', fontWeight: 700, fontSize: 18, textAlign: 'center' }}
                placeholder="F.eks. XK7R2P" value={joinCode}
                onChange={e => setJoinCode(e.target.value.toUpperCase())} maxLength={6} required />
            </>}
          </>}

          {err && <p style={S.error}>{err}</p>}
          <button style={{ ...S.btnPrimary, opacity: loading ? 0.7 : 1 }} type="submit" disabled={loading}>
            {loading ? 'Oppretter konto...' : companyMode === 'new' ? '🏢 Opprett bedrift og konto' : '🔗 Bli med og opprett konto'}
          </button>
        </form>
      )}
    </div></div>
  )

  return null
}

// ─── Student App ──────────────────────────────────────────────────────────────

function StudentApp({ profile, onLogout }) {
  const [company, setCompany] = useState(null)
  const [tasks, setTasks] = useState([])
  const [crmContacts, setCrmContacts] = useState([])
  const [mainTab, setMainTab] = useState('tasks')
  const [activePhase, setActivePhase] = useState('oppstart')
  const [filterUserId, setFilterUserId] = useState(null)
  const [newTask, setNewTask] = useState('')
  const [showInfo, setShowInfo] = useState(false)
  const [assignModal, setAssignModal] = useState(null)
  const [expandedInfo, setExpandedInfo] = useState(null)
  const [crmModal, setCrmModal] = useState(null)
  const [loading, setLoading] = useState(true)

  // Godkjenningssporing. MÅ ligge her, over alle tidlige return-er – React
  // krever at samme antall hooks kjøres ved hver render.
  const seenKey = `ub_seen_approved_${profile.id}`
  const [seenApproved, setSeenApproved] = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem(seenKey) || '[]')) } catch { return new Set() }
  })
  const [firstLoad, setFirstLoad] = useState(true)

  useEffect(() => {
    if (tasks.length === 0) return
    const ids = tasks.filter(t => t.approved_by).map(t => t.id)
    // Ved aller første innlogging kvitterer vi stille, ellers får en elev som
    // blir med i en godt i gang-gruppe en banner om 30 gamle godkjenninger.
    if (firstLoad && ids.length > 0 && seenApproved.size === 0) {
      localStorage.setItem(seenKey, JSON.stringify(ids))
      setSeenApproved(new Set(ids))
    }
    setFirstLoad(false)
  }, [tasks]) // eslint-disable-line react-hooks/exhaustive-deps

  const loadData = useCallback(async () => {
    if (!profile.company_id) { setLoading(false); return }
    try {
      const [co, ts, crm] = await Promise.all([
        db.getCompany(profile.company_id),
        db.getTasks(profile.company_id),
        db.getCrmContacts(profile.company_id),
      ])
      setCompany(co)
      setTasks(ts)
      setCrmContacts(crm)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }, [profile.company_id])

  useEffect(() => {
    loadData()
    if (!profile.company_id) return
    // Realtime subscription
    const unsub = db.subscribeToCompany(profile.company_id, loadData, loadData)
    return unsub
  }, [loadData, profile.company_id])

  if (loading) return <LoadingScreen />
  if (!company) return (
    <div style={S.authBg}><div style={S.authCard}>
      <div style={S.authLogo}>😕</div>
      <h1 style={S.authTitle}>Ingen bedrift</h1>
      <p style={S.authSub}>Du er ikke koblet til en bedrift ennå.</p>
      <button style={S.btnPrimary} onClick={onLogout}>Logg ut</button>
    </div></div>
  )

  const members = (company.company_members || []).map(m => m.profiles).filter(Boolean)
  const memberInfo = (company.company_members || []).find(m => m.user_id === profile.id)
  const phase = PHASES.find(p => p.id === activePhase)

  const phaseTasks = tasks
    .filter(t => t.phase === activePhase)
    .filter(t => !filterUserId || (t.assignedTo || []).includes(filterUserId))

  const totalAll = tasks.length
  const doneAll  = tasks.filter(t => t.done).length
  const overallPct = totalAll === 0 ? 0 : Math.round(doneAll / totalAll * 100)

  const rawPhaseTasks = tasks.filter(t => t.phase === activePhase)
  const phDone = rawPhaseTasks.filter(t => t.done).length
  const phTotal = rawPhaseTasks.length
  const phPct = phTotal === 0 ? 0 : Math.round(phDone / phTotal * 100)

  const myPendingTasks = tasks.filter(t => (t.assignedTo || []).includes(profile.id) && !t.done)
  const pendingApproval = tasks.filter(t => t.done && !t.approved_by).length

  // ── Fasestatus ──────────────────────────────────────────────────────────────
  // En fase er "åpen" når forrige fase er fullt godkjent. Låste faser kan
  // fortsatt åpnes og leses – de vises bare i grått, uten farge.
  const phaseState = {}
  PHASES.forEach((p, i) => {
    const pt = tasks.filter(t => t.phase === p.id)
    const approved = pt.filter(t => t.approved_by).length
    const complete = pt.length > 0 && approved === pt.length
    const prev = i === 0 ? null : phaseState[PHASES[i - 1].id]
    phaseState[p.id] = { total: pt.length, approved, complete, unlocked: i === 0 || !!prev?.complete }
  })
  const isLocked = id => !phaseState[id]?.unlocked

  async function toggleTask(task) {
    const newDone = !task.done
    // Optimistic update
    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, done: newDone, done_by: newDone ? profile.name : null, approved_by: null } : t))
    await db.updateTask(task.id, { done: newDone, done_by: newDone ? profile.name : null, approved_by: null })
  }

  async function handleDeleteTask(taskId) {
    setTasks(prev => prev.filter(t => t.id !== taskId))
    await db.deleteTask(taskId)
  }

  async function handleAddTask() {
    if (!newTask.trim()) return
    const t = await db.addTask({ companyId: company.id, phase: activePhase, text: newTask.trim() })
    setTasks(prev => [...prev, t])
    setNewTask('')
  }

  async function handleToggleAssign(taskId, userId) {
    // Optimistic update
    setTasks(prev => prev.map(t => {
      if (t.id !== taskId) return t
      const assigned = t.assignedTo || []
      return { ...t, assignedTo: assigned.includes(userId) ? assigned.filter(id => id !== userId) : [...assigned, userId] }
    }))
    await db.toggleTaskAssignment(taskId, userId)
  }

  async function handleCrmSave(data) {
    const saved = await db.upsertCrmContact(company.id, data)
    setCrmContacts(prev => {
      const idx = prev.findIndex(c => c.id === saved.id)
      if (idx >= 0) { const next = [...prev]; next[idx] = saved; return next }
      return [saved, ...prev]
    })
    setCrmModal(null)
  }

  async function handleCrmDelete(contactId) {
    setCrmContacts(prev => prev.filter(c => c.id !== contactId))
    await db.deleteCrmContact(contactId)
  }

  // ── Nytt siden sist ─────────────────────────────────────────────────────────
  // Hookene ligger øverst i komponenten (før tidlige return-er). Her utledes
  // bare verdier – ingen hooks, så rekkefølgen er trygg.
  const approvedIds = tasks.filter(t => t.approved_by).map(t => t.id)
  const newlyApproved = tasks.filter(t => t.approved_by && !seenApproved.has(t.id))

  function dismissApproved() {
    localStorage.setItem(seenKey, JSON.stringify(approvedIds))
    setSeenApproved(new Set(approvedIds))
  }

  // Fase som nettopp ble ferdig – vises som feiring, kvitteres separat
  const justCompleted = PHASES.find(p =>
    phaseState[p.id].complete &&
    tasks.some(t => t.phase === p.id && t.approved_by && !seenApproved.has(t.id))
  )

  return (
    <div style={S.appRoot}>
      <header style={S.header}>
        <div>
          <div style={S.appTitle}>{company.name}</div>
          <div style={S.appSub}>{profile.name} · {memberInfo?.role} · {profile.school}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {myPendingTasks.length > 0 && <div style={{ background: '#ef4444', color: '#fff', borderRadius: 99, fontSize: 11, fontWeight: 700, padding: '2px 7px' }}>{myPendingTasks.length}</div>}
          {pendingApproval > 0 && <div style={{ background: '#f97316', color: '#fff', borderRadius: 99, fontSize: 11, fontWeight: 700, padding: '2px 7px' }}>⏳{pendingApproval}</div>}
          <DonutChart pct={overallPct} color="#6366f1" size={40} />
          <button style={S.iconBtn} onClick={() => setShowInfo(!showInfo)}>ℹ️</button>
          <button onClick={() => { if (window.confirm("Er du sikker på at du vil logge ut?")) onLogout(); }} style={{ background: "none", border: "1.5px solid #e2e8f0", borderRadius: 8, padding: "5px 12px", cursor: "pointer", fontFamily: "inherit", fontSize: 12, fontWeight: 700, color: "#64748b", display: "flex", alignItems: "center", gap: 5 }}>⏻ Logg ut</button>
        </div>
      </header>

      {showInfo && (
        <div style={S.settingsPanel}>
          <div style={{ fontWeight: 700, marginBottom: 8, color: '#1e293b' }}>Bedriftskode</div>
          <div style={S.codeBox}>
            <span style={S.code}>{company.code}</span>
            <button style={S.copyBtn} onClick={() => navigator.clipboard?.writeText(company.code)}>Kopier</button>
          </div>
          <p style={{ fontSize: 11, color: '#94a3b8', marginBottom: 12 }}>Del med gruppemedlemmer</p>
          <div style={{ fontWeight: 700, marginBottom: 8, color: '#1e293b' }}>Gruppemedlemmer</div>
          {(company.company_members || []).map(m => {
            const u = m.profiles; if (!u) return null
            return <div key={m.user_id} style={S.memberRow}><Avatar name={u.name} /><div><div style={{ fontWeight: 600, fontSize: 13 }}>{u.name}</div><div style={{ fontSize: 11, color: '#94a3b8' }}>{m.role}</div></div></div>
          })}
        </div>
      )}

      <div style={{ display: 'flex', background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '0 16px' }}>
        {[{ id: 'tasks', label: '📋 Oppgaver' }, { id: 'crm', label: '👥 CRM' }].map(tab => (
          <button key={tab.id} onClick={() => setMainTab(tab.id)} style={{ padding: '12px 16px', background: 'none', border: 'none', borderBottom: mainTab === tab.id ? '2px solid #6366f1' : '2px solid transparent', fontWeight: mainTab === tab.id ? 700 : 500, color: mainTab === tab.id ? '#6366f1' : '#64748b', cursor: 'pointer', fontFamily: 'inherit', fontSize: 14 }}>{tab.label}</button>
        ))}
      </div>

      {mainTab === 'tasks' && <>
        <nav style={S.nav}>
          {PHASES.map(p => {
            const st = phaseState[p.id]
            const isA = activePhase === p.id
            const locked = isLocked(p.id)
            // Låst fase: fortsatt klikkbar og lesbar, men grå i stedet for farget
            const accent = locked ? '#94a3b8' : p.color
            return (
              <button key={p.id} onClick={() => { setActivePhase(p.id); setAssignModal(null); setExpandedInfo(null) }}
                title={locked ? 'Ikke åpnet ennå – du kan lese, men fullfør forrige fase først' : undefined}
                style={{ ...S.tab,
                  background: isA ? accent : '#f8fafc',
                  color: isA ? '#fff' : locked ? '#94a3b8' : '#64748b',
                  borderColor: isA ? accent : '#e2e8f0',
                  boxShadow: isA && !locked ? `0 4px 14px ${p.color}44` : 'none',
                  transform: isA ? 'translateY(-2px)' : 'none',
                  filter: locked && !isA ? 'grayscale(1)' : 'none',
                  opacity: locked && !isA ? 0.65 : 1 }}>
                <span style={{ fontSize: 20 }}>{st.complete ? '✅' : p.emoji}</span>
                <span style={{ fontSize: 11, fontWeight: 700 }}>{p.label}</span>
                <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 20, background: isA ? 'rgba(255,255,255,0.25)' : locked ? '#f1f5f9' : p.light, color: isA ? '#fff' : accent }}>
                  {st.approved}/{st.total}
                </span>
              </button>
            )
          })}
        </nav>

        <main style={S.main}>

          {/* Fasefeiring – det viktigste øyeblikket i fasen fortjener å bli markert */}
          {justCompleted && (
            <div style={{ background: `linear-gradient(135deg, ${justCompleted.light}, #fff)`, border: `2px solid ${justCompleted.color}`, borderRadius: 16, padding: '18px 20px', marginBottom: 14, textAlign: 'center' }}>
              <div style={{ fontSize: 34 }}>{justCompleted.emoji}</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: justCompleted.color, marginTop: 6 }}>
                {justCompleted.label} er i havn!
              </div>
              <p style={{ fontSize: 13, color: '#64748b', margin: '6px 0 14px', lineHeight: 1.5 }}>
                Alle oppgavene er godkjent av læreren. Neste fase er nå åpnet.
              </p>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                {(() => {
                  const next = PHASES[PHASES.findIndex(p => p.id === justCompleted.id) + 1]
                  return next ? (
                    <button onClick={() => { dismissApproved(); setActivePhase(next.id) }}
                      style={{ padding: '10px 18px', borderRadius: 99, border: 'none', background: next.color, color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                      Gå til {next.label} →
                    </button>
                  ) : (
                    <button onClick={dismissApproved}
                      style={{ padding: '10px 18px', borderRadius: 99, border: 'none', background: justCompleted.color, color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                      Gratulerer – bedriften er ferdig!
                    </button>
                  )
                })()}
              </div>
            </div>
          )}

          {/* Godkjent siden sist – vises kun når ingen fase nettopp ble ferdig */}
          {!justCompleted && newlyApproved.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 11, background: '#f0fdf4', border: '1.5px solid #86EFAC', borderRadius: 12, padding: '11px 14px', marginBottom: 14 }}>
              <span style={{ fontSize: 20 }}>✅</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#15803d' }}>
                  {newlyApproved.length} oppgave{newlyApproved.length === 1 ? '' : 'r'} godkjent
                </div>
                <div style={{ fontSize: 11, color: '#16a34a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {newlyApproved.slice(0, 2).map(t => t.text).join(' · ')}
                  {newlyApproved.length > 2 && ` +${newlyApproved.length - 2} flere`}
                </div>
              </div>
              <button onClick={dismissApproved}
                style={{ background: 'none', border: 'none', color: '#16a34a', fontSize: 18, cursor: 'pointer', padding: '0 4px', fontFamily: 'inherit' }}>×</button>
            </div>
          )}

          {/* Låst fase – forklarer hvorfor den er grå, uten å sperre lesing */}
          {isLocked(activePhase) && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: '10px 14px', marginBottom: 14 }}>
              <span style={{ fontSize: 17 }}>🔒</span>
              <div style={{ fontSize: 12, color: '#64748b', lineHeight: 1.5 }}>
                Denne fasen er ikke åpnet ennå. Du kan lese alt for å se hva som kommer –
                men fullfør og få godkjent forrige fase først.
              </div>
            </div>
          )}

          <div style={{ ...S.phaseHeader, background: isLocked(activePhase) ? '#f8fafc' : phase.light, borderColor: isLocked(activePhase) ? '#e2e8f0' : phase.border }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 30 }}>{phase.emoji}</span>
              <div>
                <div style={{ fontSize: 18, fontWeight: 800, color: phase.color }}>{phase.label}</div>
                <div style={{ fontSize: 12, color: '#64748b' }}>{rawPhaseTasks.filter(t => t.approved_by).length} godkjent · {phDone} av {phTotal} fullført</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 10 }}>
              <div style={S.progressBar}><div style={{ ...S.progressFill, width: `${phPct}%`, background: phase.color }} /></div>
              <span style={{ fontSize: 13, fontWeight: 700, color: phase.color, minWidth: 36 }}>{phPct}%</span>
            </div>
          </div>

          <div style={{ background: '#fef9c3', border: '1px solid #fde047', borderRadius: 12, padding: '10px 14px', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <span style={{ fontSize: 18 }}>📤</span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#854d0e' }}>Husk å levere på Its learning!</div>
              <div style={{ fontSize: 12, color: '#92400e', marginTop: 2 }}>Huk av alle oppgavene, last opp dokumentasjon, og be læreren godkjenne fasen.</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>Vis:</span>
            <button onClick={() => setFilterUserId(null)} style={{ ...S.filterChip, background: !filterUserId ? '#6366f1' : '#f8fafc', color: !filterUserId ? '#fff' : '#64748b', borderColor: !filterUserId ? '#6366f1' : '#e2e8f0' }}>Alle</button>
            {members.map(m => (
              <button key={m.id} onClick={() => setFilterUserId(filterUserId === m.id ? null : m.id)}
                style={{ ...S.filterChip, display: 'flex', alignItems: 'center', gap: 5, background: filterUserId === m.id ? '#6366f1' : '#f8fafc', color: filterUserId === m.id ? '#fff' : '#64748b', borderColor: filterUserId === m.id ? '#6366f1' : '#e2e8f0' }}>
                <span style={{ width: 18, height: 18, borderRadius: 5, background: filterUserId === m.id ? 'rgba(255,255,255,0.3)' : '#e2e8f0', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700 }}>{m.name[0]}</span>
                {m.name.split(' ')[0]}{m.id === profile.id ? ' (meg)' : ''}
              </button>
            ))}
          </div>

          {myPendingTasks.length > 0 && !filterUserId && (
            <div style={{ background: '#eef2ff', borderRadius: 12, padding: '10px 14px', border: '1px solid #c7d2fe' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#6366f1', marginBottom: 4 }}>📌 Tilordnet til deg ({myPendingTasks.length})</div>
              {myPendingTasks.slice(0, 3).map(t => { const ph = PHASES.find(p => p.id === t.phase); return <div key={t.id} style={{ fontSize: 12, color: '#4338ca', marginTop: 2 }}>{ph?.emoji} {t.text}</div> })}
              {myPendingTasks.length > 3 && <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>...og {myPendingTasks.length - 3} til</div>}
            </div>
          )}

          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {phaseTasks.map(task => {
              const assignedUsers = (task.assignedTo || []).map(id => members.find(m => m.id === id)).filter(Boolean)
              const isAssignOpen = assignModal === task.id
              const isInfoOpen = expandedInfo === task.id
              const isApproved = !!task.approved_by
              const isSubmission = !!task.is_submission
              const hasInfo = !!task.info
              const anyPanelOpen = isAssignOpen || isInfoOpen

              return (
                <li key={task.id}>
                  <div style={{ ...S.taskItem, borderRadius: anyPanelOpen ? '12px 12px 0 0' : 12, background: isSubmission ? '#fffbeb' : '#fff', borderLeft: isSubmission ? '3px solid #f59e0b' : 'none' }}>
                    <button onClick={() => !isApproved && toggleTask(task)}
                      disabled={isApproved}
                      style={{ ...S.checkbox, borderColor: isApproved ? '#22c55e' : task.done ? phase.color : '#cbd5e1', background: isApproved ? '#22c55e' : task.done ? phase.color : '#fff', cursor: isApproved ? 'default' : 'pointer' }}>
                      {(task.done || isApproved) && <svg viewBox="0 0 12 12" style={{ width: 12, height: 12 }}><polyline points="1.5,6 4.5,9 10.5,3" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                    </button>

                    <div style={{ flex: 1, cursor: hasInfo ? 'pointer' : 'default' }}
                      onClick={() => { if (hasInfo) { setExpandedInfo(isInfoOpen ? null : task.id); setAssignModal(null) } }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 14, fontWeight: 500, textDecoration: task.done ? 'line-through' : 'none', color: task.done ? '#94a3b8' : '#1e293b' }}>{task.text}</span>
                        {hasInfo && !task.done && <span style={{ fontSize: 10, color: isInfoOpen ? phase.color : '#a5b4fc', fontWeight: 700, textDecoration: 'underline' }}>les mer</span>}
                        {isApproved && <span style={{ fontSize: 10, background: '#f0fdf4', color: '#16a34a', borderRadius: 99, padding: '1px 7px', fontWeight: 700 }}>✓ Godkjent</span>}
                        {task.done && !isApproved && <span style={{ fontSize: 10, background: '#fff7ed', color: '#c2410c', borderRadius: 99, padding: '1px 7px', fontWeight: 700 }}>⏳ Venter</span>}
                      </div>
                      {task.done && task.done_by && !isApproved && <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 1 }}>Fullført av {task.done_by}</div>}
                      {isApproved && <div style={{ fontSize: 10, color: '#16a34a', marginTop: 1 }}>Godkjent av {task.approved_by}</div>}
                      {assignedUsers.length > 0 && (
                        <div style={{ display: 'flex', gap: 4, marginTop: 5, flexWrap: 'wrap' }}>
                          {assignedUsers.map(u => <span key={u.id} style={{ fontSize: 11, background: '#eef2ff', color: '#6366f1', borderRadius: 99, padding: '1px 7px', fontWeight: 600 }}>{u.name.split(' ')[0]}{u.id === profile.id ? ' (meg)' : ''}</span>)}
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'flex', gap: 2, flexShrink: 0 }}>
                      <button onClick={() => { setAssignModal(isAssignOpen ? null : task.id); setExpandedInfo(null) }} title="Tilordne"
                        style={{ ...S.iconBtn, fontSize: 13, color: assignedUsers.length > 0 ? '#6366f1' : '#cbd5e1', background: isAssignOpen ? '#eef2ff' : 'none' }}>👤</button>
                      {!isApproved && <button onClick={() => handleDeleteTask(task.id)} style={S.deleteBtn}>×</button>}
                    </div>
                  </div>

                  {isInfoOpen && (
                    <div style={{ background: phase.light, border: `1px solid ${phase.border}`, borderTop: 'none', borderRadius: isAssignOpen ? 0 : '0 0 12px 12px', padding: '14px 16px' }}>
                      <p style={{ fontSize: 13, color: '#374151', lineHeight: 1.75, margin: '0 0 12px' }}>{task.info || 'Kommer mer tekst'}</p>
                      {task.link && (
                        <a href={task.link} target="_blank" rel="noopener noreferrer"
                          style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, color: phase.color, fontWeight: 700, textDecoration: 'none', background: '#fff', border: `1px solid ${phase.border}`, padding: '6px 12px', borderRadius: 99 }}>
                          Les mer på elevbedrift.no →
                        </a>
                      )}
                    </div>
                  )}

                  {isAssignOpen && (
                    <div style={{ background: '#f8fafc', borderRadius: '0 0 12px 12px', border: '1px solid #e2e8f0', borderTop: 'none', padding: '10px 14px' }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>Tilordne til</div>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        {members.map(m => {
                          const checked = (task.assignedTo || []).includes(m.id)
                          return (
                            <button key={m.id} onClick={() => handleToggleAssign(task.id, m.id)}
                              style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '6px 12px', borderRadius: 99, border: `1.5px solid ${checked ? '#6366f1' : '#e2e8f0'}`, background: checked ? '#eef2ff' : '#fff', cursor: 'pointer', fontFamily: 'inherit' }}>
                              <Avatar name={m.name} size={22} />
                              <span style={{ fontSize: 12, fontWeight: 600, color: checked ? '#6366f1' : '#1e293b' }}>{m.name.split(' ')[0]}</span>
                              {checked && <svg viewBox="0 0 12 12" style={{ width: 10, height: 10 }}><polyline points="1.5,6 4.5,9 10.5,3" fill="none" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </li>
              )
            })}
          </ul>

          <div style={{ display: 'flex', gap: 8 }}>
            <input value={newTask} onChange={e => setNewTask(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAddTask()} placeholder="+ Legg til ny oppgave..." style={S.input} />
            <button onClick={handleAddTask} style={{ ...S.btnSmall, background: phase.color }} disabled={!newTask.trim()}>Legg til</button>
          </div>
        </main>
      </>}

      {mainTab === 'crm' && (
        <CRMTab contacts={crmContacts} profile={profile} members={members} company={company}
          onSave={handleCrmSave} onDelete={handleCrmDelete}
          crmModal={crmModal} setCrmModal={setCrmModal} />
      )}
    </div>
  )
}

// ─── Teacher Dashboard ────────────────────────────────────────────────────────

function TeacherDashboard({ profile, onLogout }) {
  const [companies, setCompanies] = useState([])
  const [selected, setSelected] = useState(null)
  const [selectedTasks, setSelectedTasks] = useState([])
  const [selectedCrm, setSelectedCrm] = useState([])
  const [activePhase, setActivePhase] = useState('oppstart')
  const [teacherTab, setTeacherTab] = useState('tasks')
  const [loading, setLoading] = useState(true)
  const [allCrm, setAllCrm] = useState([])

  useEffect(() => {
    db.getCompaniesForTeacher(profile.school).then(async data => {
      setCompanies(data)
      try { setAllCrm(await db.getCrmForCompanies(data.map(c => c.id))) } catch { setAllCrm([]) }
      setLoading(false)
    })
  }, [profile.school])

  async function selectCompany(co) {
    setSelected(co)
    setActivePhase('oppstart')
    setTeacherTab('tasks')
    const [ts, crm] = await Promise.all([db.getTasks(co.id), db.getCrmContacts(co.id)])
    setSelectedTasks(ts)
    setSelectedCrm(crm)
  }

  async function approveTask(taskId, currentApprovedBy) {
    const newApproved = currentApprovedBy ? null : profile.name
    setSelectedTasks(prev => prev.map(t => t.id === taskId ? { ...t, approved_by: newApproved } : t))
    await db.updateTask(taskId, { approved_by: newApproved })
  }

  if (loading) return <LoadingScreen />

  return (
    <div style={S.appRoot}>
      <header style={S.header}>
        <div><div style={S.appTitle}>Lærerdashbord 👩‍🏫</div><div style={S.appSub}>{profile.name} · {profile.school}</div></div>
        <button onClick={() => { if (window.confirm("Er du sikker på at du vil logge ut?")) onLogout(); }} style={{ background: "none", border: "1.5px solid #e2e8f0", borderRadius: 8, padding: "5px 12px", cursor: "pointer", fontFamily: "inherit", fontSize: 12, fontWeight: 700, color: "#64748b", display: "flex", alignItems: "center", gap: 5 }}>⏻ Logg ut</button>
      </header>

      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        {/* Mobil: vis enten liste ELLER detalj */}
        {!selected ? (
          /* ── Bedriftsliste ── */
          <div style={{ flex: 1 }}>
            <div style={S.sidebarTitle}>Bedrifter ({companies.length})</div>
            {companies.map(co => (
              <button key={co.id} onClick={() => selectCompany(co)}
                style={{ ...S.companyCard, background: '#fff', color: '#1e293b', width: '100%', textAlign: 'left', display: 'block' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 700, fontSize: 15 }}>{co.name}</span>
                  <span style={{ fontSize: 11, color: '#94a3b8' }}>{(co.company_members || []).length} elever</span>
                </div>
                <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 3 }}>Kode: {co.code}</div>
              </button>
            ))}
            {companies.length === 0 && (
              <div style={{ textAlign: 'center', padding: '48px 16px', color: '#94a3b8' }}>
                <div style={{ fontSize: 48 }}>📋</div>
                <p style={{ fontWeight: 600, color: '#1e293b', marginTop: 8 }}>Ingen bedrifter ennå</p>
                <p style={{ fontSize: 13, marginTop: 4 }}>Elever ved {profile.school} vil dukke opp her</p>
              </div>
            )}

            {allCrm.length > 0 && <SalesOverview companies={companies} allCrm={allCrm} />}
          </div>
        ) : (
          /* ── Bedriftsdetalj ── */
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            {/* Tilbake-knapp */}
            <div style={{ padding: '10px 16px', borderBottom: '1px solid #e2e8f0', background: '#fff', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
              <button onClick={() => setSelected(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, color: '#6366f1', fontWeight: 700, padding: 0 }}>
                ← Alle bedrifter
              </button>
              <span style={{ fontSize: 15, fontWeight: 800, color: '#1e293b' }}>{selected.name}</span>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {/* Faner */}
            <div style={{ display: 'flex', overflowX: 'auto', borderBottom: '1px solid #e2e8f0', scrollbarWidth: 'none', flexShrink: 0 }}>
              {[{ id: 'tasks', label: '📋 Oppgaver' }, { id: 'crm', label: '👥 CRM' }].map(tab => (
                <button key={tab.id} onClick={() => setTeacherTab(tab.id)} style={{ padding: '10px 14px', background: 'none', border: 'none', borderBottom: teacherTab === tab.id ? '2px solid #6366f1' : '2px solid transparent', fontWeight: teacherTab === tab.id ? 700 : 500, color: teacherTab === tab.id ? '#6366f1' : '#64748b', cursor: 'pointer', fontFamily: 'inherit', fontSize: 14, whiteSpace: 'nowrap', flexShrink: 0 }}>{tab.label}</button>
              ))}
            </div>

            {/* Kode og medlemmer */}
            <div style={{ fontSize: 11, color: '#64748b', marginBottom: 4 }}>Kode: {selected.code}</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 4 }}>
              {(selected.company_members || []).map(m => { const u = m.profiles; if (!u) return null; return <div key={m.user_id} style={S.memberChip}><Avatar name={u.name} size={26} /><div><div style={{ fontSize: 11, fontWeight: 600 }}>{u.name}</div><div style={{ fontSize: 10, color: '#94a3b8' }}>{m.role}</div></div></div> })}
            </div>

            {teacherTab === 'tasks' && (<>
              {selectedTasks.filter(t => t.done && !t.approved_by).length > 0 && (
                <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 12, padding: '10px 14px', marginBottom: 12, display: 'flex', gap: 10, alignItems: 'center' }}>
                  <span style={{ fontSize: 20 }}>⏳</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#c2410c' }}>{selectedTasks.filter(t => t.done && !t.approved_by).length} oppgave(r) venter på din godkjenning</div>
                    <div style={{ fontSize: 12, color: '#9a3412' }}>Klikk "Godkjenn" på oppgavene nedenfor.</div>
                  </div>
                </div>
              )}
              <div style={{ display: 'flex', gap: 8, overflowX: 'auto', marginBottom: 12 }}>
                {PHASES.map(p => {
                  const pt = selectedTasks.filter(t => t.phase === p.id)
                  const pa = pt.filter(t => t.approved_by).length
                  const pendingInPhase = pt.filter(t => t.done && !t.approved_by).length
                  const isA = activePhase === p.id
                  return (
                    <button key={p.id} onClick={() => setActivePhase(p.id)}
                      style={{ ...S.tab, background: isA ? p.color : '#f8fafc', color: isA ? '#fff' : '#64748b', borderColor: isA ? p.color : '#e2e8f0', position: 'relative' }}>
                      {pendingInPhase > 0 && <span style={{ position: 'absolute', top: -4, right: -4, background: '#f97316', color: '#fff', borderRadius: 99, fontSize: 9, fontWeight: 700, padding: '1px 4px' }}>{pendingInPhase}</span>}
                      <span style={{ fontSize: 18 }}>{p.emoji}</span>
                      <span style={{ fontSize: 10, fontWeight: 700 }}>{p.label}</span>
                      <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 20, background: isA ? 'rgba(255,255,255,0.25)' : p.light, color: isA ? '#fff' : p.color, fontWeight: 700 }}>{pa}/{pt.length}</span>
                    </button>
                  )
                })}
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 7 }}>
                {selectedTasks.filter(t => t.phase === activePhase).map(task => {
                  const ph = PHASES.find(p => p.id === activePhase)
                  const isApproved = !!task.approved_by
                  const needsApproval = task.done && !task.approved_by
                  const members = (selected.company_members || []).map(m => m.profiles).filter(Boolean)
                  const assignedUsers = (task.assignedTo || []).map(id => members.find(m => m.id === id)).filter(Boolean)
                  return (
                    <li key={task.id} style={{ ...S.taskItem, background: needsApproval ? '#fffbeb' : '#fff', border: needsApproval ? '1px solid #fde68a' : '1px solid transparent', borderRadius: 12 }}>
                      <div style={{ ...S.checkbox, borderColor: isApproved ? '#22c55e' : task.done ? ph.color : '#cbd5e1', background: isApproved ? '#22c55e' : task.done ? ph.color : '#fff', cursor: 'default' }}>
                        {task.done && <svg viewBox="0 0 12 12" style={{ width: 12, height: 12 }}><polyline points="1.5,6 4.5,9 10.5,3" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                          <span style={{ fontSize: 13, fontWeight: 500, textDecoration: task.done ? 'line-through' : 'none', color: task.done ? '#94a3b8' : '#1e293b' }}>{task.text}</span>
                          {isApproved && <span style={{ fontSize: 10, background: '#f0fdf4', color: '#16a34a', borderRadius: 99, padding: '1px 7px', fontWeight: 700 }}>✓ Godkjent</span>}
                          {needsApproval && <span style={{ fontSize: 10, background: '#fff7ed', color: '#c2410c', borderRadius: 99, padding: '1px 7px', fontWeight: 700 }}>⏳ Venter</span>}
                        </div>
                        {task.done_by && <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 1 }}>Fullført av {task.done_by}</div>}
                        {assignedUsers.length > 0 && <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>{assignedUsers.map(u => <span key={u.id} style={{ fontSize: 11, background: '#eef2ff', color: '#6366f1', borderRadius: 99, padding: '1px 7px', fontWeight: 600 }}>{u.name.split(' ')[0]}</span>)}</div>}
                      </div>
                      {task.done && (
                        <button onClick={() => approveTask(task.id, task.approved_by)}
                          style={{ padding: '5px 12px', borderRadius: 99, border: `1.5px solid ${isApproved ? '#22c55e' : '#e2e8f0'}`, background: isApproved ? '#f0fdf4' : '#f8fafc', color: isApproved ? '#16a34a' : '#64748b', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0 }}>
                          {isApproved ? '✓ Godkjent' : 'Godkjenn'}
                        </button>
                      )}
                    </li>
                  )
                })}
              </ul>
            </>)}

            {teacherTab === 'crm' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                  {CRM_STATUSES.map(s => { const count = selectedCrm.filter(c => c.status === s.id).length; return count > 0 ? <div key={s.id} style={{ padding: '5px 12px', borderRadius: 99, background: s.bg, border: `1px solid ${s.color}33` }}><span style={{ fontWeight: 700, color: s.color }}>{count}</span><span style={{ fontSize: 12, color: '#64748b', marginLeft: 4 }}>{s.label}</span></div> : null })}
                </div>
                {selectedCrm.map(contact => {
                  const st = CRM_STATUSES.find(s => s.id === contact.status)
                  const od = isOverdue(contact)
                  const stale = daysSince(contact.last_contact)
                  return (
                    <div key={contact.id} style={{ background: '#f8fafc', borderRadius: 10, padding: '10px 12px', border: od ? '1.5px solid #fca5a5' : '1px solid #e2e8f0' }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                        <span style={{ fontSize: 18 }}>{contact.type === 'Bedrift' ? '🏢' : '👤'}</span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                            <span style={{ fontSize: 13, fontWeight: 700 }}>{contact.name}</span>
                            <span style={{ fontSize: 11, background: st?.bg, color: st?.color, borderRadius: 99, padding: '1px 7px', fontWeight: 600 }}>{st?.label}</span>
                            {contact.value_nok > 0 && <span style={{ fontSize: 11, background: '#f0fdf4', color: '#16a34a', borderRadius: 99, padding: '1px 7px', fontWeight: 700 }}>{formatNok(contact.value_nok)}</span>}
                          </div>
                          {contact.next_followup && (
                            <div style={{ fontSize: 11, marginTop: 3, fontWeight: 700, color: od ? '#dc2626' : '#6366f1' }}>
                              {od ? '⚠️' : '📅'} Følg opp: {formatFollowup(contact.next_followup)}
                            </div>
                          )}
                          {contact.status === 'tapt' && contact.lost_reason && (
                            <div style={{ fontSize: 11, color: '#be185d', marginTop: 3, fontWeight: 600 }}>Tapt: {contact.lost_reason}</div>
                          )}
                          {contact.note && <div style={{ fontSize: 11, color: '#94a3b8', fontStyle: 'italic', marginTop: 3 }}>"{contact.note}"</div>}
                          {stale != null && stale > 14 && !['kunde', 'tapt'].includes(contact.status) && (
                            <div style={{ fontSize: 11, color: '#dc2626', marginTop: 3 }}>Ingen kontakt på {stale} dager</div>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Salgsoversikt for lærer ─────────────────────────────────────────────────
// Viser alle bedriftene side om side. Poenget er å se hvem som står stille
// uten å måtte klikke seg inn i hver enkelt bedrift.

function SalesOverview({ companies, allCrm }) {
  const [open, setOpen] = useState(true)

  const rows = companies.map(co => {
    const cs = allCrm.filter(c => c.company_id === co.id)
    return {
      id: co.id,
      name: co.name,
      counts: Object.fromEntries(CRM_STATUSES.map(s => [s.id, cs.filter(c => c.status === s.id).length])),
      pipeline: pipelineValue(cs),
      won: cs.filter(c => c.status === 'kunde').reduce((sum, c) => sum + (c.value_nok || 0), 0),
      overdue: cs.filter(isOverdue).length,
      total: cs.length,
    }
  }).filter(r => r.total > 0)

  // Tapt-årsaker samlet for hele klassen – dette er en ferdig undervisningstime
  const lost = allCrm.filter(c => c.status === 'tapt' && c.lost_reason)
  const reasonCounts = Object.entries(
    lost.reduce((acc, c) => { acc[c.lost_reason] = (acc[c.lost_reason] || 0) + 1; return acc }, {})
  ).sort((a, b) => b[1] - a[1])

  if (rows.length === 0) return null

  const th = { padding: '7px 8px', fontSize: 10, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.4, textAlign: 'center', whiteSpace: 'nowrap' }
  const td = { padding: '9px 8px', fontSize: 13, textAlign: 'center', color: '#1e293b', whiteSpace: 'nowrap' }

  return (
    <div style={{ margin: '16px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, overflow: 'hidden' }}>
      <button onClick={() => setOpen(!open)}
        style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '13px 16px', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' }}>
        <span style={{ fontSize: 17 }}>📊</span>
        <span style={{ fontSize: 14, fontWeight: 800, color: '#1e293b', flex: 1 }}>Salgsoversikt</span>
        <span style={{ fontSize: 12, color: '#94a3b8' }}>{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div style={{ padding: '0 16px 16px' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <th style={{ ...th, textAlign: 'left' }}>Bedrift</th>
                  {CRM_STATUSES.map(st => <th key={st.id} style={{ ...th, color: st.color }}>{st.label}</th>)}
                  <th style={th}>Ute</th>
                  <th style={th}>Solgt</th>
                  <th style={th}>Forfalt</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(r => (
                  <tr key={r.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ ...td, textAlign: 'left', fontWeight: 700 }}>{r.name}</td>
                    {CRM_STATUSES.map(st => (
                      <td key={st.id} style={{ ...td, color: r.counts[st.id] ? st.color : '#cbd5e1', fontWeight: r.counts[st.id] ? 700 : 400 }}>
                        {r.counts[st.id]}
                      </td>
                    ))}
                    <td style={{ ...td, color: '#F97316', fontWeight: 700 }}>{formatNok(r.pipeline) || '–'}</td>
                    <td style={{ ...td, color: '#22C55E', fontWeight: 700 }}>{formatNok(r.won) || '–'}</td>
                    <td style={td}>
                      {r.overdue > 0
                        ? <span style={{ background: '#fef2f2', color: '#dc2626', borderRadius: 99, padding: '2px 9px', fontSize: 12, fontWeight: 700 }}>{r.overdue}</span>
                        : <span style={{ color: '#cbd5e1' }}>0</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {reasonCounts.length > 0 && (
            <div style={{ marginTop: 16, background: '#FFF1F7', border: '1px solid #F9A8D4', borderRadius: 12, padding: '12px 14px' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#be185d', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>
                Hvorfor taper klassen salg? ({lost.length} tapte)
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                {reasonCounts.map(([reason, count]) => (
                  <div key={reason} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ flex: 1, fontSize: 13, color: '#1e293b' }}>{reason}</div>
                    <div style={{ width: 110, height: 7, background: '#fff', borderRadius: 99, overflow: 'hidden' }}>
                      <div style={{ width: `${Math.round(count / lost.length * 100)}%`, height: '100%', background: '#EC4899' }} />
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#be185d', minWidth: 22, textAlign: 'right' }}>{count}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── CRM-hjelpere ─────────────────────────────────────────────────────────────

function todayISO() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

// Forfalt = dato i dag eller tidligere. Kontakter uten dato regnes ikke som forfalte.
function isOverdue(contact) {
  return !!contact.next_followup && contact.next_followup <= todayISO()
}

function daysSince(ts) {
  if (!ts) return null
  return Math.floor((Date.now() - new Date(ts).getTime()) / 86400000)
}

function formatFollowup(dateStr) {
  if (!dateStr) return null
  const today = todayISO()
  if (dateStr === today) return 'I dag'
  const diff = Math.round((new Date(dateStr) - new Date(today)) / 86400000)
  if (diff === 1) return 'I morgen'
  if (diff < 0) return `${Math.abs(diff)} d forsinket`
  if (diff <= 7) return `Om ${diff} dager`
  return new Date(dateStr).toLocaleDateString('nb-NO', { day: 'numeric', month: 'short' })
}

function formatNok(n) {
  if (n == null || n === '') return null
  return new Intl.NumberFormat('nb-NO').format(n) + ' kr'
}

// Verdi som fortsatt kan bli til salg – tapte og allerede vunne holdes utenfor
function pipelineValue(contacts) {
  return contacts
    .filter(c => ['lead', 'kontaktet', 'tilbud'].includes(c.status))
    .reduce((sum, c) => sum + (c.value_nok || 0), 0)
}

// ─── CRM Tab ──────────────────────────────────────────────────────────────────

function CRMTab({ contacts, profile, members, company, onSave, onDelete, crmModal, setCrmModal }) {
  const [filterStatus, setFilterStatus] = useState(null)
  const [showOverdue, setShowOverdue] = useState(false)
  const [search, setSearch] = useState('')

  const overdue = contacts.filter(isOverdue)
  const stats = CRM_STATUSES.map(s => ({ ...s, count: contacts.filter(c => c.status === s.id).length }))
  const pipeline = pipelineValue(contacts)
  const won = contacts.filter(c => c.status === 'kunde').reduce((sum, c) => sum + (c.value_nok || 0), 0)

  const filtered = contacts
    .filter(c => !showOverdue || isOverdue(c))
    .filter(c => !filterStatus || c.status === filterStatus)
    .filter(c => {
      if (!search) return true
      const q = search.toLowerCase()
      return c.name.toLowerCase().includes(q)
        || (c.email || '').toLowerCase().includes(q)
        || (c.note || '').toLowerCase().includes(q)
    })
    // Forfalte først, deretter nærmeste oppfølging
    .sort((a, b) => {
      const ao = isOverdue(a), bo = isOverdue(b)
      if (ao !== bo) return ao ? -1 : 1
      if (a.next_followup && b.next_followup) return a.next_followup.localeCompare(b.next_followup)
      if (a.next_followup) return -1
      if (b.next_followup) return 1
      return 0
    })

  return (
    <div style={{ flex: 1, padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>

      {/* Oppfølgingsvarsel – erstatter push-varsler med noe elevene faktisk ser */}
      {overdue.length > 0 && (
        <button onClick={() => { setShowOverdue(!showOverdue); setFilterStatus(null) }}
          style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', textAlign: 'left', padding: '11px 14px', borderRadius: 12, cursor: 'pointer', fontFamily: 'inherit',
                   background: showOverdue ? '#fef2f2' : '#fff7ed', border: `1.5px solid ${showOverdue ? '#fca5a5' : '#fed7aa'}` }}>
          <span style={{ fontSize: 20 }}>🔔</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#c2410c' }}>
              {overdue.length} kontakt{overdue.length === 1 ? '' : 'er'} trenger oppfølging
            </div>
            <div style={{ fontSize: 11, color: '#9a3412' }}>
              {showOverdue ? 'Viser kun disse – trykk for å vise alle' : 'Trykk for å se hvilke'}
            </div>
          </div>
        </button>
      )}

      {/* Pipeline-verdi – kobler CRM til budsjettet fra etableringsfasen */}
      {(pipeline > 0 || won > 0) && (
        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{ flex: 1, background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '10px 14px' }}>
            <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>Ute på tilbud</div>
            <div style={{ fontSize: 17, fontWeight: 800, color: '#F97316' }}>{formatNok(pipeline) || '0 kr'}</div>
          </div>
          <div style={{ flex: 1, background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '10px 14px' }}>
            <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>Solgt</div>
            <div style={{ fontSize: 17, fontWeight: 800, color: '#22C55E' }}>{formatNok(won) || '0 kr'}</div>
          </div>
        </div>
      )}

      {/* Statusfiltre */}
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto' }}>
        {stats.map(s => (
          <button key={s.id} onClick={() => { setFilterStatus(filterStatus === s.id ? null : s.id); setShowOverdue(false) }}
            style={{ padding: '10px 14px', borderRadius: 12, border: `1.5px solid ${filterStatus === s.id ? s.color : '#e2e8f0'}`, background: filterStatus === s.id ? s.bg : '#fff', cursor: 'pointer', textAlign: 'center', minWidth: 90, fontFamily: 'inherit', flexShrink: 0 }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: s.color }}>{s.count}</div>
            <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>{s.label}</div>
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Søk navn, e-post, notat..." style={{ ...S.input, flex: 1 }} />
        <button onClick={() => setCrmModal('new')} style={{ ...S.btnSmall, background: '#6366f1', whiteSpace: 'nowrap' }}>+ Ny kontakt</button>
      </div>

      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8' }}>
          <div style={{ fontSize: 36 }}>👥</div>
          <div style={{ fontWeight: 600, color: '#1e293b' }}>
            {contacts.length === 0 ? 'Ingen kontakter ennå' : 'Ingen treff'}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {filtered.map(contact => {
          const st = CRM_STATUSES.find(s => s.id === contact.status)
          const au = members.find(m => m.id === contact.assigned_to)
          const od = isOverdue(contact)
          const stale = daysSince(contact.last_contact)
          return (
            <div key={contact.id}
              style={{ background: '#fff', borderRadius: 12, padding: '12px 14px', cursor: 'pointer',
                       border: od ? '1.5px solid #fca5a5' : '1px solid #e2e8f0' }}
              onClick={() => setCrmModal(contact.id)}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: contact.type === 'Bedrift' ? '#fef3c7' : '#ede9fe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
                  {contact.type === 'Bedrift' ? '🏢' : '👤'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: '#1e293b' }}>{contact.name}</span>
                    <span style={{ fontSize: 11, background: st?.bg, color: st?.color, borderRadius: 99, padding: '1px 8px', fontWeight: 600 }}>{st?.label}</span>
                    {contact.value_nok > 0 && (
                      <span style={{ fontSize: 11, background: '#f0fdf4', color: '#16a34a', borderRadius: 99, padding: '1px 8px', fontWeight: 700 }}>{formatNok(contact.value_nok)}</span>
                    )}
                  </div>

                  {contact.next_followup && (
                    <div style={{ fontSize: 11, marginTop: 4, fontWeight: 700, color: od ? '#dc2626' : '#6366f1' }}>
                      {od ? '⚠️' : '📅'} Følg opp: {formatFollowup(contact.next_followup)}
                    </div>
                  )}

                  {contact.status === 'tapt' && contact.lost_reason && (
                    <div style={{ fontSize: 11, color: '#be185d', marginTop: 3, fontWeight: 600 }}>Tapt: {contact.lost_reason}</div>
                  )}

                  {contact.email && <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{contact.email}</div>}
                  {contact.note && <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 3, fontStyle: 'italic' }}>"{contact.note}"</div>}

                  <div style={{ display: 'flex', gap: 8, marginTop: 4, flexWrap: 'wrap' }}>
                    {au && <span style={{ fontSize: 11, color: '#6366f1' }}>📌 {au.name.split(' ')[0]}</span>}
                    {stale != null && stale > 0 && !['kunde', 'tapt'].includes(contact.status) && (
                      <span style={{ fontSize: 11, color: stale > 14 ? '#dc2626' : '#94a3b8' }}>
                        Sist kontakt: {stale} d siden
                      </span>
                    )}
                  </div>
                </div>
                <button onClick={e => { e.stopPropagation(); onDelete(contact.id) }} style={{ ...S.deleteBtn, fontSize: 18 }}>×</button>
              </div>
            </div>
          )
        })}
      </div>

      {crmModal && (
        <CRMModal
          contact={crmModal === 'new' ? null : contacts.find(c => c.id === crmModal)}
          members={members}
          currentUser={profile}
          company={company}
          onSave={data => onSave({ ...data, id: crmModal !== 'new' ? crmModal : undefined })}
          onClose={() => setCrmModal(null)}
        />
      )}
    </div>
  )
}

function CRMModal({ contact, members, currentUser, company, onSave, onClose }) {
  const [name, setName] = useState(contact?.name || '')
  const [type, setType] = useState(contact?.type || 'Privatperson')
  const [email, setEmail] = useState(contact?.email || '')
  const [phone, setPhone] = useState(contact?.phone || '')
  const [status, setStatus] = useState(contact?.status || 'lead')
  const [note, setNote] = useState(contact?.note || '')
  const [assignedTo, setAssignedTo] = useState(contact?.assigned_to || currentUser.id)
  const [valueNok, setValueNok] = useState(contact?.value_nok ?? '')
  const [nextFollowup, setNextFollowup] = useState(contact?.next_followup || '')
  const [lostReason, setLostReason] = useState(contact?.lost_reason || '')

  // Aktivitetslogg
  const [activities, setActivities] = useState([])
  const [newActivity, setNewActivity] = useState('')
  const [savingActivity, setSavingActivity] = useState(false)

  useEffect(() => {
    if (!contact?.id) return
    db.getCrmActivities(contact.id).then(setActivities).catch(() => setActivities([]))
  }, [contact?.id])

  async function submitActivity() {
    if (!newActivity.trim() || !contact?.id) return
    setSavingActivity(true)
    try {
      const saved = await db.addCrmActivity({
        contactId: contact.id,
        companyId: company.id,
        authorId: currentUser.id,
        authorName: currentUser.name,
        text: newActivity.trim(),
      })
      setActivities(prev => [saved, ...prev])
      setNewActivity('')
    } catch (e) {
      alert('Kunne ikke lagre notatet: ' + (e.message || e))
    } finally {
      setSavingActivity(false)
    }
  }

  // Foreslår oppfølging om én uke – de fleste glemmer å sette dato selv
  function suggestFollowup(days) {
    const d = new Date()
    d.setDate(d.getDate() + days)
    setNextFollowup(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`)
  }

  const isLost = status === 'tapt'
  const isClosed = status === 'kunde' || status === 'tapt'

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 100 }}>
      <div style={{ background: '#fff', borderRadius: '20px 20px 0 0', padding: '24px 22px 36px', width: '100%', maxWidth: 520, boxShadow: '0 -8px 40px rgba(0,0,0,0.18)', maxHeight: '92vh', overflowY: 'auto' }}>
        <h2 style={{ fontSize: 18, fontWeight: 800, color: '#1e293b', margin: '0 0 18px' }}>{contact ? 'Rediger kontakt' : 'Ny kontakt'}</h2>

        <form onSubmit={e => {
          e.preventDefault()
          if (!name.trim()) return
          onSave({
            name, type, email, phone, status, note, assignedTo,
            valueNok, nextFollowup, lostReason,
            previousStatus: contact?.status,
          })
        }} style={S.form}>

          <input style={S.input} placeholder="Navn *" value={name} onChange={e => setName(e.target.value)} required autoFocus />

          <div style={{ display: 'flex', gap: 8 }}>
            {['Privatperson', 'Bedrift'].map(t => (
              <button type="button" key={t} onClick={() => setType(t)}
                style={{ flex: 1, padding: '10px', borderRadius: 10, border: `1.5px solid ${type === t ? '#6366f1' : '#e2e8f0'}`, background: type === t ? '#eef2ff' : '#f8fafc', fontFamily: 'inherit', fontSize: 13, fontWeight: 600, color: type === t ? '#6366f1' : '#64748b', cursor: 'pointer' }}>
                {t === 'Bedrift' ? '🏢 Bedrift' : '👤 Privatperson'}
              </button>
            ))}
          </div>

          <input style={S.input} placeholder="E-post" type="email" value={email} onChange={e => setEmail(e.target.value)} />
          <input style={S.input} placeholder="Telefon" value={phone} onChange={e => setPhone(e.target.value)} />

          <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5 }}>Status</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {CRM_STATUSES.map(s => (
              <button type="button" key={s.id} onClick={() => setStatus(s.id)}
                style={{ padding: '5px 12px', borderRadius: 99, border: `1.5px solid ${status === s.id ? s.color : '#e2e8f0'}`, background: status === s.id ? s.bg : '#f8fafc', color: status === s.id ? s.color : '#94a3b8', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                {s.label}
              </button>
            ))}
          </div>

          {/* Årsak vises kun ved tapt – tapte salg er den mest lærerike dataen dere har */}
          {isLost && (
            <div style={{ background: '#FFF1F7', border: '1px solid #F9A8D4', borderRadius: 12, padding: '12px 14px' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#be185d', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>Hvorfor ble det ikke salg?</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {LOST_REASONS.map(r => (
                  <button type="button" key={r} onClick={() => setLostReason(r)}
                    style={{ padding: '5px 11px', borderRadius: 99, border: `1.5px solid ${lostReason === r ? '#EC4899' : '#e2e8f0'}`, background: lostReason === r ? '#fff' : '#f8fafc', color: lostReason === r ? '#be185d' : '#94a3b8', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                    {r}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5 }}>Verdi (kr)</div>
          <input style={S.input} type="number" min="0" inputMode="numeric" placeholder="Hva er dette salget verdt?" value={valueNok} onChange={e => setValueNok(e.target.value)} />

          {/* Oppfølgingsdato – uten denne blir "Kontaktet" en blindvei */}
          {!isClosed && (
            <>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5 }}>Neste oppfølging</div>
              <input style={S.input} type="date" value={nextFollowup} onChange={e => setNextFollowup(e.target.value)} />
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {[{ l: 'Om 3 dager', d: 3 }, { l: 'Om 1 uke', d: 7 }, { l: 'Om 2 uker', d: 14 }].map(o => (
                  <button type="button" key={o.d} onClick={() => suggestFollowup(o.d)}
                    style={{ padding: '5px 11px', borderRadius: 99, border: '1.5px solid #e2e8f0', background: '#f8fafc', color: '#64748b', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                    {o.l}
                  </button>
                ))}
                {nextFollowup && (
                  <button type="button" onClick={() => setNextFollowup('')}
                    style={{ padding: '5px 11px', borderRadius: 99, border: '1.5px solid #e2e8f0', background: '#fff', color: '#94a3b8', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                    Fjern
                  </button>
                )}
              </div>
            </>
          )}

          <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5 }}>Ansvarlig</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {members.map(m => {
              const checked = assignedTo === m.id
              return (
                <button type="button" key={m.id} onClick={() => setAssignedTo(checked ? '' : m.id)}
                  style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '7px 12px', borderRadius: 99, border: `1.5px solid ${checked ? '#6366f1' : '#e2e8f0'}`, background: checked ? '#eef2ff' : '#f8fafc', cursor: 'pointer', fontFamily: 'inherit' }}>
                  <Avatar name={m.name} size={22} />
                  <span style={{ fontSize: 12, fontWeight: 600, color: checked ? '#6366f1' : '#1e293b' }}>{m.name.split(' ')[0]}</span>
                </button>
              )
            })}
          </div>

          <textarea style={{ ...S.input, minHeight: 60, resize: 'vertical' }} placeholder="Kort notat (vises i lista)..." value={note} onChange={e => setNote(e.target.value)} />

          <div style={{ display: 'flex', gap: 8 }}>
            <button type="button" onClick={onClose} style={{ flex: 1, padding: '11px', borderRadius: 12, border: '1.5px solid #e2e8f0', background: '#f8fafc', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600, color: '#64748b' }}>Avbryt</button>
            <button type="submit" style={{ ...S.btnPrimary, flex: 2, marginTop: 0 }}>Lagre</button>
          </div>
        </form>

        {/* Aktivitetslogg – kun for lagrede kontakter */}
        {contact?.id && (
          <div style={{ marginTop: 22, borderTop: '1px solid #e2e8f0', paddingTop: 18 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 }}>
              Logg ({activities.length})
            </div>

            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              <input style={{ ...S.input, flex: 1 }} placeholder="Hva skjedde? F.eks. «Ringte, ba om tilbud»"
                value={newActivity} onChange={e => setNewActivity(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); submitActivity() } }} />
              <button type="button" onClick={submitActivity} disabled={!newActivity.trim() || savingActivity}
                style={{ ...S.btnSmall, background: '#6366f1', opacity: newActivity.trim() ? 1 : 0.5, whiteSpace: 'nowrap' }}>
                {savingActivity ? '...' : 'Legg til'}
              </button>
            </div>

            {activities.length === 0 && (
              <div style={{ fontSize: 12, color: '#94a3b8', fontStyle: 'italic' }}>
                Ingen logg ennå. Skriv ned hva som skjer, så har dere hele kundereisen når årsrapporten skal skrives.
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {activities.map(a => (
                <div key={a.id} style={{ background: '#f8fafc', borderRadius: 10, padding: '9px 12px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: 13, color: '#1e293b', lineHeight: 1.5 }}>{a.text}</div>
                  <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 3 }}>
                    {a.author_name || 'Ukjent'} · {new Date(a.created_at).toLocaleDateString('nb-NO', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Shared Components ────────────────────────────────────────────────────────

function Avatar({ name = '?', size = 36 }) {
  const colors = ['#667eea', '#f97316', '#22c55e', '#a855f7', '#ec4899', '#3b82f6']
  const color = colors[(name.charCodeAt(0) || 0) % colors.length]
  return <div style={{ width: size, height: size, borderRadius: Math.round(size * 0.27), background: color, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: Math.round(size * 0.42), flexShrink: 0 }}>{name[0]?.toUpperCase()}</div>
}

function DonutChart({ pct, color, size = 44, textColor }) {
  return (
    <svg viewBox="0 0 36 36" style={{ width: size, height: size }}>
      <circle cx="18" cy="18" r="15" fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth="4" />
      <circle cx="18" cy="18" r="15" fill="none" stroke={color} strokeWidth="4" strokeDasharray={`${pct * 0.942} 100`} strokeLinecap="round" transform="rotate(-90 18 18)" style={{ transition: 'stroke-dasharray 0.5s ease' }} />
      <text x="18" y="22" textAnchor="middle" fontSize="9" fontWeight="bold" fill={textColor || color}>{pct}%</text>
    </svg>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const S = {
  authBg: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: 20, boxSizing: 'border-box' },
  authCard: { background: '#fff', borderRadius: 24, padding: '36px 32px', width: '100%', maxWidth: 400, boxShadow: '0 20px 60px rgba(0,0,0,0.2)', position: 'relative' },
  authLogo: { fontSize: 48, textAlign: 'center', marginBottom: 4 },
  authTitle: { fontSize: 26, fontWeight: 900, color: '#1e293b', textAlign: 'center', margin: '0 0 4px', letterSpacing: '-0.5px' },
  authSub: { fontSize: 14, color: '#94a3b8', textAlign: 'center', margin: '0 0 24px' },
  form: { display: 'flex', flexDirection: 'column', gap: 12 },
  input: { padding: '12px 14px', borderRadius: 12, border: '1.5px solid #e2e8f0', fontSize: 14, fontFamily: 'inherit', outline: 'none', background: '#f8fafc', color: '#1e293b', boxSizing: 'border-box', width: '100%' },
  select: { padding: '12px 14px', borderRadius: 12, border: '1.5px solid #e2e8f0', fontSize: 14, fontFamily: 'inherit', outline: 'none', background: '#f8fafc', color: '#1e293b', width: '100%', boxSizing: 'border-box' },
  btnPrimary: { padding: '13px', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg, #667eea, #764ba2)', color: '#fff', fontWeight: 800, fontSize: 15, cursor: 'pointer', fontFamily: 'inherit', marginTop: 4 },
  btnSmall: { padding: '12px 18px', borderRadius: 12, border: 'none', color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0 },
  error: { color: '#ef4444', fontSize: 13, textAlign: 'center', margin: 0 },
  authSwitch: { textAlign: 'center', fontSize: 13, color: '#64748b', marginTop: 16, marginBottom: 0 },
  linkBtn: { background: 'none', border: 'none', color: '#6366f1', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', fontSize: 13 },
  backBtn: { position: 'absolute', top: 16, left: 20, background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: 13, fontFamily: 'inherit' },
  roleRow: { display: 'flex', gap: 12, margin: '0 0 20px' },
  roleCard: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px 12px', borderRadius: 16, border: '2px solid #e2e8f0', cursor: 'pointer', background: '#f8fafc', fontFamily: 'inherit', color: '#1e293b', transition: 'all 0.15s' },
  roleCardActive: { borderColor: '#6366f1', background: '#eef2ff' },
  divider: { display: 'flex', alignItems: 'center', gap: 8 },
  dividerText: { fontSize: 11, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, whiteSpace: 'nowrap' },
  appRoot: { fontFamily: "'Nunito','Segoe UI',sans-serif", minHeight: '100vh', background: '#f1f5f9', display: 'flex', flexDirection: 'column' },
  header: { background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 10 },
  appTitle: { fontSize: 17, fontWeight: 800, color: '#1e293b', letterSpacing: '-0.3px' },
  appSub: { fontSize: 11, color: '#94a3b8', marginTop: 1 },
  iconBtn: { background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', padding: 4, borderRadius: 8 },
  nav: { display: 'flex', gap: 8, padding: '12px 16px', overflowX: 'auto', background: '#fff', borderBottom: '1px solid #e2e8f0', scrollbarWidth: 'none' },
  tab: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '10px 14px', borderRadius: 14, border: '2px solid', cursor: 'pointer', minWidth: 76, flexShrink: 0, transition: 'all 0.2s ease', fontFamily: 'inherit', position: 'relative' },
  main: { flex: 1, padding: '16px', display: 'flex', flexDirection: 'column', gap: 12 },
  phaseHeader: { borderRadius: 16, border: '1.5px solid', padding: '14px 16px' },
  progressBar: { flex: 1, height: 8, background: '#e2e8f0', borderRadius: 99, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 99, transition: 'width 0.4s ease' },
  taskItem: { display: 'flex', alignItems: 'flex-start', gap: 10, background: '#fff', borderRadius: 12, padding: '12px 14px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' },
  checkbox: { width: 24, height: 24, borderRadius: 8, border: '2px solid', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.15s ease', padding: 0, marginTop: 1 },
  deleteBtn: { background: 'none', border: 'none', color: '#cbd5e1', fontSize: 20, cursor: 'pointer', lineHeight: 1, padding: '0 2px', flexShrink: 0 },
  filterChip: { fontSize: 12, fontWeight: 600, padding: '5px 12px', borderRadius: 99, border: '1.5px solid', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s' },
  settingsPanel: { background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '16px 20px' },
  codeBox: { display: 'flex', alignItems: 'center', gap: 10, background: '#f8fafc', borderRadius: 10, padding: '10px 14px' },
  code: { fontSize: 22, fontWeight: 900, letterSpacing: 4, color: '#6366f1', fontFamily: 'monospace' },
  copyBtn: { background: '#6366f1', color: '#fff', border: 'none', borderRadius: 8, padding: '5px 12px', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' },
  memberRow: { display: 'flex', alignItems: 'center', gap: 10, padding: '7px 0', borderBottom: '1px solid #f1f5f9' },
  memberChip: { display: 'flex', alignItems: 'center', gap: 8, background: '#f8fafc', borderRadius: 10, padding: '8px 12px' },
  dashLayout: { display: 'flex', flex: 1, overflow: 'hidden', minHeight: 0 },
  sidebar: { width: 280, flexShrink: 0, borderRight: '1px solid #e2e8f0', background: '#fff', overflowY: 'auto', padding: '12px 0' },
  sidebarTitle: { fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.8, padding: '0 16px 10px' },
  companyCard: { width: '100%', textAlign: 'left', border: 'none', padding: '12px 16px', cursor: 'pointer', fontFamily: 'inherit', borderBottom: '1px solid #f1f5f9', transition: 'background 0.15s' },
  dashMain: { flex: 1, overflowY: 'auto', padding: 20 },
  dashCompanyHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 },
  membersRow: { display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  emptyState: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: 300 },
}

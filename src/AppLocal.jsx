import { useState, useCallback, useEffect } from "react";

const APP_VERSION = "1.0.0";

// ─── Oppstart tasks – direkte fra elevbedrift.no/oppstart ────────────────────
// Sjekklisten på siden har 5 offisielle punkter, supplert med diskusjonsspørsmål,
// faseplan-nedlasting og Its learning-innlevering.

const OPPSTART_TASKS = [
  {
    text: "Vi vet hva en entreprenør er",
    info: "En entreprenør er en person som starter bedrift for seg selv. Entreprenører finner vi i alle bransjer, og typisk for dem er at de: ser et behov og finner løsninger, tenker nytt og kreativt, har tro på ideen sin, og har mot og vilje til å gjennomføre det de vil.",
    link: "https://elevbedrift.no/oppstart",
  },
  {
    text: "Vi vet hva en elevbedrift skal gjøre",
    info: "En elevbedrift finner et behov eller et problem, lager en god løsning og skaper verdier både for seg selv og andre! Bruk tid i starten på å finne behov og problemer rundt dere – på skolen, i lokalsamfunnet, i byen, i Norge eller i verden. Løsningen er et produkt: en vare eller en tjeneste. Verdiskapingen kan være å tjene penger, hjelpe mennesker (sosialt entreprenørskap) eller skape en mer miljøvennlig verden (grønt entreprenørskap).",
    link: "https://elevbedrift.no/oppstart",
  },
  {
    text: "Vi kjenner til FNs bærekraftsmål",
    info: "Når dere skal ut i arbeidslivet må dere tenke på, og ta hensyn til, helt andre ting enn generasjonene før dere. Det MÅ TENKES NYTT på mange områder. Ved å ta utgangspunkt i ett eller flere av FNs bærekraftsmål kan dere bidra til en litt bedre verden gjennom elevbedriften! Diskuter i gruppen: Hvilke bærekraftsmål synes dere er spennende? Hvilke problemer finnes innenfor disse målene?",
    link: "https://elevbedrift.no/oppstart",
  },
  {
    text: "Vi har fylt ut PLANEN til fase 1",
    info: "Last ned og fyll inn Faseplan for oppstart fra elevbedrift.no. Planen hjelper dere å strukturere oppstartsfasen og dokumentere hva dere har gjort. Diskuter i gruppen: Hvilke forventinger har dere? Hvordan kan dere finne ut av hva dere har lyst til å gjøre? Kjenner dere noen som driver en bedrift?",
    link: "https://elevbedrift.no/oppstart",
  },
  {
    text: "Vi har PLAKATEN som viser fasene",
    info: "Sørg for at gruppen har oversiktsplakaten som viser alle fasene i elevbedrift-årshjulet: Oppstart → Idéutvikling → Etablering → Drift → Avvikling. Plakaten kan lastes ned fra elevbedrift.no og henges opp som en påminnelse om hvor dere er i prosessen.",
    link: "https://elevbedrift.no/oppstart",
  },
  {
    text: "📤 Send inn til lærer på Its learning",
    info: "Husk å laste opp dokumentasjon på Its learning når dere er ferdige med oppstartsfasen. Lever Faseplan for oppstart (bokmål eller nynorsk), og eventuelle notater fra gruppediskusjonen. Læreren godkjenner fasen før dere går videre til Idéutvikling.",
    link: null,
    isSubmission: true,
  },
];

// ─── Constants ────────────────────────────────────────────────────────────────

const PHASES = [
  {
    id: "oppstart", label: "Oppstart", emoji: "🚀", color: "#F97316", light: "#FFF7ED", border: "#FDBA74",
    defaultTasks: OPPSTART_TASKS,
  },
  {
    id: "ideutvikling", label: "Idéutvikling", emoji: "💡", color: "#3B82F6", light: "#EFF6FF", border: "#93C5FD",
    defaultTasks: [
      { text: "Gjennomfør idémyldring", info: "Bruk minst 15 minutter på å skrive ned alle idéer uten å vurdere dem. Post-it-lapper fungerer bra. Ingen idé er for dum i denne fasen." },
      { text: "Velg forretningsidé", info: "Velg idéen som har best potensial basert på: markedsbehov, kostnad å lage, og gruppens kompetanse." },
      { text: "Lag en enkel prototype", info: "Lag en fysisk eller digital modell/skisse av produktet/tjenesten. Vis den til noen og få tilbakemelding." },
      { text: "Kartlegg målgruppen", info: "Hvem er den typiske kunden? Alder, interesser, betalingsvilje. Lag gjerne en 'kundepersona'." },
      { text: "Gjennomfør markedsundersøkelse", info: "Spør minst 10 potensielle kunder om de ville kjøpt produktet og hva de ville betalt. Google Forms fungerer bra til dette." },
    ],
  },
  {
    id: "etablering", label: "Etablering", emoji: "🏗️", color: "#22C55E", light: "#F0FDF4", border: "#86EFAC",
    defaultTasks: [
      { text: "Fullfør forretningsplan", info: "Fyll ut alle delene: produkt/tjeneste, marked, konkurrenter, markedsplan, økonomiplan og organisasjon. Bruk malen fra UE." },
      { text: "Selg aksjer og skaff startkapital", info: "Selg aksjer til medelever, familie og lærere. Typisk pris: 20–50 kr per aksje. Før aksjebok nøye." },
      { text: "Åpne bankkonto / opprett kassabok", info: "Alle inntekter og utgifter skal dokumenteres. Bruk enten en enkel kassabok i Excel eller et regnskapsverktøy." },
      { text: "Registrer bedriften hos UE", info: "Sørg for at registreringen på elevbedrift.no er fullstendig med alle medlemmer, roller og forretningsidé." },
      { text: "Lag logo og visuell profil", info: "Velg farger og font som passer merkevaren. Gratis verktøy: Canva. Bruk logoen konsekvent på alt materiell." },
      { text: "Sett opp nettside eller sosiale medier", info: "Minst én kanal for å nå kunder. Instagram eller TikTok fungerer godt for unge målgrupper. Nettside kan lages gratis på Wix eller Squarespace." },
    ],
  },
  {
    id: "drift", label: "Drift", emoji: "⚙️", color: "#A855F7", light: "#FAF5FF", border: "#D8B4FE",
    weeklyTasks: [
      { text: "Skriv ukereferat", info: "Skriv kort hva dere har gjort denne uken, hva som gikk bra og hva som var utfordrende. Referatet lagres i historikken.", recurring: true },
      { text: "Oppdater regnskap", info: "Registrer alle inntekter og utgifter fra uken. Husk bilag for alt!", recurring: true },
      { text: "Post på sosiale medier", info: "Del noe fra bedriften denne uken – produkt, bak-kulissen, kundehistorie eller fremgang.", recurring: true },
      { text: "Oppdater CRM", info: "Gå gjennom kundeoversikten. Er det noen leads som skal følges opp? Nye kunder å legge til?", recurring: true },
      { text: "Teammøte gjennomført", info: "Hold ukentlig møte med agenda. Hvem gjør hva neste uke? Skriv kort referat.", recurring: true },
    ],
    defaultTasks: [
      { text: "Skriv ukereferat", info: "Skriv kort hva dere har gjort denne uken, hva som gikk bra og hva som var utfordrende.", recurring: true },
      { text: "Oppdater regnskap", info: "Registrer alle inntekter og utgifter fra uken. Husk bilag for alt!", recurring: true },
      { text: "Post på sosiale medier", info: "Del noe fra bedriften denne uken.", recurring: true },
      { text: "Oppdater CRM", info: "Følg opp leads og kunder i CRM-oversikten.", recurring: true },
      { text: "Teammøte gjennomført", info: "Hold ukentlig møte og skriv referat.", recurring: true },
    ],
  },
  {
    id: "avvikling", label: "Avvikling", emoji: "🏁", color: "#EC4899", light: "#FFF1F7", border: "#F9A8D4",
    defaultTasks: [
      { text: "Lag årsregnskap", info: "Summer alle inntekter og utgifter, regn ut overskudd/underskudd. Bruk malen fra UE. Revisjon kan gjøres av en medelev fra en annen gruppe." },
      { text: "Skriv årsrapport", info: "Årsrapporten dokumenterer hele bedriftens levetid: hva dere gjorde, hva som gikk bra, hva dere lærte. Bruk UEs mal." },
      { text: "Presenter for investorer", info: "Hold en kort presentasjon (5–10 min) for aksjonærene. Vis frem årsregnskap og fortell om året." },
      { text: "Betal tilbake aksjekapital", info: "Aksjonærene skal få tilbake pengene sine (pluss eventuelt utbytte). Dokumenter utbetalingen i aksjebok." },
      { text: "Evaluer skoleåret i gruppen", info: "Hva lærte dere? Hva ville dere gjort annerledes? Skriv en kort felles evaluering og en individuell del." },
    ],
  },
];

const ROLES = [
  "Daglig leder",
  "Økonomiansvarlig",
  "Personalansvarlig",
  "Bærekraftsansvarlig",
  "Markedsansvarlig",
  "Kommunikasjonsansvarlig",
  "Produksjonsansvarlig",
  "Salgsansvarlig",
  "Innkjøpsansvarlig",
  "Andre stillinger",
];
const CRM_STATUSES = [
  { id: "lead",      label: "Lead",         color: "#94a3b8", bg: "#f8fafc" },
  { id: "kontaktet", label: "Kontaktet",    color: "#3B82F6", bg: "#EFF6FF" },
  { id: "tilbud",    label: "Tilbud sendt", color: "#F97316", bg: "#FFF7ED" },
  { id: "kunde",     label: "Kunde",        color: "#22C55E", bg: "#F0FDF4" },
  { id: "tapt",      label: "Tapt",         color: "#EC4899", bg: "#FFF1F7" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function genId() { return Math.random().toString(36).substr(2, 9); }
function getWeekNumber() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3 - (d.getDay() + 6) % 7);
  const week1 = new Date(d.getFullYear(), 0, 4);
  return 1 + Math.round(((d.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
}
function getCurrentYear() { return new Date().getFullYear(); }
function genCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}
function load(key) { try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : null; } catch { return null; } }
function save(key, val) { try { localStorage.setItem(key, JSON.stringify(val)); } catch {} }

function initCompanyTasks() {
  const t = {};
  PHASES.forEach(p => {
    t[p.id] = p.defaultTasks.map(task => ({
      id: genId(),
      text: typeof task === "string" ? task : task.text,
      info: typeof task === "object" ? task.info : null,
      link: typeof task === "object" ? task.link : null,
      isSubmission: typeof task === "object" ? !!task.isSubmission : false,
      recurring: typeof task === "object" ? !!task.recurring : false,
      done: false,
      doneBy: null,
      approvedBy: null,
      assignedTo: [],
    }));
  });
  return t;
}

function initWeeklyLogs() {
  // weeklyLogs: array of { id, week, year, text, teacherComment, approvedBy, createdAt }
  return [];
}

function seedDB() {
  const db = { users: {}, companies: {} };
  const sid = genId(), tid = genId(), m2 = genId(), l1 = genId(), l2 = genId();
  const c1 = genId(), c2 = genId(), c3 = genId();
  const t1 = initCompanyTasks();
  t1.oppstart[0].done = true; t1.oppstart[0].doneBy = "Kari Nordmann"; t1.oppstart[0].assignedTo = [sid]; t1.oppstart[0].approvedBy = "Ola Hansen";
  t1.oppstart[1].done = true; t1.oppstart[1].doneBy = "Per Solberg";   t1.oppstart[1].assignedTo = [sid, m2];
  t1.oppstart[2].done = true; t1.oppstart[2].doneBy = "Kari Nordmann"; t1.oppstart[2].assignedTo = [sid];
  t1.ideutvikling[0].assignedTo = [sid];
  t1.ideutvikling[1].assignedTo = [sid, m2];
  const t2 = initCompanyTasks(); t2.oppstart[0].done = true; t2.oppstart[0].doneBy = "Lars Bakke";
  const t3 = initCompanyTasks();
  const crm1 = [
    { id: genId(), name: "Sofie Dahl",  type: "Privatperson", email: "sofie@example.no", phone: "99887766", status: "kunde",     note: "Kjøpte gorines på skolemarked",     assignedTo: sid, createdAt: Date.now() - 86400000 * 14 },
    { id: genId(), name: "Bygger'n AS", type: "Bedrift",      email: "post@byggern.no",  phone: "22334455", status: "tilbud",    note: "Venter på svar om bulk-bestilling", assignedTo: m2,  createdAt: Date.now() - 86400000 * 7  },
    { id: genId(), name: "Martin Lund", type: "Privatperson", email: "",                 phone: "47474747", status: "lead",      note: "Møtte ham på messe",                assignedTo: sid, createdAt: Date.now() - 86400000 * 3  },
  ];
  db.users[sid] = { id: sid, name: "Kari Nordmann", email: "kari@demo.no", password: "demo", role: "student", school: "Vennesla VGS", companyId: c1 };
  db.users[tid] = { id: tid, name: "Ola Hansen",    email: "ola@demo.no",  password: "demo", role: "teacher", school: "Vennesla VGS" };
  db.users[m2]  = { id: m2,  name: "Per Solberg",   email: "per@demo.no",  password: "demo", role: "student", school: "Vennesla VGS", companyId: c1 };
  db.users[l1]  = { id: l1,  name: "Lars Bakke",    email: "lars@demo.no", password: "demo", role: "student", school: "Vennesla VGS", companyId: c2 };
  db.users[l2]  = { id: l2,  name: "Sara Lie",      email: "sara@demo.no", password: "demo", role: "student", school: "Vennesla VGS", companyId: c3 };
  const currentWeek = getWeekNumber(); const currentYear = getCurrentYear();
  const demoLogs = [
    { id: genId(), week: currentWeek - 2, year: currentYear, text: "Vi hadde et bra møte tirsdag. Kari tok kontakt med tre nye potensielle kunder på Instagram. Per fullførte regnskapet for forrige uke. Vi solgte 12 gorines på skolemarkedet fredag!", teacherComment: "Bra innsats! Husk å føre alle salgene i regnskapet.", approvedBy: "Ola Hansen", createdAt: Date.now() - 86400000 * 14 },
    { id: genId(), week: currentWeek - 1, year: currentYear, text: "Travelt med prøver denne uken, men vi fikk sendt faktura til Bygger'n AS. Postet bilder fra produksjonen på Instagram – fikk mange likes! Møtet ble litt kort.", teacherComment: null, approvedBy: null, createdAt: Date.now() - 86400000 * 7 },
  ];
  db.companies[c1] = { id: c1, code: genCode(), name: "Fryz UB",     school: "Vennesla VGS", createdBy: sid, members: [{ userId: sid, role: "Daglig leder" }, { userId: m2, role: "Økonomiansvarlig" }], tasks: t1, crm: crm1, weeklyLogs: demoLogs, createdAt: Date.now() - 86400000 * 30 };
  db.companies[c2] = { id: c2, code: genCode(), name: "ScanBack UB", school: "Vennesla VGS", createdBy: l1,  members: [{ userId: l1, role: "Daglig leder" }],  tasks: t2, crm: [], weeklyLogs: [], createdAt: Date.now() - 86400000 * 20 };
  db.companies[c3] = { id: c3, code: genCode(), name: "NordTech UB", school: "Vennesla VGS", createdBy: l2,  members: [{ userId: l2, role: "Markedsansvarlig" }],  tasks: t3, crm: [], weeklyLogs: [], createdAt: Date.now() - 86400000 * 10 };
  return db;
}

function getDB() {
  const saved = load("ub_db");
  if (saved && Object.keys(saved.users).length > 0) return saved;
  const fresh = seedDB(); saveDB(fresh); return fresh;
}
function saveDB(db) { save("ub_db", db); }

// ─── Main App ─────────────────────────────────────────────────────────────────

export default function App() {
  const [session, setSession] = useState(() => {
    // Auto-login fra URL-parameter ?demo=1&role=student|teacher
    const params = new URLSearchParams(window.location.search)
    const role = params.get("role")
    if (params.get("demo") === "1" && role) {
      const db = getDB()
      const user = Object.values(db.users).find(u => u.role === role)
      if (user) {
        save("ub_session", { userId: user.id })
        return { userId: user.id }
      }
    }
    return load("ub_session")
  });
  const [view, setView] = useState(() => {
    const s = load("ub_session"); if (!s) return "login";
    const db = getDB(); return db.users[s.userId]?.role === "teacher" ? "teacher" : "app";
  });

  function login(s) { save("ub_session", s); setSession(s); const db = getDB(); setView(db.users[s.userId]?.role === "teacher" ? "teacher" : "app"); }
  function logout() { save("ub_session", null); setSession(null); setView("login"); }

  if (!session || view === "login") return view === "register"
    ? <RegisterScreen onLogin={login} onBack={() => setView("login")} />
    : <LoginScreen onLogin={login} onRegister={() => setView("register")} />;

  const db = getDB();
  const user = db.users[session.userId];
  if (!user) return null;
  if (user.role === "teacher") return <TeacherDashboard user={user} onLogout={logout} />;
  return <StudentApp user={user} onLogout={logout} />;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────


// ─── Install Button Component ─────────────────────────────────────────────────

function InstallButton() {
  const [installPrompt, setInstallPrompt] = useState(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const handler = e => { e.preventDefault(); setInstallPrompt(e); };
    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', () => setInstalled(true));
    if (window.matchMedia('(display-mode: standalone)').matches) setInstalled(true);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  async function installApp() {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') setInstalled(true);
    setInstallPrompt(null);
  }

  if (installed) return (
    <div style={{ background: '#f0fdf4', borderRadius: 12, padding: '10px 14px', textAlign: 'center', marginTop: 12 }}>
      <p style={{ fontSize: 13, color: '#16a34a', fontWeight: 700, margin: 0 }}>✅ Appen er installert!</p>
    </div>
  );

  if (installPrompt) return (
    <button onClick={installApp}
      style={{ width: '100%', marginTop: 12, padding: '13px', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg, #22c55e, #16a34a)', color: '#fff', fontWeight: 800, fontSize: 15, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
      📲 Installer app på telefonen
    </button>
  );

  return (
    <div style={{ background: '#f8fafc', borderRadius: 12, padding: '12px 14px', border: '1px solid #e2e8f0', textAlign: 'center', marginTop: 12 }}>
      <p style={{ fontSize: 12, color: '#64748b', margin: '0 0 6px', fontWeight: 600 }}>📲 Installer appen</p>
      <p style={{ fontSize: 11, color: '#94a3b8', margin: 0, lineHeight: 1.5 }}>
        <strong>Android:</strong> Trykk ⋮ → "Installer app"<br/>
        <strong>iPhone:</strong> Trykk Del 🔗 → "Legg til på hjem-skjerm"
      </p>
    </div>
  );
}

function LoginScreen({ onLogin, onRegister }) {
  const [email, setEmail] = useState(""); const [pw, setPw] = useState(""); const [err, setErr] = useState("");
  function submit(e) {
    e.preventDefault();
    const db = getDB();
    const user = Object.values(db.users).find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user || user.password !== pw) { setErr("Feil e-post eller passord."); return; }
    onLogin({ userId: user.id });
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
        <button style={S.btnPrimary} type="submit">Logg inn</button>
      </form>
      <p style={S.authSwitch}>Ingen konto? <button style={S.linkBtn} onClick={onRegister}>Registrer deg</button></p>

      {/* Installer app-knapp */}
      <InstallButton />

      {/* Demo-modus – isolert localStorage, ikke koblet til Supabase */}
      <div style={{ borderTop: "1px solid #e2e8f0", marginTop: 20, paddingTop: 18 }}>
        <div style={{ background: "linear-gradient(135deg, #f0fdf4, #eff6ff)", borderRadius: 14, padding: "16px 14px", border: "1px solid #e2e8f0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <span style={{ fontSize: 18 }}>🎮</span>
            <span style={{ fontSize: 13, fontWeight: 800, color: "#1e293b" }}>Prøv demo – ingen registrering</span>
          </div>
          <p style={{ fontSize: 12, color: "#64748b", margin: "0 0 12px", lineHeight: 1.6 }}>
            Utforsk appen som elev eller lærer med ferdig eksempeldata. Helt isolert – påvirker ingen ekte brukere.
          </p>
          <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
            {[{ role: "student", emoji: "🧑", label: "Elev", name: "Kari Nordmann" }, { role: "teacher", emoji: "👩", label: "Lærer", name: "Ola Hansen" }].map(d => (
              <button key={d.role} onClick={() => {
                const db = getDB();
                const u = Object.values(db.users).find(u => u.role === d.role);
                if (u) onLogin({ userId: u.id });
              }} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: "12px 8px", borderRadius: 12, border: "1.5px solid #e2e8f0", cursor: "pointer", background: "#fff", fontFamily: "inherit", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", transition: "all 0.15s" }}>
                <span style={{ fontSize: 24 }}>{d.emoji}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#1e293b" }}>{d.label}</span>
                <span style={{ fontSize: 11, color: "#94a3b8" }}>{d.name}</span>
              </button>
            ))}
          </div>
          <button onClick={() => {
            if (window.confirm("Dette nullstiller all demo-data og starter på nytt med ferske eksempeloppgaver. Fortsette?")) {
              localStorage.removeItem("ub_db");
              localStorage.removeItem("ub_session");
              localStorage.removeItem("ub_admin_tasks");
              window.location.reload();
            }
          }} style={{ width: "100%", padding: "8px", borderRadius: 10, border: "1px dashed #cbd5e1", background: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 12, color: "#94a3b8", display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}>
            🔄 Nullstill demo-data
          </button>
        </div>
      </div>

      {/* Versjon */}
      <div style={{ textAlign: "center", marginTop: 14 }}>
        <p style={{ fontSize: 11, color: "#94a3b8", marginBottom: 3 }}>
          Utviklet ved <strong style={{ color: "#6366f1" }}>Vennesla vgs</strong>
        </p>
        <p style={{ fontSize: 10, color: "#cbd5e1", margin: 0 }}>v{APP_VERSION}</p>
      </div>

    </div></div>
  );
}

function RegisterScreen({ onLogin, onBack }) {
  const [step, setStep] = useState(1); const [role, setRole] = useState("student");
  const [name, setName] = useState(""); const [email, setEmail] = useState(""); const [pw, setPw] = useState(""); const [school, setSchool] = useState("");
  const [sRole, setSRole] = useState("Daglig leder"); const [code, setCode] = useState(""); const [err, setErr] = useState("");

  function submit(e) {
    e.preventDefault();
    const db = getDB();
    if (!name || !email || !pw || !school) { setErr("Fyll inn alle feltene."); return; }
    if (pw.length < 4) { setErr("Passordet må være minst 4 tegn."); return; }
    if (Object.values(db.users).find(u => u.email.toLowerCase() === email.toLowerCase())) { setErr("E-posten er allerede i bruk."); return; }
    const uid = genId(); const user = { id: uid, name, email, password: pw, role, school };
    if (role === "student") {
      if (code) {
        const co = Object.values(db.companies).find(c => c.code === code.toUpperCase());
        if (!co) { setErr("Fant ingen bedrift med den koden."); return; }
        co.members.push({ userId: uid, role: sRole }); user.companyId = co.id;
      } else {
        const cid = genId();
        db.companies[cid] = { id: cid, code: genCode(), name: name + "s bedrift", school, createdBy: uid, members: [{ userId: uid, role: sRole }], tasks: initCompanyTasks(), crm: [], createdAt: Date.now() };
        user.companyId = cid;
      }
    }
    db.users[uid] = user; saveDB(db); onLogin({ userId: uid });
  }

  if (step === 1) return (
    <div style={S.authBg}><div style={S.authCard}>
      <button style={S.backBtn} onClick={onBack}>← Tilbake</button>
      <div style={S.authLogo}>🎓</div><h1 style={S.authTitle}>Opprett konto</h1><p style={S.authSub}>Hvem er du?</p>
      <div style={S.roleRow}>
        {[{ v: "student", e: "🧑", l: "Elev" }, { v: "teacher", e: "👩", l: "Lærer" }].map(r => (
          <button key={r.v} onClick={() => setRole(r.v)} style={{ ...S.roleCard, ...(role === r.v ? S.roleCardActive : {}) }}>
            <span style={{ fontSize: 36 }}>{r.e}</span><span style={{ fontWeight: 700 }}>{r.l}</span>
          </button>
        ))}
      </div>
      <button style={S.btnPrimary} onClick={() => setStep(2)}>Fortsett</button>
    </div></div>
  );

  return (
    <div style={S.authBg}><div style={S.authCard}>
      <button style={S.backBtn} onClick={() => setStep(1)}>← Tilbake</button>
      <div style={S.authLogo}>{role === "teacher" ? "👩" : "🧑"}</div>
      <h1 style={S.authTitle}>{role === "teacher" ? "Ny lærer" : "Ny elev"}</h1>
      <form onSubmit={submit} style={S.form}>
        <input style={S.input} placeholder="Fullt navn" value={name} onChange={e => setName(e.target.value)} required />
        <input style={S.input} type="email" placeholder="E-post" value={email} onChange={e => setEmail(e.target.value)} required />
        <input style={S.input} type="password" placeholder="Passord" value={pw} onChange={e => setPw(e.target.value)} required />
        <input style={S.input} placeholder="Skole" value={school} onChange={e => setSchool(e.target.value)} required />
        {role === "student" && <>
          <div style={S.divider}><span style={S.dividerText}>Din rolle i bedriften</span></div>
          <select style={S.select} value={sRole} onChange={e => setSRole(e.target.value)}>{ROLES.map(r => <option key={r}>{r}</option>)}</select>
          <div style={S.divider}><span style={S.dividerText}>Tilkoblingskode (tom = ny bedrift)</span></div>
          <input style={{ ...S.input, letterSpacing: 4 }} placeholder="F.eks. XK7R2P" value={code} onChange={e => setCode(e.target.value)} maxLength={6} />
        </>}
        {err && <p style={S.error}>{err}</p>}
        <button style={S.btnPrimary} type="submit">Opprett konto</button>
      </form>
    </div></div>
  );
}

// ─── Student App ──────────────────────────────────────────────────────────────

function StudentApp({ user, onLogout }) {
  const [db, setDb] = useState(getDB);
  const [mainTab, setMainTab] = useState("tasks");
  const [activePhase, setActivePhase] = useState("oppstart");
  const [filterUserId, setFilterUserId] = useState(null);
  const [newTask, setNewTask] = useState("");
  const [showInfo, setShowInfo] = useState(false);
  const [assignModal, setAssignModal] = useState(null);
  const [expandedInfo, setExpandedInfo] = useState(null);
  const [crmModal, setCrmModal] = useState(null);
  const [weeklyLogText, setWeeklyLogText] = useState("");
  const [showLogHistory, setShowLogHistory] = useState(false);

  const refresh = useCallback(() => setDb(getDB()), []);
  function mutate(fn) { const d = getDB(); fn(d); saveDB(d); refresh(); }

  const company = db.companies[user.companyId];
  if (!company) return <div style={S.authBg}><p style={{ color: "#fff" }}>Bedrift ikke funnet.</p></div>;

  const members = company.members.map(m => db.users[m.userId]).filter(Boolean);
  const memberInfo = company.members.find(m => m.userId === user.id);
  const phase = PHASES.find(p => p.id === activePhase);
  let phaseTasks = company.tasks[activePhase] || [];
  if (filterUserId) phaseTasks = phaseTasks.filter(t => (t.assignedTo || []).includes(filterUserId));

  const totalAll = Object.values(company.tasks).flat().length;
  const doneAll  = Object.values(company.tasks).flat().filter(t => t.done).length;
  const overallPct = totalAll === 0 ? 0 : Math.round(doneAll / totalAll * 100);
  const rawPhaseTasks = company.tasks[activePhase] || [];
  const phDone = rawPhaseTasks.filter(t => t.done).length;
  const phTotal = rawPhaseTasks.length;
  const phPct = phTotal === 0 ? 0 : Math.round(phDone / phTotal * 100);
  const myPendingTasks = Object.entries(company.tasks).flatMap(([phaseId, tasks]) =>
    tasks.filter(t => (t.assignedTo || []).includes(user.id) && !t.done).map(t => ({ ...t, phaseId }))
  );
  // Pending approval count (done but not yet approved)
  const pendingApproval = Object.values(company.tasks).flat().filter(t => t.done && !t.approvedBy).length;

  function toggleTask(id) {
    mutate(d => {
      const t = d.companies[company.id].tasks[activePhase].find(t => t.id === id);
      if (t.done && t.approvedBy) return; // can't uncheck approved tasks
      t.done = !t.done; t.doneBy = t.done ? user.name : null;
      if (!t.done) t.approvedBy = null; // reset approval if unchecked
    });
  }
  function deleteTask(id) { mutate(d => { d.companies[company.id].tasks[activePhase] = d.companies[company.id].tasks[activePhase].filter(t => t.id !== id); }); }
  function addTask() {
    if (!newTask.trim()) return;
    mutate(d => { d.companies[company.id].tasks[activePhase].push({ id: genId(), text: newTask.trim(), info: null, done: false, doneBy: null, approvedBy: null, assignedTo: [] }); });
    setNewTask("");
  }
  function toggleAssign(taskId, userId) {
    mutate(d => {
      const t = d.companies[company.id].tasks[activePhase].find(t => t.id === taskId);
      if (!t.assignedTo) t.assignedTo = [];
      if (t.assignedTo.includes(userId)) t.assignedTo = t.assignedTo.filter(id => id !== userId);
      else t.assignedTo.push(userId);
    });
  }

  function completeRecurring(taskId) {
    const week = getWeekNumber();
    const year = getCurrentYear();
    mutate(d => {
      const tasks = d.companies[company.id].tasks.drift;
      const t = tasks.find(t => t.id === taskId);
      if (!t) return;
      // Archive done version with week label
      const archived = { ...t, id: genId(), text: `${t.text} – uke ${week}`, done: true, doneBy: user.name, approvedBy: null, archived: true, week, year };
      // Reset current task
      t.done = false; t.doneBy = null; t.approvedBy = null;
      // Add archived version after current
      const idx = tasks.indexOf(t);
      tasks.splice(idx + 1, 0, archived);
    });
  }

  function submitWeeklyLog() {
    if (!weeklyLogText.trim()) return;
    const week = getWeekNumber();
    const year = getCurrentYear();
    mutate(d => {
      if (!d.companies[company.id].weeklyLogs) d.companies[company.id].weeklyLogs = [];
      // Remove existing log for this week if any
      d.companies[company.id].weeklyLogs = d.companies[company.id].weeklyLogs.filter(l => !(l.week === week && l.year === year));
      d.companies[company.id].weeklyLogs.push({ id: genId(), week, year, text: weeklyLogText.trim(), teacherComment: null, approvedBy: null, createdAt: Date.now() });
    });
    setWeeklyLogText("");
  }

  return (
    <div style={S.appRoot}>
      <header style={S.header}>
        <div>
          <div style={S.appTitle}>{company.name}</div>
          <div style={S.appSub}>{user.name} · {memberInfo?.role} · {user.school}</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 10, color: "#cbd5e1", fontWeight: 600 }}>v{APP_VERSION}</span>
          {myPendingTasks.length > 0 && (
            <div title={`${myPendingTasks.length} oppgaver tilordnet deg`} style={{ background: "#ef4444", color: "#fff", borderRadius: 99, fontSize: 11, fontWeight: 700, padding: "2px 7px" }}>{myPendingTasks.length}</div>
          )}
          {pendingApproval > 0 && (
            <div title={`${pendingApproval} oppgaver venter på lærerens godkjenning`} style={{ background: "#f97316", color: "#fff", borderRadius: 99, fontSize: 11, fontWeight: 700, padding: "2px 7px" }}>⏳{pendingApproval}</div>
          )}
          <DonutChart pct={overallPct} color="#6366f1" size={40} />
          <button style={{ ...S.iconBtn, fontSize: 14, fontWeight: 700, color: "#6366f1", background: "#eef2ff", borderRadius: 8, padding: "4px 10px" }} onClick={() => setShowInfo(!showInfo)}>
            {user.name.split(" ")[0]} 👤
          </button>
          <button onClick={() => { if (window.confirm("Er du sikker på at du vil logge ut?")) onLogout(); }} style={{ background: "none", border: "1.5px solid #e2e8f0", borderRadius: 8, padding: "5px 12px", cursor: "pointer", fontFamily: "inherit", fontSize: 12, fontWeight: 700, color: "#64748b", display: "flex", alignItems: "center", gap: 5 }}>⏻ Logg ut</button>
        </div>
      </header>

      {showInfo && (
        <div style={S.settingsPanel}>
          {/* Profil */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16, padding: "12px 14px", background: "#f8fafc", borderRadius: 12, border: "1px solid #e2e8f0" }}>
            <Avatar name={user.name} size={48} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 800, fontSize: 15, color: "#1e293b" }}>{user.name}</div>
              <div style={{ fontSize: 12, color: "#94a3b8" }}>{user.email}</div>
            </div>
          </div>

          {/* Rediger rolle */}
          <div style={{ fontWeight: 700, marginBottom: 6, color: "#1e293b", fontSize: 13 }}>Din rolle i bedriften</div>
          <select value={memberInfo?.role || "Annet"} onChange={e => {
            mutate(d => {
              const m = d.companies[company.id].members.find(m => m.userId === user.id);
              if (m) m.role = e.target.value;
            });
          }} style={{ ...S.select, marginBottom: 14 }}>
            {ROLES.map(r => <option key={r}>{r}</option>)}
          </select>

          {/* Bedriftskode */}
          <div style={{ fontWeight: 700, marginBottom: 6, color: "#1e293b", fontSize: 13 }}>Bedriftskode</div>
          <div style={S.codeBox}><span style={S.code}>{company.code}</span><button style={S.copyBtn} onClick={() => navigator.clipboard?.writeText(company.code)}>Kopier</button></div>
          <p style={{ fontSize: 11, color: "#94a3b8", marginBottom: 14 }}>Del med gruppemedlemmer</p>

          {/* Gruppemedlemmer */}
          <div style={{ fontWeight: 700, marginBottom: 8, color: "#1e293b", fontSize: 13 }}>Gruppemedlemmer</div>
          {company.members.map(m => {
            const u = db.users[m.userId]; if (!u) return null;
            return (
              <div key={m.userId} style={S.memberRow}>
                <Avatar name={u.name} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{u.name}{u.id === user.id ? " (meg)" : ""}</div>
                  <div style={{ fontSize: 11, color: "#94a3b8" }}>{m.role}</div>
                </div>
              </div>
            );
          })}

          <button onClick={() => setShowInfo(false)} style={{ marginTop: 12, width: "100%", padding: "10px", borderRadius: 10, border: "1.5px solid #e2e8f0", background: "#f8fafc", cursor: "pointer", fontFamily: "inherit", fontWeight: 600, color: "#64748b", fontSize: 13 }}>Lukk</button>
        </div>
      )}

      {/* Tab bar */}
      <div style={{ display: "flex", background: "#fff", borderBottom: "1px solid #e2e8f0", padding: "0 8px" }}>
        {[{ id: "tasks", label: "📋 Oppgaver" }, { id: "crm", label: "👥 CRM" }, { id: "badges", label: "🏅 Badges" }].map(tab => (
          <button key={tab.id} onClick={() => setMainTab(tab.id)} style={{ padding: "12px 14px", background: "none", border: "none", borderBottom: mainTab === tab.id ? "2px solid #6366f1" : "2px solid transparent", fontWeight: mainTab === tab.id ? 700 : 500, color: mainTab === tab.id ? "#6366f1" : "#64748b", cursor: "pointer", fontFamily: "inherit", fontSize: 14, whiteSpace: "nowrap" }}>{tab.label}</button>
        ))}
      </div>

      {mainTab === "tasks" && <>
        <nav style={S.nav}>
          {PHASES.map(p => {
            const pt = company.tasks[p.id] || [];
            const pd = pt.filter(t => t.done).length;
            const pa = pt.filter(t => t.approvedBy).length;
            const isA = activePhase === p.id;
            return (
              <button key={p.id} onClick={() => { setActivePhase(p.id); setAssignModal(null); setExpandedInfo(null); }}
                style={{ ...S.tab, background: isA ? p.color : "#f8fafc", color: isA ? "#fff" : "#64748b", borderColor: isA ? p.color : "#e2e8f0", boxShadow: isA ? `0 4px 14px ${p.color}44` : "none", transform: isA ? "translateY(-2px)" : "none" }}>
                <span style={{ fontSize: 20 }}>{p.emoji}</span>
                <span style={{ fontSize: 11, fontWeight: 700 }}>{p.label}</span>
                <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 20, background: isA ? "rgba(255,255,255,0.25)" : p.light, color: isA ? "#fff" : p.color }}>{pa}/{pt.length}</span>
              </button>
            );
          })}
        </nav>

        <main style={S.main}>
          <div style={{ ...S.phaseHeader, background: phase.light, borderColor: phase.border }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: 30 }}>{phase.emoji}</span>
              <div>
                <div style={{ fontSize: 18, fontWeight: 800, color: phase.color }}>{phase.label}</div>
                <div style={{ fontSize: 12, color: "#64748b" }}>
                  {rawPhaseTasks.filter(t => t.approvedBy).length} godkjent · {phDone} av {phTotal} fullført
                </div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 10 }}>
              <div style={S.progressBar}><div style={{ ...S.progressFill, width: `${phPct}%`, background: phase.color }} /></div>
              <span style={{ fontSize: 13, fontWeight: 700, color: phase.color, minWidth: 36 }}>{phPct}%</span>
            </div>
          </div>

          {/* Its learning reminder */}
          <div style={{ background: "#fef9c3", border: "1px solid #fde047", borderRadius: 12, padding: "10px 14px", display: "flex", gap: 10, alignItems: "flex-start" }}>
            <span style={{ fontSize: 18, flexShrink: 0 }}>📤</span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#854d0e" }}>Husk å levere på Its learning!</div>
              <div style={{ fontSize: 12, color: "#92400e", marginTop: 2 }}>Huk av alle oppgavene, last opp dokumentasjon på Its learning, og be læreren godkjenne fasen før dere fortsetter.</div>
            </div>
          </div>

          {/* Filter chips */}
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
            <span style={{ fontSize: 12, color: "#64748b", fontWeight: 600 }}>Vis:</span>
            <button onClick={() => setFilterUserId(null)} style={{ ...S.filterChip, background: !filterUserId ? "#6366f1" : "#f8fafc", color: !filterUserId ? "#fff" : "#64748b", borderColor: !filterUserId ? "#6366f1" : "#e2e8f0" }}>Alle</button>
            {members.map(m => (
              <button key={m.id} onClick={() => setFilterUserId(filterUserId === m.id ? null : m.id)}
                style={{ ...S.filterChip, display: "flex", alignItems: "center", gap: 5, background: filterUserId === m.id ? "#6366f1" : "#f8fafc", color: filterUserId === m.id ? "#fff" : "#64748b", borderColor: filterUserId === m.id ? "#6366f1" : "#e2e8f0" }}>
                <span style={{ width: 18, height: 18, borderRadius: 5, background: filterUserId === m.id ? "rgba(255,255,255,0.3)" : "#e2e8f0", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700 }}>{m.name[0]}</span>
                {m.name.split(" ")[0]}{m.id === user.id ? " (meg)" : ""}
              </button>
            ))}
          </div>

          {/* My pending tasks alert */}
          {myPendingTasks.length > 0 && !filterUserId && (
            <div style={{ background: "#eef2ff", borderRadius: 12, padding: "10px 14px", border: "1px solid #c7d2fe" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#6366f1", marginBottom: 4 }}>📌 Tilordnet til deg ({myPendingTasks.length})</div>
              {myPendingTasks.slice(0, 3).map(t => { const ph = PHASES.find(p => p.id === t.phaseId); return <div key={t.id} style={{ fontSize: 12, color: "#4338ca", marginTop: 2 }}>{ph?.emoji} {t.text}</div>; })}
              {myPendingTasks.length > 3 && <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 4 }}>...og {myPendingTasks.length - 3} til</div>}
            </div>
          )}

          {/* Task list */}
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 8 }}>
            {phaseTasks.map(task => {
              const assignedUsers = (task.assignedTo || []).map(id => db.users[id]).filter(Boolean);
              const isAssignOpen = assignModal === task.id;
              const isInfoOpen = expandedInfo === task.id;
              const isApproved = !!task.approvedBy;
              const isSubmission = !!task.isSubmission;
              const hasInfo = !!task.info;
              const anyPanelOpen = isAssignOpen || isInfoOpen;

              return (
                <li key={task.id}>
                  {/* Main task row */}
                  <div style={{ ...S.taskItem, borderRadius: anyPanelOpen ? "12px 12px 0 0" : 12, background: isSubmission ? "#fffbeb" : "#fff", borderLeft: isSubmission ? "3px solid #f59e0b" : "none" }}>
                    {/* Checkbox */}
                    <button onClick={() => toggleTask(task.id)}
                      disabled={isApproved}
                      style={{ ...S.checkbox, borderColor: isApproved ? "#22c55e" : task.done ? phase.color : "#cbd5e1", background: isApproved ? "#22c55e" : task.done ? phase.color : "#fff", cursor: isApproved ? "default" : "pointer" }}>
                      {(task.done || isApproved) && <svg viewBox="0 0 12 12" style={{ width: 12, height: 12 }}><polyline points="1.5,6 4.5,9 10.5,3" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                    </button>

                    {/* Text – clickable if has info */}
                    <div style={{ flex: 1, cursor: hasInfo ? "pointer" : "default", minWidth: 0 }}
                      onClick={() => { if (hasInfo) { setExpandedInfo(isInfoOpen ? null : task.id); setAssignModal(null); } }}>
                      <div style={{ display: "flex", alignItems: "flex-start", gap: 6, flexWrap: "wrap" }}>
                        <span style={{ fontSize: 14, fontWeight: 500, textDecoration: task.done ? "line-through" : "none", color: task.done ? "#94a3b8" : "#1e293b", lineHeight: 1.5 }}>{task.text}</span>
                        {isApproved && <span style={{ fontSize: 10, background: "#f0fdf4", color: "#16a34a", borderRadius: 99, padding: "1px 7px", fontWeight: 700, flexShrink: 0 }}>✓ Godkjent</span>}
                        {task.done && !isApproved && <span style={{ fontSize: 10, background: "#fff7ed", color: "#c2410c", borderRadius: 99, padding: "1px 7px", fontWeight: 700, flexShrink: 0 }}>⏳ Venter</span>}
                      </div>
                      {hasInfo && (
                        <div style={{ display: "inline-flex", alignItems: "center", gap: 4, marginTop: 4, padding: "2px 9px", borderRadius: 99, background: isInfoOpen ? phase.light : "#f1f5f9", border: `1px solid ${isInfoOpen ? phase.border : "#e2e8f0"}` }}>
                          <span style={{ fontSize: 11, color: isInfoOpen ? phase.color : "#6366f1", fontWeight: 700 }}>
                            {isInfoOpen ? "▲ Lukk" : "▼ Les mer"}
                          </span>
                        </div>
                      )}
                      {task.done && task.doneBy && !isApproved && <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 1 }}>Fullført av {task.doneBy}</div>}
                      {isApproved && <div style={{ fontSize: 10, color: "#16a34a", marginTop: 1 }}>Godkjent av {task.approvedBy}</div>}
                      {assignedUsers.length > 0 && (
                        <div style={{ display: "flex", gap: 4, marginTop: 5, flexWrap: "wrap" }}>
                          {assignedUsers.map(u => <span key={u.id} style={{ fontSize: 11, background: "#eef2ff", color: "#6366f1", borderRadius: 99, padding: "1px 7px", fontWeight: 600 }}>{u.name.split(" ")[0]}{u.id === user.id ? " (meg)" : ""}</span>)}
                        </div>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div style={{ display: "flex", gap: 2, flexShrink: 0 }}>
                      <button onClick={() => { setAssignModal(isAssignOpen ? null : task.id); setExpandedInfo(null); }} title="Tilordne"
                        style={{ ...S.iconBtn, fontSize: 13, color: assignedUsers.length > 0 ? "#6366f1" : "#cbd5e1", background: isAssignOpen ? "#eef2ff" : "none" }}>👤</button>
                      {!isApproved && <button onClick={() => deleteTask(task.id)} style={S.deleteBtn}>×</button>}
                    </div>
                  </div>

                  {/* Info panel – expands inline below task */}
                  {isInfoOpen && (
                    <div style={{ background: phase.light, border: `1px solid ${phase.border}`, borderTop: "none", borderRadius: isAssignOpen ? 0 : "0 0 12px 12px", padding: "14px 16px" }}>
                      <p style={{ fontSize: 13, color: "#374151", lineHeight: 1.75, margin: "0 0 12px" }}>
                        {task.info || "Kommer mer tekst"}
                      </p>
                      {task.link && (
                        <a href={task.link} target="_blank" rel="noopener noreferrer"
                          style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12, color: phase.color, fontWeight: 700, textDecoration: "none", background: "#fff", border: `1px solid ${phase.border}`, padding: "6px 12px", borderRadius: 99 }}>
                          Les mer på elevbedrift.no →
                        </a>
                      )}
                    </div>
                  )}

                  {/* Assign panel */}
                  {isAssignOpen && (
                    <div style={{ background: "#f8fafc", borderRadius: "0 0 12px 12px", border: "1px solid #e2e8f0", borderTop: "none", padding: "10px 14px" }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>Tilordne til</div>
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        {members.map(m => {
                          const checked = (task.assignedTo || []).includes(m.id);
                          return (
                            <button key={m.id} onClick={() => toggleAssign(task.id, m.id)}
                              style={{ display: "flex", alignItems: "center", gap: 7, padding: "6px 12px", borderRadius: 99, border: `1.5px solid ${checked ? "#6366f1" : "#e2e8f0"}`, background: checked ? "#eef2ff" : "#fff", cursor: "pointer", fontFamily: "inherit" }}>
                              <Avatar name={m.name} size={22} />
                              <span style={{ fontSize: 12, fontWeight: 600, color: checked ? "#6366f1" : "#1e293b" }}>{m.name.split(" ")[0]}</span>
                              {checked && <svg viewBox="0 0 12 12" style={{ width: 10, height: 10 }}><polyline points="1.5,6 4.5,9 10.5,3" fill="none" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>

          {/* Drift-fase: ukelogg + ukentlige oppgaver med historikk */}
          {activePhase === "drift" && (() => {
            const week = getWeekNumber(); const year = getCurrentYear();
            const existingLog = (company.weeklyLogs || []).find(l => l.week === week && l.year === year);
            const historicLogs = (company.weeklyLogs || []).filter(l => !(l.week === week && l.year === year)).sort((a,b) => b.week - a.week);
            const archivedTasks = phaseTasks.filter(t => t.archived);
            const activeTasks = phaseTasks.filter(t => !t.archived);

            return (
              <>
                {/* Ukentlig logg */}
                <div style={{ background: "#faf5ff", border: "1px solid #d8b4fe", borderRadius: 14, padding: "14px 16px" }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: "#7c3aed", marginBottom: 8 }}>
                    📝 Ukelogg – uke {week}
                  </div>
                  {existingLog ? (
                    <div>
                      <p style={{ fontSize: 13, color: "#374151", lineHeight: 1.7, margin: "0 0 8px", background: "#fff", borderRadius: 10, padding: "10px 12px", border: "1px solid #e9d5ff" }}>{existingLog.text}</p>
                      {existingLog.teacherComment && (
                        <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 10, padding: "8px 12px", marginBottom: 8 }}>
                          <div style={{ fontSize: 11, fontWeight: 700, color: "#92400e", marginBottom: 3 }}>💬 Kommentar fra lærer:</div>
                          <p style={{ fontSize: 12, color: "#78350f", margin: 0 }}>{existingLog.teacherComment}</p>
                        </div>
                      )}
                      {existingLog.approvedBy
                        ? <div style={{ fontSize: 11, color: "#16a34a", fontWeight: 700 }}>✓ Godkjent av {existingLog.approvedBy}</div>
                        : <div style={{ fontSize: 11, color: "#c2410c" }}>⏳ Venter på lærerens godkjenning</div>
                      }
                      <button onClick={() => setWeeklyLogText(existingLog.text)} style={{ fontSize: 12, color: "#7c3aed", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", marginTop: 6, textDecoration: "underline" }}>Rediger logg</button>
                    </div>
                  ) : weeklyLogText !== "" || !existingLog ? (
                    <div>
                      <textarea value={weeklyLogText} onChange={e => setWeeklyLogText(e.target.value)}
                        placeholder="Hva har dere gjort denne uken? Hva gikk bra? Hva var utfordrende? Hva er planen for neste uke?"
                        style={{ ...S.input, minHeight: 80, resize: "vertical", marginBottom: 8 }} />
                      <button onClick={submitWeeklyLog} disabled={!weeklyLogText.trim()}
                        style={{ ...S.btnSmall, background: "#7c3aed", width: "100%", padding: "10px" }}>
                        📤 Send ukelogg til lærer
                      </button>
                    </div>
                  ) : null}
                </div>

                {/* Historiske logger */}
                {historicLogs.length > 0 && (
                  <div>
                    <button onClick={() => setShowLogHistory(!showLogHistory)}
                      style={{ fontSize: 12, color: "#94a3b8", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", padding: 0 }}>
                      {showLogHistory ? "▲" : "▼"} Tidligere ukelogger ({historicLogs.length})
                    </button>
                    {showLogHistory && (
                      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
                        {historicLogs.map(log => (
                          <div key={log.id} style={{ background: "#f8fafc", borderRadius: 10, padding: "10px 12px", border: "1px solid #e2e8f0" }}>
                            <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", marginBottom: 4 }}>Uke {log.week}, {log.year}</div>
                            <p style={{ fontSize: 12, color: "#374151", margin: "0 0 4px", lineHeight: 1.6 }}>{log.text}</p>
                            {log.teacherComment && <div style={{ fontSize: 11, color: "#92400e", fontStyle: "italic" }}>💬 {log.teacherComment}</div>}
                            {log.approvedBy
                              ? <div style={{ fontSize: 10, color: "#16a34a", marginTop: 3 }}>✓ {log.approvedBy}</div>
                              : <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 3 }}>⏳ Ikke godkjent</div>
                            }
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Historiske/arkiverte oppgaver */}
                {archivedTasks.length > 0 && (
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>Fullført historikk</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      {archivedTasks.map(t => (
                        <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 12px", background: "#f8fafc", borderRadius: 8, border: "1px solid #f1f5f9" }}>
                          <div style={{ width: 18, height: 18, borderRadius: 5, background: "#22c55e", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            <svg viewBox="0 0 12 12" style={{ width: 10, height: 10 }}><polyline points="1.5,6 4.5,9 10.5,3" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                          </div>
                          <span style={{ fontSize: 12, color: "#94a3b8", textDecoration: "line-through", flex: 1 }}>{t.text}</span>
                          {t.approvedBy && <span style={{ fontSize: 10, color: "#16a34a", fontWeight: 600 }}>✓</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            );
          })()}

          {/* Add task – for drift vises enklere versjon */}
          <div style={{ display: "flex", gap: 8 }}>
            <input value={newTask} onChange={e => setNewTask(e.target.value)} onKeyDown={e => e.key === "Enter" && addTask()}
              placeholder={activePhase === "drift" ? "+ Legg til ekstra oppgave denne uken..." : "+ Legg til ny oppgave..."}
              style={S.input} />
            <button onClick={addTask} style={{ ...S.btnSmall, background: phase.color }} disabled={!newTask.trim()}>Legg til</button>
          </div>
        </main>
      </>}

      {mainTab === "crm" && <CRMTab company={company} user={user} db={db} mutate={mutate} crmModal={crmModal} setCrmModal={setCrmModal} members={members} />}
      {mainTab === "badges" && <BadgesTab company={company} user={user} db={db} />}
    </div>
  );
}


// ─── Badges Tab ───────────────────────────────────────────────────────────────

const ALL_BADGES = [
  { id: "oppstarter",   emoji: "🚀", label: "Oppstarter",    desc: "Fullført Oppstart-fasen",              check: (co, uid) => (co.tasks.oppstart || []).filter(t => t.approvedBy).length >= 4 },
  { id: "idemaker",     emoji: "💡", label: "Idémaker",      desc: "Fullført Idéutvikling-fasen",          check: (co, uid) => (co.tasks.ideutvikling || []).filter(t => t.approvedBy).length >= 4 },
  { id: "etablerer",    emoji: "🏗️", label: "Etablerer",     desc: "Fullført Etablering-fasen",            check: (co, uid) => (co.tasks.etablering || []).filter(t => t.approvedBy).length >= 4 },
  { id: "drifter",      emoji: "⚙️", label: "Drifter",       desc: "Sendt inn 4 ukelogger",                check: (co, uid) => (co.weeklyLogs || []).length >= 4 },
  { id: "avvikler",     emoji: "🏁", label: "Avvikler",      desc: "Fullført Avvikling-fasen",             check: (co, uid) => (co.tasks.avvikling || []).filter(t => t.approvedBy).length >= 3 },
  { id: "teamspiller",  emoji: "🤝", label: "Teamspiller",   desc: "Tilordnet 5+ oppgaver til andre",      check: (co, uid) => Object.values(co.tasks).flat().filter(t => (t.assignedTo||[]).includes(uid) && t.done).length >= 5 },
  { id: "selger",       emoji: "💰", label: "Selger",        desc: "Registrert første kunde i CRM",        check: (co, uid) => (co.crm || []).some(c => c.status === "kunde") },
  { id: "nettverk",     emoji: "📇", label: "Nettverker",    desc: "5+ kontakter i CRM",                   check: (co, uid) => (co.crm || []).length >= 5 },
  { id: "flink_elev",   emoji: "⭐", label: "Flink elev",    desc: "10+ oppgaver fullført og godkjent",    check: (co, uid) => Object.values(co.tasks).flat().filter(t => t.approvedBy).length >= 10 },
  { id: "logghelt",     emoji: "📝", label: "Logghelt",      desc: "Sendt inn ukelogg 8 uker på rad",      check: (co, uid) => (co.weeklyLogs || []).length >= 8 },
];

function BadgesTab({ company, user, db }) {
  const earned = ALL_BADGES.filter(b => {
    try { return b.check(company, user.id); } catch { return false; }
  });
  const notEarned = ALL_BADGES.filter(b => !earned.includes(b));

  return (
    <div style={{ flex: 1, padding: 16, display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #667eea, #764ba2)", borderRadius: 16, padding: "18px 16px", color: "#fff", textAlign: "center" }}>
        <div style={{ fontSize: 36, marginBottom: 6 }}>🏅</div>
        <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 4 }}>Dine utmerkelser</div>
        <div style={{ fontSize: 13, opacity: 0.85 }}>{earned.length} av {ALL_BADGES.length} låst opp</div>
        <div style={{ display: "flex", gap: 4, justifyContent: "center", marginTop: 12, flexWrap: "wrap" }}>
          {ALL_BADGES.map(b => (
            <div key={b.id} style={{ fontSize: 22, opacity: earned.includes(b) ? 1 : 0.25, filter: earned.includes(b) ? "none" : "grayscale(100%)" }}>
              {b.emoji}
            </div>
          ))}
        </div>
      </div>

      {/* Earned */}
      {earned.length > 0 && (
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 8 }}>
            Opptjent ({earned.length})
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {earned.map(b => (
              <div key={b.id} style={{ display: "flex", alignItems: "center", gap: 12, background: "#fff", borderRadius: 12, padding: "12px 14px", border: "1.5px solid #e9d5ff", boxShadow: "0 2px 8px rgba(99,102,241,0.08)" }}>
                <div style={{ fontSize: 32, width: 48, height: 48, borderRadius: 12, background: "linear-gradient(135deg, #faf5ff, #ede9fe)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {b.emoji}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: "#1e293b" }}>{b.label}</div>
                  <div style={{ fontSize: 12, color: "#7c3aed", marginTop: 2 }}>{b.desc}</div>
                </div>
                <div style={{ fontSize: 18 }}>✅</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Not yet earned */}
      {notEarned.length > 0 && (
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 8 }}>
            Ikke låst opp ennå ({notEarned.length})
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {notEarned.map(b => (
              <div key={b.id} style={{ display: "flex", alignItems: "center", gap: 12, background: "#f8fafc", borderRadius: 12, padding: "12px 14px", border: "1px solid #e2e8f0", opacity: 0.65 }}>
                <div style={{ fontSize: 32, width: 48, height: 48, borderRadius: 12, background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, filter: "grayscale(100%)" }}>
                  {b.emoji}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#64748b" }}>{b.label}</div>
                  <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>{b.desc}</div>
                </div>
                <div style={{ fontSize: 16, color: "#cbd5e1" }}>🔒</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {earned.length === 0 && (
        <div style={{ textAlign: "center", padding: "32px 0", color: "#94a3b8" }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>🔒</div>
          <div style={{ fontWeight: 600, color: "#1e293b", marginBottom: 4 }}>Ingen badges ennå</div>
          <div style={{ fontSize: 13 }}>Fullfør oppgaver og aktiviteter for å låse opp utmerkelser!</div>
        </div>
      )}
    </div>
  );
}

// ─── CRM Tab ──────────────────────────────────────────────────────────────────

function CRMTab({ company, user, db, mutate, crmModal, setCrmModal, members }) {
  const [filterStatus, setFilterStatus] = useState(null);
  const [search, setSearch] = useState("");
  const contacts = company.crm || [];
  const filtered = contacts.filter(c => !filterStatus || c.status === filterStatus).filter(c => !search || c.name.toLowerCase().includes(search.toLowerCase()) || (c.email || "").toLowerCase().includes(search.toLowerCase()));
  const stats = CRM_STATUSES.map(s => ({ ...s, count: contacts.filter(c => c.status === s.id).length }));
  function deleteContact(id) { mutate(d => { d.companies[company.id].crm = d.companies[company.id].crm.filter(c => c.id !== id); }); }

  return (
    <div style={{ flex: 1, padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 2 }}>
        {stats.map(s => (
          <button key={s.id} onClick={() => setFilterStatus(filterStatus === s.id ? null : s.id)}
            style={{ padding: "10px 14px", borderRadius: 12, border: `1.5px solid ${filterStatus === s.id ? s.color : "#e2e8f0"}`, background: filterStatus === s.id ? s.bg : "#fff", cursor: "pointer", textAlign: "center", minWidth: 90, fontFamily: "inherit", flexShrink: 0 }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: s.color }}>{s.count}</div>
            <div style={{ fontSize: 11, color: "#64748b", fontWeight: 600 }}>{s.label}</div>
          </button>
        ))}
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Søk etter kontakt..." style={{ ...S.input, flex: 1 }} />
        <button onClick={() => setCrmModal("new")} style={{ ...S.btnSmall, background: "#6366f1", whiteSpace: "nowrap" }}>+ Ny kontakt</button>
      </div>
      {filtered.length === 0 && <div style={{ textAlign: "center", padding: "40px 0", color: "#94a3b8" }}><div style={{ fontSize: 36, marginBottom: 8 }}>👥</div><div style={{ fontWeight: 600, color: "#1e293b" }}>Ingen kontakter ennå</div></div>}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {filtered.map(contact => {
          const st = CRM_STATUSES.find(s => s.id === contact.status);
          const assignedUser = db.users[contact.assignedTo];
          return (
            <div key={contact.id} style={{ background: "#fff", borderRadius: 12, padding: "12px 14px", border: "1px solid #e2e8f0", cursor: "pointer" }} onClick={() => setCrmModal(contact.id)}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: contact.type === "Bedrift" ? "#fef3c7" : "#ede9fe", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>{contact.type === "Bedrift" ? "🏢" : "👤"}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: "#1e293b" }}>{contact.name}</span>
                    <span style={{ fontSize: 11, background: st?.bg, color: st?.color, borderRadius: 99, padding: "1px 8px", fontWeight: 600 }}>{st?.label}</span>
                    <span style={{ fontSize: 11, color: "#94a3b8", background: "#f8fafc", borderRadius: 99, padding: "1px 7px" }}>{contact.type}</span>
                  </div>
                  {contact.email && <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>{contact.email}</div>}
                  {contact.note && <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 3, fontStyle: "italic" }}>"{contact.note}"</div>}
                  {assignedUser && <div style={{ fontSize: 11, color: "#6366f1", marginTop: 4 }}>📌 {assignedUser.name.split(" ")[0]}{assignedUser.id === user.id ? " (meg)" : ""}</div>}
                </div>
                <button onClick={e => { e.stopPropagation(); deleteContact(contact.id); }} style={{ ...S.deleteBtn, fontSize: 18 }}>×</button>
              </div>
            </div>
          );
        })}
      </div>
      {crmModal && <CRMModal contact={crmModal === "new" ? null : contacts.find(c => c.id === crmModal)} members={members} currentUser={user}
        onSave={data => { mutate(d => { if (!d.companies[company.id].crm) d.companies[company.id].crm = []; if (crmModal === "new") d.companies[company.id].crm.push({ ...data, id: genId(), createdAt: Date.now() }); else { const idx = d.companies[company.id].crm.findIndex(c => c.id === crmModal); if (idx >= 0) d.companies[company.id].crm[idx] = { ...d.companies[company.id].crm[idx], ...data }; } }); setCrmModal(null); }} onClose={() => setCrmModal(null)} />}
    </div>
  );
}

function CRMModal({ contact, members, currentUser, onSave, onClose }) {
  const [name, setName] = useState(contact?.name || ""); const [type, setType] = useState(contact?.type || "Privatperson");
  const [email, setEmail] = useState(contact?.email || ""); const [phone, setPhone] = useState(contact?.phone || "");
  const [status, setStatus] = useState(contact?.status || "lead"); const [note, setNote] = useState(contact?.note || "");
  const [assignedTo, setAssignedTo] = useState(contact?.assignedTo || currentUser.id);

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 100 }}>
      <div style={{ background: "#fff", borderRadius: "20px 20px 0 0", padding: "24px 22px 36px", width: "100%", maxWidth: 520, boxShadow: "0 -8px 40px rgba(0,0,0,0.18)", maxHeight: "92vh", overflowY: "auto" }}>
        <div style={{ width: 40, height: 4, borderRadius: 99, background: "#e2e8f0", margin: "0 auto 20px" }} />
        <h2 style={{ fontSize: 18, fontWeight: 800, color: "#1e293b", margin: "0 0 18px" }}>{contact ? "Rediger kontakt" : "Ny kontakt"}</h2>
        <form onSubmit={e => { e.preventDefault(); if (!name.trim()) return; onSave({ name, type, email, phone, status, note, assignedTo }); }} style={S.form}>
          <input style={S.input} placeholder="Navn *" value={name} onChange={e => setName(e.target.value)} required autoFocus />
          <div style={{ display: "flex", gap: 8 }}>
            {["Privatperson", "Bedrift"].map(t => <button type="button" key={t} onClick={() => setType(t)} style={{ flex: 1, padding: "10px", borderRadius: 10, border: `1.5px solid ${type === t ? "#6366f1" : "#e2e8f0"}`, background: type === t ? "#eef2ff" : "#f8fafc", fontFamily: "inherit", fontSize: 13, fontWeight: 600, color: type === t ? "#6366f1" : "#64748b", cursor: "pointer" }}>{t === "Bedrift" ? "🏢 Bedrift" : "👤 Privatperson"}</button>)}
          </div>
          <input style={S.input} placeholder="E-post" type="email" value={email} onChange={e => setEmail(e.target.value)} />
          <input style={S.input} placeholder="Telefon" value={phone} onChange={e => setPhone(e.target.value)} />
          <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: 0.5 }}>Status</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {CRM_STATUSES.map(s => <button type="button" key={s.id} onClick={() => setStatus(s.id)} style={{ padding: "5px 12px", borderRadius: 99, border: `1.5px solid ${status === s.id ? s.color : "#e2e8f0"}`, background: status === s.id ? s.bg : "#f8fafc", color: status === s.id ? s.color : "#94a3b8", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>{s.label}</button>)}
          </div>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: 0.5 }}>Ansvarlig</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {members.map(m => { const checked = assignedTo === m.id; return <button type="button" key={m.id} onClick={() => setAssignedTo(checked ? "" : m.id)} style={{ display: "flex", alignItems: "center", gap: 7, padding: "7px 12px", borderRadius: 99, border: `1.5px solid ${checked ? "#6366f1" : "#e2e8f0"}`, background: checked ? "#eef2ff" : "#f8fafc", cursor: "pointer", fontFamily: "inherit" }}><Avatar name={m.name} size={22} /><span style={{ fontSize: 12, fontWeight: 600, color: checked ? "#6366f1" : "#1e293b" }}>{m.name.split(" ")[0]}</span>{m.id === currentUser.id && <span style={{ fontSize: 10, color: "#94a3b8" }}>(meg)</span>}</button>; })}
          </div>
          <textarea style={{ ...S.input, minHeight: 70, resize: "vertical" }} placeholder="Notat..." value={note} onChange={e => setNote(e.target.value)} />
          <div style={{ display: "flex", gap: 8 }}>
            <button type="button" onClick={onClose} style={{ flex: 1, padding: "11px", borderRadius: 12, border: "1.5px solid #e2e8f0", background: "#f8fafc", cursor: "pointer", fontFamily: "inherit", fontWeight: 600, color: "#64748b" }}>Avbryt</button>
            <button type="submit" style={{ ...S.btnPrimary, flex: 2, marginTop: 0 }}>Lagre</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Teacher Dashboard ────────────────────────────────────────────────────────

function TeacherDashboard({ user, onLogout }) {
  const [db, setDb] = useState(getDB);
  const [selected, setSelected] = useState(null);
  const [activePhase, setActivePhase] = useState("oppstart");
  const [teacherTab, setTeacherTab] = useState("tasks");
  const [adminPhase, setAdminPhase] = useState("oppstart");
  const [adminTasks, setAdminTasks] = useState(() => {
    try { const saved = localStorage.getItem("ub_admin_tasks"); return saved ? JSON.parse(saved) : null; } catch { return null; }
  });
  const [editingTask, setEditingTask] = useState(null); // { phaseId, taskId } | null
  const [editText, setEditText] = useState("");
  const [editInfo, setEditInfo] = useState("");
  const [editLink, setEditLink] = useState("");
  const [addingPhase, setAddingPhase] = useState(null);
  const [newTaskText, setNewTaskText] = useState("");
  const [saved, setSaved] = useState(false);
  const refresh = useCallback(() => setDb(getDB()), []);

  // Build effective phases: use adminTasks overrides if set
  const effectivePhases = PHASES.map(p => {
    if (!adminTasks || !adminTasks[p.id]) return p;
    return { ...p, defaultTasks: adminTasks[p.id] };
  });

  function saveAdminTasks(updated) {
    try { localStorage.setItem("ub_admin_tasks", JSON.stringify(updated)); } catch {}
    setAdminTasks(updated);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function startEdit(phaseId, task) {
    setEditingTask({ phaseId, taskId: task.id });
    setEditText(task.text);
    setEditInfo(task.info || "");
    setEditLink(task.link || "");
  }

  function saveEdit() {
    if (!editingTask) return;
    const base = adminTasks || {};
    const phaseTasks = base[editingTask.phaseId] ||
      PHASES.find(p => p.id === editingTask.phaseId).defaultTasks.map(t =>
        typeof t === "string" ? { id: genId(), text: t, info: "", link: "", isSubmission: false }
        : { id: genId(), ...t, info: t.info || "", link: t.link || "" }
      );
    const updated = {
      ...base,
      [editingTask.phaseId]: phaseTasks.map(t =>
        t.id === editingTask.taskId
          ? { ...t, text: editText, info: editInfo, link: editLink }
          : t
      )
    };
    saveAdminTasks(updated);
    setEditingTask(null);
  }

  function deleteAdminTask(phaseId, taskId) {
    const base = adminTasks || {};
    const phaseTasks = base[phaseId] ||
      PHASES.find(p => p.id === phaseId).defaultTasks.map(t =>
        typeof t === "string" ? { id: genId(), text: t, info: "", link: "", isSubmission: false }
        : { id: genId(), ...t, info: t.info || "", link: t.link || "" }
      );
    const updated = { ...base, [phaseId]: phaseTasks.filter(t => t.id !== taskId) };
    saveAdminTasks(updated);
  }

  function addAdminTask(phaseId) {
    if (!newTaskText.trim()) return;
    const base = adminTasks || {};
    const phaseTasks = base[phaseId] ||
      PHASES.find(p => p.id === phaseId).defaultTasks.map(t =>
        typeof t === "string" ? { id: genId(), text: t, info: "", link: "", isSubmission: false }
        : { id: genId(), ...t, info: t.info || "", link: t.link || "" }
      );
    const updated = { ...base, [phaseId]: [...phaseTasks, { id: genId(), text: newTaskText.trim(), info: "", link: "", isSubmission: false }] };
    saveAdminTasks(updated);
    setNewTaskText("");
    setAddingPhase(null);
  }

  function resetPhaseToDefault(phaseId) {
    if (!window.confirm("Tilbakestille denne fasen til standardoppgavene?")) return;
    const base = { ...(adminTasks || {}) };
    delete base[phaseId];
    const updated = Object.keys(base).length ? base : null;
    try { if (updated) localStorage.setItem("ub_admin_tasks", JSON.stringify(updated)); else localStorage.removeItem("ub_admin_tasks"); } catch {}
    setAdminTasks(updated);
  }

  const myCompanies = Object.values(db.companies).filter(c => c.members.some(m => db.users[m.userId]?.school?.toLowerCase() === user.school?.toLowerCase()));
  const companies = myCompanies.length > 0 ? myCompanies : Object.values(db.companies);
  const selectedCompany = selected ? db.companies[selected] : null;

  function approveTask(companyId, phaseId, taskId) {
    const d = getDB();
    const t = d.companies[companyId].tasks[phaseId].find(t => t.id === taskId);
    if (t) { t.approvedBy = t.approvedBy ? null : user.name; }
    saveDB(d); refresh();
  }

  // Count pending approvals per company
  function pendingCount(co) { return Object.values(co.tasks).flat().filter(t => t.done && !t.approvedBy).length; }

  return (
    <div style={S.appRoot}>
      <header style={S.header}>
        <div><div style={S.appTitle}>Lærerdashbord 👩</div><div style={S.appSub}>{user.name} · {user.school}</div></div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 10, color: "#cbd5e1", fontWeight: 600 }}>v{APP_VERSION}</span>
          <button onClick={() => { if (window.confirm("Er du sikker på at du vil logge ut?")) onLogout(); }} style={{ background: "none", border: "1.5px solid #e2e8f0", borderRadius: 8, padding: "5px 12px", cursor: "pointer", fontFamily: "inherit", fontSize: 12, fontWeight: 700, color: "#64748b", display: "flex", alignItems: "center", gap: 5 }}>⏻ Logg ut</button>
        </div>
      </header>

      <div style={S.appRoot}>
        {/* Mobil: vis enten liste ELLER detalj */}
        {(!selected || !selectedCompany) ? (
          /* ── Bedriftsliste ── */
          <div style={{ flex: 1, overflowY: "auto" }}>
            <div style={S.sidebarTitle}>Bedrifter ({companies.length})</div>
            {companies.map(co => {
              const allT = Object.values(co.tasks).flat();
              const pct = allT.length === 0 ? 0 : Math.round(allT.filter(t => t.approvedBy).length / allT.length * 100);
              const pending = pendingCount(co);
              return (
                <button key={co.id} onClick={() => { setSelected(co.id); setActivePhase("oppstart"); setTeacherTab("tasks"); }}
                  style={{ ...S.companyCard, background: "#fff", color: "#1e293b", width: "100%", textAlign: "left" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontWeight: 700, fontSize: 15 }}>{co.name}</span>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      {pending > 0 && <span style={{ background: "#f97316", color: "#fff", borderRadius: 99, fontSize: 11, fontWeight: 700, padding: "2px 8px" }}>{pending} ny</span>}
                      <DonutChart pct={pct} color="#6366f1" size={36} />
                    </div>
                  </div>
                  <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 3 }}>{co.members.length} elever · {co.code}</div>
                  <MiniProgress tasks={co.tasks} selected={false} />
                </button>
              );
            })}
          </div>
        ) : (
          /* ── Bedriftsdetalj ── */
          <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column" }}>
            {/* Tilbake-knapp */}
            <div style={{ padding: "10px 16px", borderBottom: "1px solid #e2e8f0", background: "#fff", display: "flex", alignItems: "center", gap: 10 }}>
              <button onClick={() => setSelected(null)}
                style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 13, color: "#6366f1", fontWeight: 700, display: "flex", alignItems: "center", gap: 4, padding: 0 }}>
                ← Alle bedrifter
              </button>
              <span style={{ fontSize: 15, fontWeight: 800, color: "#1e293b" }}>{selectedCompany.name}</span>
            </div>

            <div style={{ padding: "12px 16px", display: "flex", flexDirection: "column", gap: 12, flex: 1 }}>
              {/* Medlemmer */}
              <div style={S.membersRow}>
                {selectedCompany.members.map(m => { const u = db.users[m.userId]; if (!u) return null; return <div key={m.userId} style={S.memberChip}><Avatar name={u.name} size={28} /><div><div style={{ fontSize: 12, fontWeight: 600 }}>{u.name}</div><div style={{ fontSize: 10, color: "#94a3b8" }}>{m.role}</div></div></div>; })}
              </div>

            {/* Faner */}
            <div style={{ display: "flex", overflowX: "auto", borderBottom: "1px solid #e2e8f0", marginBottom: 4, scrollbarWidth: "none" }}>
              {(() => {
                const pendingLogs = (selectedCompany.weeklyLogs || []).filter(l => !l.approvedBy).length;
                return [{ id: "tasks", label: "📋 Oppgaver" }, { id: "logs", label: `📝 Ukelogger${pendingLogs > 0 ? ` (${pendingLogs})` : ""}` }, { id: "crm", label: "👥 CRM" }, { id: "admin", label: "⚙️ Rediger" }].map(tab => (
                  <button key={tab.id} onClick={() => setTeacherTab(tab.id)} style={{ padding: "10px 14px", background: "none", border: "none", borderBottom: teacherTab === tab.id ? "2px solid #6366f1" : "2px solid transparent", fontWeight: teacherTab === tab.id ? 700 : 500, color: teacherTab === tab.id ? "#6366f1" : "#64748b", cursor: "pointer", fontFamily: "inherit", fontSize: 13, whiteSpace: "nowrap", flexShrink: 0 }}>{tab.label}</button>
                ));
              })()}
            </div>

          {!selectedCompany ? (
            <div style={S.emptyState}><span style={{ fontSize: 48 }}>📋</span><p style={{ fontWeight: 700, color: "#1e293b", marginTop: 8 }}>Velg en bedrift</p></div>
          ) : (<>
            {teacherTab === "tasks" && (<>
              {/* Pending approval banner */}
              {pendingCount(selectedCompany) > 0 && (
                <div style={{ background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: 12, padding: "10px 14px", marginBottom: 12, display: "flex", gap: 10, alignItems: "center" }}>
                  <span style={{ fontSize: 20 }}>⏳</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#c2410c" }}>{pendingCount(selectedCompany)} oppgave(r) venter på din godkjenning</div>
                    <div style={{ fontSize: 12, color: "#9a3412" }}>Klikk på en oppgave nedenfor for å godkjenne eller avvise den.</div>
                  </div>
                </div>
              )}

              <div style={{ display: "flex", gap: 8, overflowX: "auto", marginBottom: 12 }}>
                {PHASES.map(p => {
                  const pt = selectedCompany.tasks[p.id] || [];
                  const pa = pt.filter(t => t.approvedBy).length;
                  const pendingInPhase = pt.filter(t => t.done && !t.approvedBy).length;
                  const isA = activePhase === p.id;
                  return (
                    <button key={p.id} onClick={() => setActivePhase(p.id)}
                      style={{ ...S.tab, background: isA ? p.color : "#f8fafc", color: isA ? "#fff" : "#64748b", borderColor: isA ? p.color : "#e2e8f0", position: "relative" }}>
                      {pendingInPhase > 0 && <span style={{ position: "absolute", top: -4, right: -4, background: "#f97316", color: "#fff", borderRadius: 99, fontSize: 9, fontWeight: 700, padding: "1px 4px", minWidth: 14, textAlign: "center" }}>{pendingInPhase}</span>}
                      <span style={{ fontSize: 18 }}>{p.emoji}</span>
                      <span style={{ fontSize: 10, fontWeight: 700 }}>{p.label}</span>
                      <span style={{ fontSize: 10, padding: "2px 6px", borderRadius: 20, background: isA ? "rgba(255,255,255,0.25)" : p.light, color: isA ? "#fff" : p.color, fontWeight: 700 }}>{pa}/{pt.length}</span>
                    </button>
                  );
                })}
              </div>

              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 7 }}>
                {(selectedCompany.tasks[activePhase] || []).map(task => {
                  const ph = PHASES.find(p => p.id === activePhase);
                  const assignedUsers = (task.assignedTo || []).map(id => db.users[id]).filter(Boolean);
                  const isApproved = !!task.approvedBy;
                  const needsApproval = task.done && !task.approvedBy;

                  return (
                    <li key={task.id} style={{ ...S.taskItem, background: needsApproval ? "#fffbeb" : "#fff", border: needsApproval ? "1px solid #fde68a" : "1px solid transparent", borderRadius: 12 }}>
                      <div style={{ ...S.checkbox, borderColor: isApproved ? "#22c55e" : task.done ? ph.color : "#cbd5e1", background: isApproved ? "#22c55e" : task.done ? ph.color : "#fff", cursor: "default" }}>
                        {task.done && <svg viewBox="0 0 12 12" style={{ width: 12, height: 12 }}><polyline points="1.5,6 4.5,9 10.5,3" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                          <span style={{ fontSize: 13, fontWeight: 500, textDecoration: task.done ? "line-through" : "none", color: task.done ? "#94a3b8" : "#1e293b" }}>{task.text}</span>
                          {isApproved && <span style={{ fontSize: 10, background: "#f0fdf4", color: "#16a34a", borderRadius: 99, padding: "1px 7px", fontWeight: 700 }}>✓ Godkjent av deg</span>}
                          {needsApproval && <span style={{ fontSize: 10, background: "#fff7ed", color: "#c2410c", borderRadius: 99, padding: "1px 7px", fontWeight: 700 }}>⏳ Venter på godkjenning</span>}
                        </div>
                        {task.doneBy && <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 1 }}>Fullført av {task.doneBy}</div>}
                        {assignedUsers.length > 0 && <div style={{ display: "flex", gap: 4, marginTop: 4 }}>{assignedUsers.map(u => <span key={u.id} style={{ fontSize: 11, background: "#eef2ff", color: "#6366f1", borderRadius: 99, padding: "1px 7px", fontWeight: 600 }}>{u.name.split(" ")[0]}</span>)}</div>}
                      </div>
                      {task.done && (
                        <button onClick={() => approveTask(selectedCompany.id, activePhase, task.id)}
                          style={{ padding: "5px 12px", borderRadius: 99, border: `1.5px solid ${isApproved ? "#22c55e" : "#e2e8f0"}`, background: isApproved ? "#f0fdf4" : "#f8fafc", color: isApproved ? "#16a34a" : "#64748b", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", flexShrink: 0 }}>
                          {isApproved ? "✓ Godkjent" : "Godkjenn"}
                        </button>
                      )}
                    </li>
                  );
                })}
              </ul>
            </>)}

            {teacherTab === "logs" && (
              <WeeklyLogsTeacher company={selectedCompany} teacherName={user.name} mutate={d => { const db2 = getDB(); d(db2); saveDB(db2); refresh(); }} />
            )}

            {teacherTab === "crm" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
                  {CRM_STATUSES.map(s => { const count = (selectedCompany.crm || []).filter(c => c.status === s.id).length; return count > 0 ? <div key={s.id} style={{ padding: "5px 12px", borderRadius: 99, background: s.bg, border: `1px solid ${s.color}33` }}><span style={{ fontWeight: 700, color: s.color }}>{count}</span><span style={{ fontSize: 12, color: "#64748b", marginLeft: 4 }}>{s.label}</span></div> : null; })}
                </div>
                {!(selectedCompany.crm || []).length && <div style={{ textAlign: "center", padding: "32px 0", color: "#94a3b8" }}><div style={{ fontSize: 32 }}>👥</div><div style={{ fontWeight: 600 }}>Ingen kontakter registrert</div></div>}
                {(selectedCompany.crm || []).map(contact => { const st = CRM_STATUSES.find(s => s.id === contact.status); const au = db.users[contact.assignedTo]; return <div key={contact.id} style={{ background: "#f8fafc", borderRadius: 10, padding: "10px 12px", border: "1px solid #e2e8f0" }}><div style={{ display: "flex", alignItems: "center", gap: 8 }}><span style={{ fontSize: 18 }}>{contact.type === "Bedrift" ? "🏢" : "👤"}</span><div style={{ flex: 1 }}><div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}><span style={{ fontSize: 13, fontWeight: 700 }}>{contact.name}</span><span style={{ fontSize: 11, background: st?.bg, color: st?.color, borderRadius: 99, padding: "1px 7px", fontWeight: 600 }}>{st?.label}</span></div>{contact.email && <div style={{ fontSize: 11, color: "#64748b" }}>{contact.email}</div>}{au && <div style={{ fontSize: 11, color: "#6366f1", marginTop: 2 }}>📌 {au.name}</div>}{contact.note && <div style={{ fontSize: 11, color: "#94a3b8", fontStyle: "italic" }}>"{contact.note}"</div>}</div></div></div>; })}
              </div>
            )}

            {teacherTab === "admin" && (
              <AdminEditor
                phases={PHASES}
                adminTasks={adminTasks}
                adminPhase={adminPhase}
                setAdminPhase={setAdminPhase}
                editingTask={editingTask}
                editText={editText} setEditText={setEditText}
                editInfo={editInfo} setEditInfo={setEditInfo}
                editLink={editLink} setEditLink={setEditLink}
                addingPhase={addingPhase} setAddingPhase={setAddingPhase}
                newTaskText={newTaskText} setNewTaskText={setNewTaskText}
                saved={saved}
                onStartEdit={startEdit}
                onSaveEdit={saveEdit}
                onCancelEdit={() => setEditingTask(null)}
                onDelete={deleteAdminTask}
                onAdd={addAdminTask}
                onReset={resetPhaseToDefault}
              />
            )}
          </>)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}



// ─── Weekly Logs Teacher Component ───────────────────────────────────────────

function WeeklyLogsTeacher({ company, teacherName, mutate }) {
  const [commentText, setCommentText] = useState({});
  const logs = [...(company.weeklyLogs || [])].sort((a, b) => b.week - a.week || b.year - a.year);

  function approveLog(logId) {
    mutate(d => {
      const co = d.companies[company.id];
      const log = co.weeklyLogs.find(l => l.id === logId);
      if (log) { log.approvedBy = log.approvedBy ? null : teacherName; }
    });
  }

  function saveComment(logId) {
    const text = commentText[logId];
    if (!text?.trim()) return;
    mutate(d => {
      const co = d.companies[company.id];
      const log = co.weeklyLogs.find(l => l.id === logId);
      if (log) log.teacherComment = text.trim();
    });
    setCommentText(prev => ({ ...prev, [logId]: "" }));
  }

  if (logs.length === 0) return (
    <div style={{ textAlign: "center", padding: "48px 0", color: "#94a3b8" }}>
      <div style={{ fontSize: 36, marginBottom: 8 }}>📝</div>
      <div style={{ fontWeight: 600, color: "#1e293b" }}>Ingen ukelogger ennå</div>
      <div style={{ fontSize: 13, marginTop: 4 }}>Elevene sender inn ukelogger fra Drift-fasen</div>
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", gap: 8, marginBottom: 4 }}>
        <div style={{ padding: "6px 12px", borderRadius: 99, background: "#fff7ed", border: "1px solid #fed7aa", fontSize: 12, fontWeight: 600, color: "#c2410c" }}>
          ⏳ {logs.filter(l => !l.approvedBy).length} venter på godkjenning
        </div>
        <div style={{ padding: "6px 12px", borderRadius: 99, background: "#f0fdf4", border: "1px solid #86efac", fontSize: 12, fontWeight: 600, color: "#16a34a" }}>
          ✓ {logs.filter(l => l.approvedBy).length} godkjent
        </div>
      </div>

      {logs.map(log => {
        const isApproved = !!log.approvedBy;
        const commentVal = commentText[log.id] ?? (log.teacherComment || "");
        return (
          <div key={log.id} style={{ background: isApproved ? "#f0fdf4" : "#fffbeb", border: `1px solid ${isApproved ? "#86efac" : "#fde68a"}`, borderRadius: 14, padding: "14px 16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: "#1e293b" }}>
                📅 Uke {log.week}, {log.year}
              </div>
              <button onClick={() => approveLog(log.id)}
                style={{ padding: "5px 14px", borderRadius: 99, border: `1.5px solid ${isApproved ? "#22c55e" : "#e2e8f0"}`, background: isApproved ? "#f0fdf4" : "#fff", color: isApproved ? "#16a34a" : "#64748b", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                {isApproved ? "✓ Godkjent" : "Godkjenn"}
              </button>
            </div>

            {/* Elevenes logg */}
            <div style={{ background: "#fff", borderRadius: 10, padding: "10px 12px", marginBottom: 10, border: "1px solid #e2e8f0" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>Elevenes logg</div>
              <p style={{ fontSize: 13, color: "#374151", lineHeight: 1.7, margin: 0 }}>{log.text}</p>
            </div>

            {/* Lærerens kommentar */}
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>
                Din kommentar {log.teacherComment ? "(lagret)" : "(valgfritt)"}
              </div>
              {log.teacherComment && !commentText[log.id] && (
                <div style={{ background: "#fffbeb", borderRadius: 10, padding: "8px 12px", marginBottom: 8, fontSize: 12, color: "#78350f", lineHeight: 1.6, border: "1px solid #fde68a" }}>
                  💬 {log.teacherComment}
                  <button onClick={() => setCommentText(prev => ({ ...prev, [log.id]: log.teacherComment }))}
                    style={{ display: "block", marginTop: 4, fontSize: 11, color: "#92400e", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", textDecoration: "underline", padding: 0 }}>
                    Rediger
                  </button>
                </div>
              )}
              {(commentText[log.id] !== undefined && commentText[log.id] !== null) || !log.teacherComment ? (
                <div>
                  <textarea
                    value={commentVal}
                    onChange={e => setCommentText(prev => ({ ...prev, [log.id]: e.target.value }))}
                    placeholder="Skriv en kommentar til elevene om denne uken..."
                    style={{ width: "100%", padding: "9px 12px", borderRadius: 10, border: "1.5px solid #e2e8f0", fontSize: 13, fontFamily: "inherit", outline: "none", background: "#fff", color: "#1e293b", boxSizing: "border-box", resize: "vertical", minHeight: 70 }}
                  />
                  <button onClick={() => saveComment(log.id)} disabled={!commentVal?.trim()}
                    style={{ marginTop: 6, padding: "8px 16px", borderRadius: 10, border: "none", background: "#6366f1", color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit", opacity: commentVal?.trim() ? 1 : 0.5 }}>
                    Lagre kommentar
                  </button>
                </div>
              ) : null}
            </div>

            {isApproved && <div style={{ fontSize: 11, color: "#16a34a", fontWeight: 700, marginTop: 8 }}>✓ Godkjent av {log.approvedBy}</div>}
          </div>
        );
      })}
    </div>
  );
}

// ─── Admin Editor Component ───────────────────────────────────────────────────

function AdminEditor({ phases, adminTasks, adminPhase, setAdminPhase, editingTask, editText, setEditText, editInfo, setEditInfo, editLink, setEditLink, addingPhase, setAddingPhase, newTaskText, setNewTaskText, saved, onStartEdit, onSaveEdit, onCancelEdit, onDelete, onAdd, onReset }) {
  const phase = phases.find(p => p.id === adminPhase);

  // Get current tasks for this phase (admin overrides or defaults)
  const getDisplayTasks = (phaseId) => {
    if (adminTasks && adminTasks[phaseId]) return adminTasks[phaseId];
    return phases.find(p => p.id === phaseId).defaultTasks.map((t, i) => ({
      id: `default-${phaseId}-${i}`,
      text: typeof t === "string" ? t : t.text,
      info: typeof t === "object" ? (t.info || "") : "",
      link: typeof t === "object" ? (t.link || "") : "",
      isSubmission: typeof t === "object" ? !!t.isSubmission : false,
    }));
  };

  const displayTasks = getDisplayTasks(adminPhase);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Header */}
      <div style={{ background: "#f8fafc", borderRadius: 12, padding: "14px 16px", border: "1px solid #e2e8f0" }}>
        <div style={{ fontSize: 15, fontWeight: 800, color: "#1e293b", marginBottom: 4 }}>⚙️ Rediger innhold</div>
        <div style={{ fontSize: 12, color: "#64748b", lineHeight: 1.6 }}>
          Her kan du redigere oppgavetekster og "les mer"-innhold for alle faser. Endringer gjelder for alle nye bedrifter som opprettes.
        </div>
        {saved && (
          <div style={{ marginTop: 8, display: "inline-flex", alignItems: "center", gap: 6, background: "#f0fdf4", color: "#16a34a", borderRadius: 99, padding: "4px 12px", fontSize: 12, fontWeight: 700 }}>
            ✓ Lagret!
          </div>
        )}
      </div>

      {/* Phase selector */}
      <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 2 }}>
        {phases.map(p => {
          const isA = adminPhase === p.id;
          const hasOverrides = adminTasks && adminTasks[p.id];
          return (
            <button key={p.id} onClick={() => { setAdminPhase(p.id); onCancelEdit(); setAddingPhase(null); }}
              style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, padding: "8px 12px", borderRadius: 12, border: `2px solid ${isA ? p.color : "#e2e8f0"}`, background: isA ? p.color : "#f8fafc", color: isA ? "#fff" : "#64748b", cursor: "pointer", minWidth: 72, flexShrink: 0, fontFamily: "inherit", position: "relative" }}>
              {hasOverrides && <span style={{ position: "absolute", top: -4, right: -4, width: 10, height: 10, borderRadius: 99, background: "#6366f1", border: "2px solid #fff" }} />}
              <span style={{ fontSize: 18 }}>{p.emoji}</span>
              <span style={{ fontSize: 10, fontWeight: 700 }}>{p.label}</span>
            </button>
          );
        })}
      </div>

      {/* Phase tasks list */}
      <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", overflow: "hidden" }}>
        <div style={{ background: phase.light, borderBottom: `2px solid ${phase.border}`, padding: "10px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: phase.color }}>{phase.emoji} {phase.label}</div>
          <button onClick={() => onReset(adminPhase)} style={{ fontSize: 11, color: "#94a3b8", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", textDecoration: "underline" }}>
            Tilbakestill til standard
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          {displayTasks.map((task, idx) => {
            const isEditing = editingTask?.taskId === task.id && editingTask?.phaseId === adminPhase;
            return (
              <div key={task.id} style={{ borderBottom: idx < displayTasks.length - 1 ? "1px solid #f1f5f9" : "none" }}>
                {isEditing ? (
                  /* Edit form */
                  <div style={{ padding: "14px 16px", background: "#fafbff" }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>Oppgavetekst</div>
                    <input value={editText} onChange={e => setEditText(e.target.value)}
                      style={{ ...adminInputStyle, marginBottom: 10, fontWeight: 600 }}
                      placeholder="Oppgavetekst..." autoFocus />
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>Les mer-tekst (vises når elev trykker på oppgaven)</div>
                    <textarea value={editInfo} onChange={e => setEditInfo(e.target.value)}
                      style={{ ...adminInputStyle, minHeight: 90, resize: "vertical", marginBottom: 10 }}
                      placeholder="Forklarende tekst som hjelper elevene å forstå oppgaven..." />
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>Lenke (valgfritt)</div>
                    <input value={editLink} onChange={e => setEditLink(e.target.value)}
                      style={{ ...adminInputStyle, marginBottom: 12 }}
                      placeholder="https://elevbedrift.no/..." />
                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={onCancelEdit} style={{ flex: 1, padding: "9px", borderRadius: 10, border: "1.5px solid #e2e8f0", background: "#f8fafc", cursor: "pointer", fontFamily: "inherit", fontWeight: 600, color: "#64748b", fontSize: 13 }}>Avbryt</button>
                      <button onClick={onSaveEdit} style={{ flex: 2, padding: "9px", borderRadius: 10, border: "none", background: "#6366f1", color: "#fff", cursor: "pointer", fontFamily: "inherit", fontWeight: 700, fontSize: 13 }}>Lagre endringer</button>
                    </div>
                  </div>
                ) : (
                  /* Read row */
                  <div style={{ padding: "12px 16px", display: "flex", alignItems: "flex-start", gap: 10 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: task.isSubmission ? "#92400e" : "#1e293b" }}>{task.text}</div>
                      {task.info && <div style={{ fontSize: 11, color: "#64748b", marginTop: 3, lineHeight: 1.5 }}>{task.info.length > 80 ? task.info.slice(0, 80) + "…" : task.info}</div>}
                      {!task.info && <div style={{ fontSize: 11, color: "#a5b4fc", marginTop: 3, fontStyle: "italic" }}>Ingen les mer-tekst ennå</div>}
                    </div>
                    <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                      <button onClick={() => onStartEdit(adminPhase, task)}
                        style={{ fontSize: 12, fontWeight: 600, color: "#6366f1", background: "#eef2ff", border: "none", borderRadius: 8, padding: "5px 10px", cursor: "pointer", fontFamily: "inherit" }}>
                        ✏️ Rediger
                      </button>
                      <button onClick={() => { if (window.confirm("Slett denne oppgaven?")) onDelete(adminPhase, task.id); }}
                        style={{ fontSize: 12, color: "#ef4444", background: "#fef2f2", border: "none", borderRadius: 8, padding: "5px 8px", cursor: "pointer", fontFamily: "inherit" }}>
                        🗑
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Add new task */}
        {addingPhase === adminPhase ? (
          <div style={{ padding: "12px 16px", borderTop: "1px solid #e2e8f0", background: "#fafbff" }}>
            <input value={newTaskText} onChange={e => setNewTaskText(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") onAdd(adminPhase); if (e.key === "Escape") { setAddingPhase(null); setNewTaskText(""); } }}
              style={{ ...adminInputStyle, marginBottom: 8 }}
              placeholder="Skriv inn ny oppgave og trykk Enter..." autoFocus />
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => { setAddingPhase(null); setNewTaskText(""); }} style={{ flex: 1, padding: "8px", borderRadius: 8, border: "1.5px solid #e2e8f0", background: "#f8fafc", cursor: "pointer", fontFamily: "inherit", color: "#64748b", fontSize: 13 }}>Avbryt</button>
              <button onClick={() => onAdd(adminPhase)} style={{ flex: 2, padding: "8px", borderRadius: 8, border: "none", background: "#6366f1", color: "#fff", cursor: "pointer", fontFamily: "inherit", fontWeight: 700, fontSize: 13 }}>Legg til</button>
            </div>
          </div>
        ) : (
          <div style={{ padding: "10px 16px", borderTop: "1px solid #f1f5f9" }}>
            <button onClick={() => { setAddingPhase(adminPhase); onCancelEdit(); }}
              style={{ fontSize: 13, fontWeight: 600, color: "#6366f1", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", padding: 0 }}>
              + Legg til ny oppgave i {phase.label}
            </button>
          </div>
        )}
      </div>

      {/* Info box */}
      <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 12, padding: "12px 14px" }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "#92400e", marginBottom: 4 }}>💡 Tips</div>
        <div style={{ fontSize: 12, color: "#92400e", lineHeight: 1.6 }}>
          Endringer du gjør her påvirker ikke bedrifter som allerede er opprettet – kun nye bedrifter vil få de oppdaterte standardoppgavene. Blå prikk på en fase betyr at du har gjort egne endringer der.
        </div>
      </div>
    </div>
  );
}

const adminInputStyle = {
  width: "100%", padding: "9px 12px", borderRadius: 8, border: "1.5px solid #e2e8f0",
  fontSize: 13, fontFamily: "inherit", outline: "none", background: "#fff", color: "#1e293b",
  boxSizing: "border-box", display: "block",
};

// ─── Shared Components ────────────────────────────────────────────────────────

function Avatar({ name = "?", size = 36 }) {
  const colors = ["#667eea", "#f97316", "#22c55e", "#a855f7", "#ec4899", "#3b82f6"];
  const color = colors[(name.charCodeAt(0) || 0) % colors.length];
  return <div style={{ width: size, height: size, borderRadius: Math.round(size * 0.27), background: color, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: Math.round(size * 0.42), flexShrink: 0 }}>{name[0]?.toUpperCase()}</div>;
}

function DonutChart({ pct, color, size = 44, textColor }) {
  return (
    <svg viewBox="0 0 36 36" style={{ width: size, height: size }}>
      <circle cx="18" cy="18" r="15" fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth="4" />
      <circle cx="18" cy="18" r="15" fill="none" stroke={color} strokeWidth="4" strokeDasharray={`${pct * 0.942} 100`} strokeLinecap="round" transform="rotate(-90 18 18)" style={{ transition: "stroke-dasharray 0.5s ease" }} />
      <text x="18" y="22" textAnchor="middle" fontSize="9" fontWeight="bold" fill={textColor || color}>{pct}%</text>
    </svg>
  );
}

function MiniProgress({ tasks, selected }) {
  return (
    <div style={{ display: "flex", gap: 3, marginTop: 8 }}>
      {PHASES.map(p => { const pt = tasks[p.id] || []; const pct = pt.length === 0 ? 0 : pt.filter(t => t.approvedBy).length / pt.length; return <div key={p.id} style={{ flex: 1, height: 4, borderRadius: 99, background: selected ? "rgba(255,255,255,0.2)" : "#f1f5f9", overflow: "hidden" }}><div style={{ width: `${pct * 100}%`, height: "100%", background: selected ? "rgba(255,255,255,0.8)" : p.color, borderRadius: 99 }} /></div>; })}
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const S = {
  authBg: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", padding: 20, boxSizing: "border-box" },
  authCard: { background: "#fff", borderRadius: 24, padding: "36px 32px", width: "100%", maxWidth: 400, boxShadow: "0 20px 60px rgba(0,0,0,0.2)", position: "relative" },
  authLogo: { fontSize: 48, textAlign: "center", marginBottom: 4 },
  authTitle: { fontSize: 26, fontWeight: 900, color: "#1e293b", textAlign: "center", margin: "0 0 4px", letterSpacing: "-0.5px" },
  authSub: { fontSize: 14, color: "#94a3b8", textAlign: "center", margin: "0 0 24px" },
  form: { display: "flex", flexDirection: "column", gap: 12 },
  input: { padding: "12px 14px", borderRadius: 12, border: "1.5px solid #e2e8f0", fontSize: 14, fontFamily: "inherit", outline: "none", background: "#f8fafc", color: "#1e293b", boxSizing: "border-box", width: "100%" },
  select: { padding: "12px 14px", borderRadius: 12, border: "1.5px solid #e2e8f0", fontSize: 14, fontFamily: "inherit", outline: "none", background: "#f8fafc", color: "#1e293b", width: "100%", boxSizing: "border-box" },
  btnPrimary: { padding: "13px", borderRadius: 12, border: "none", background: "linear-gradient(135deg, #667eea, #764ba2)", color: "#fff", fontWeight: 800, fontSize: 15, cursor: "pointer", fontFamily: "inherit", marginTop: 4 },
  btnSmall: { padding: "12px 18px", borderRadius: 12, border: "none", color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "inherit", flexShrink: 0 },
  error: { color: "#ef4444", fontSize: 13, textAlign: "center", margin: 0 },
  authSwitch: { textAlign: "center", fontSize: 13, color: "#64748b", marginTop: 16, marginBottom: 0 },
  linkBtn: { background: "none", border: "none", color: "#6366f1", fontWeight: 700, cursor: "pointer", fontFamily: "inherit", fontSize: 13 },
  backBtn: { position: "absolute", top: 16, left: 20, background: "none", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: 13, fontFamily: "inherit" },
  roleRow: { display: "flex", gap: 12, margin: "0 0 20px" },
  roleCard: { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", padding: "20px 12px", borderRadius: 16, border: "2px solid #e2e8f0", cursor: "pointer", background: "#f8fafc", fontFamily: "inherit", color: "#1e293b", transition: "all 0.15s" },
  roleCardActive: { borderColor: "#6366f1", background: "#eef2ff" },
  divider: { display: "flex", alignItems: "center", gap: 8 },
  dividerText: { fontSize: 11, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5, whiteSpace: "nowrap" },
  appRoot: { fontFamily: "'Nunito', 'Segoe UI', sans-serif", minHeight: "100vh", background: "#f1f5f9", display: "flex", flexDirection: "column" },
  header: { background: "#fff", borderBottom: "1px solid #e2e8f0", padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, zIndex: 10 },
  appTitle: { fontSize: 17, fontWeight: 800, color: "#1e293b", letterSpacing: "-0.3px" },
  appSub: { fontSize: 11, color: "#94a3b8", marginTop: 1 },
  iconBtn: { background: "none", border: "none", fontSize: 18, cursor: "pointer", padding: 4, borderRadius: 8 },
  nav: { display: "flex", gap: 8, padding: "12px 16px", overflowX: "auto", background: "#fff", borderBottom: "1px solid #e2e8f0", scrollbarWidth: "none" },
  tab: { display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: "10px 14px", borderRadius: 14, border: "2px solid", cursor: "pointer", minWidth: 76, flexShrink: 0, transition: "all 0.2s ease", fontFamily: "inherit", position: "relative" },
  main: { flex: 1, padding: "16px", display: "flex", flexDirection: "column", gap: 12 },
  phaseHeader: { borderRadius: 16, border: "1.5px solid", padding: "14px 16px" },
  progressBar: { flex: 1, height: 8, background: "#e2e8f0", borderRadius: 99, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 99, transition: "width 0.4s ease" },
  taskItem: { display: "flex", alignItems: "flex-start", gap: 10, background: "#fff", borderRadius: 12, padding: "12px 14px", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" },
  checkbox: { width: 24, height: 24, borderRadius: 8, border: "2px solid", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.15s ease", padding: 0, marginTop: 1 },
  deleteBtn: { background: "none", border: "none", color: "#cbd5e1", fontSize: 20, cursor: "pointer", lineHeight: 1, padding: "0 2px", flexShrink: 0 },
  filterChip: { fontSize: 12, fontWeight: 600, padding: "5px 12px", borderRadius: 99, border: "1.5px solid", cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s" },
  settingsPanel: { background: "#fff", borderBottom: "1px solid #e2e8f0", padding: "16px 20px" },
  codeBox: { display: "flex", alignItems: "center", gap: 10, background: "#f8fafc", borderRadius: 10, padding: "10px 14px" },
  code: { fontSize: 22, fontWeight: 900, letterSpacing: 4, color: "#6366f1", fontFamily: "monospace" },
  copyBtn: { background: "#6366f1", color: "#fff", border: "none", borderRadius: 8, padding: "5px 12px", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" },
  memberRow: { display: "flex", alignItems: "center", gap: 10, padding: "7px 0", borderBottom: "1px solid #f1f5f9" },
  memberChip: { display: "flex", alignItems: "center", gap: 8, background: "#f8fafc", borderRadius: 10, padding: "8px 12px" },
  dashLayout: { display: "flex", flex: 1, overflow: "hidden", minHeight: 0 },
  sidebar: { width: 280, flexShrink: 0, borderRight: "1px solid #e2e8f0", background: "#fff", overflowY: "auto", padding: "12px 0" },
  sidebarTitle: { fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 0.8, padding: "0 16px 10px" },
  companyCard: { width: "100%", textAlign: "left", border: "none", padding: "12px 16px", cursor: "pointer", fontFamily: "inherit", borderBottom: "1px solid #f1f5f9", transition: "background 0.15s" },
  dashMain: { flex: 1, overflowY: "auto", padding: 20 },
  dashCompanyHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 },
  membersRow: { display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 },
  emptyState: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", minHeight: 300 },
};

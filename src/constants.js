// constants.js – deles mellom AppLocal.jsx og AppSupabase.jsx

export const PHASES = [
  {
    id: 'oppstart', label: 'Oppstart', emoji: '🚀', color: '#F97316', light: '#FFF7ED', border: '#FDBA74',
    defaultTasks: [
      { text: 'Vi vet hva en entreprenør er', info: 'En entreprenør er en person som starter bedrift for seg selv. Typisk for dem er at de: ser et behov og finner løsninger, tenker nytt og kreativt, har tro på ideen sin, og har mot og vilje til å gjennomføre det de vil.', link: 'https://elevbedrift.no/oppstart' },
      { text: 'Vi vet hva en elevbedrift skal gjøre', info: 'En elevbedrift finner et behov eller et problem, lager en god løsning og skaper verdier både for seg selv og andre! Løsningen er et produkt: en vare eller en tjeneste. Verdiskapingen kan være å tjene penger, hjelpe mennesker (sosialt entreprenørskap) eller skape en mer miljøvennlig verden (grønt entreprenørskap).', link: 'https://elevbedrift.no/oppstart' },
      { text: 'Vi kjenner til FNs bærekraftsmål', info: 'Når dere skal ut i arbeidslivet må dere tenke på, og ta hensyn til, helt andre ting enn generasjonene før dere. Ved å ta utgangspunkt i ett eller flere av FNs bærekraftsmål kan dere bidra til en litt bedre verden gjennom elevbedriften!', link: 'https://elevbedrift.no/oppstart' },
      { text: 'Vi har fylt ut PLANEN til fase 1', info: 'Last ned og fyll inn Faseplan for oppstart fra elevbedrift.no. Diskuter i gruppen: Hvilke forventinger har dere? Kjenner dere noen som driver en bedrift?', link: 'https://elevbedrift.no/oppstart' },
      { text: 'Vi har PLAKATEN som viser fasene', info: 'Sørg for at gruppen har oversiktsplakaten som viser alle fasene i elevbedrift-årshjulet. Plakaten kan lastes ned fra elevbedrift.no.', link: 'https://elevbedrift.no/oppstart' },
      { text: '📤 Send inn til lærer på Its learning', info: 'Lever Faseplan for oppstart på Its learning og be læreren godkjenne fasen før dere går videre til Idéutvikling.', link: null, isSubmission: true },
    ],
  },
  {
    id: 'ideutvikling', label: 'Idéutvikling', emoji: '💡', color: '#3B82F6', light: '#EFF6FF', border: '#93C5FD',
    defaultTasks: [
      { text: 'Gjennomfør idémyldring', info: 'Bruk minst 15 minutter på å skrive ned alle idéer uten å vurdere dem. Post-it-lapper fungerer bra. Ingen idé er for dum i denne fasen.' },
      { text: 'Velg forretningsidé', info: 'Velg idéen som har best potensial basert på: markedsbehov, kostnad å lage, og gruppens kompetanse.' },
      { text: 'Lag en enkel prototype', info: 'Lag en fysisk eller digital modell/skisse av produktet/tjenesten. Vis den til noen og få tilbakemelding.' },
      { text: 'Kartlegg målgruppen', info: 'Hvem er den typiske kunden? Alder, interesser, betalingsvilje. Lag gjerne en kundepersona.' },
      { text: 'Gjennomfør markedsundersøkelse', info: 'Spør minst 10 potensielle kunder om de ville kjøpt produktet og hva de ville betalt. Google Forms fungerer bra til dette.' },
    ],
  },
  {
    id: 'etablering', label: 'Etablering', emoji: '🏗️', color: '#22C55E', light: '#F0FDF4', border: '#86EFAC',
    defaultTasks: [
      { text: 'Fullfør forretningsplan', info: 'Fyll ut alle delene: produkt/tjeneste, marked, konkurrenter, markedsplan, økonomiplan og organisasjon. Bruk malen fra UE.' },
      { text: 'Selg aksjer og skaff startkapital', info: 'Selg aksjer til medelever, familie og lærere. Typisk pris: 20–50 kr per aksje. Før aksjebok nøye.' },
      { text: 'Åpne bankkonto / opprett kassabok', info: 'Alle inntekter og utgifter skal dokumenteres. Bruk enten en enkel kassabok i Excel eller et regnskapsverktøy.' },
      { text: 'Registrer bedriften hos UE', info: 'Sørg for at registreringen på elevbedrift.no er fullstendig med alle medlemmer, roller og forretningsidé.' },
      { text: 'Lag logo og visuell profil', info: 'Velg farger og font som passer merkevaren. Gratis verktøy: Canva. Bruk logoen konsekvent på alt materiell.' },
      { text: 'Sett opp nettside eller sosiale medier', info: 'Minst én kanal for å nå kunder. Instagram eller TikTok fungerer godt for unge målgrupper.' },
    ],
  },
  {
    id: 'drift', label: 'Drift', emoji: '⚙️', color: '#A855F7', light: '#FAF5FF', border: '#D8B4FE',
    defaultTasks: [
      { text: 'Produser og selg produktet/tjenesten', info: 'Kom i gang med produksjon og salg. Sett ukentlige salgsmål og følg opp.' },
      { text: 'Før regnskap løpende', info: 'Registrer alle inntekter og utgifter fortløpende. Det er mye enklere å holde orden underveis enn å rydde opp på slutten.' },
      { text: 'Delta på messer og markeder', info: 'UE arrangerer regionale messer. Sjekk "Hva skjer?" på elevbedrift.no for datoer i din region.' },
      { text: 'Oppdater sosiale medier jevnlig', info: 'Post minst én gang i uken. Vis frem produktet, bak-kulissen og kundeanmeldelser.' },
      { text: 'Hold teammøter ukentlig', info: 'Skriv alltid referat. Sett agenda på forhånd: hva er status, hva skal gjøres denne uken, hvem gjør hva.' },
      { text: 'Send faktura til kunder', info: 'Alle salg skal dokumenteres. Lag enkle fakturaer med fakturanummer, dato, beløp og betalingsfrist.' },
    ],
  },
  {
    id: 'avvikling', label: 'Avvikling', emoji: '🏁', color: '#EC4899', light: '#FFF1F7', border: '#F9A8D4',
    defaultTasks: [
      { text: 'Lag årsregnskap', info: 'Summer alle inntekter og utgifter, regn ut overskudd/underskudd. Bruk malen fra UE.' },
      { text: 'Skriv årsrapport', info: 'Årsrapporten dokumenterer hele bedriftens levetid: hva dere gjorde, hva som gikk bra, hva dere lærte.' },
      { text: 'Presenter for investorer', info: 'Hold en kort presentasjon (5–10 min) for aksjonærene. Vis frem årsregnskap og fortell om året.' },
      { text: 'Betal tilbake aksjekapital', info: 'Aksjonærene skal få tilbake pengene sine. Dokumenter utbetalingen i aksjebok.' },
      { text: 'Evaluer skoleåret i gruppen', info: 'Hva lærte dere? Hva ville dere gjort annerledes? Skriv en kort felles evaluering.' },
    ],
  },
]

export const ROLES = ['CEO', 'CFO', 'CMO', 'COO', 'Styremedlem', 'Annet']

export const CRM_STATUSES = [
  { id: 'lead',      label: 'Lead',         color: '#94a3b8', bg: '#f8fafc' },
  { id: 'kontaktet', label: 'Kontaktet',    color: '#3B82F6', bg: '#EFF6FF' },
  { id: 'tilbud',    label: 'Tilbud sendt', color: '#F97316', bg: '#FFF7ED' },
  { id: 'kunde',     label: 'Kunde',        color: '#22C55E', bg: '#F0FDF4' },
  { id: 'tapt',      label: 'Tapt',         color: '#EC4899', bg: '#FFF1F7' },
]

export const OPPSTART_TASKS = PHASES.find(p => p.id === 'oppstart').defaultTasks

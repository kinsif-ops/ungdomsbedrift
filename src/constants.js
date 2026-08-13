// constants.js – felles innhold for AppLocal.jsx og AppSupabase.jsx
//
// MERK: Per i dag importerer kun AppSupabase.jsx denne fila. AppLocal.jsx har
// egne definisjoner inline, noe som har ført til at de to versjonene har
// divergert. Målet er at begge skal importere herfra.

export const PHASES = [
  {
    id: 'oppstart', label: 'Oppstart', emoji: '🚀', color: '#F97316', light: '#FFF7ED', border: '#FDBA74',
    defaultTasks: [
      {
        text: 'Vi vet hva en entreprenør er',
        info: 'En entreprenør er en person som starter og driver en bedrift. Entreprenører finnes i alle bransjer, og felles for dem er at de: ser et behov og finner løsninger, tenker nytt og kreativt, har tro på ideen sin, og har mot og vilje til å gjennomføre. Diskuter i gruppen: Kjenner dere noen som driver egen bedrift? Hva skal til for å tørre å starte for seg selv?',
        link: 'https://ungdomsbedrift.no',
      },
      {
        text: 'Vi vet hva en ungdomsbedrift er',
        info: 'En ungdomsbedrift er en ekte bedrift som drives av elever gjennom ett skoleår. Dere registrerer bedriften hos Ungt Entreprenørskap, henter inn aksjekapital, har egne roller og et styre, selger til ekte kunder, fører regnskap og avvikler bedriften til slutt. Produktet er en vare eller en tjeneste. Verdiskapingen kan være økonomisk, sosial (hjelpe mennesker) eller grønn (mer miljøvennlig).',
        link: 'https://ungdomsbedrift.no',
      },
      {
        text: 'Vi kjenner til FNs bærekraftsmål',
        info: 'Bedrifter i dag må ta hensyn til helt andre ting enn generasjonene før. Ved å ta utgangspunkt i ett eller flere av FNs bærekraftsmål kan ungdomsbedriften bidra til noe større enn seg selv. Diskuter i gruppen: Hvilke bærekraftsmål engasjerer dere? Hvilke konkrete problemer finnes innenfor disse målene – på skolen, i lokalsamfunnet eller i verden?',
        link: 'https://ungdomsbedrift.no',
      },
      {
        text: 'Vi har blitt kjent i gruppa og kartlagt kompetanse',
        info: 'En ungdomsbedrift trenger bredde: noen som liker tall, noen som liker å snakke med folk, noen som liker å lage ting. Gå en runde i gruppen: Hva er du god til? Hva har du lyst til å lære i år? Hva gruer du deg til? Denne samtalen gjør rollefordelingen i etableringsfasen mye enklere.',
        link: null,
      },
      {
        text: 'Vi har fylt ut faseplanen for oppstart',
        info: 'Last ned og fyll ut faseplanen for oppstartsfasen fra ungdomsbedrift.no. Planen hjelper dere å strukturere fasen og dokumentere hva dere har gjort. Diskuter i gruppen: Hvilke forventninger har dere til året? Hva vil dere sitte igjen med til våren?',
        link: 'https://ungdomsbedrift.no',
      },
      {
        text: 'Vi kjenner årshjulet og de fem fasene',
        info: 'Ungdomsbedriften følger et årshjul: Oppstart → Idéutvikling → Etablering → Drift → Avvikling. Skaff oversikt over hvilke frister som gjelder i år – registrering hos UE, fylkesmesse og avvikling. Heng gjerne opp en oversikt i klasserommet som viser hvor dere er i prosessen.',
        link: 'https://ungdomsbedrift.no',
      },
      {
        text: '📤 Send inn til lærer',
        info: 'Last opp dokumentasjon når dere er ferdige med oppstartsfasen: utfylt faseplan for oppstart, og eventuelle notater fra gruppediskusjonene. Læreren godkjenner fasen før dere går videre til idéutvikling.',
        link: null,
        isSubmission: true,
      },
    ],
  },
  {
    id: 'ideutvikling', label: 'Idéutvikling', emoji: '💡', color: '#3B82F6', light: '#EFF6FF', border: '#93C5FD',
    defaultTasks: [
      { text: 'Kartlegg problemer og behov', info: 'Før dere leter etter idéer: hva irriterer dere i hverdagen? På skolen, i lokalsamfunnet, i byen? Skriv ned minst fem hver. Reelle problemer er der bedrifter starter – ikke i løsninger som leter etter et problem.' },
      { text: 'Gjennomfør idémyldring', info: 'Bruk minst 15 minutter på å skrive ned alle idéer uten å vurdere dem. Kvantitet før kvalitet, ingen kritikk underveis. Post-it-lapper eller brainwriting fungerer bra: alle skriver tre idéer, sender arket videre, og neste person bygger på det som står.' },
      { text: 'Sil idéene mot faste kriterier', info: 'Still tre spørsmål til hver idé: Hvem er kunden – kan dere navngi dem? Kan dere snakke med tre av dem denne uka? Hvordan påvirker idéen mennesker og miljø? Idéer som ikke kan svare på de to første, går ikke videre.' },
      { text: 'Velg forretningsidé', info: 'Velg idéen med best potensial ut fra markedsbehov, hva det koster å lage, og hva gruppen faktisk kan gjennomføre. Skriv ned hvorfor dere valgte akkurat denne – dere kommer til å trenge begrunnelsen i forretningsplanen.' },
      { text: 'Kartlegg målgruppen', info: 'Hvem er den typiske kunden? Alder, interesser, betalingsvilje, hvor treffer dere dem? Lag gjerne en kundepersona med navn og bilde – det gjør det lettere å ta beslutninger senere.' },
      { text: 'Lag en enkel prototype', info: 'Lag en fysisk eller digital modell/skisse av produktet eller tjenesten. Vis den til noen utenfor gruppen og noter hva de sier. Første versjon skal være rask og billig, ikke perfekt.' },
      { text: 'Gjennomfør markedsundersøkelse', info: 'Spør minst 10 potensielle kunder om de ville kjøpt produktet og hva de ville betalt. Google Forms fungerer bra. Husk: det folk sier de vil betale, er som regel høyere enn det de faktisk betaler.' },
      {
        text: '📤 Send inn til lærer',
        info: 'Lever dokumentasjon på idéfasen: valgt forretningsidé med begrunnelse, målgruppebeskrivelse og resultater fra markedsundersøkelsen.',
        link: null,
        isSubmission: true,
      },
    ],
  },
  {
    id: 'etablering', label: 'Etablering', emoji: '🏗️', color: '#22C55E', light: '#F0FDF4', border: '#86EFAC',
    defaultTasks: [
      { text: 'Fordel roller i bedriften', info: 'Fordel rollene: daglig leder, økonomiansvarlig, markedsansvarlig, produksjonsansvarlig og de andre dere trenger. Skriv ned hva hver rolle faktisk har ansvar for – ellers blir titlene tomme.' },
      { text: 'Fullfør forretningsplan', info: 'Fyll ut alle delene: produkt/tjeneste, marked, konkurrenter, markedsplan, økonomiplan og organisasjon. Bruk malen fra UE. Dette er dokumentet dere blir vurdert på, og det dere viser fram på messa.' },
      { text: 'Sett opp budsjett og priskalkyle', info: 'Regn ut hva én enhet koster å lage (varekost, tid, emballasje), og sett en pris som gir dekningsbidrag. Lag deretter et enkelt budsjett for året: forventede inntekter, faste og variable kostnader.' },
      { text: 'Selg aksjer og skaff startkapital', info: 'Selg aksjer til medelever, familie og lærere. Typisk pris: 20–50 kr per aksje. Før aksjebok nøye – aksjonærene skal ha pengene tilbake ved avvikling.' },
      { text: 'Åpne bankkonto / opprett kassabok', info: 'Alle inntekter og utgifter skal dokumenteres. Bruk en enkel kassabok i Excel eller et regnskapsverktøy. Bestem nå hvem som fører den, og hvor ofte.' },
      { text: 'Registrer bedriften hos UE', info: 'Sørg for at registreringen på ungdomsbedrift.no er fullstendig med alle medlemmer, roller, forretningsidé og ansvarlig lærer. Registreringen gir dere organisasjonsnummer og forsikring gjennom UE.' },
      { text: 'Lag logo og visuell profil', info: 'Velg farger og font som passer merkevaren og målgruppen. Gratis verktøy: Canva. Bruk logoen konsekvent på alt materiell – nettside, emballasje, messestand.' },
      { text: 'Sett opp nettside eller sosiale medier', info: 'Minst én kanal for å nå kunder. Instagram eller TikTok fungerer godt for unge målgrupper. Bestem hvem som har ansvar for å poste, og hvor ofte.' },
      {
        text: '📤 Send inn til lærer',
        info: 'Lever forretningsplan, budsjett med priskalkyle, aksjebok og bekreftelse på registrering hos UE.',
        link: null,
        isSubmission: true,
      },
    ],
  },
  {
    id: 'drift', label: 'Drift', emoji: '⚙️', color: '#A855F7', light: '#FAF5FF', border: '#D8B4FE',
    defaultTasks: [
      // ── Milepæler (gjøres én gang) ──
      { text: 'Produser og selg de første enhetene', info: 'Kom i gang med produksjon og salg. Sett et konkret mål for de første ukene og følg opp. Første salg er den viktigste milepælen i hele året – da er dere en ekte bedrift.' },
      { text: 'Send første faktura', info: 'Alle salg skal dokumenteres. Lag en enkel faktura med fakturanummer, dato, beskrivelse, beløp og betalingsfrist. Ta vare på kopien – den skal inn i regnskapet.' },
      { text: 'Delta på messe eller marked', info: 'UE arrangerer fylkesmesse, og mange skoler har egne markedsdager. Forbered stand, pitch og prisliste på forhånd. Sjekk datoer for din region på ungdomsbedrift.no.', link: 'https://ungdomsbedrift.no' },
      { text: 'Evaluer og juster prisen', info: 'Nå vet dere hva produktet faktisk koster å lage og hva kundene faktisk betaler. Gå tilbake til priskalkylen fra etableringsfasen og juster. Tjener dere penger per enhet?' },

      // ── Ukentlige rutiner (recurring: true) ──
      { text: 'Skriv ukereferat', info: 'Skriv kort hva dere har gjort denne uken, hva som gikk bra og hva som var utfordrende. Referatet lagres i historikken.', recurring: true },
      { text: 'Oppdater regnskap', info: 'Registrer alle inntekter og utgifter fra uken. Husk bilag for alt!', recurring: true },
      { text: 'Post på sosiale medier', info: 'Del noe fra bedriften denne uken – produkt, bak kulissene, kundehistorie eller fremgang.', recurring: true },
      { text: 'Oppdater CRM', info: 'Gå gjennom kundeoversikten. Er det noen leads som skal følges opp? Nye kunder å legge til?', recurring: true },
      { text: 'Teammøte gjennomført', info: 'Hold ukentlig møte med agenda. Hvem gjør hva neste uke? Skriv kort referat.', recurring: true },
    ],
  },
  {
    id: 'avvikling', label: 'Avvikling', emoji: '🏁', color: '#EC4899', light: '#FFF1F7', border: '#F9A8D4',
    defaultTasks: [
      { text: 'Lag årsregnskap', info: 'Summer alle inntekter og utgifter, regn ut overskudd eller underskudd. Bruk malen fra UE. Revisjon kan gjøres av en medelev fra en annen gruppe.' },
      { text: 'Skriv årsrapport', info: 'Årsrapporten dokumenterer hele bedriftens levetid: hva dere gjorde, hva som gikk bra, hva dere lærte. Bruk UEs mal.' },
      { text: 'Presenter for aksjonærene', info: 'Hold en kort presentasjon (5–10 minutter) for aksjonærene. Vis fram årsregnskapet og fortell om året – også det som ikke gikk etter planen.' },
      { text: 'Betal tilbake aksjekapital', info: 'Aksjonærene skal få tilbake pengene sine, pluss eventuelt utbytte. Dokumenter utbetalingen i aksjeboka.' },
      { text: 'Evaluer bærekraft og samfunnsansvar', info: 'Gå tilbake til bærekraftsmålene dere valgte i oppstartsfasen. Hva fikk dere til? Hva ble bare en intensjon? Vær ærlige – det er mer interessant enn å pynte på det.' },
      { text: 'Evaluer skoleåret i gruppen', info: 'Hva lærte dere? Hva ville dere gjort annerledes? Hvordan fungerte rollene og samarbeidet? Skriv en kort felles evaluering og en individuell del.' },
      {
        text: '📤 Send inn til lærer',
        info: 'Lever årsregnskap, årsrapport, dokumentasjon på tilbakebetalt aksjekapital og evalueringene.',
        link: null,
        isSubmission: true,
      },
    ],
  },
]

// Norske UE-roller. MERK: eksisterende brukere i Supabase kan ha lagret
// gamle verdier ('CEO', 'CFO', ...). Disse vises fortsatt, men finnes ikke
// lenger i nedtrekkslista – vurder en migrering hvis basen har gamle brukere.
export const ROLES = [
  'Daglig leder',
  'Økonomiansvarlig',
  'Personalansvarlig',
  'Bærekraftsansvarlig',
  'Markedsansvarlig',
  'Kommunikasjonsansvarlig',
  'Produksjonsansvarlig',
  'Salgsansvarlig',
  'Innkjøpsansvarlig',
  'Andre stillinger',
]

export const CRM_STATUSES = [
  { id: 'lead',      label: 'Lead',         color: '#94a3b8', bg: '#f8fafc' },
  { id: 'kontaktet', label: 'Kontaktet',    color: '#3B82F6', bg: '#EFF6FF' },
  { id: 'tilbud',    label: 'Tilbud sendt', color: '#F97316', bg: '#FFF7ED' },
  { id: 'kunde',     label: 'Kunde',        color: '#22C55E', bg: '#F0FDF4' },
  { id: 'tapt',      label: 'Tapt',         color: '#EC4899', bg: '#FFF1F7' },
]

// Viser domenenavnet til en lenke, slik at knappetekster stemmer uansett kilde
// (ungdomsbedrift.no, ndla.no, youtube.com ...). Faller tilbake til 'nettsiden'.
export function linkLabel(url) {
  try { return new URL(url).hostname.replace(/^www\./, '') } catch { return 'nettsiden' }
}

export const OPPSTART_TASKS = PHASES.find(p => p.id === 'oppstart').defaultTasks

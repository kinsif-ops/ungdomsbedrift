# 🎓 Ungdomsbedrift-appen

Sjekkliste- og CRM-app for elevbedrifter, bygget med React + Vite + Supabase.

---

## 🚀 Publisering på 30 minutter

### Steg 1 – Sett opp Supabase (gratis, ~5 min)

1. Gå til [supabase.com](https://supabase.com) og lag en gratis konto
2. Klikk **"New project"**, gi det et navn (f.eks. `ungdomsbedrift`) og velg et passord
3. Vent ~2 minutter mens prosjektet starter opp
4. Gå til **Database → SQL Editor → New Query**
5. Lim inn hele innholdet fra `supabase-schema.sql` og klikk **Run**
6. Gå til **Settings → API** og kopier:
   - **Project URL** (ser ut som `https://abc123.supabase.co`)
   - **anon/public key** (lang streng som starter med `eyJ...`)

### Steg 2 – Konfigurer miljøvariabler (~2 min)

```bash
cp .env.example .env
```

Åpne `.env` og fyll inn verdiene fra Supabase:

```
VITE_SUPABASE_URL=https://ditt-prosjekt-id.supabase.co
VITE_SUPABASE_ANON_KEY=din-anon-nokkel-her
```

### Steg 3 – Test lokalt (~3 min)

```bash
npm install
npm run dev
```

Åpne [http://localhost:5173](http://localhost:5173) – appen skal nå bruke Supabase.
Opprett en testbruker og sjekk at data dukker opp i Supabase-dashbordet under **Table Editor**.

### Steg 4 – Publiser på Vercel (gratis, ~10 min)

1. Gå til [vercel.com](https://vercel.com) og logg inn med GitHub
2. Push prosjektet til GitHub:
   ```bash
   git init
   git add .
   git commit -m "første versjon"
   git remote add origin https://github.com/dittbrukernavn/ungdomsbedrift.git
   git push -u origin main
   ```
3. I Vercel: klikk **"Add New Project"** → velg GitHub-repoet
4. Under **Environment Variables**, legg til:
   - `VITE_SUPABASE_URL` → din Supabase URL
   - `VITE_SUPABASE_ANON_KEY` → din anon-nøkkel
5. Klikk **Deploy** – ferdig på ~1 minutt! 🎉

Du får en gratis URL som `ungdomsbedrift.vercel.app`.

### Steg 5 (valgfritt) – Eget domene (~5 min)

1. Kjøp domene på [domeneshop.no](https://domeneshop.no) (~150 kr/år)
2. I Vercel: **Settings → Domains** → legg til domenet
3. Følg instruksjonene for å peke DNS til Vercel

---

## 📁 Prosjektstruktur

```
ungdomsbedrift/
├── src/
│   ├── main.jsx          # Inngangspunkt
│   ├── App.jsx           # Router: Supabase vs localStorage
│   ├── AppSupabase.jsx   # Supabase-tilkoblet versjon
│   ├── AppLocal.jsx      # localStorage-versjon (demo/utvikling)
│   ├── db.js             # Alle Supabase-operasjoner
│   ├── constants.js      # Faser, roller, CRM-statuser
│   └── supabaseClient.js # Supabase-klient
├── public/
│   └── favicon.svg
├── supabase-schema.sql   # Kjør denne i Supabase SQL Editor
├── .env.example          # Mal for miljøvariabler
├── index.html
├── vite.config.js
└── package.json
```

---

## 🛠 Lokal utvikling

```bash
npm install      # installer avhengigheter
npm run dev      # start utviklingsserver på port 5173
npm run build    # bygg for produksjon (output i /dist)
npm run preview  # forhåndsvis produksjonsbygget
```

**Uten Supabase** (bare for å se UI):
Slett `.env`-filen eller la `VITE_SUPABASE_URL` stå som eksempel-verdien.
Appen faller da tilbake til localStorage-modus automatisk.

---

## 💰 Kostnader

| Tjeneste | Gratisnivå | Neste nivå |
|---|---|---|
| Vercel (hosting) | Gratis alltid | ~$20/mnd |
| Supabase (database) | Gratis opp til 500 MB / 50k brukere | ~$25/mnd |
| Domeneshop (domene) | – | ~150 kr/år |
| **Total pilot** | **~0 kr/år** | – |
| **Total m/domene** | **~150 kr/år** | – |

---

## 🔒 Sikkerhet

- Passord håndteres av Supabase Auth (bcrypt, aldri lagret i klartekst)
- Row Level Security (RLS) er aktivert på alle tabeller
- Elever kan kun se sin egen bedrifts data
- Lærere kan kun se bedrifter fra sin skole
- API-nøkkelen i `.env` er en `anon`-nøkkel – trygg å bruke i frontend

---

## 📞 Hjelp

- Supabase-dokumentasjon: [supabase.com/docs](https://supabase.com/docs)
- Vercel-dokumentasjon: [vercel.com/docs](https://vercel.com/docs)
- Elevbedrift-ressurser: [elevbedrift.no](https://elevbedrift.no)

# Fulltime — World Cup Prediction Markets (v2)

Onchain parimutuel markets on live World Cup fixtures, settled by TxODDS'
onchain oracle. No admin decides. The data provider is the referee.

Live: fulltime-sigma.vercel.app
Program (devnet): BTJDBnNJU9L3ZfoBeGW84kDN2zD7XLoeAutqFBrjafHd

## v2 changes

- Stadium atmosphere: floodlight gradients + film grain over the turf canvas
- Live StablePrice ticker (renders only with real backend odds — never simulated)
- Hero stats row: markets onchain, SOL pooled, settlements proven (from chain)
- Rolling probability counters (CountUp) on every pool bar
- Proof strip: verified sheen animation, check-mark trust pattern
- Micro-interactions: card lift + shadow, button spring press, skeleton loaders
- Fixed: empty-state text collision; pitch-bar centre circle clamped inside field
- Create page pulls live upcoming fixtures from the backend (static fallback)
- Sticky blurred nav, footer with program explorer link

## Data model

No database. Chain is the store (markets, pools, outcomes, proof hashes via RPC).
Backend (wc-ingestion on Render) adds fixture names + live odds. Absent backend →
static fallback names, hidden ticker. Nothing displayed is fabricated.

## Run

npm install
cp .env.example .env   # set VITE_INGESTION_URL after backend deploy
npm run dev

## Deploy (Vercel)

Framework: Vite. Env: VITE_PROGRAM_ID, VITE_RPC_URL, VITE_CLUSTER, VITE_INGESTION_URL.

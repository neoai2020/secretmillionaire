# extraction-workflow

Secret Millionaire Society Activation Console — one-page onboarding on `/dashboard`.

## Routes

| Path | Action |
|------|--------|
| `/dashboard` | Activation Console: Connect → Scan → Lock In Target, then Empire Builder bridge |
| `/scanner` | Redirects to `/dashboard` (legacy) |
| `/extraction` | Redirects to `/dashboard` (legacy) |

The console has four states driven by `ExtractionContext` flags: intro (`!connected`), running (`isConnecting`/`isScanning`), target reveal (`scanned && !extracted`), and activated (`extracted`).

## State

`ExtractionContext` persists to **Supabase** (`extraction_sessions`) via `/api/extraction/session` — not localStorage.

## Trust UI

- `ConnectionStatus` — sticky server indicator
- `MemberCapacity` — 24/25 network gauge
- `ProfitTicker` — animated "Daily Earning Target" counter

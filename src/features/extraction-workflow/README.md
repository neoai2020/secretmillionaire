# extraction-workflow

Secret Millionaire Society three-click extraction protocol.

## Routes

| Click | Path | Action |
|-------|------|--------|
| 1 | `/dashboard` | Connect to Private Server |
| 2 | `/scanner` | Scan for Lost Digital Change |
| 3 | `/extraction` | Route Funds to Account |

## State

## State

`ExtractionContext` persists to **Supabase** (`extraction_sessions`) via `/api/extraction/session` — not localStorage.

## Trust UI

- `ConnectionStatus` — sticky server indicator
- `MemberCapacity` — 24/25 network gauge
- `ProfitTicker` — animated balance counter

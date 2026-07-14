# extraction-workflow / Home setup

Member Home lives at `/dashboard` (`ConnectDashboardPage`).

## What members see

1. Welcome + **Video training** placeholder  
2. **Here's how it works** — Pick topic → Add links → Launch website  
3. Optional **Quick setup** (connect / scan / save daily goal) if not finished  
4. Stats + quick links  

Legacy `/scanner` and `/extraction` redirect to `/dashboard`.

## State

`ExtractionContext` persists to Supabase `extraction_sessions` via `/api/extraction/session`.

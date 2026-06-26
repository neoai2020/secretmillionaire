# core-workflow

4-step workflow: Search → Analysis → Radar → Replies.

## Enable

```typescript
// features.config.ts
enabledFeatures: ["core-workflow"]
```

## Env

- `RAPIDAPI_KEY`, `RAPIDAPI_HOST_CHATGPT`, `RAPIDAPI_HOST_REDDIT`, `RAPIDAPI_HOST_YOUTUBE`
- `SCRAPERAPI_KEY`

## Files

- `context/SearchContext.tsx` — workflow state
- `lib/llm.ts`, `lib/rapidapi.ts` — AI + scraping
- `pages/` — step UI components
- API routes: `src/app/api/search`, `analysis`, `jackpots`, `replies`

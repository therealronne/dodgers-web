# Dodgers Daily ⚾

A daily LA Dodgers news digest — automatically fetches the top stories from multiple sources, deduplicates them, and summarizes each one with Claude AI. Refreshes once per day; every page load after the first is instant.

## Features

- Pulls from MLB.com, ESPN, Dodgers Nation, True Blue LA, MLB Trade Rumors, AP Sports
- Fuzzy deduplication removes the same story appearing across multiple outlets
- 2–3 sentence AI summaries via Claude (Haiku model)
- Auto-categorizes stories: Injuries · Transactions · Game Recaps · Opinion · General
- Relevance ranking surfaces breaking news and injury/trade stories first
- Daily cache via Next.js Data Cache — only re-fetches once per day
- Vercel Cron pre-warms the cache at 7 AM ET so visitors never wait
- Category filter tabs, relative timestamps, email signup widget

## Running locally

```bash
git clone <repo>
cd dodgers-web
npm install

# Create your env file
echo "ANTHROPIC_API_KEY=sk-ant-YOUR_KEY_HERE" > .env.local

npm run dev
```

Open http://localhost:3000. The first load fetches and summarizes stories (~30–60s); subsequent loads within the same day are instant.

Get your Anthropic API key at https://console.anthropic.com.

## Deploying to Vercel

### One-click deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_ORG/dodgers-web)

### Manual steps

1. Push this repo to GitHub
2. Go to https://vercel.com/new and import the repo
3. Add the environment variable:
   - `ANTHROPIC_API_KEY` → your key from console.anthropic.com
4. (Optional) Add `CRON_SECRET` → any random string to secure the cron endpoint
5. Click **Deploy**

Vercel automatically picks up `vercel.json` and schedules the daily cron job (7 AM UTC = ~midnight PT / 3 AM ET).

> **Note:** The initial cold fetch takes 30–60 seconds. Vercel's Hobby plan has a 10-second function timeout, so the cron pre-warm (which runs before visitors arrive) may not complete on free tier. Upgrade to Vercel Pro for reliable 60-second function execution, or the app will still work — it just may time out on the very first daily load.

## Environment variables

| Variable | Required | Description |
|---|---|---|
| `ANTHROPIC_API_KEY` | Yes | Anthropic API key for Claude summarization |
| `CRON_SECRET` | No | If set, Vercel cron requests must include `Authorization: Bearer <secret>` |

## Project structure

```
app/
  api/
    digest/route.ts   — GET: return cached or fresh digest
    refresh/route.ts  — POST: force invalidate cache and re-fetch
    cron/route.ts     — GET: called by Vercel Cron daily to pre-warm
  layout.tsx
  page.tsx
components/
  DigestPage.tsx      — Root client component
  DigestHeader.tsx    — Header with date and refresh button
  StoryCard.tsx       — Individual story card
  CategoryFilter.tsx  — Filter tabs with counts
  EmailSignup.tsx     — Email subscription widget
lib/
  types.ts            — Shared TypeScript types
  fetcher.ts          — RSS + article scraping
  deduplicator.ts     — URL + fuzzy-title deduplication
  summarizer.ts       — Claude API summarization + categorization
  cache.ts            — Next.js unstable_cache wrapper
vercel.json           — Cron schedule config
```

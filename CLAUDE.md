# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Bisik is an anonymous public chat application using Supabase Realtime Broadcast for ephemeral messaging. Messages are not persisted - they're broadcast in real-time to connected users only.

## Build Command

```bash
npm run build
```

This runs `sed` to replace placeholder values in config.js with environment variables (`SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY`).

## Local Development

1. Set environment variables (create .env with `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY`)
2. Run `npm run build` to inject credentials into config.js
3. Serve the directory with any static file server (e.g., `npx serve .`)

## Architecture

- **No bundler/framework**: Pure vanilla HTML, CSS, and JavaScript
- **Real-time messaging**: Supabase Realtime Broadcast channel (`public-chat`) - messages are ephemeral, not stored in database
- **Anonymous usernames**: Generated client-side by combining profession + connector + object (e.g., "LawyerOfDoom")
- **Deployment**: Vercel serves static files from root directory (configured in vercel.json)

## Key Files

- `config.js` - Supabase credentials (placeholders replaced at build time)
- `script.js` - All application logic (Supabase client, message handling, UI)
- `styles.css` - Responsive CSS with mobile keyboard handling

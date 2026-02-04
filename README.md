# Bisik

Anonymous public chat application using Supabase Realtime Broadcast. Messages are broadcast in real-time to connected users only and not stored in any database.

**Live Demo:** [bisikchat.vercel.app](https://bisikchat.vercel.app)

## Features

- Anonymous usernames generated automatically
- Real-time messaging via Supabase Broadcast
- No message persistence
- Online user count
- Mobile-friendly responsive design

## Deploy Your Own Instance

### 1. Set Up Supabase

1. Create a free account at [supabase.com](https://supabase.com)
2. Create a new project
3. Go to **Settings** → **API** and copy:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon/public key** (the publishable key)

No database tables or additional configuration needed - the app uses only Supabase Realtime Broadcast.

### 2. Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yusufmalikul/bisik&env=SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY)

Or deploy manually:

1. Fork this repository
2. Import the project in [Vercel](https://vercel.com)
3. Add environment variables:
   - `SUPABASE_URL` - Your Supabase project URL
   - `SUPABASE_PUBLISHABLE_KEY` - Your Supabase anon/public key
4. Deploy

### 3. Alternative: Deploy to Other Platforms

The app is static HTML/CSS/JS. You can deploy it anywhere.

## Local Development

1. Clone the repository:
   ```bash
   git clone https://github.com/yusufmalikul/bisik.git
   cd bisik
   ```

2. Set environment variables:
   ```bash
   export SUPABASE_URL="https://your-project.supabase.co"
   export SUPABASE_PUBLISHABLE_KEY="your-anon-key"
   ```

3. Build the config:
   ```bash
   npm run build
   ```

4. Serve with any static file server:
   ```bash
   npx serve .
   ```

## Architecture

- **No bundler/framework** - Pure vanilla HTML, CSS, and JavaScript
- **Supabase Realtime Broadcast** - Uses the `public-chat` channel for ephemeral messaging
- **Anonymous usernames** - Generated client-side

## License

MIT

# T20 PredictR

A private prediction game for friends. Bet on T20 World Cup outcomes, climb the leaderboard, and trash-talk your squad.

## Features

- **Private Groups** -- Create/join groups with invite codes. Friends only.
- **Live Match Dashboard** -- Track T20 matches with real-time scores.
- **Dynamic Predictions** -- Auto-generated questions per match phase (pre-match, powerplay, middle overs, death overs, post-match).
- **Custom Questions** -- Create your own prediction questions for friends to bet on.
- **Points System** -- 5,000 seed points. Bet 250-1,000 per question. Winners split the pot proportionally.
- **Leaderboard** -- Ranked by balance with win rate and profit tracking.
- **Trash Talk Chat** -- Group chat with real-time polling.
- **Admin Controls** -- Advance match phases, generate questions, resolve bets, update scores.
- **Dark Mode** -- Default dark theme.
- **Confetti** -- Celebration animations on wins.

## Tech Stack

- **Framework**: Next.js 16 (App Router, Turbopack)
- **Auth**: NextAuth.js v5 (credentials)
- **Database**: Prisma + PostgreSQL (Neon free tier)
- **UI**: Tailwind CSS v4 + shadcn/ui
- **State**: Zustand + SWR (polling for real-time updates)

---

## Deploy to Vercel (GitHub)

### 1. Create a Neon PostgreSQL database (free)

1. Go to [neon.tech](https://neon.tech) and sign up
2. Create a new project (any name, e.g. `t20-predictr`)
3. Copy both connection strings from the dashboard:
   - **Pooled** connection string (for `DATABASE_URL`)
   - **Direct** connection string (for `DIRECT_URL`)

They look like:
```
postgresql://neondb_owner:abc123@ep-cool-name-12345.us-east-2.aws.neon.tech/neondb?sslmode=require
```

### 2. Push to GitHub

```bash
cd ap_prediction_app
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USER/YOUR_REPO.git
git push -u origin main
```

### 3. Import to Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. In **Environment Variables**, add:

| Variable | Value |
|---|---|
| `DATABASE_URL` | Your Neon **pooled** connection string |
| `DIRECT_URL` | Your Neon **direct** connection string |
| `AUTH_SECRET` | Run `openssl rand -base64 32` and paste the output |

4. Click **Deploy**

The build script automatically runs `prisma generate` and `prisma db push` to set up the database schema.

### 4. Seed data (optional)

After deploying, seed sample data from your local machine:

```bash
# Set your Neon URLs in .env locally
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

npm run db:seed
```

This creates 3 demo users (`rohit@predictr.app`, `virat@predictr.app`, `jasprit@predictr.app` -- password: `password123`) and a group with code `WC2026`.

---

## Local Development

### Prerequisites

- Node.js 18+
- A PostgreSQL database (Neon free tier works, or run Postgres locally)

### Setup

```bash
npm install

# Copy .env.example and fill in your Neon connection strings
cp .env.example .env

# Push the schema to your database
npx prisma db push

# Seed sample data (optional)
npm run db:seed

# Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Demo Accounts (after seeding)

| Email | Password | Role |
|---|---|---|
| rohit@predictr.app | password123 | Admin |
| virat@predictr.app | password123 | Member |
| jasprit@predictr.app | password123 | Member |

Group invite code: **WC2026**

---

## How It Works

### Points System

- Each user starts with **5,000 points**
- Bets range from **250** (min) to **1,000** (max) per question
- Question weights: Easy (250), Medium (500), Hard (750), Expert (1,000)
- Winners split the pot proportionally based on their stake
- Balance < 250 = can't bet

### Match Phases

1. **Pre-Match** -- Toss predictions, match winner, innings total
2. **Powerplay (1-6 overs)** -- Run targets, wicket counts, boundaries
3. **Middle Overs (7-15)** -- Run rates, milestone scores, sixes
4. **Death Overs (16-20)** -- Final totals, boundary counts, last over drama
5. **Post-Match** -- Player of the match, victory margins

### Admin Flow

1. Create a group -> Get invite code
2. Add a match (quick picks for major T20 teams)
3. Pre-match questions auto-generate
4. As the match progresses, advance the phase
5. Generate new questions per phase
6. Resolve questions with correct answers -> Payouts auto-distribute

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Production build (generates Prisma + pushes schema + builds Next.js) |
| `npm run start` | Start production server |
| `npm run db:push` | Push schema to database (no migration files) |
| `npm run db:migrate` | Create and apply migrations |
| `npm run db:seed` | Seed sample data |
| `npm run db:studio` | Open Prisma Studio |

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | PostgreSQL connection string (pooled for Neon) |
| `DIRECT_URL` | Yes | PostgreSQL direct connection string (for Prisma migrations) |
| `AUTH_SECRET` | Yes | Random 32+ char secret (`openssl rand -base64 32`) |
| `NEXTAUTH_URL` | Local only | `http://localhost:3000` (Vercel sets this automatically) |
| `CRICKET_API_KEY` | No | CricAPI key for live scores (https://cricapi.com) |

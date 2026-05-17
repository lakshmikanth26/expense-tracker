# FamilyLedger

A family finance tracker that stores all data in a GitHub repository as JSON files. No database required. Deploy on Vercel for free.

## Features

- 📊 Dashboard with monthly overview
- 💸 Track expenses by category (Food, Transport, Housing, etc.)
- 💰 Track income from multiple sources
- 📈 Investment tracker (MF, SIP, FD, Stocks, etc.)
- 🏦 Savings tracker
- 💳 Loan & EMI tracker
- 📺 Subscription manager with renewal alerts
- 🎯 Financial goals with progress tracking
- 📋 Budget planner with over-budget alerts
- 📱 Mobile-first dark mode UI
- 🔄 Data synced to GitHub as JSON files

## Setup

### 1. Create a GitHub Repository

Create a new **empty** private repository on GitHub (e.g., `family-ledger-data`).

### 2. Create a Personal Access Token

1. Go to [github.com/settings/tokens](https://github.com/settings/tokens)
2. Click "Generate new token (classic)"
3. Select the `repo` scope
4. Copy the token

### 3. Install & Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 4. Configure in the App

1. Go to **Settings** in the app
2. Enter your GitHub token, username, and repository name
3. Click **Test Connection** to verify
4. Click **Save**

### 5. Deploy to Vercel

```bash
npx vercel
```

Or connect your GitHub repo to [vercel.com](https://vercel.com) for automatic deploys.

> Note: Each user needs to configure their own GitHub token in Settings. Tokens are stored in browser localStorage and never sent to any server.

## Data Structure

Data is stored as monthly JSON files in your GitHub repo:
- `/data/2025-01.json` — January 2025 data
- `/data/2025-02.json` — February 2025 data
- `/data/manifest.json` — list of all months with data

## Tech Stack

- **Next.js 14** — App Router
- **Tailwind CSS** — Styling (dark mode)
- **Recharts** — Charts
- **Zustand** — State management
- **GitHub Contents API** — Data storage

# FamilyLedger

A family finance tracker that stores all data as local JSON files. No database or external services required. Deploy anywhere for free.

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
- 💾 Local data storage with backup/restore

## Setup

### 1. Install & Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 2. Start Using

1. Begin adding your income and expenses
2. Data is automatically saved to your browser's local storage
3. Use the **Settings** page to download backups or restore data

### 3. Deploy to Vercel (Optional)

```bash
npx vercel
```

Or connect your repo to [vercel.com](https://vercel.com) for automatic deploys.

## Data Management

- **Automatic**: Data is saved to browser localStorage
- **Backup**: Download JSON files from Settings page
- **Restore**: Upload JSON files to restore data
- **Persistent**: Store JSON files in `public/data/` for deployment persistence

## Data Structure

Data is stored as monthly JSON files:
- `public/data/2026-05.json` — May 2026 data
- `public/data/manifest.json` — list of all months with data

Each month file contains:
```json
{
  "month": "2026-05",
  "income": [],
  "expenses": [],
  "investments": [],
  "savings": [],
  "loans": [],
  "subscriptions": [],
  "goals": [],
  "budgets": {}
}
```

## Tech Stack

- **Next.js 14** — App Router
- **Tailwind CSS** — Styling (dark mode)
- **Recharts** — Charts
- **Zustand** — State management
- **Local Storage** — Data persistence

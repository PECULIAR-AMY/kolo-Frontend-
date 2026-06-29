# kolo. — Intelligent Finance Tracker & AI Copilot

An obsidian/emerald-themed, client-first intelligent financial assistant engineered for mobile excellence, recurring outlay mapping, and instant CSV statement ingestions.

---

## 1. One-line Product Pitch
Gain complete control of your wealth through private, local-first analytics, interactive AI planning, and seamless bank CSV ingestions—all wrapped in a premium, high-performance glassmorphic interface.

---

## 2. Problem Statement
Most personal finance applications present several critical friction points:
1. **Privacy Concerns**: Requiring direct bank credential syncs exposes sensitive user information to external database storage.
2. **Clunky Data Entry**: Manually adding transactions is tedious, leading to app abandonment, while CSV statements from local banks are poorly parsed.
3. **Cluttered Mobile UX**: Heavy analytical charts and filters crash, lag, or overlap on smaller viewports.
4. **Lack of Projections**: Dashboards show past spendings but fail to model upcoming recurring commitments against cash flow curves.

---

## 3. Solution
`kolo.` solves these problems with a local-first, high-fidelity web application:
- **Local-First Privacy**: All accounts and transactions reside completely within your browser's `localStorage`—no cookies, external servers, or data mining.
- **Smart Statement Ingestion**: Pre-configured CSV ingestion templates for major financial institutions (Kuda, GTBank, OPay, PalmPay, Moniepoint) parse statement files automatically in seconds.
- **Elite Mobile Responsiveness**: Dynamic bottom navigation sheets, scrolling-safe chart touch boundaries, and adaptive 2x2 cards optimized for mobile screens.
- **Upcoming commitments Projection**: An integrated Smart Recurring Transaction Engine calculates bi-weekly, weekly, and monthly invoices ahead of time for forecasting.

---

## 4. Features

### Financial Dashboard
- Dynamic summaries of Income, Expenses, Savings Amount, and Savings Rate.
- Pulse-glowing "Upcoming Bills" widget showing timelines, due dates, and active statuses.
- Spendings category distribution lists and responsive Recharts daily curves.

### 💳 Transaction Ledger
- Day-by-day grouped listings displaying transaction details, bank badges, and category indicators.
- Live keyword searching and dual filter systems (Pill categories & Transact types).
- Tactile transaction compositor supporting Add/Edit/Delete actions.

### CSV Statement Ingestion
- Raw drag-and-drop CSV parsing supporting PapaParse.
- Columns mappings matching Kuda, GTBank, OPay, PalmPay, and Moniepoint outputs.
- Table previews with transaction check counts before ingestion commit.

### 🤖 Kolo AI Assistant
- Live chat companion providing immediate advisory insights.
- Dynamic timeline timeline cards summarizing recurring invoices.
- Quick insight chips ("Show June 2026 bills", "Calculate savings rate").

### ⌨️ Command Palette & Hotkeys
- Press `⌘K` or `Ctrl+K` to search actions, switch tabs, toggle themes, or search transactions.
- Press `?` for a visual keyboard shortcuts cheat sheet.
- Single key navigations (`G` then `D` for Dashboard, `C` to Add Transaction, `T` for theme switch).

---

## 🛠️ 5. Tech Stack
- **Framework**: Next.js 16 (App Router, Turbopack)
- **Language**: TypeScript (Strict typing check)
- **Styling**: Tailwind CSS v4, PostCSS
- **Animations**: Framer Motion (Tactile sheets, spring transitions, pulsing loaders)
- **Libraries**:
  - `recharts` for charting and graphs
  - `lucide-react` for premium layout iconography
  - `papaparse` for high-speed local CSV statement processing

---

6. Architecture
`kolo.` is structured as a client-side single-page app (SPA) wrapping context providers for reactive state distribution:

```mermaid
graph TD
  RootLayout[layout.tsx] --> ThemeProvider[ThemeProvider]
  ThemeProvider --> ToastProvider[ToastProvider]
  ToastProvider --> AuthProvider[AuthProvider]
  AuthProvider --> Home[page.tsx]
  Home --> FinanceProvider[FinanceProvider]
  
  subgraph Context Providers
    ThemeProvider
    ToastProvider
    AuthProvider
    FinanceProvider
  end

  subgraph View Layer (next/dynamic)
    FinanceProvider --> Dashboard[DashboardView]
    FinanceProvider --> Transactions[TransactionsView]
    FinanceProvider --> Import[ImportCsvView]
    FinanceProvider --> AI[AiAssistantView]
  end
  
  subgraph Helpers & Engines
    FinanceProvider --> RecEngine[Recurring Engine]
    FinanceProvider --> AiEngine[AI Insights Engine]
  end
```

---

## ⚙️ 7. Technical Decisions & Optimization

### 📦 Dynamic Code Splitting
To hit excellent LCP (Largest Contentful Paint) markers on mobile networks, we code-split heavy views using Next.js `next/dynamic`:
- Main view components (`DashboardView`, `TransactionsView`, `ImportCsvView`, `AiAssistantView`) are loaded on-demand when active.
- The charting module (`SpendingTrend`) is configured with `ssr: false` and a `ChartSkeleton` fallback, keeping Recharts bundle weights outside the initial page load thread.

### ⚡ Strict Render Memoization
To maintain 60fps scrolling on resource-constrained mobile processors:
- All transaction state operations (`add`, `update`, `delete`, `import`) use `React.useCallback` combined with functional state updates (`prev => next`), giving sub-components stable references that never trigger render sweeps.
- Complex calculations (daily spent trends, category counts, recurring roadmaps) are memoized under unified `useMemo` blocks.

### 🎨 Tailwind CSS v4 Variable Remapping
Rather than bloating templates with `dark:bg-slate-900` selectors:
- Tailwind's default slate colors and white variables are mapped directly to CSS custom variables inside `globals.css`.
- Class-based theme variables switch layout colorings instantly when the `.dark` class is toggled on `<html>` by `ThemeContext`.

---

## 🚧 8. Challenges & Solutions

### 1. Client Hydration Mismatches (SSR vs LocalStorage)
* **Challenge**: Next.js pre-renders HTML on the server. Because `localStorage` is only available in the browser, the initial server-generated state differs from the client, throwing console mismatch hydration warnings.
* **Solution**: Developed a `mounted` state check inside providers. Until the client-side mounting hooks execute, we return hidden placeholders or dynamic skeleton structures, resolving hydration discrepancies completely.

### 2. Chart Scrolling Interferences on Touchscreens
* **Challenge**: Recharts event layers intercept touch coordinates, freezing document page scrolls when swiping vertically over charts.
* **Solution**: Injected `style={{ touchAction: "pan-y" }}` onto target SVG wrappers and configured dynamic mobile tick intervals to prevent overlapping labels.

### 3. Readability of Bank Colors in Dark Mode
* **Challenge**: Saturated brand colors (like GTBank orange or Kuda purple) clashed with dark card backgrounds.
* **Solution**: Transformed hardcoded color definitions into custom variable values in `globals.css`, converting solid pastel tags into translucent `rgba` tags in dark mode to preserve text contrast.

---

## 📸 9. Screenshots
The application's premium Obsidian/Emerald theme is shown below:

![Kolo Finance Tracker Showcase Mockup](public/kolo_showcase.png)

---

## 🚀 10. Live Demo & Local Installation

### Prerequisites
- Node.js (version 18 or above recommended)
- npm or yarn

### Steps
1. Clone the project repository.
2. Install standard dependencies:
   ```bash
   npm install
   ```
3. Boot the local development server:
   ```bash
   npm run dev
   ```
4. Access the application in your browser: [http://localhost:3000](http://localhost:3000)

### Production Build
To compile optimized bundles and start a production server locally:
```bash
npm run build
npm run start
```

---

## 🗺️ 11. Future Roadmap
- [ ] **Virtualized Transactions List**: Integrate `react-window` or `react-virtual` to handle transaction histories exceeding 10,000 items with zero performance cost.
- [ ] **Speech-to-Text AI Input**: Allow users to dictate transactions ("MTN Recharge for ₦1,500 on GTBank") via the Web Speech API.
- [ ] **Multi-Currency Ledger**: Track transactions in USD, EUR, and GBP with daily-updated exchange rates.
- [ ] **Interactive Financial Goals**: Build savings target widgets displaying progress circles.

---

## 🧠 12. Key Learnings
1. **Dynamic CSS Variables are King**: Mapping Tailwind's utility class names to responsive CSS variables inside `:root` and `.dark` selectors is significantly cleaner than writing inline `dark:` classes everywhere.
2. **Skeleton Registry Benefits**: Centralizing loading templates inside a unified skeletons file ensures visual consistency during dynamic code splitting transitions.
3. **Local-First is Fast**: Keeping data computations local minimizes fetch latencies and results in an extremely snappy user experience.

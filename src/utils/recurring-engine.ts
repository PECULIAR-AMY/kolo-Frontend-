import { Transaction } from "@/context/finance-context";

export interface RecurringItem {
  id: string;
  title: string;
  category: string;
  amount: number;
  frequency: "weekly" | "bi-weekly" | "monthly" | "yearly" | "irregular";
  lastDate: string;
  nextDueDate: string;
  daysRemaining: number;
  confidence: "High" | "Medium" | "Low";
  bank: Transaction["bank"];
}

// Fixed relative "current date" matching seed timeline (June 1, 2026)
export const VIRTUAL_CURRENT_DATE = new Date("2026-06-01T00:00:00");

export function detectRecurringTransactions(transactions: Transaction[]): RecurringItem[] {
  const expenses = transactions.filter((t) => t.type === "expense");

  // Group transactions by a normalized title/narration key
  const groups: Record<string, Transaction[]> = {};
  
  expenses.forEach((t) => {
    const titleLower = t.title.toLowerCase();
    let normKey = t.title;

    // Normalize popular subscriptions & routine transfers
    if (titleLower.includes("netflix")) normKey = "Netflix";
    else if (titleLower.includes("spotify")) normKey = "Spotify Premium";
    else if (titleLower.includes("mtn")) normKey = "MTN Renewal";
    else if (titleLower.includes("chatgpt") || titleLower.includes("openai")) normKey = "ChatGPT Plus";
    else if (titleLower.includes("rent")) normKey = "Rent Contribution";
    else if (titleLower.includes("savings") || titleLower.includes("transfer to savings")) normKey = "Transfer to Savings";
    else if (titleLower.includes("aws") || titleLower.includes("amazon web")) normKey = "AWS Cloud Services";

    if (!groups[normKey]) {
      groups[normKey] = [];
    }
    groups[normKey].push(t);
  });

  const recurringItems: RecurringItem[] = [];

  Object.entries(groups).forEach(([normTitle, txList]) => {
    // Sort transactions chronologically
    const sorted = [...txList].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    if (sorted.length < 2) {
      // Single transaction - check if it's a known subscription keyword to flag as Medium confidence recurring
      const titleLower = normTitle.toLowerCase();
      const isKnownSub = 
        titleLower.includes("netflix") || 
        titleLower.includes("spotify") || 
        titleLower.includes("chatgpt") || 
        titleLower.includes("aws") ||
        titleLower.includes("mtn");

      if (isKnownSub) {
        const lastTx = sorted[0];
        const lastDate = new Date(lastTx.date);
        
        // Predict next month same day
        const nextDueDate = new Date(lastDate);
        nextDueDate.setMonth(nextDueDate.getMonth() + 1);

        const diffTime = nextDueDate.getTime() - VIRTUAL_CURRENT_DATE.getTime();
        const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        recurringItems.push({
          id: `rec-single-${lastTx.id}`,
          title: normTitle,
          category: lastTx.category,
          amount: lastTx.amount,
          frequency: "monthly",
          lastDate: lastTx.date,
          nextDueDate: nextDueDate.toISOString(),
          daysRemaining,
          confidence: "Medium",
          bank: lastTx.bank,
        });
      }
      return;
    }

    // Calculate dates & average gaps
    const dates = sorted.map((t) => new Date(t.date));
    const gaps: number[] = [];
    for (let i = 1; i < dates.length; i++) {
      const diffMs = dates[i].getTime() - dates[i-1].getTime();
      const diffDays = diffMs / (1000 * 60 * 60 * 24);
      gaps.push(diffDays);
    }

    const avgGap = gaps.reduce((a, b) => a + b, 0) / gaps.length;
    const lastTx = sorted[sorted.length - 1];
    const lastDate = new Date(lastTx.date);

    // Identify frequency & calculate next due date
    let frequency: RecurringItem["frequency"] = "irregular";
    let nextDueDate = new Date(lastDate);
    let confidence: RecurringItem["confidence"] = "Low";

    if (avgGap >= 5 && avgGap <= 9) {
      frequency = "weekly";
      nextDueDate.setDate(nextDueDate.getDate() + 7);
      confidence = sorted.length >= 3 ? "High" : "Medium";
    } else if (avgGap >= 12 && avgGap <= 16) {
      frequency = "bi-weekly";
      nextDueDate.setDate(nextDueDate.getDate() + 14);
      confidence = sorted.length >= 3 ? "High" : "Medium";
    } else if (avgGap >= 25 && avgGap <= 35) {
      frequency = "monthly";
      nextDueDate.setMonth(nextDueDate.getMonth() + 1);
      confidence = sorted.length >= 2 ? "High" : "Medium";
    } else if (avgGap >= 340 && avgGap <= 380) {
      frequency = "yearly";
      nextDueDate.setFullYear(nextDueDate.getFullYear() + 1);
      confidence = "High";
    }

    // Force standard classifications for prominent keywords to protect accuracy
    const titleLower = normTitle.toLowerCase();
    if (titleLower.includes("netflix") || titleLower.includes("spotify") || titleLower.includes("chatgpt") || titleLower.includes("aws") || titleLower.includes("rent") || titleLower.includes("savings")) {
      frequency = "monthly";
      confidence = "High";
    } else if (titleLower.includes("mtn")) {
      frequency = "weekly";
      confidence = "High";
    }

    if (frequency !== "irregular") {
      const diffTime = nextDueDate.getTime() - VIRTUAL_CURRENT_DATE.getTime();
      const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      // Calculate average amount
      const avgAmount = Math.round(
        sorted.reduce((sum, t) => sum + t.amount, 0) / sorted.length
      );

      recurringItems.push({
        id: `rec-group-${lastTx.id}`,
        title: normTitle,
        category: lastTx.category,
        amount: avgAmount,
        frequency,
        lastDate: lastTx.date,
        nextDueDate: nextDueDate.toISOString(),
        daysRemaining,
        confidence,
        bank: lastTx.bank,
      });
    }
  });

  // Sort by days remaining asc (soonest first)
  return recurringItems.sort((a, b) => a.daysRemaining - b.daysRemaining);
}

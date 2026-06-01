import { Transaction } from "@/context/finance-context";

export interface AIInsight {
  id: string;
  type: "pattern" | "warning" | "suggestion";
  title: string;
  description: string;
  category?: string;
  actionText?: string;
  metadata?: {
    primaryValue?: string | number;
    secondaryValue?: string | number;
    ratio?: number;
    items?: { label: string; value: number }[];
  };
}

export function generateAIInsights(transactions: Transaction[]): AIInsight[] {
  const insights: AIInsight[] = [];

  const expenses = transactions.filter((t) => t.type === "expense");
  const incomes = transactions.filter((t) => t.type === "income");

  const totalExpenses = expenses.reduce((sum, t) => sum + t.amount, 0);
  const totalIncome = incomes.reduce((sum, t) => sum + t.amount, 0);

  if (expenses.length === 0) {
    return [
      {
        id: "no-data",
        type: "pattern",
        title: "Welcome to Kolo AI Insights!",
        description: "No expenses recorded yet. Import your bank statements via CSV or add transactions manually to view real-time smart financial analyses.",
        actionText: "Import CSV now",
      },
    ];
  }

  // Group by Category
  const categoryMap: Record<string, number> = {};
  expenses.forEach((t) => {
    categoryMap[t.category] = (categoryMap[t.category] || 0) + t.amount;
  });

  // Group by Merchant/Title (normalize names)
  const merchantMap: Record<string, { amount: number; count: number }> = {};
  expenses.forEach((t) => {
    const titleLower = t.title.toLowerCase();
    let merchant = t.title;
    if (titleLower.includes("bolt")) merchant = "Bolt";
    else if (titleLower.includes("uber")) merchant = "Uber";
    else if (titleLower.includes("netflix")) merchant = "Netflix";
    else if (titleLower.includes("aws") || titleLower.includes("amazon web")) merchant = "AWS";
    else if (titleLower.includes("chicken republic")) merchant = "Chicken Republic";
    else if (titleLower.includes("jumia")) merchant = "Jumia Food";
    else if (titleLower.includes("sportybet")) merchant = "SportyBet";
    else if (titleLower.includes("shoprite")) merchant = "Shoprite";
    else if (titleLower.includes("spar")) merchant = "Spar VI";
    else if (titleLower.includes("airtel")) merchant = "Airtel";

    if (!merchantMap[merchant]) {
      merchantMap[merchant] = { amount: 0, count: 0 };
    }
    merchantMap[merchant].amount += t.amount;
    merchantMap[merchant].count += 1;
  });

  // 1. SPENDING PATTERNS

  // Bolt vs Food comparison (Example requirement)
  const boltTotal = merchantMap["Bolt"]?.amount || 0;
  const foodTotal = categoryMap["Food & Dining"] || 0;
  const groceryTotal = categoryMap["Groceries"] || 0;
  const totalFoodExpenses = foodTotal + groceryTotal;

  if (boltTotal > 0 && totalFoodExpenses > 0) {
    if (boltTotal > totalFoodExpenses) {
      insights.push({
        id: "pattern-bolt-vs-food",
        type: "pattern",
        title: "Transport vs Food ratio",
        description: `You spent more on Bolt than food this month. You paid ₦${boltTotal.toLocaleString("en-NG")} on Bolt rides compared to ₦${totalFoodExpenses.toLocaleString("en-NG")} on food and groceries combined.`,
        category: "Transport",
        actionText: "See transport breakdown",
        metadata: {
          primaryValue: `₦${boltTotal.toLocaleString("en-NG")}`,
          secondaryValue: `₦${totalFoodExpenses.toLocaleString("en-NG")}`,
          ratio: boltTotal / totalFoodExpenses,
          items: [
            { label: "Bolt", value: boltTotal },
            { label: "Food & Groceries", value: totalFoodExpenses },
          ],
        },
      });
    } else {
      insights.push({
        id: "pattern-bolt-vs-food-sub",
        type: "pattern",
        title: "Food is your main staple",
        description: `You spent ₦${totalFoodExpenses.toLocaleString("en-NG")} on food & groceries compared to ₦${boltTotal.toLocaleString("en-NG")} on Bolt rides. Food makes up ${((totalFoodExpenses / totalExpenses) * 100).toFixed(0)}% of your expenses.`,
        category: "Food & Dining",
        actionText: "See food categories",
        metadata: {
          primaryValue: `₦${totalFoodExpenses.toLocaleString("en-NG")}`,
          secondaryValue: `₦${boltTotal.toLocaleString("en-NG")}`,
          ratio: totalFoodExpenses / boltTotal,
          items: [
            { label: "Food & Groceries", value: totalFoodExpenses },
            { label: "Bolt", value: boltTotal },
          ],
        },
      });
    }
  }

  // Top Category Pattern
  const sortedCats = Object.entries(categoryMap).sort((a, b) => b[1] - a[1]);
  if (sortedCats.length > 0) {
    const [topCat, topCatAmt] = sortedCats[0];
    const topCatPct = (topCatAmt / totalExpenses) * 100;
    insights.push({
      id: "pattern-top-category",
      type: "pattern",
      title: `${topCat} is your top expense category`,
      description: `You spent ₦${topCatAmt.toLocaleString("en-NG")} on ${topCat} this month, which accounts for ${topCatPct.toFixed(0)}% of your total outflow.`,
      category: topCat,
      actionText: `Manage ${topCat}`,
      metadata: {
        primaryValue: `₦${topCatAmt.toLocaleString("en-NG")}`,
        ratio: topCatPct / 100,
      },
    });
  }

  // Uber + Bolt joint transport analysis
  const uberTotal = merchantMap["Uber"]?.amount || 0;
  const transportJoint = uberTotal + boltTotal;
  const rideCount = (merchantMap["Uber"]?.count || 0) + (merchantMap["Bolt"]?.count || 0);

  if (transportJoint > 10000) {
    insights.push({
      id: "pattern-ride-hailing",
      type: "pattern",
      title: "High frequency ride-hailing habits",
      description: `You spent ₦${transportJoint.toLocaleString("en-NG")} across ${rideCount} ride-hailing trips (Uber & Bolt). These are mostly morning commutes.`,
      category: "Transport",
      actionText: "See transport breakdown",
      metadata: {
        primaryValue: `₦${transportJoint.toLocaleString("en-NG")}`,
        secondaryValue: `${rideCount} rides`,
      },
    });
  }

  // 2. OVERSPENDING WARNINGS

  // High total spending relative to income
  if (totalIncome > 0) {
    const expenseRatio = totalExpenses / totalIncome;
    if (expenseRatio > 0.7) {
      insights.push({
        id: "warning-high-outflow",
        type: "warning",
        title: "Critical spending warning",
        description: `Your spending represents ${(expenseRatio * 100).toFixed(0)}% of your monthly income. You've only saved ${(100 - (expenseRatio * 100)).toFixed(0)}% (₦${(totalIncome - totalExpenses).toLocaleString("en-NG")}) so far.`,
        category: "Income",
        actionText: "Review budget goals",
        metadata: {
          primaryValue: `${(expenseRatio * 100).toFixed(0)}%`,
          ratio: expenseRatio,
        },
      });
    }
  }

  // Specific high subscriptions warning
  const subTotal = categoryMap["Subscriptions"] || 0;
  if (subTotal > 15000) {
    insights.push({
      id: "warning-subscriptions",
      type: "warning",
      title: "Subscription creep detected",
      description: `You spent ₦${subTotal.toLocaleString("en-NG")} on recurring subscriptions (including Netflix, AWS). It's easy for these hidden bills to accumulate over time.`,
      category: "Subscriptions",
      actionText: "Audit recurring subscriptions",
      metadata: {
        primaryValue: `₦${subTotal.toLocaleString("en-NG")}`,
        items: [
          { label: "Subscriptions", value: subTotal },
          { label: "Others", value: totalExpenses - subTotal },
        ],
      },
    });
  }

  // Betting warning
  const bettingTotal = categoryMap["Betting"] || 0;
  if (bettingTotal > 0) {
    insights.push({
      id: "warning-betting",
      type: "warning",
      title: "Betting outflow detected",
      description: `You deposited ₦${bettingTotal.toLocaleString("en-NG")} on SportyBet/betting platforms. High betting rates represent immediate lost capital; try setting a solid limit next month.`,
      category: "Betting",
      actionText: "Set betting limits",
      metadata: {
        primaryValue: `₦${bettingTotal.toLocaleString("en-NG")}`,
      },
    });
  }

  // High POS cash withdrawals
  const cashTotal = categoryMap["POS & Cash"] || 0;
  if (cashTotal > 15000) {
    insights.push({
      id: "warning-cash-withdrawals",
      type: "warning",
      title: "Frequent POS withdrawals",
      description: `You spent ₦${cashTotal.toLocaleString("en-NG")} via cash or POS agents. High cash withdrawls are difficult to categorize and trace; try paying with direct transfers instead.`,
      category: "POS & Cash",
      actionText: "See transactions",
    });
  }

  // 3. SAVING SUGGESTIONS

  // Suggesting dining habits correction
  const diningTotal = merchantMap["Jumia Food"]?.amount || 0;
  const chickenRepublicTotal = merchantMap["Chicken Republic"]?.amount || 0;
  const foodOutSum = diningTotal + chickenRepublicTotal;

  if (foodOutSum > 10000) {
    insights.push({
      id: "suggestion-cooking",
      type: "suggestion",
      title: "Cook at home to save ₦15,000+",
      description: `You spent ₦${foodOutSum.toLocaleString("en-NG")} ordering Jumia Food & Chicken Republic. Cooking at home could save you up to 60% of this, roughly ₦${(foodOutSum * 0.6).toFixed(0)} next month.`,
      category: "Food & Dining",
      actionText: "Analyze dining expenses",
      metadata: {
        primaryValue: `₦${(foodOutSum * 0.6).toFixed(0)}`,
      },
    });
  }

  // Transport suggestion
  if (transportJoint > 15000) {
    insights.push({
      id: "suggestion-transport",
      type: "suggestion",
      title: "Batch ride rides to save ₦10,000",
      description: `You spent ₦${transportJoint.toLocaleString("en-NG")} on Uber/Bolt rides. Batching your errands on weekends or leaving 30 minutes earlier to bypass price spikes can save up to ₦${(transportJoint * 0.35).toFixed(0)}.`,
      category: "Transport",
      actionText: "Review transport logs",
      metadata: {
        primaryValue: `₦${(transportJoint * 0.35).toFixed(0)}`,
      },
    });
  }

  // Unused subscription suggestion
  if (subTotal > 5000) {
    const netflixAmt = merchantMap["Netflix"]?.amount || 0;
    const awsAmt = merchantMap["AWS"]?.amount || 0;
    if (netflixAmt > 0 || awsAmt > 0) {
      const suggestCancelStr = [
        netflixAmt > 0 ? "Netflix" : "",
        awsAmt > 0 ? "AWS" : "",
      ].filter(Boolean).join(" and ");

      insights.push({
        id: "suggestion-subscriptions",
        type: "suggestion",
        title: `Pause or downgrade ${suggestCancelStr}`,
        description: `You paid for ${suggestCancelStr} this month (₦${(netflixAmt + awsAmt).toLocaleString("en-NG")}). Downgrading or pausing services you don't use every day puts cash back in your pocket.`,
        category: "Subscriptions",
        actionText: "Manage subscriptions",
        metadata: {
          primaryValue: `₦${(netflixAmt + awsAmt).toLocaleString("en-NG")}`,
        },
      });
    }
  }

  // Savings rate challenge suggestion
  const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;
  if (savingsRate < 40 && totalIncome > 0) {
    insights.push({
      id: "suggestion-challenge",
      type: "suggestion",
      title: "Activate a 10% Savings Challenge",
      description: `By auto-saving 10% of every income (₦${(totalIncome * 0.1).toFixed(0)}), you'll build your emergency fund faster without changing your lifestyle significantly.`,
      category: "Income",
      actionText: "Start a challenge",
      metadata: {
        primaryValue: `₦${(totalIncome * 0.1).toFixed(0)}`,
      },
    });
  }

  return insights;
}

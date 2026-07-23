import api from "./axios";

// 1. GET /api/analytics/monthly
export interface GetMonthlyAnalyticsParams {
  year?: number | string;
  month?: number | string;
  startDate?: string;
  endDate?: string;
  [key: string]: any;
}

export interface MonthlyAnalyticsItem {
  month: string;
  year?: number;
  income: number;
  expense: number;
  savings?: number;
  net?: number;
  [key: string]: any;
}

export interface GetMonthlyAnalyticsResponse {
  success: boolean;
  data: MonthlyAnalyticsItem[] | MonthlyAnalyticsItem;
  message?: string;
}

// 2. GET /api/analytics/categories
export interface GetCategoryAnalyticsParams {
  type?: "income" | "expense";
  startDate?: string;
  endDate?: string;
  month?: number | string;
  year?: number | string;
  limit?: number;
  [key: string]: any;
}

export interface CategoryAnalyticsItem {
  category_id?: string;
  category?: string;
  name?: string;
  amount: number;
  percentage?: number;
  count?: number;
  color?: string;
  [key: string]: any;
}

export interface GetCategoryAnalyticsResponse {
  success: boolean;
  data: CategoryAnalyticsItem[];
  message?: string;
}

// 3. GET /api/analytics/income-expense
export interface GetIncomeExpenseAnalyticsParams {
  period?: "daily" | "weekly" | "monthly" | "yearly" | string;
  startDate?: string;
  endDate?: string;
  month?: number | string;
  year?: number | string;
  [key: string]: any;
}

export interface IncomeExpenseAnalyticsData {
  totalIncome: number;
  totalExpense: number;
  netSavings: number;
  savingsRate?: number;
  breakdown?: Array<{
    date?: string;
    month?: string;
    income: number;
    expense: number;
    [key: string]: any;
  }>;
  [key: string]: any;
}

export interface GetIncomeExpenseAnalyticsResponse {
  success: boolean;
  data: IncomeExpenseAnalyticsData;
  message?: string;
}

// 4. GET /api/analytics/savings
export interface GetSavingsAnalyticsParams {
  period?: "monthly" | "yearly" | string;
  year?: number | string;
  startDate?: string;
  endDate?: string;
  [key: string]: any;
}

export interface SavingsAnalyticsData {
  totalSavings: number;
  savingsRate: number;
  targetSavings?: number;
  history?: Array<{
    month?: string;
    date?: string;
    amount: number;
    [key: string]: any;
  }>;
  [key: string]: any;
}

export interface GetSavingsAnalyticsResponse {
  success: boolean;
  data: SavingsAnalyticsData;
  message?: string;
}

/**
 * Fetch monthly analytics data: GET /api/analytics/monthly
 */
export const getMonthlyAnalytics = async (
  params?: GetMonthlyAnalyticsParams
): Promise<GetMonthlyAnalyticsResponse> => {
  const response = await api.get("/analytics/monthly", { params });
  return response.data;
};

/**
 * Fetch category breakdown analytics data: GET /api/analytics/categories
 */
export const getCategoryAnalytics = async (
  params?: GetCategoryAnalyticsParams
): Promise<GetCategoryAnalyticsResponse> => {
  const response = await api.get("/analytics/categories", { params });
  return response.data;
};

/**
 * Fetch income vs expense analytics data: GET /api/analytics/income-expense
 */
export const getIncomeExpenseAnalytics = async (
  params?: GetIncomeExpenseAnalyticsParams
): Promise<GetIncomeExpenseAnalyticsResponse> => {
  const response = await api.get("/analytics/income-expense", { params });
  return response.data;
};

/**
 * Fetch savings analytics data: GET /api/analytics/savings
 */
export const getSavingsAnalytics = async (
  params?: GetSavingsAnalyticsParams
): Promise<GetSavingsAnalyticsResponse> => {
  const response = await api.get("/analytics/savings", { params });
  return response.data;
};

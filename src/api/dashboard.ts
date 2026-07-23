import api from "./axios";
import { BackendTransaction } from "./transaction";

export interface DashboardSummaryData {
  totalBalance?: number;
  totalIncome?: number;
  totalExpenses?: number;
  savingsAmount?: number;
  savingsRate?: number;
  netSavings?: number;
  recentTransactions?: BackendTransaction[];
  topCategory?: {
    name: string;
    amount: number;
    percentage?: number;
  };
  monthlyOverview?: {
    income: number;
    expense: number;
    savings: number;
  };
  chartData?: Array<{
    day?: number;
    date?: string;
    amount: number;
    income?: number;
    expense?: number;
    [key: string]: any;
  }>;
  [key: string]: any;
}

export interface GetDashboardParams {
  startDate?: string;
  endDate?: string;
  month?: number | string;
  year?: number | string;
  period?: string;
  [key: string]: any;
}

export interface GetDashboardResponse {
  success: boolean;
  data: DashboardSummaryData;
  message?: string;
}

/**
 * GET /api/dashboard - Fetch dashboard summary & overview data
 */
export const getDashboardApi = async (
  params?: GetDashboardParams
): Promise<GetDashboardResponse> => {
  const response = await api.get("/dashboard", { params });
  return response.data;
};

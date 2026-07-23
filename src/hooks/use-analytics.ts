import { useQuery } from "@tanstack/react-query";
import {
  getMonthlyAnalytics,
  getCategoryAnalytics,
  getIncomeExpenseAnalytics,
  getSavingsAnalytics,
  GetMonthlyAnalyticsParams,
  GetCategoryAnalyticsParams,
  GetIncomeExpenseAnalyticsParams,
  GetSavingsAnalyticsParams,
} from "@/api/analytics";
import { useAuth } from "@/context/auth-context";

export const ANALYTICS_QUERY_KEYS = {
  monthly: (params?: GetMonthlyAnalyticsParams) => ["analytics", "monthly", params || {}] as const,
  categories: (params?: GetCategoryAnalyticsParams) => ["analytics", "categories", params || {}] as const,
  incomeExpense: (params?: GetIncomeExpenseAnalyticsParams) => ["analytics", "income-expense", params || {}] as const,
  savings: (params?: GetSavingsAnalyticsParams) => ["analytics", "savings", params || {}] as const,
};

/**
 * Hook to consume GET /api/analytics/monthly
 */
export function useMonthlyAnalyticsQuery(params?: GetMonthlyAnalyticsParams) {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: ANALYTICS_QUERY_KEYS.monthly(params),
    queryFn: async () => {
      const response = await getMonthlyAnalytics(params);
      return response.data;
    },
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to consume GET /api/analytics/categories
 */
export function useCategoryAnalyticsQuery(params?: GetCategoryAnalyticsParams) {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: ANALYTICS_QUERY_KEYS.categories(params),
    queryFn: async () => {
      const response = await getCategoryAnalytics(params);
      return response.data;
    },
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to consume GET /api/analytics/income-expense
 */
export function useIncomeExpenseAnalyticsQuery(params?: GetIncomeExpenseAnalyticsParams) {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: ANALYTICS_QUERY_KEYS.incomeExpense(params),
    queryFn: async () => {
      const response = await getIncomeExpenseAnalytics(params);
      return response.data;
    },
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to consume GET /api/analytics/savings
 */
export function useSavingsAnalyticsQuery(params?: GetSavingsAnalyticsParams) {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: ANALYTICS_QUERY_KEYS.savings(params),
    queryFn: async () => {
      const response = await getSavingsAnalytics(params);
      return response.data;
    },
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Combined Hook to consume all 4 analytics endpoints concurrently
 */
export function useAllAnalyticsQuery() {
  const monthly = useMonthlyAnalyticsQuery();
  const categories = useCategoryAnalyticsQuery();
  const incomeExpense = useIncomeExpenseAnalyticsQuery();
  const savings = useSavingsAnalyticsQuery();

  const isLoading = monthly.isLoading || categories.isLoading || incomeExpense.isLoading || savings.isLoading;
  const isError = monthly.isError || categories.isError || incomeExpense.isError || savings.isError;
  const error = monthly.error || categories.error || incomeExpense.error || savings.error;

  return {
    monthly: monthly.data,
    categories: categories.data,
    incomeExpense: incomeExpense.data,
    savings: savings.data,
    isLoading,
    isError,
    error,
    refetchAll: () => {
      monthly.refetch();
      categories.refetch();
      incomeExpense.refetch();
      savings.refetch();
    },
  };
}

import { useQuery } from "@tanstack/react-query";
import { getDashboardApi, GetDashboardParams } from "@/api/dashboard";
import { useAuth } from "@/context/auth-context";

export const DASHBOARD_QUERY_KEY = ["dashboard"];

/**
 * Hook to consume GET /api/dashboard with TanStack Query caching
 */
export function useDashboardQuery(params?: GetDashboardParams) {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: [...DASHBOARD_QUERY_KEY, params || {}],
    queryFn: async () => {
      const response = await getDashboardApi(params);
      return response.data;
    },
    enabled: isAuthenticated,
    staleTime: 2 * 60 * 1000, // 2 minutes cache stale time
  });
}

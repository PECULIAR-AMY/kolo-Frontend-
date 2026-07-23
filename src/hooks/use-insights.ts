import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getInsightsApi,
  getInsightByIdApi,
  generateInsightsApi,
  deleteInsightApi,
  GetInsightsParams,
  GenerateInsightsPayload,
  BackendInsight,
} from "@/api/insight";
import { useAuth } from "@/context/auth-context";

export const INSIGHTS_QUERY_KEY = ["insights"];

export const insightDetailQueryKey = (id: string) => [...INSIGHTS_QUERY_KEY, id];

/**
 * Hook to consume GET /api/insights with TanStack Query caching
 */
export function useInsightsQuery(params?: GetInsightsParams) {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: [...INSIGHTS_QUERY_KEY, params || {}],
    queryFn: async () => {
      const response = await getInsightsApi(params);
      if (Array.isArray(response.data)) {
        return response.data;
      }
      if (response.data && "insights" in response.data) {
        return response.data.insights;
      }
      return [];
    },
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5 minutes cache stale time
  });
}

/**
 * Hook to consume GET /api/insights/:id with TanStack Query caching
 */
export function useInsightDetailQuery(id: string) {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: insightDetailQueryKey(id),
    queryFn: async () => {
      const response = await getInsightByIdApi(id);
      return response.data;
    },
    enabled: isAuthenticated && Boolean(id),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to consume POST /api/insights/generate
 */
export function useGenerateInsightsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload?: GenerateInsightsPayload) => generateInsightsApi(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: INSIGHTS_QUERY_KEY });
    },
  });
}

/**
 * Hook to consume DELETE /api/insights/:id
 */
export function useDeleteInsightMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteInsightApi(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: INSIGHTS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: insightDetailQueryKey(id) });
    },
  });
}

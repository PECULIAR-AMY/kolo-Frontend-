import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getRecommendationsApi,
  generateRecommendationsApi,
  GetRecommendationsParams,
  GenerateRecommendationsPayload,
  BackendRecommendation,
} from "@/api/recommendation";
import { useAuth } from "@/context/auth-context";

export const RECOMMENDATIONS_QUERY_KEY = ["recommendations"];

/**
 * Hook to consume GET /api/recommendations with TanStack Query caching
 */
export function useRecommendationsQuery(params?: GetRecommendationsParams) {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: [...RECOMMENDATIONS_QUERY_KEY, params || {}],
    queryFn: async () => {
      const response = await getRecommendationsApi(params);
      if (Array.isArray(response.data)) {
        return response.data;
      }
      if (response.data && "recommendations" in response.data) {
        return response.data.recommendations;
      }
      return [];
    },
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5 minutes cache stale time
  });
}

/**
 * Hook to consume POST /api/recommendations/generate with automatic cache invalidation
 */
export function useGenerateRecommendationsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload?: GenerateRecommendationsPayload) =>
      generateRecommendationsApi(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: RECOMMENDATIONS_QUERY_KEY });
    },
  });
}

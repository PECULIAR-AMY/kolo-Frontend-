import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getSavingsGoalsApi,
  getSavingsGoalByIdApi,
  createSavingsGoalApi,
  updateSavingsGoalApi,
  deleteSavingsGoalApi,
  depositSavingsGoalApi,
  GetSavingsGoalsParams,
  CreateSavingsGoalPayload,
  UpdateSavingsGoalPayload,
  DepositSavingsGoalPayload,
  SavingsGoal,
} from "@/api/savings-goals";
import { useAuth } from "@/context/auth-context";

export const SAVINGS_GOALS_QUERY_KEY = ["savings-goals"];

export const savingsGoalDetailQueryKey = (id: string) => [...SAVINGS_GOALS_QUERY_KEY, id];

/**
 * Hook to consume GET /api/savings-goals with TanStack Query caching
 */
export function useSavingsGoalsQuery(params?: GetSavingsGoalsParams) {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: [...SAVINGS_GOALS_QUERY_KEY, params || {}],
    queryFn: async () => {
      const response = await getSavingsGoalsApi(params);
      if (Array.isArray(response.data)) {
        return response.data;
      }
      if (response.data && "goals" in response.data) {
        return response.data.goals;
      }
      return [];
    },
    enabled: isAuthenticated,
    staleTime: 2 * 60 * 1000,
  });
}

/**
 * Hook to consume GET /api/savings-goals/:id with TanStack Query caching
 */
export function useSavingsGoalDetailQuery(id: string) {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: savingsGoalDetailQueryKey(id),
    queryFn: async () => {
      const response = await getSavingsGoalByIdApi(id);
      return response.data;
    },
    enabled: isAuthenticated && Boolean(id),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to consume POST /api/savings-goals
 */
export function useCreateSavingsGoalMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateSavingsGoalPayload) => createSavingsGoalApi(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SAVINGS_GOALS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

/**
 * Hook to consume PATCH /api/savings-goals/:id
 */
export function useUpdateSavingsGoalMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateSavingsGoalPayload }) =>
      updateSavingsGoalApi(id, payload),
    onSuccess: ({ data }) => {
      queryClient.invalidateQueries({ queryKey: SAVINGS_GOALS_QUERY_KEY });
      if (data?.id) {
        queryClient.invalidateQueries({ queryKey: savingsGoalDetailQueryKey(data.id) });
      }
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

/**
 * Hook to consume DELETE /api/savings-goals/:id
 */
export function useDeleteSavingsGoalMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteSavingsGoalApi(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: SAVINGS_GOALS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: savingsGoalDetailQueryKey(id) });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

/**
 * Hook to consume POST /api/savings-goals/:id/deposit
 */
export function useDepositSavingsGoalMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: DepositSavingsGoalPayload }) =>
      depositSavingsGoalApi(id, payload),
    onSuccess: ({ data }, { id }) => {
      queryClient.invalidateQueries({ queryKey: SAVINGS_GOALS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: savingsGoalDetailQueryKey(id || data?.id) });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
  });
}

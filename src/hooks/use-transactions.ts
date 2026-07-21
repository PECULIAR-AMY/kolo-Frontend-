import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getTransactions,
  createTransactionApi,
  updateTransactionApi,
  deleteTransactionApi,
  CreateTransactionPayload,
  UpdateTransactionPayload,
} from "@/api/transaction";
import { useAuth } from "@/context/auth-context";

export const TRANSACTIONS_QUERY_KEY = ["transactions"];

export function useTransactionsQuery() {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: TRANSACTIONS_QUERY_KEY,
    queryFn: async () => {
      const res = await getTransactions();
      return res.data.transactions;
    },
    enabled: isAuthenticated,
    staleTime: 2 * 60 * 1000, // 2 minutes cache time
  });
}

export function useCreateTransactionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateTransactionPayload) => createTransactionApi(payload),
    onSuccess: () => {
      // Automatically invalidate transactions cache on creation
      queryClient.invalidateQueries({ queryKey: TRANSACTIONS_QUERY_KEY });
    },
  });
}

export function useUpdateTransactionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateTransactionPayload }) =>
      updateTransactionApi(id, payload),
    onSuccess: () => {
      // Automatically invalidate transactions cache on update
      queryClient.invalidateQueries({ queryKey: TRANSACTIONS_QUERY_KEY });
    },
  });
}

export function useDeleteTransactionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteTransactionApi(id),
    onSuccess: () => {
      // Automatically invalidate transactions cache on deletion
      queryClient.invalidateQueries({ queryKey: TRANSACTIONS_QUERY_KEY });
    },
  });
}

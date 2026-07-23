import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getUploadsApi,
  getUploadByIdApi,
  uploadFileApi,
  GetUploadsParams,
  BackendUpload,
} from "@/api/upload";
import { useAuth } from "@/context/auth-context";

export const UPLOADS_QUERY_KEY = ["uploads"];

export const uploadDetailQueryKey = (id: string) => [...UPLOADS_QUERY_KEY, id];

/**
 * Hook to consume GET /api/uploads with TanStack Query caching
 */
export function useUploadsQuery(params?: GetUploadsParams) {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: [...UPLOADS_QUERY_KEY, params || {}],
    queryFn: async () => {
      const response = await getUploadsApi(params);
      if (Array.isArray(response.data)) {
        return response.data;
      }
      if (response.data && "uploads" in response.data) {
        return response.data.uploads;
      }
      return [];
    },
    enabled: isAuthenticated,
    staleTime: 2 * 60 * 1000, // Cache for 2 minutes
  });
}

/**
 * Hook to consume GET /api/uploads/:id with TanStack Query caching
 */
export function useUploadDetailQuery(id: string) {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: uploadDetailQueryKey(id),
    queryFn: async () => {
      const response = await getUploadByIdApi(id);
      return response.data;
    },
    enabled: isAuthenticated && Boolean(id),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to consume POST /api/uploads with automatic TanStack Query cache invalidation
 */
export function useUploadMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: File | FormData | { file: File; [key: string]: any }) =>
      uploadFileApi(payload),
    onSuccess: (data) => {
      // Invalidate uploads list cache to automatically re-fetch fresh data
      queryClient.invalidateQueries({ queryKey: UPLOADS_QUERY_KEY });
      if (data?.data?.id) {
        queryClient.invalidateQueries({ queryKey: uploadDetailQueryKey(data.data.id) });
      }
    },
  });
}

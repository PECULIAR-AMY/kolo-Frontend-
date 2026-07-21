import { useQuery } from "@tanstack/react-query";
import { getCategories } from "@/api/category";
import { useAuth } from "@/context/auth-context";

export const CATEGORIES_QUERY_KEY = ["categories"];

export function useCategoriesQuery() {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: CATEGORIES_QUERY_KEY,
    queryFn: async () => {
      const response = await getCategories();
      return response.categories;
    },
    enabled: isAuthenticated,
    staleTime: 10 * 60 * 1000, // Cache categories for 10 minutes
  });
}

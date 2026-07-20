import api from "./axios";

export interface Category {
  id: string;
  name: string;
}

export interface GetCategoriesResponse {
  success: boolean;
  categories: Category[];
}

export const getCategories = async (): Promise<GetCategoriesResponse> => {
  const response = await api.get("/categories");
  return response.data;
};

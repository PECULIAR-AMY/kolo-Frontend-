import api from "./axios";

export interface BackendTransaction {
  id: string;
  user_id: string;
  amount: number;
  transaction_type: "income" | "expense";
  transaction_date: string;
  description?: string | null;
  category_id?: string | null;
  categories?: {
    id: string;
    name: string;
  } | null;
  created_at?: string;
  updated_at?: string;
}

export interface CreateTransactionPayload {
  amount: number | string;
  transaction_type: "income" | "expense";
  transaction_date: string;
  description?: string | null;
  category_id?: string | null;
}

export interface UpdateTransactionPayload {
  amount?: number | string;
  transaction_type?: "income" | "expense";
  transaction_date?: string;
  description?: string | null;
  category_id?: string | null;
}

export interface GetTransactionsResponse {
  success: boolean;
  data: {
    transactions: BackendTransaction[];
    pagination: {
      totalItems: number;
      totalPages: number;
      currentPage: number;
      limit: number;
    };
  };
}

export const getTransactions = async (): Promise<GetTransactionsResponse> => {
  const response = await api.get("/transactions");
  return response.data;
};

export const createTransactionApi = async (
  payload: CreateTransactionPayload
): Promise<{ success: boolean; data: BackendTransaction }> => {
  const response = await api.post("/transactions", payload);
  return response.data;
};

export const updateTransactionApi = async (
  id: string,
  payload: UpdateTransactionPayload
): Promise<{ success: boolean; data: BackendTransaction }> => {
  const response = await api.patch(`/transactions/${id}`, payload);
  return response.data;
};

export const deleteTransactionApi = async (
  id: string
): Promise<{ success: boolean; message: string }> => {
  const response = await api.delete(`/transactions/${id}`);
  return response.data;
};

import api from "./axios";

export interface SavingsGoal {
  id: string;
  user_id?: string;
  name: string;
  title?: string;
  target_amount: number;
  current_amount: number;
  target_date?: string;
  category?: string;
  description?: string | null;
  status?: "active" | "completed" | "cancelled" | string;
  created_at?: string;
  updated_at?: string;
  [key: string]: any;
}

export interface CreateSavingsGoalPayload {
  name?: string;
  title?: string;
  target_amount: number | string;
  current_amount?: number | string;
  target_date?: string;
  category?: string;
  description?: string | null;
}

export interface UpdateSavingsGoalPayload {
  name?: string;
  title?: string;
  target_amount?: number | string;
  current_amount?: number | string;
  target_date?: string;
  category?: string;
  description?: string | null;
  status?: string;
}

export interface DepositSavingsGoalPayload {
  amount: number | string;
  note?: string;
  date?: string;
  [key: string]: any;
}

export interface GetSavingsGoalsParams {
  status?: string;
  page?: number;
  limit?: number;
  [key: string]: any;
}

export interface GetSavingsGoalsResponse {
  success: boolean;
  data: SavingsGoal[] | {
    goals: SavingsGoal[];
    pagination?: {
      totalItems: number;
      totalPages: number;
      currentPage: number;
      limit: number;
    };
  };
  message?: string;
}

export interface GetSavingsGoalByIdResponse {
  success: boolean;
  data: SavingsGoal;
  message?: string;
}

export interface SavingsGoalActionResponse {
  success: boolean;
  data: SavingsGoal;
  message?: string;
}

/**
 * GET /api/savings-goals - Fetch savings goals list
 */
export const getSavingsGoalsApi = async (
  params?: GetSavingsGoalsParams
): Promise<GetSavingsGoalsResponse> => {
  const response = await api.get("/savings-goals", { params });
  return response.data;
};

/**
 * GET /api/savings-goals/:id - Fetch savings goal by ID
 */
export const getSavingsGoalByIdApi = async (
  id: string
): Promise<GetSavingsGoalByIdResponse> => {
  const response = await api.get(`/savings-goals/${id}`);
  return response.data;
};

/**
 * POST /api/savings-goals - Create a new savings goal
 */
export const createSavingsGoalApi = async (
  payload: CreateSavingsGoalPayload
): Promise<SavingsGoalActionResponse> => {
  const response = await api.post("/savings-goals", payload);
  return response.data;
};

/**
 * PATCH /api/savings-goals/:id - Update an existing savings goal
 */
export const updateSavingsGoalApi = async (
  id: string,
  payload: UpdateSavingsGoalPayload
): Promise<SavingsGoalActionResponse> => {
  const response = await api.patch(`/savings-goals/${id}`, payload);
  return response.data;
};

/**
 * DELETE /api/savings-goals/:id - Delete a savings goal
 */
export const deleteSavingsGoalApi = async (
  id: string
): Promise<{ success: boolean; message: string }> => {
  const response = await api.delete(`/savings-goals/${id}`);
  return response.data;
};

/**
 * POST /api/savings-goals/:id/deposit - Deposit into a savings goal
 */
export const depositSavingsGoalApi = async (
  id: string,
  payload: DepositSavingsGoalPayload
): Promise<SavingsGoalActionResponse> => {
  const response = await api.post(`/savings-goals/${id}/deposit`, payload);
  return response.data;
};

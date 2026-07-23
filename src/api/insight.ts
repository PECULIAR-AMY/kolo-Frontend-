import api from "./axios";

export interface BackendInsight {
  id: string;
  type: "pattern" | "warning" | "suggestion" | string;
  title: string;
  description: string;
  category?: string;
  action_text?: string;
  actionText?: string;
  metadata?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
  user_id?: string;
  [key: string]: any;
}

export interface GenerateInsightsPayload {
  prompt?: string;
  context?: Record<string, any>;
  transactions?: any[];
  period?: string;
  [key: string]: any;
}

export interface GetInsightsParams {
  type?: string;
  category?: string;
  page?: number;
  limit?: number;
  [key: string]: any;
}

export interface GetInsightsResponse {
  success: boolean;
  data: BackendInsight[] | {
    insights: BackendInsight[];
    pagination?: {
      totalItems: number;
      totalPages: number;
      currentPage: number;
      limit: number;
    };
  };
  message?: string;
}

export interface GetInsightByIdResponse {
  success: boolean;
  data: BackendInsight;
  message?: string;
}

export interface GenerateInsightsResponse {
  success: boolean;
  data: BackendInsight[] | BackendInsight;
  message?: string;
}

/**
 * POST /api/insights/generate - Generate AI Insights
 */
export const generateInsightsApi = async (
  payload?: GenerateInsightsPayload
): Promise<GenerateInsightsResponse> => {
  const response = await api.post("/insights/generate", payload || {});
  return response.data;
};

/**
 * GET /api/insights - Fetch all AI Insights
 */
export const getInsightsApi = async (
  params?: GetInsightsParams
): Promise<GetInsightsResponse> => {
  const response = await api.get("/insights", { params });
  return response.data;
};

/**
 * GET /api/insights/:id - Fetch AI Insight by ID
 */
export const getInsightByIdApi = async (
  id: string
): Promise<GetInsightByIdResponse> => {
  const response = await api.get(`/insights/${id}`);
  return response.data;
};

/**
 * DELETE /api/insights/:id - Delete an AI Insight by ID
 */
export const deleteInsightApi = async (
  id: string
): Promise<{ success: boolean; message: string }> => {
  const response = await api.delete(`/insights/${id}`);
  return response.data;
};

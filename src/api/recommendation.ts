import api from "./axios";

export interface BackendRecommendation {
  id: string;
  type?: string;
  title: string;
  description: string;
  category?: string;
  impact?: "high" | "medium" | "low" | string;
  potential_savings?: number;
  potentialSavings?: number;
  action_text?: string;
  actionText?: string;
  created_at?: string;
  updated_at?: string;
  user_id?: string;
  [key: string]: any;
}

export interface GetRecommendationsParams {
  category?: string;
  impact?: string;
  page?: number;
  limit?: number;
  [key: string]: any;
}

export interface GetRecommendationsResponse {
  success: boolean;
  data: BackendRecommendation[] | {
    recommendations: BackendRecommendation[];
    pagination?: {
      totalItems: number;
      totalPages: number;
      currentPage: number;
      limit: number;
    };
  };
  message?: string;
}

export interface GenerateRecommendationsPayload {
  context?: Record<string, any>;
  prompt?: string;
  period?: string;
  [key: string]: any;
}

export interface GenerateRecommendationsResponse {
  success: boolean;
  data: BackendRecommendation[] | BackendRecommendation;
  message?: string;
}

/**
 * GET /api/recommendations - Fetch recommendations list
 */
export const getRecommendationsApi = async (
  params?: GetRecommendationsParams
): Promise<GetRecommendationsResponse> => {
  const response = await api.get("/recommendations", { params });
  return response.data;
};

/**
 * POST /api/recommendations/generate - Generate new AI recommendations
 */
export const generateRecommendationsApi = async (
  payload?: GenerateRecommendationsPayload
): Promise<GenerateRecommendationsResponse> => {
  const response = await api.post("/recommendations/generate", payload || {});
  return response.data;
};

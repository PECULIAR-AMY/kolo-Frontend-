import api from "./axios";

export interface BackendUpload {
  id: string;
  filename: string;
  original_name?: string;
  mime_type?: string;
  size?: number;
  url?: string;
  status?: "pending" | "processing" | "completed" | "failed" | string;
  created_at?: string;
  updated_at?: string;
  user_id?: string;
  [key: string]: any;
}

export interface GetUploadsParams {
  page?: number;
  limit?: number;
  status?: string;
  [key: string]: any;
}

export interface GetUploadsResponse {
  success: boolean;
  data: BackendUpload[] | {
    uploads: BackendUpload[];
    pagination?: {
      totalItems: number;
      totalPages: number;
      currentPage: number;
      limit: number;
    };
  };
  message?: string;
}

export interface GetUploadByIdResponse {
  success: boolean;
  data: BackendUpload;
  message?: string;
}

export interface UploadFileResponse {
  success: boolean;
  data: BackendUpload;
  message?: string;
}

/**
 * POST /api/uploads - Upload a file or FormData payload
 */
export const uploadFileApi = async (
  payload: File | FormData | { file: File; [key: string]: any }
): Promise<UploadFileResponse> => {
  let body: FormData;

  if (payload instanceof FormData) {
    body = payload;
  } else if (payload instanceof File) {
    body = new FormData();
    body.append("file", payload);
  } else if (payload && typeof payload === "object" && "file" in payload) {
    body = new FormData();
    body.append("file", payload.file);
    Object.keys(payload).forEach((key) => {
      if (key !== "file" && payload[key] !== undefined) {
        body.append(key, payload[key]);
      }
    });
  } else {
    throw new Error("Invalid payload provided for file upload.");
  }

  const response = await api.post("/uploads", body, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

/**
 * GET /api/uploads - Fetch all uploads
 */
export const getUploadsApi = async (
  params?: GetUploadsParams
): Promise<GetUploadsResponse> => {
  const response = await api.get("/uploads", { params });
  return response.data;
};

/**
 * GET /api/uploads/:id - Fetch upload by ID
 */
export const getUploadByIdApi = async (
  id: string
): Promise<GetUploadByIdResponse> => {
  const response = await api.get(`/uploads/${id}`);
  return response.data;
};

export type ApiError = {
  code: string;
  message: string;
  details?: Record<string, unknown>;
};

export type ApiResponse<T> =
  | {
      success: true;
      data: T;
      message?: string;
    }
  | {
      success: false;
      error: ApiError;
    };

export type ApiSuccessResponse<T> = Extract<ApiResponse<T>, { success: true }>;

import { Response } from 'express';

interface SuccessResponse<T> {
  success: true;
  data: T;
  meta?: {
    page?: number;
    perPage?: number;
    total?: number;
    totalPages?: number;
  };
}

interface ErrorResponse {
  success: false;
  error: {
    message: string;
    code?: string;
    details?: unknown;
  };
}

type ApiResponse<T> = SuccessResponse<T> | ErrorResponse;

export const sendSuccess = <T>(res: Response, data: T, statusCode = 200, meta?: SuccessResponse<T>['meta']) => {
  const response: SuccessResponse<T> = {
    success: true,
    data,
  };

  if (meta) {
    response.meta = meta;
  }

  return res.status(statusCode).json(response);
};

export const sendError = (
  res: Response,
  message: string,
  statusCode = 400,
  code?: string,
  details?: unknown
) => {
  const response: ErrorResponse = {
    success: false,
    error: {
      message,
      code,
      details,
    },
  };

  return res.status(statusCode).json(response);
};

export const sendCreated = <T>(res: Response, data: T) => {
  return sendSuccess(res, data, 201);
};

export const sendNoContent = (res: Response) => {
  return res.status(204).send();
};

export type { ApiResponse, SuccessResponse, ErrorResponse };

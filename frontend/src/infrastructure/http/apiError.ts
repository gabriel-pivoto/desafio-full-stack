export type ApiError = {
  message: string;
  statusCode?: number;
  details?: unknown;
};

export function toApiError(err: unknown): ApiError {
  if (typeof err === 'string') {
    return { message: err };
  }

  const anyErr = err as any;
  const responseData = anyErr?.response?.data;
  const statusCode = anyErr?.response?.status ?? responseData?.statusCode;
  const message = responseData?.message || anyErr?.message || '';

  return {
    message,
    statusCode,
    details: responseData ?? anyErr,
  };
}

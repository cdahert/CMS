import { type z } from "zod";

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

interface FetchOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  params?: Record<string, string | number | boolean | undefined>;
}

/**
 * Type-safe API fetcher with Zod validation.
 * Used for client-side data fetching with TanStack Query.
 */
export async function fetcher<T>(
  url: string,
  schema: z.ZodType<T>,
  options: FetchOptions = {}
): Promise<T> {
  const { body, params, headers, ...restOptions } = options;

  // Build URL with query params
  const urlWithParams = params
    ? `${url}?${new URLSearchParams(
        Object.entries(params)
          .filter(([, v]) => v !== undefined)
          .map(([k, v]) => [k, String(v)])
      ).toString()}`
    : url;

  const response = await fetch(urlWithParams, {
    ...restOptions,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new ApiError(
      (errorData as { message?: string }).message ??
        `HTTP error! status: ${response.status}`,
      response.status,
      errorData
    );
  }

  const json: unknown = await response.json();
  return schema.parse(json);
}

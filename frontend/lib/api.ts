export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api';

export class ApiError extends Error {
  constructor(message: string, public status: number, public fieldErrors?: Record<string, string>) { super(message); }
}

/** Browser-side API helper. Sends the admin cookie and turns failures into readable errors. */
export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const isForm = init.body instanceof FormData;
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      ...init,
      credentials: 'include',
      headers: { ...(init.body && !isForm ? { 'Content-Type': 'application/json' } : {}), ...init.headers },
    });
  } catch {
    throw new ApiError('Cannot reach the server. Check that the backend is running and try again.', 0);
  }
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new ApiError(data?.message ?? 'Something went wrong. Please try again.', res.status, data?.errors);
  return data as T;
}

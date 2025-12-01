export const apiBaseUrl = (import.meta as any).env.VITE_API_BASE_URL as string;

export async function httpGet<T>(path: string): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  return response.json() as Promise<T>;
}



// API 调用封装入口
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

export async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${url}`, {
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  })
  return response.json() as Promise<T>
}

/** 后端统一响应结构（与 mall api.Resp / WriteResp 对齐） */
export interface ApiResult<T> {
  code: number
  msg: string
  err_msg: string
  data: T
}

const BASE_URL: string = import.meta.env.VITE_API_BASE_URL ?? ''

/**
 * 轻量 fetch 封装：
 * - 自动拼接 baseURL、注入鉴权 token
 * - 统一解包 ApiResult，code !== 200 抛错，错误信息优先取 err_msg
 */
export async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('mall_admin_token')
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> | undefined),
  }
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers })
  if (!res.ok) {
    throw new Error(`网络异常（${res.status}）`)
  }

  const body = (await res.json()) as ApiResult<T>
  if (body.code !== 200) {
    throw new Error(body.err_msg || body.msg || '请求失败')
  }
  return body.data
}

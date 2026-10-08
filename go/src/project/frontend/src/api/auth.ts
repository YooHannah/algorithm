import { request } from './request'

/** 是否使用前端内置 Mock（默认开启，后端就绪后置 VITE_USE_MOCK=false） */
const USE_MOCK: boolean = String(import.meta.env.VITE_USE_MOCK ?? 'true') !== 'false'

const API_PREFIX = '/api/mall/admin/v1/user'

export interface LoginResult {
  token: string
  userName: string
}

export interface SendCodeResult {
  sent: boolean
  /** 仅 Mock 模式返回，方便联调演示 */
  debugCode?: string
}

/* ------------------------------ 滑块验证码 ------------------------------ */

/** GET /verify/captcha 的原始响应（snake_case，与后端 dto 对齐） */
interface RawSlideCaptcha {
  key: string
  image_base64: string
  title_image_base64: string
  title_height: number
  title_width: number
  title_x: number
  title_y: number
  expire: number
}

export interface SlideCaptcha {
  key: string
  /** 背景主图（含 data:image/...;base64 前缀） */
  imageBase64: string
  /** 滑块拼图（含 data:image/...;base64 前缀） */
  titleImageBase64: string
  titleHeight: number
  titleWidth: number
  /** 滑块缺口在主图（原始像素）中的坐标 */
  titleX: number
  titleY: number
  /** 过期秒数 */
  expire: number
}

export interface CheckCaptchaResult {
  ticket: string
  expire: number
}

export interface QrTicket {
  ticket: string
  /** 二维码内容（飞书授权地址） */
  url: string
  expiresIn: number
}

export type QrStatus = 'WAITING' | 'SCANNED' | 'CONFIRMED' | 'EXPIRED'

export interface QrStatusResult {
  status: QrStatus
  token?: string
  userName?: string
}

const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))

/* ------------------------------ 账号密码登录 ------------------------------ */

/** POST /verify/mobile/password 响应（与后端 MobilePasswordLoginDtoResp 对齐） */
interface MobilePasswordLoginResp {
  token: string
  user: {
    user_id: number
    name: string
  }
}

/**
 * 手机号 + 密码登录
 * 需先通过滑块校验拿到 ticket，再 POST /verify/mobile/password。
 */
export async function loginByPassword(
  phone: string,
  password: string,
  ticket: string,
): Promise<LoginResult> {
  console.log('loginByPassword', phone, password, ticket, USE_MOCK)
  // if (USE_MOCK) {
  //   await delay(500)
  //   if (password === 'error') {
  //     throw new Error('账号或密码错误')
  //   }
  //   return { token: `mock-token-${Date.now()}`, userName: `用户${phone.slice(-4)}` }
  // }
  const res = await request<MobilePasswordLoginResp>(`${API_PREFIX}/verify/mobile/password`, {
    method: 'POST',
    body: JSON.stringify({ phone, password, ticket }),
  })
  return { token: res.token, userName: res.user.name }
}

/* ------------------------------- 验证码登录 ------------------------------- */

export async function sendSmsCode(phone: string, ticket?: string): Promise<SendCodeResult> {
  if (USE_MOCK) {
    await delay(400)
    return { sent: true, debugCode: '123456' }
  }
  return request<SendCodeResult>(`${API_PREFIX}/verify/smscode`, {
    method: 'POST',
    body: JSON.stringify({ phone, ticket }),
  })
}

export async function loginByCode(phone: string, code: string): Promise<LoginResult> {
  if (USE_MOCK) {
    await delay(500)
    if (code !== '123456') {
      throw new Error('验证码不正确')
    }
    return { token: `mock-token-${Date.now()}`, userName: `用户${phone.slice(-4)}` }
  }
  return request<LoginResult>(`${API_PREFIX}/login/sms`, {
    method: 'POST',
    body: JSON.stringify({ phone, code }),
  })
}

/* ------------------------------ 飞书扫码登录 ------------------------------ */

/** Mock：ticket -> 二维码生成时间戳 */
const qrCreatedAt = new Map<string, number>()

export async function createLoginQr(): Promise<QrTicket> {
  if (USE_MOCK) {
    await delay(200)
    const ticket = `mock_ticket_${Math.random().toString(36).slice(2, 10)}`
    qrCreatedAt.set(ticket, Date.now())
    return {
      ticket,
      url: `https://accounts.feishu.cn/oauth/scan?ticket=${ticket}`,
      expiresIn: 120,
    }
  }
  return request<QrTicket>(`${API_PREFIX}/login/feishu/qrcode`, { method: 'POST' })
}

export async function getQrStatus(ticket: string): Promise<QrStatusResult> {
  if (USE_MOCK) {
    await delay(150)
    const createdAt = qrCreatedAt.get(ticket) ?? Date.now()
    const elapsed = Date.now() - createdAt
    if (elapsed >= 120_000) {
      return { status: 'EXPIRED' }
    }
    // 演示：约 5s 变为已扫码，约 8s 自动确认登录
    if (elapsed < 5000) {
      return { status: 'WAITING' }
    }
    if (elapsed < 8000) {
      return { status: 'SCANNED' }
    }
    return { status: 'CONFIRMED', token: `mock-token-${Date.now()}`, userName: '飞书用户' }
  }
  return request<QrStatusResult>(
    `${API_PREFIX}/login/feishu/qrcode?ticket=${encodeURIComponent(ticket)}`,
    { method: 'GET' },
  )
}

/* --------------------------- 滑块验证码（真实接口） --------------------------- */

/**
 * 获取滑块验证图片信息
 * GET /api/mall/admin/v1/user/verify/captcha
 * 该接口按需求始终请求真实后端（localhost:8081，经 Vite 代理），不走 Mock。
 */
export async function getSlideCaptcha(): Promise<SlideCaptcha> {
  const raw = await request<RawSlideCaptcha>(`${API_PREFIX}/verify/captcha`, {
    method: 'GET',
  })
  return {
    key: raw.key,
    imageBase64: raw.image_base64,
    titleImageBase64: raw.title_image_base64,
    titleHeight: raw.title_height,
    titleWidth: raw.title_width,
    titleX: raw.title_x,
    titleY: raw.title_y,
    expire: raw.expire,
  }
}

/**
 * 校验滑块位置
 * POST /api/mall/admin/v1/user/verify/captcha/check
 * @param slideX 滑块最终位置（主图原始像素坐标）
 * @param slideY 滑块纵向位置（主图原始像素坐标）
 */
export async function checkSlideCaptcha(
  key: string,
  slideX: number,
  slideY: number,
): Promise<CheckCaptchaResult> {
  return request<CheckCaptchaResult>(`${API_PREFIX}/verify/captcha/check`, {
    method: 'POST',
    body: JSON.stringify({ key, slide_x: slideX, slide_y: slideY }),
  })
}
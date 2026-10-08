import { request } from './request'

/** 是否使用前端内置 Mock（默认开启，后端就绪后置 VITE_USE_MOCK=false） */
const USE_MOCK: boolean = String(import.meta.env.VITE_USE_MOCK ?? 'true') !== 'false'

const API_PREFIX = '/api/mall/admin/v1/user'

export interface LoginResult {
  token: string
  userName: string
}

export interface SendCodeResult {
  code: number
  msg: string
  err_msg: string
  data: null
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

/** 用户信息（GET /v1/user/info 响应，与后端 dto.UserInfoResp 对齐） */
export interface UserInfo {
  user_id: number
  name: string
  nick_name: string
  mobile: string
  sex: number
  lark_open_id: string
  status: number
  create_at: number
  update_at: number
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
  if (USE_MOCK) {
    await delay(500)
    if (password === 'error') {
      throw new Error('账号或密码错误')
    }
    return { token: `mock-token-${Date.now()}`, userName: `用户${phone.slice(-4)}` }
  }
  const res = await request<MobilePasswordLoginResp>(`${API_PREFIX}/login/mobile/password`, {
    method: 'POST',
    body: JSON.stringify({ phone, password, ticket }),
  })
  return { token: res.token, userName: res.user.name }
}

/**
 * 获取当前登录用户信息
 * GET /api/mall/admin/v1/user/info
 * 需先登录并保存 token，请求由 request 层自动在 header 携带 token。
 */
export async function getUserInfo(): Promise<UserInfo> {
  if (USE_MOCK) {
    await delay(300)
    const now = Date.now()
    return {
      user_id: 57,
      name: 'admin',
      nick_name: '管理员',
      mobile: '11111111111',
      sex: 1,
      lark_open_id: '',
      status: 1,
      create_at: now,
      update_at: now,
    }
  }
  return request<UserInfo>(`${API_PREFIX}/info`, { method: 'GET' })
}

/* ------------------------------- 验证码登录 ------------------------------- */

export async function sendSmsCode(phone: string, ticket?: string, scene = 'login'): Promise<SendCodeResult> {
  if (USE_MOCK) {
    await delay(400)
    return { code: 200, msg: 'success', err_msg: '123456', data: null }
  }
  // GET 请求参数需拼到 query string（放 body 不会被 BindQuery 读取）。
  const query = new URLSearchParams({
    scene,
    phone,
    ...(ticket ? { ticket } : {}),
  }).toString()
  return request<SendCodeResult>(`${API_PREFIX}/verify/smscode?${query}`, {
    method: 'GET',
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
  return request<LoginResult>(`${API_PREFIX}/login/mobile/phone`, {
    method: 'POST',
    body: JSON.stringify({ phone, verify_code: code, scene: 'login' }),
  })
}

/* --------------------------- 飞书扫码登录换登录态 --------------------------- */

/** POST /login/Lark/qrcode 响应（结构与 MobilePasswordLoginDtoResp 对齐） */
interface LarkQrLoginResp {
  token: string
  user: {
    user_id: number
    name: string
  }
}

/**
 * 飞书扫码授权回调后，用 OAuth code 向后端换取本系统登录态。
 * POST /api/mall/admin/v1/user/login/Lark/qrcode
 * @param code 飞书 302 回调在 query 中携带的授权码（5 分钟内一次性有效）
 */
export async function larkQrLogin(req: {
  AppCode: number
  Code: string
  RedirectUrl: string
}): Promise<LoginResult> {
  const res = await request<LarkQrLoginResp>(`${API_PREFIX}/login/Lark/qrcode`, {
    method: 'POST',
    body: JSON.stringify({
      app_code: req.AppCode,
      code: req.Code,
      redirect_url: req.RedirectUrl,
    }),
  })
  return { token: res.token, userName: res.user.name }
}

/* ----------------------------- 飞书账号绑定 ----------------------------- */

/** POST /user/bind/lark 响应 */
interface BindLarkResp {
  lark_open_id: string
}

/**
 * 已登录用户在个人信息弹窗扫码后，用 OAuth code 将飞书账号绑定到当前管理员。
 * POST /api/mall/admin/v1/user/bind/lark
 * @param code 飞书 302 回调在 query 中携带的授权码（一次性有效）
 */
export async function bindLark(req: {
  appCode: number
  code: string
  redirectUrl: string
}): Promise<{ larkOpenId: string }> {
  const res = await request<BindLarkResp>(`${API_PREFIX}/bind/lark`, {
    method: 'POST',
    body: JSON.stringify({
      app_code: req.appCode,
      code: req.code,
      redirect_url: req.redirectUrl,
    }),
  })
  return { larkOpenId: res.lark_open_id }
}

/**
 * 已登录用户解除当前账号的飞书绑定。
 * POST /api/mall/admin/v1/user/bind/unlark
 */
export async function unbindLark(): Promise<void> {
  await request<null>(`${API_PREFIX}/bind/unlark`, { method: 'POST' })
}

/* ------------------------------- 登出 / 改密 ------------------------------- */

/**
 * 管理员登出，使当前 token 失效。
 * POST /api/mall/admin/v1/user/logout
 */
export async function logout(): Promise<void> {
  await request<null>(`${API_PREFIX}/logout`, { method: 'POST' })
}

/**
 * 已登录管理员通过短信验证码重置密码。
 * POST /api/mall/admin/v1/user/password/reset
 */
export async function updatePassword(req: {
  mobile: string
  code: string
  newPassword: string
  confirmPassword: string
}): Promise<void> {
  await request<null>(`${API_PREFIX}/password/reset`, {
    method: 'POST',
    body: JSON.stringify({
      mobile: req.mobile,
      code: req.code,
      new_password: req.newPassword,
      confirm_password: req.confirmPassword,
    }),
  })
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
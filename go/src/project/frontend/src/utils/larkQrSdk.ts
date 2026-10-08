/**
 * 飞书网页扫码登录 SDK 加载与授权地址构造
 * 文档：https://open.larkoffice.com/document/sso/web-application-sso/qr-sdk-documentation
 */

const SDK_URL =
  'https://lf-package-cn.feishucdn.com/obj/feishu-static/lark/passport/qrcode/LarkSSOSDKWebQRCode-1.0.3.js'

/**
 * 暂存本次授权 state 的 sessionStorage key。
 * 发起扫码时写入，OAuth 回调时读取校验（防 CSRF），校验后立即清除。
 */
export const OAUTH_STATE_KEY = 'feishu_sso_oauth_state'

/** 脚本加载中的 Promise，做 in-flight 复用，避免重复插入 <script> */
let loadingPromise: Promise<void> | null = null

/**
 * 动态加载飞书二维码 SDK。
 * - 已加载则立即返回
 * - 加载失败会重置状态，允许下次重试
 */
export function loadLarkQrSdk(): Promise<void> {
  if (typeof window.QRLogin === 'function') {
    return Promise.resolve()
  }
  if (loadingPromise) {
    return loadingPromise
  }

  loadingPromise = new Promise<void>((resolve, reject) => {
    const script = document.createElement('script')
    script.src = SDK_URL
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => {
      loadingPromise = null
      reject(new Error('飞书二维码 SDK 加载失败，请检查网络后重试'))
    }
    document.head.appendChild(script)
  })

  return loadingPromise
}

export interface FeishuGotoParams {
  /** 飞书应用 App ID（对应旧版流程的 client_id） */
  appId: string
  /** 在飞书开放平台登记的回调地址 */
  redirectUri: string
  /** 随机 state，用于防止 CSRF，回调时需校验一致 */
  state: string
}

/**
 * 构造 SDK 需要的 goto 授权页地址（旧版 passport 授权端点）。
 */
export function buildFeishuGoto({ appId, redirectUri, state }: FeishuGotoParams): string {
  const query = new URLSearchParams({
    client_id: appId,
    redirect_uri: redirectUri,
    response_type: 'code',
    state,
  })
  return `https://passport.feishu.cn/suite/passport/oauth/authorize?${query.toString()}`
}

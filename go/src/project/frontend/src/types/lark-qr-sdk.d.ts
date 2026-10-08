/**
 * 飞书网页扫码登录 SDK（LarkSSOSDKWebQRCode）全局类型声明
 * 文档：https://open.larkoffice.com/document/sso/web-application-sso/qr-sdk-documentation
 */

/** window.QRLogin 初始化入参 */
interface QRLoginOptions {
  /** 二维码挂载容器的元素 id */
  id: string
  /** 授权页地址（旧版登录流程 passport 授权地址） */
  goto: string
  /** 二维码区域宽度，二维码本体固定 250*250 */
  width?: string
  /** 二维码区域高度 */
  height?: string
  /** 二维码 HTML 标签的 style */
  style?: string
}

/** 二维码 iframe 通过 postMessage 回传的数据 */
interface QRLoginMessageData {
  tmp_code?: string
}

/** window.QRLogin 返回的实例方法 */
interface QRLoginInstance {
  /** 校验消息来源 origin 是否为飞书域名 */
  matchOrigin(origin: string): boolean
  /** 校验回传数据是否合法 */
  matchData(data: unknown): boolean
}

interface Window {
  /** 加载 LarkSSOSDKWebQRCode 脚本后挂载的全局构造函数 */
  QRLogin?: (options: QRLoginOptions) => QRLoginInstance
}

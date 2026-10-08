import FeishuQrCode from './FeishuQrCode'

export default function QrCodeLogin() {
  return (
    <div className="qr-login">
      <FeishuQrCode mode="login" size={260} />

      <p className="qr-status">请使用飞书 App 扫码登录</p>

      <p className="qr-tip">
        <span className="qr-feishu-badge">飞书</span>
        扫码后可快速登录，安全便捷
      </p>
    </div>
  )
}

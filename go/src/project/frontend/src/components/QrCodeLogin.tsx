import { useCallback, useEffect, useRef, useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import {
  createLoginQr,
  getQrStatus,
  type LoginResult,
  type QrStatus,
  type QrTicket,
} from '../api/auth'
import { IconRefresh } from './Icons'

interface Props {
  onSuccess: (data: LoginResult) => void
}

const STATUS_TEXT: Record<QrStatus, string> = {
  WAITING: '请使用飞书 App 扫码登录',
  SCANNED: '扫码成功，请在飞书中确认登录',
  CONFIRMED: '登录成功',
  EXPIRED: '二维码已失效',
}

export default function QrCodeLogin({ onSuccess }: Props) {
  const [ticket, setTicket] = useState<QrTicket | null>(null)
  const [status, setStatus] = useState<QrStatus>('WAITING')
  const [error, setError] = useState('')

  // 轮询回调里始终拿到最新的 onSuccess
  const onSuccessRef = useRef(onSuccess)
  onSuccessRef.current = onSuccess

  const initQr = useCallback(async () => {
    setError('')
    setStatus('WAITING')
    setTicket(null)
    try {
      setTicket(await createLoginQr())
    } catch (err) {
      setError(err instanceof Error ? err.message : '二维码获取失败')
    }
  }, [])

  // 初始化 / 手动刷新
  useEffect(() => {
    void initQr()
  }, [initQr])

  // 轮询扫码状态（CONFIRMED / EXPIRED 后停止）
  useEffect(() => {
    if (!ticket || status === 'CONFIRMED' || status === 'EXPIRED') return

    const timer = window.setInterval(() => {
      void getQrStatus(ticket.ticket)
        .then((res) => {
          setStatus(res.status)
          if (res.status === 'CONFIRMED' && res.token && res.userName) {
            onSuccessRef.current({ token: res.token, userName: res.userName })
          }
        })
        .catch(() => {
          // 忽略轮询中的瞬时网络错误，下次轮询继续
        })
    }, 1500)

    return () => window.clearInterval(timer)
  }, [ticket, status])

  return (
    <div className="qr-login">
      <div className={`qr-box qr-box--${status.toLowerCase()}`}>
        {ticket ? (
          <QRCodeSVG value={ticket.url} size={188} level="M" includeMargin={false} />
        ) : (
          <div className="qr-loading">二维码生成中…</div>
        )}

        {status === 'EXPIRED' && (
          <button type="button" className="qr-mask" onClick={() => void initQr()}>
            <IconRefresh width={26} height={26} />
            <span>点击刷新二维码</span>
          </button>
        )}
      </div>

      <p className={`qr-status qr-status--${status.toLowerCase()}`}>{STATUS_TEXT[status]}</p>
      {error && <p className="form-error">{error}</p>}

      <p className="qr-tip">
        <span className="qr-feishu-badge">飞书</span>
        扫码后可快速登录，安全便捷
      </p>
    </div>
  )
}

import { useEffect, useId, useMemo, useState, type CSSProperties } from 'react'

import { IconRefresh } from './Icons'

import { OAUTH_STATE_KEY, buildFeishuGoto, loadLarkQrSdk } from '../utils/larkQrSdk'

/** 授权用途：登录 / 绑定 */
export type FeishuAuthMode = 'login' | 'bind'

/** 绑定流程的 state 前缀，回调据此区分登录与绑定 */
const BIND_STATE_PREFIX = 'bind_'

function randomState(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `${Date.now()}_${Math.random().toString(36).slice(2)}`
}

/** 判断回调 state 是否为绑定流程 */
export function isBindState(state: string): boolean {
  return state.startsWith(BIND_STATE_PREFIX)
}

interface FeishuQrCodeProps {
  mode: FeishuAuthMode
  /** 二维码显示边长（px） */
  size?: number
}

/**
 * 可复用的飞书网页扫码二维码。
 * 挂载官方 QR SDK（iframe），扫码确认后整页跳转 OAuth 授权，飞书 302 回 redirect_uri 携带 code/state。
 * state 用 useState 初始化器稳定取值、写 sessionStorage 放 effect，避免 StrictMode 双调用导致 state 不一致。
 */
export default function FeishuQrCode({ mode, size = 220 }: FeishuQrCodeProps) {
  const reactId = useId().replace(/:/g, '')
  const containerId = `lark-qr-${reactId}`

  const [state] = useState(() => (mode === 'bind' ? BIND_STATE_PREFIX + randomState() : randomState()))
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  // SDK 加载失败时点击重试
  const [retrySeq, setRetrySeq] = useState(0)

  const appId = String(import.meta.env.VITE_FEISHU_APP_ID ?? '').trim()
  const redirectUri = String(import.meta.env.VITE_FEISHU_REDIRECT_URI ?? '').trim()

  const goto = useMemo(() => {
    if (!appId || !redirectUri) return ''
    return buildFeishuGoto({ appId, redirectUri, state })
  }, [appId, redirectUri, state])

  // state 作为副作用写入，回调时读取校验（防 CSRF）
  useEffect(() => {
    sessionStorage.setItem(OAUTH_STATE_KEY, state)
  }, [state])

  useEffect(() => {
    if (!goto) {
      setLoading(false)
      setError('缺少飞书应用配置，请先设置 VITE_FEISHU_APP_ID 与 VITE_FEISHU_REDIRECT_URI')
      return
    }

    let disposed = false
    let instance: QRLoginInstance | null = null

    // 监听二维码 iframe 回传的 tmp_code
    const handleMessage = (event: MessageEvent) => {
      if (!instance) return
      if (instance.matchOrigin(event.origin) && instance.matchData(event.data)) {
        const tmpCode = (event.data as QRLoginMessageData).tmp_code
        if (tmpCode) {
          // 拼接 tmp_code 后整页跳转；飞书随后 302 回 redirect_uri 并携带 code、state
          window.location.href = `${goto}&tmp_code=${encodeURIComponent(tmpCode)}`
        }
      }
    }

    setLoading(true)
    setError('')

    void (async () => {
      try {
        await loadLarkQrSdk()
        if (disposed) return
        if (typeof window.QRLogin !== 'function') {
          throw new Error('飞书二维码 SDK 未正确初始化')
        }

        // 清空容器，避免开发态重复挂载产生多个 iframe
        const container = document.getElementById(containerId)
        if (container) container.innerHTML = ''

        instance = window.QRLogin({
          id: containerId,
          goto,
          width: String(size),
          height: String(size),
          style: `width:${size}px;height:${size}px;border:none;`,
        })
        window.addEventListener('message', handleMessage, false)

        if (!disposed) setLoading(false)
      } catch (err) {
        if (!disposed) {
          setError(err instanceof Error ? err.message : '二维码加载失败，请重试')
          setLoading(false)
        }
      }
    })()

    return () => {
      disposed = true
      window.removeEventListener('message', handleMessage)
    }
  }, [goto, size, containerId, retrySeq])

  return (
    <div
      className="qr-box qr-box--lark feishu-qr"
      style={{ '--qr-size': `${size}px` } as CSSProperties}
    >
      <div id={containerId} className="lark-qr-container" />

      {loading && <div className="qr-overlay">二维码加载中…</div>}
      {!loading && error && (
        <div className="qr-overlay">
          <p className="qr-overlay__msg">{error}</p>
          <button type="button" className="qr-retry" onClick={() => setRetrySeq((n) => n + 1)}>
            <IconRefresh width={16} height={16} />
            重新加载
          </button>
        </div>
      )}
    </div>
  )
}

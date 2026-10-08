import { useEffect, useState } from 'react'

import { isBindState } from './FeishuQrCode'
import Logo from './Logo'

import { OAUTH_STATE_KEY } from '../utils/larkQrSdk'
import { bindLark, getUserInfo, larkQrLogin } from '../api/auth'

type Phase = 'loading' | 'success' | 'error'

/**
 * 飞书扫码登录 OAuth 回调处理页。
 * 飞书确认授权后 302 回本页并携带 code、state：
 * 1. 校验 state 防 CSRF
 * 2. 打印 code
 * 3. 携带 code 调用 /v1/user/login/Lark/qrcode 换取本系统登录态
 * 4. 保存 token、拉取并保存用户信息，清理地址栏一次性参数
 */
interface LarkAuthCallbackProps {
  onLoggedIn?: () => void
}

export default function LarkAuthCallback({ onLoggedIn }: LarkAuthCallbackProps) {
  const [phase, setPhase] = useState<Phase>('loading')
  const [message, setMessage] = useState('正在处理，请稍候…')
  const redirectUri = String(import.meta.env.VITE_FEISHU_REDIRECT_URI ?? '').trim()

  useEffect(() => {
    let cancelled = false

    const finish = (nextPhase: Phase, text: string) => {
      if (cancelled) return
      setPhase(nextPhase)
      setMessage(text)
    }

    void (async () => {
      try {
        const params = new URLSearchParams(window.location.search)
        const code = params.get('code')
        const state = params.get('state')

        if (!code) {
          finish('error', '回调缺少 code 参数，登录未完成')
          return
        }
        // state 必须与发起扫码时暂存的值一致，否则立即终止
        const savedState = sessionStorage.getItem(OAUTH_STATE_KEY)
        if (!state || !savedState || state !== savedState) {
          sessionStorage.removeItem(OAUTH_STATE_KEY)
          finish('error', 'state 校验失败，为安全起见已终止登录')
          return
        }
        sessionStorage.removeItem(OAUTH_STATE_KEY)

        // 绑定流程：state 以 bind_ 开头，调用绑定接口而非换登录态
        if (isBindState(state)) {
          try {
            const bound = await bindLark({ appCode: 2000, code, redirectUrl: redirectUri })

            // 同步更新本地缓存用户信息中的 lark_open_id
            try {
              const raw = localStorage.getItem('mall_admin_user')
              const u = raw ? (JSON.parse(raw) as Record<string, unknown>) : {}
              u.lark_open_id = bound.larkOpenId
              localStorage.setItem('mall_admin_user', JSON.stringify(u))
            } catch {
              /* 本地信息更新失败不阻断绑定结果 */
            }

            // 清理地址栏一次性参数，避免刷新重复消费
            window.history.replaceState(null, '', window.location.pathname)
            finish('success', '飞书账号绑定成功')
            window.setTimeout(() => onLoggedIn?.(), 700)
          } catch (err) {
            finish('error', err instanceof Error ? err.message : '绑定失败，请重试')
          }
          return
        }

        // 打印飞书回调返回的 code
        console.log('飞书扫码登录 code:', code)

        // 携带 code 调后端换取登录态
        const login = await larkQrLogin({ AppCode: 2000, Code: code, RedirectUrl: redirectUri })
        localStorage.setItem('mall_admin_token', login.token)

        // 拉取并持久化完整用户信息；失败不阻断登录（已有 token）
        let displayName = login.userName
        try {
          const userInfo = await getUserInfo()
          localStorage.setItem('mall_admin_user', JSON.stringify(userInfo))
          displayName = userInfo.nick_name || userInfo.name || login.userName
        } catch {
          localStorage.setItem('mall_admin_user', JSON.stringify({ name: login.userName }))
        }

        // 清理地址栏中的一次性 code/state，避免刷新重复消费
        window.history.replaceState(null, '', window.location.pathname)

        finish('success', `登录成功，欢迎回来，${displayName}`)
        // 短暂展示成功状态后进入后台
        window.setTimeout(() => onLoggedIn?.(), 700)
      } catch (err) {
        finish('error', err instanceof Error ? err.message : '登录失败，请重试')
      }
    })()

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="login-page">
      <div className="login-card auth-callback">
        <Logo size={44} />

        <div className={`auth-callback__badge auth-callback__badge--${phase}`}>
          {phase === 'loading' && <span className="auth-callback__spinner" />}
          {phase === 'success' && (
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="m5 12 5 5L20 7" />
            </svg>
          )}
          {phase === 'error' && (
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          )}
        </div>

        <p className="auth-callback__message">{message}</p>

        {phase === 'error' && (
          <a className="auth-callback__back" href="/">
            返回登录页
          </a>
        )}
      </div>
    </div>
  )
}
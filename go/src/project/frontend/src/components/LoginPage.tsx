import { useEffect, useState } from 'react'

import CodeLogin from './CodeLogin'
import Logo from './Logo'
import PasswordLogin from './PasswordLogin'
import QrCodeLogin from './QrCodeLogin'

import { getUserInfo, type LoginResult } from '../api/auth'

type LoginType = 'password' | 'code' | 'qrcode'

const TABS: { key: LoginType; label: string }[] = [
  { key: 'password', label: '账户密码登录' },
  { key: 'code', label: '验证码登录' },
  { key: 'qrcode', label: '飞书扫码登录' },
]

interface Toast {
  type: 'success' | 'error' | 'info'
  text: string
}

interface LoginPageProps {
  onLoggedIn?: () => void
}

export default function LoginPage({ onLoggedIn }: LoginPageProps) {
  const [activeTab, setActiveTab] = useState<LoginType>('password')
  const [toast, setToast] = useState<Toast | null>(null)

  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(null), 2600)
    return () => clearTimeout(timer)
  }, [toast])

  /**
   * 登录成功：
   * 1. 保存 token，后续请求由 request 层自动在 header 携带
   * 2. 携带 token 调用 /v1/user/info 拉取用户信息并持久化
   * 内部兜底所有异常，保证不向上抛出。
   */
  const handleSuccess = async (data: LoginResult) => {
    localStorage.setItem('mall_admin_token', data.token)

    try {
      const userInfo = await getUserInfo()
      localStorage.setItem('mall_admin_user', JSON.stringify(userInfo))
      const displayName = userInfo.nick_name || userInfo.name || data.userName
      setToast({ type: 'success', text: `登录成功，欢迎回来，${displayName}` })
      // 短暂展示欢迎提示后进入后台
      window.setTimeout(() => onLoggedIn?.(), 600)
    } catch (err) {
      localStorage.removeItem('mall_admin_user')
      setToast({
        type: 'error',
        text: err instanceof Error ? err.message : '用户信息获取失败',
      })
    }
  }

  return (
    <div className="login-page">
      {toast && <div className={`toast toast--${toast.type}`}>{toast.text}</div>}

      <div className="login-card">
        <header className="login-header">
          <Logo size={48} />
          <h1 className="login-title">管理后台</h1>
          <p className="login-subtitle">gogo出品，只出精品</p>
        </header>

        <nav className="login-tabs">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              className={`login-tab ${activeTab === tab.key ? 'login-tab--active' : ''}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        <main className="login-panel">
          {activeTab === 'password' && <PasswordLogin onSuccess={handleSuccess} />}
          {activeTab === 'code' && <CodeLogin onSuccess={handleSuccess} />}
          {activeTab === 'qrcode' && <QrCodeLogin />}
        </main>
      </div>

      <footer className="login-footer">
        <span>Copyright©2024-2025 gogo后台有限公司 All Rights Reserved</span>
        <a href="https://beian.miit.gov.cn/" target="_blank" rel="noreferrer">
          冀ICP备12233444号
        </a>
      </footer>
    </div>
  )
}
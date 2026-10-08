import { useEffect, useState } from 'react'
import Logo from './Logo'
import PasswordLogin from './PasswordLogin'
import CodeLogin from './CodeLogin'
import QrCodeLogin from './QrCodeLogin'
import type { LoginResult } from '../api/auth'

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

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState<LoginType>('password')
  const [toast, setToast] = useState<Toast | null>(null)

  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(null), 2600)
    return () => clearTimeout(timer)
  }, [toast])

  const handleSuccess = (data: LoginResult) => {
    localStorage.setItem('mall_admin_token', data.token)
    localStorage.setItem('mall_admin_user', data.userName)
    setToast({ type: 'success', text: `登录成功，欢迎回来，${data.userName}` })
    // TODO: 登录成功后的跳转，例如 location.href = '/admin'
  }

  return (
    <div className="login-page">
      {toast && <div className={`toast toast--${toast.type}`}>{toast.text}</div>}

      <div className="login-card">
        <header className="login-header">
          <Logo size={48} />
          <h1 className="login-title">大秦科技管理后台</h1>
          <p className="login-subtitle">大秦出品，只出精品</p>
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
          {activeTab === 'qrcode' && <QrCodeLogin onSuccess={handleSuccess} />}
        </main>
      </div>

      <footer className="login-footer">
        <span>Copyright©2024-2025 大秦科技有限公司 All Rights Reserved</span>
        <a href="https://beian.miit.gov.cn/" target="_blank" rel="noreferrer">
          湘ICP备12233444号
        </a>
      </footer>
    </div>
  )
}

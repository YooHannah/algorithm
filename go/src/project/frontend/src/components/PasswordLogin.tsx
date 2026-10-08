import { useState, type FormEvent } from 'react'

import { IconPhone, IconLock, IconEye, IconEyeOff } from './Icons'
import SliderCaptchaModal from './SliderCaptchaModal'
import ResetPasswordModal from './ResetPasswordModal'

import { loginByPassword, type LoginResult } from '../api/auth'

interface Props {
  onSuccess: (data: LoginResult) => void
}

const PHONE_REGEX = /^1[3-9]\d{9}$/

export default function PasswordLogin({ onSuccess }: Props) {
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [captchaVisible, setCaptchaVisible] = useState(false)
  // 忘记密码弹窗
  const [resetPwdVisible, setResetPwdVisible] = useState(false)

  // 点击登录：先做前端校验，通过后弹出滑块验证码
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    setError('')

    if (!PHONE_REGEX.test(phone)) {
      setError('请输入正确的手机号')
      return
    }
    if (password.length < 6) {
      setError('密码至少 6 位')
      return
    }
    setCaptchaVisible(true)
  }

  // 滑块校验通过：携带 ticket 调用 /verify/mobile/password 登录
  const handleCaptchaVerified = async (ticket: string) => {
    setCaptchaVisible(false)
    setLoading(true)
    try {
      onSuccess(await loginByPassword(phone, password, ticket))
    } catch (err) {
      console.error(err)
      setError(err instanceof Error ? err.message : '登录失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <form className="login-form" onSubmit={handleSubmit} noValidate>
        <div className="field">
          <span className="field__icon">
            <IconPhone />
          </span>
          <input
            className="field__input"
            type="tel"
            maxLength={11}
            placeholder="请输入手机号"
            autoComplete="username"
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
          />
        </div>

        <div className="field">
          <span className="field__icon">
            <IconLock />
          </span>
          <input
            className="field__input"
            type={showPwd ? 'text' : 'password'}
            placeholder="请输入密码"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="button"
            className="field__suffix field__btn"
            aria-label={showPwd ? '隐藏密码' : '显示密码'}
            onClick={() => setShowPwd((v) => !v)}
          >
            {showPwd ? <IconEyeOff /> : <IconEye />}
          </button>
        </div>

        <div className="login-form__row">
          <button
            type="button"
            className="login-form__forget"
            onClick={() => setResetPwdVisible(true)}
          >
            忘记密码？
          </button>
        </div>

        {error && <p className="form-error">{error}</p>}

        <button className="submit-btn" type="submit" disabled={loading}>
          {loading ? '登录中…' : '登 录'}
        </button>
      </form>

      {captchaVisible && (
        <SliderCaptchaModal
          onClose={() => setCaptchaVisible(false)}
          onVerified={handleCaptchaVerified}
        />
      )}

      {resetPwdVisible && (
        <ResetPasswordModal
          mobile=""
          onClose={() => setResetPwdVisible(false)}
          onSuccess={() => setError('密码已重置，请使用新密码登录')}
        />
      )}
    </>
  )
}
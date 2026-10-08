import { useEffect, useState, type FormEvent } from 'react'

import { IconPhone, IconShield } from './Icons'
import SliderCaptchaModal from './SliderCaptchaModal'

import { loginByCode, sendSmsCode, type LoginResult } from '../api/auth'

interface Props {
  onSuccess: (data: LoginResult) => void
}

const PHONE_REGEX = /^1[3-9]\d{9}$/
const CODE_REGEX = /^\d{6}$/

export default function CodeLogin({ onSuccess }: Props) {
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [countdown, setCountdown] = useState(0)
  const [error, setError] = useState('')
  const [hint, setHint] = useState('')
  const [sending, setSending] = useState(false)
  const [loading, setLoading] = useState(false)
  const [captchaVisible, setCaptchaVisible] = useState(false)

  // 倒计时
  useEffect(() => {
    if (countdown <= 0) return
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000)
    return () => clearTimeout(timer)
  }, [countdown])

  // 点击获取验证码：先校验手机号，再弹出滑块验证码
  const handleGetCode = () => {
    setError('')
    setHint('')
    if (!PHONE_REGEX.test(phone)) {
      setError('请输入正确的手机号')
      return
    }
    setCaptchaVisible(true)
  }

  // 滑块校验通过：关闭弹窗，携带 ticket 发送短信验证码
  const handleCaptchaVerified = async (ticket: string) => {
    setCaptchaVisible(false)
    setSending(true)
    try {
      const res = await sendSmsCode(phone, ticket)
      setCountdown(60)
      setHint(
        res.debugCode ? `验证码已发送（演示码：${res.debugCode}）` : '验证码已发送，请注意查收',
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : '验证码发送失败')
    } finally {
      setSending(false)
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')

    if (!PHONE_REGEX.test(phone)) {
      setError('请输入正确的手机号')
      return
    }
    if (!CODE_REGEX.test(code)) {
      setError('请输入 6 位数字验证码')
      return
    }

    setLoading(true)
    try {
      onSuccess(await loginByCode(phone, code))
    } catch (err) {
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
          autoComplete="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
        />
      </div>

      <div className="field field--with-action">
        <div className="field__main">
          <span className="field__icon">
            <IconShield />
          </span>
          <input
            className="field__input"
            type="text"
            inputMode="numeric"
            maxLength={6}
            placeholder="请输入验证码"
            autoComplete="one-time-code"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
          />
        </div>
        <button
          type="button"
          className="code-btn"
          disabled={countdown > 0 || sending}
          onClick={handleGetCode}
        >
          {sending ? '发送中…' : countdown > 0 ? `${countdown}s 后重发` : '获取验证码'}
        </button>
      </div>

      {error && <p className="form-error">{error}</p>}
      {!error && hint && <p className="form-hint">{hint}</p>}

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
    </>
  )
}
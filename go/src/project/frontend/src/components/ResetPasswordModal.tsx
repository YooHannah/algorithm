import { useEffect, useRef, useState, type FormEvent } from 'react'

import { IconClose } from './Icons'
import SliderCaptchaModal from './SliderCaptchaModal'

import { sendSmsCode, updatePassword } from '../api/auth'

interface ResetPasswordModalProps {
  /** 当前登录用户手机号（预填且不可改为他人） */
  mobile: string
  onClose: () => void
  onSuccess?: () => void
}

/** 中国大陆手机号校验 */
const MOBILE_RE = /^1[3-9]\d{9}$/

/**
 * 重置密码弹窗：通过短信验证码校验身份后设置新密码。
 * 手机号预填为当前账号手机号，校验通过才允许发送验证码。
 */
export default function ResetPasswordModal({ mobile, onClose, onSuccess }: ResetPasswordModalProps) {
  const [phone, setPhone] = useState(mobile)
  const [code, setCode] = useState('')
  const [newPwd, setNewPwd] = useState('')
  const [confirmPwd, setConfirmPwd] = useState('')

  const [phoneError, setPhoneError] = useState('')
  const [hint, setHint] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // 验证码倒计时
  const [countdown, setCountdown] = useState(0)
  const timerRef = useRef<number | null>(null)
  // 发送验证码前的滑块校验
  const [captchaVisible, setCaptchaVisible] = useState(false)

  // Esc 关闭
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  // 卸载时清理倒计时
  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current)
    }
  }, [])

  const startCountdown = () => {
    setCountdown(60)
    timerRef.current = window.setInterval(() => {
      setCountdown((n) => {
        if (n <= 1) {
          if (timerRef.current) window.clearInterval(timerRef.current)
          return 0
        }
        return n - 1
      })
    }, 1000)
  }

  // 手机号格式校验（失焦或输入时实时提示）
  const validatePhone = (value: string): boolean => {
    if (!value) {
      setPhoneError('请输入手机号')
      return false
    }
    if (!MOBILE_RE.test(value)) {
      setPhoneError('手机号格式错误')
      return false
    }
    setPhoneError('')
    return true
  }

  // 点击获取验证码：先校验手机号，再弹出滑块
  const handleSendCode = () => {
    if (countdown > 0) return
    if (!validatePhone(phone)) return
    setHint('')
    setCaptchaVisible(true)
  }

  // 滑块校验通过：携带 ticket 调用发送短信验证码接口
  const handleCaptchaVerified = async (ticket: string) => {
    setCaptchaVisible(false)
    try {
      await sendSmsCode(phone, ticket, 'change_password')
      startCountdown()
      setHint('验证码已发送，请注意查收')
    } catch (err) {
      setHint(err instanceof Error ? err.message : '验证码发送失败，请重试')
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setHint('')
    if (!validatePhone(phone)) return
    if (!code) {
      setHint('请输入验证码')
      return
    }
    if (!newPwd || !confirmPwd) {
      setHint('请输入新密码和确认密码')
      return
    }
    if (newPwd !== confirmPwd) {
      setHint('两次输入的新密码不一致')
      return
    }
    setSubmitting(true)
    try {
      await updatePassword({
        mobile: phone,
        code,
        newPassword: newPwd,
        confirmPassword: confirmPwd,
      })
      setHint('密码重置成功')
      window.setTimeout(() => {
        onSuccess?.()
        onClose()
      }, 700)
    } catch (err) {
      setHint(err instanceof Error ? err.message : '重置失败，请重试')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="modal-mask" onClick={onClose}>
      <div
        className="reset-pwd-modal"
        role="dialog"
        aria-modal="true"
        aria-label="重置密码"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="reset-pwd-modal__header">
          <h3 className="reset-pwd-modal__title">重置密码</h3>
          <button type="button" className="reset-pwd-modal__close" title="关闭" onClick={onClose}>
            <IconClose width={18} height={18} />
          </button>
        </header>

        <form className="reset-pwd-form" onSubmit={handleSubmit}>
          <div className="reset-pwd-form__item">
            <label className="reset-pwd-form__label">
              <span className="reset-pwd-form__required">*</span>手机号
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value)
                if (phoneError) validatePhone(e.target.value)
              }}
              onBlur={(e) => validatePhone(e.target.value)}
              placeholder="请输入手机号"
              className={phoneError ? 'reset-pwd-form__input reset-pwd-form__input--error' : 'reset-pwd-form__input'}
              maxLength={11}
            />
            {phoneError && <div className="reset-pwd-form__error">{phoneError}</div>}
          </div>

          <div className="reset-pwd-form__item">
            <label className="reset-pwd-form__label">
              <span className="reset-pwd-form__required">*</span>验证码
            </label>
            <div className="reset-pwd-form__code">
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="请输入"
                className="reset-pwd-form__input"
                maxLength={6}
              />
              <button
                type="button"
                className="reset-pwd-form__code-btn"
                onClick={handleSendCode}
                disabled={countdown > 0}
              >
                {countdown > 0 ? `${countdown}s 后重发` : '获取验证码'}
              </button>
            </div>
          </div>

          <div className="reset-pwd-form__item">
            <label className="reset-pwd-form__label">
              <span className="reset-pwd-form__required">*</span>新密码
            </label>
            <input
              type="password"
              value={newPwd}
              onChange={(e) => setNewPwd(e.target.value)}
              placeholder="请输入"
              className="reset-pwd-form__input"
              autoComplete="new-password"
            />
          </div>

          <div className="reset-pwd-form__item">
            <label className="reset-pwd-form__label">
              <span className="reset-pwd-form__required">*</span>确认新密码
            </label>
            <input
              type="password"
              value={confirmPwd}
              onChange={(e) => setConfirmPwd(e.target.value)}
              placeholder="请输入"
              className="reset-pwd-form__input"
              autoComplete="new-password"
            />
          </div>

          {hint && <div className="reset-pwd-form__hint">{hint}</div>}

          <footer className="reset-pwd-form__footer">
            <button type="button" className="reset-pwd-form__btn reset-pwd-form__btn--plain" onClick={onClose}>
              取消
            </button>
            <button
              type="submit"
              className="reset-pwd-form__btn reset-pwd-form__btn--primary"
              disabled={submitting}
            >
              {submitting ? '提交中…' : '保存'}
            </button>
          </footer>
        </form>
      </div>

      {captchaVisible && (
        <SliderCaptchaModal
          onClose={() => setCaptchaVisible(false)}
          onVerified={handleCaptchaVerified}
        />
      )}
    </div>
  )
}
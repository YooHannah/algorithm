import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'

import { IconClose } from './Icons'

import {
  createAdminUser,
  getRoleList,
  Sex,
  updateAdminUser,
  type AdminUser,
  type CreateUserReq,
  type Role,
} from '../api/adminUser'

interface CreateAdminModalProps {
  user?: AdminUser | null
  onClose: () => void
  onSuccess?: () => void
}

const MOBILE_RE = /^1[3-9]\d{9}$/

const defaultForm = (): CreateUserReq => ({
  name: '',
  nick_name: '',
  mobile: '',
  sex: Sex.Male,
  role_ids: [],
})

export default function CreateAdminModal({ user, onClose, onSuccess }: CreateAdminModalProps) {
  const isEdit = !!user
  const [form, setForm] = useState<CreateUserReq>(() =>
    user
      ? {
          name: user.name,
          nick_name: user.nick_name,
          mobile: user.mobile,
          sex: user.sex,
          role_ids: user.role_ids.map((r) => r.id),
        }
      : defaultForm(),
  )
  const [roles, setRoles] = useState<Role[]>([])
  const [roleOpen, setRoleOpen] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  const roleRef = useRef<HTMLDivElement>(null)

  // 加载角色列表
  useEffect(() => {
    void getRoleList().then(v=> 
    {
      console.log(v)
      setRoles(v)
    }
    )
  }, [])

  // Esc 关闭
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  // 点击外部关闭角色下拉
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (roleRef.current && !roleRef.current.contains(e.target as Node)) {
        setRoleOpen(false)
      }
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  const selectedRoleNames = useMemo(
    () => roles.filter((r) => form.role_ids.includes(r.id)).map((r) => r.name),
    [roles, form.role_ids],
  )

  const toggleRole = (id: number) => {
    setForm((f) => ({
      ...f,
      role_ids: f.role_ids.includes(id)
        ? f.role_ids.filter((x) => x !== id)
        : [...f.role_ids, id],
    }))
  }

  const validate = (): boolean => {
    const e: Record<string, string> = {}
    if (!form.name.trim()) e.name = '请输入姓名'
    if (!MOBILE_RE.test(form.mobile)) e.mobile = '请输入正确的手机号'
    if (form.role_ids.length === 0) e.role = '请选择角色'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleReset = () => {
    if (user) {
      setForm({
        name: user.name,
        nick_name: user.nick_name,
        mobile: user.mobile,
        sex: user.sex,
        role_ids: user.role_ids.map((r) => r.id),
      })
    } else {
      setForm(defaultForm())
    }
    setErrors({})
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setSubmitting(true)
    try {
      if (isEdit && user) {
        await updateAdminUser({
          id: user.user_id,
          name: form.name.trim(),
          nick_name: form.nick_name.trim(),
          sex: form.sex,
          role_ids: form.role_ids,
        })
      } else {
        await createAdminUser(form)
      }
      window.setTimeout(() => {
        onSuccess?.()
        onClose()
      }, 500)
    } catch (err) {
      setErrors({ submit: err instanceof Error ? err.message : '保存失败，请重试' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="modal-mask" onClick={onClose}>
      <div
        className="create-admin-modal"
        role="dialog"
        aria-modal="true"
        aria-label="新增管理员"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="create-admin-modal__header">
          <h3 className="create-admin-modal__title">{isEdit ? '编辑管理员' : '新增管理员'}</h3>
          <button type="button" className="create-admin-modal__close" title="关闭" onClick={onClose}>
            <IconClose width={18} height={18} />
          </button>
        </header>

        <form className="create-admin-form" onSubmit={handleSubmit}>
          <div className="create-admin-form__item">
            <label className="create-admin-form__label">
              <span className="create-admin-form__required">*</span>姓名
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="请输入"
              className={errors.name ? 'create-admin-form__input create-admin-form__input--error' : 'create-admin-form__input'}
            />
            {errors.name && <div className="create-admin-form__error">{errors.name}</div>}
          </div>

          <div className="create-admin-form__item">
            <label className="create-admin-form__label">昵称</label>
            <input
              type="text"
              value={form.nick_name}
              onChange={(e) => setForm({ ...form, nick_name: e.target.value })}
              placeholder="请输入"
              className="create-admin-form__input"
            />
          </div>

          <div className="create-admin-form__item">
            <label className="create-admin-form__label">性别</label>
            <div className="create-admin-form__radio">
              {[
                { v: Sex.Male, label: '男' },
                { v: Sex.Female, label: '女' },
                { v: Sex.Unknown, label: '未知' },
              ].map((opt) => (
                <label key={opt.v} className="radio-item">
                  <input
                    type="radio"
                    name="sex"
                    checked={form.sex === opt.v}
                    onChange={() => setForm({ ...form, sex: opt.v })}
                  />
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="create-admin-form__item">
            <label className="create-admin-form__label">
              <span className="create-admin-form__required">*</span>手机号
            </label>
            <input
              type="tel"
              maxLength={11}
              value={form.mobile}
              onChange={(e) => setForm({ ...form, mobile: e.target.value.replace(/\D/g, '') })}
              placeholder="请输入"
              readOnly={isEdit}
              className={
                errors.mobile
                  ? 'create-admin-form__input create-admin-form__input--error'
                  : isEdit
                    ? 'create-admin-form__input create-admin-form__input--readonly'
                    : 'create-admin-form__input'
              }
            />
            {errors.mobile && <div className="create-admin-form__error">{errors.mobile}</div>}
          </div>

          <div className="create-admin-form__item" ref={roleRef}>
            <label className="create-admin-form__label">
              <span className="create-admin-form__required">*</span>角色选择
            </label>
            <div
              className={
                errors.role
                  ? 'role-select role-select--error'
                  : 'role-select'
              }
              onClick={() => {
                setRoleOpen((v) => !v)
              }}
            >
              <span className="role-select__value">
                {selectedRoleNames.length > 0 ? selectedRoleNames.join('、') : '请选择'}
              </span>
              <span className="role-select__arrow">▾</span>
              {roleOpen && (
                <div className="role-select__dropdown" onClick={(e) => e.stopPropagation()}>
                  <div className="role-select__options">
                    {roles.length === 0 ? (
                      <div className="role-select__empty">暂无角色</div>
                    ) : (
                      roles.map((r) => (
                        <label key={r.id} className="role-option">
                          <input
                            type="checkbox"
                            checked={form.role_ids.includes(r.id)}
                            onChange={() => toggleRole(r.id)}
                          />
                          <span>{r.name}</span>
                        </label>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
            {errors.role && <div className="create-admin-form__error">{errors.role}</div>}
          </div>

          {errors.submit && <div className="create-admin-form__hint create-admin-form__hint--error">{errors.submit}</div>}

          <footer className="create-admin-form__footer">
            <button type="button" className="create-admin-form__btn create-admin-form__btn--plain" onClick={onClose}>
              取消
            </button>
            <button type="button" className="create-admin-form__btn create-admin-form__btn--plain" onClick={handleReset}>
              重置
            </button>
            <button type="submit" className="create-admin-form__btn create-admin-form__btn--primary" disabled={submitting}>
              {submitting ? '保存中…' : '保存'}
            </button>
          </footer>
        </form>
      </div>
    </div>
  )
}
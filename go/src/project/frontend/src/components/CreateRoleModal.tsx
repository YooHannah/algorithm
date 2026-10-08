import { useEffect, useState, type FormEvent } from 'react'

import { IconClose } from './Icons'

import { createRole, RoleStatus, updateRole, type SaveRoleReq } from '../api/role'

interface CreateRoleModalProps {
  /** 编辑时传入角色，新增时不传 */
  role?: { id: number; name: string; desc: string; status: number } | null
  onClose: () => void
  onSuccess?: () => void
}

export default function CreateRoleModal({ role, onClose, onSuccess }: CreateRoleModalProps) {
  const isEdit = !!role
  const [form, setForm] = useState<SaveRoleReq>({
    name: role?.name ?? '',
    desc: role?.desc ?? '',
    status: role?.status ?? RoleStatus.Enable,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  // Esc 关闭
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const validate = (): boolean => {
    const e: Record<string, string> = {}
    if (!form.name.trim()) e.name = '请输入角色名称'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleReset = () => {
    setForm({ name: role?.name ?? '', desc: role?.desc ?? '', status: role?.status ?? RoleStatus.Enable })
    setErrors({})
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setSubmitting(true)
    try {
      if (isEdit && role) {
        await updateRole({ ...form, id: role.id })
      } else {
        await createRole(form)
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
        className="create-role-modal"
        role="dialog"
        aria-modal="true"
        aria-label={isEdit ? '编辑角色' : '新增角色'}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="create-role-modal__header">
          <h3 className="create-role-modal__title">{isEdit ? '编辑角色' : '新增角色'}</h3>
          <button type="button" className="create-role-modal__close" title="关闭" onClick={onClose}>
            <IconClose width={18} height={18} />
          </button>
        </header>

        <form className="create-role-form" onSubmit={handleSubmit}>
          <div className="create-role-form__item">
            <label className="create-role-form__label">
              <span className="create-role-form__required">*</span>角色名称
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="请输入"
              className={errors.name ? 'create-role-form__input create-role-form__input--error' : 'create-role-form__input'}
            />
            {errors.name && <div className="create-role-form__error">{errors.name}</div>}
          </div>

          <div className="create-role-form__item">
            <label className="create-role-form__label">角色描述</label>
            <textarea
              value={form.desc}
              onChange={(e) => setForm({ ...form, desc: e.target.value })}
              placeholder="请输入"
              rows={3}
              className="create-role-form__textarea"
            />
          </div>

          <div className="create-role-form__item">
            <label className="create-role-form__label">状态</label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: Number(e.target.value) })}
              className="create-role-form__input"
            >
              <option value={RoleStatus.Enable}>启用</option>
              <option value={RoleStatus.Disable}>禁用</option>
            </select>
          </div>

          {errors.submit && <div className="create-role-form__hint create-role-form__hint--error">{errors.submit}</div>}

          <footer className="create-role-form__footer">
            <button type="button" className="create-role-form__btn create-role-form__btn--plain" onClick={onClose}>
              取消
            </button>
            <button type="button" className="create-role-form__btn create-role-form__btn--plain" onClick={handleReset}>
              重置
            </button>
            <button type="submit" className="create-role-form__btn create-role-form__btn--primary" disabled={submitting}>
              {submitting ? '保存中…' : '保存'}
            </button>
          </footer>
        </form>
      </div>
    </div>
  )
}

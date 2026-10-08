import { useEffect, useState, type FormEvent } from 'react'

import { IconClose } from './Icons'

import {
  createPerm,
  PermType,
  updatePerm,
  type SavePermissionReq,
} from '../api/permission'

export interface PermissionFormValues extends SavePermissionReq {
  id?: number
}

interface CreatePermissionModalProps {
  /** 编辑时传入节点；新增时不传 */
  perm?: PermissionFormValues | null
  /** 新增时的默认父级 ID（点「新增」子菜单时传入当前节点 id） */
  defaultParentId?: number
  onClose: () => void
  onSuccess?: () => void
}

export default function CreatePermissionModal({
  perm,
  defaultParentId = 0,
  onClose,
  onSuccess,
}: CreatePermissionModalProps) {
  const isEdit = !!perm
  const [form, setForm] = useState<PermissionFormValues>({
    id: perm?.id,
    name: perm?.name ?? '',
    code: perm?.code ?? '',
    type: perm?.type ?? PermType.Menu,
    page_path: perm?.page_path ?? '',
    parent_id: perm?.parent_id ?? defaultParentId,
    sort: perm?.sort ?? 1,
    desc: perm?.desc ?? '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const validate = (): boolean => {
    const e: Record<string, string> = {}
    if (!form.name.trim()) e.name = '请输入菜单名称'
    if (!form.code.trim()) e.code = '请输入权限标识'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleReset = () => {
    setForm({
      id: perm?.id,
      name: perm?.name ?? '',
      code: perm?.code ?? '',
      type: perm?.type ?? PermType.Menu,
      page_path: perm?.page_path ?? '',
      parent_id: perm?.parent_id ?? defaultParentId,
      sort: perm?.sort ?? 1,
      desc: perm?.desc ?? '',
    })
    setErrors({})
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setSubmitting(true)
    try {
      const payload: SavePermissionReq = {
        name: form.name.trim(),
        code: form.code.trim(),
        type: form.type,
        page_path: form.page_path,
        parent_id: form.parent_id,
        sort: form.sort,
        desc: form.desc,
      }
      if (isEdit && perm && perm.id != null) {
        await updatePerm([{ ...payload, id: perm.id }])
      } else {
        await createPerm(payload)
      }
      window.setTimeout(() => {
        onSuccess?.()
        onClose()
      }, 300)
    } catch (err) {
      setErrors({ submit: err instanceof Error ? err.message : '保存失败，请重试' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="modal-mask" onClick={onClose}>
      <div
        className="create-perm-modal"
        role="dialog"
        aria-modal="true"
        aria-label={isEdit ? '编辑菜单' : '新增菜单'}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="create-perm-modal__header">
          <h3 className="create-perm-modal__title">{isEdit ? '编辑菜单' : '新增菜单'}</h3>
          <button type="button" className="create-perm-modal__close" title="关闭" onClick={onClose}>
            <IconClose width={18} height={18} />
          </button>
        </header>

        <form className="create-perm-form" onSubmit={handleSubmit}>
          <div className="create-perm-form__row">
            <div className="create-perm-form__item">
              <label className="create-perm-form__label">
                <span className="create-perm-form__required">*</span>菜单名称
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="请输入"
                className={errors.name ? 'create-perm-form__input create-perm-form__input--error' : 'create-perm-form__input'}
              />
              {errors.name && <div className="create-perm-form__error">{errors.name}</div>}
            </div>

            <div className="create-perm-form__item">
              <label className="create-perm-form__label">
                <span className="create-perm-form__required">*</span>权限标识
              </label>
              <input
                type="text"
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value })}
                placeholder="请输入"
                className={errors.code ? 'create-perm-form__input create-perm-form__input--error' : 'create-perm-form__input'}
              />
              {errors.code && <div className="create-perm-form__error">{errors.code}</div>}
            </div>
          </div>

          <div className="create-perm-form__row">
            <div className="create-perm-form__item">
              <label className="create-perm-form__label">类型</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: Number(e.target.value) })}
                className="create-perm-form__input"
              >
                <option value={PermType.Menu}>菜单</option>
                <option value={PermType.Action}>操作</option>
              </select>
            </div>

            <div className="create-perm-form__item">
              <label className="create-perm-form__label">菜单路径</label>
              <input
                type="text"
                value={form.page_path}
                onChange={(e) => setForm({ ...form, page_path: e.target.value })}
                placeholder="请输入，如 /system/xxx"
                className="create-perm-form__input"
              />
            </div>
          </div>

          <div className="create-perm-form__row">
            <div className="create-perm-form__item">
              <label className="create-perm-form__label">父级ID</label>
              <input
                type="number"
                value={form.parent_id}
                onChange={(e) => setForm({ ...form, parent_id: Number(e.target.value) })}
                placeholder="顶级为 0"
                className="create-perm-form__input"
              />
            </div>

            <div className="create-perm-form__item">
              <label className="create-perm-form__label">排序</label>
              <input
                type="number"
                value={form.sort}
                onChange={(e) => setForm({ ...form, sort: Number(e.target.value) })}
                placeholder="数值越小越靠前"
                className="create-perm-form__input"
              />
            </div>
          </div>

          <div className="create-perm-form__item">
            <label className="create-perm-form__label">描述</label>
            <textarea
              value={form.desc}
              onChange={(e) => setForm({ ...form, desc: e.target.value })}
              placeholder="请输入"
              rows={3}
              className="create-perm-form__textarea"
            />
          </div>

          {errors.submit && <div className="create-perm-form__hint create-perm-form__hint--error">{errors.submit}</div>}

          <footer className="create-perm-form__footer">
            <button type="button" className="create-perm-form__btn create-perm-form__btn--plain" onClick={onClose}>
              取消
            </button>
            <button type="button" className="create-perm-form__btn create-perm-form__btn--plain" onClick={handleReset}>
              重置
            </button>
            <button type="submit" className="create-perm-form__btn create-perm-form__btn--primary" disabled={submitting}>
              {submitting ? '保存中…' : '保存'}
            </button>
          </footer>
        </form>
      </div>
    </div>
  )
}

import { useEffect, useMemo, useState } from 'react'

import { IconClose } from './Icons'

import type { PermissionTree } from '../api/permission'
import {
  getPermTree,
  getRolePermSets,
  setRolePermSets,
} from '../api/role'

interface PermissionConfigModalProps {
  role: { id: number; name: string; desc: string }
  onClose: () => void
  onSuccess?: () => void
}

/** 递归收集树中所有节点 ID */
function collectIds(nodes: PermissionTree[]): number[] {
  return nodes.flatMap((n) => [n.id, ...(n.children ? collectIds(n.children) : [])])
}

export default function PermissionConfigModal({ role, onClose, onSuccess }: PermissionConfigModalProps) {
  const [tree, setTree] = useState<PermissionTree[]>([])
  const [checked, setChecked] = useState<Set<number>>(new Set())
  const [desc, setDesc] = useState(role.desc)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [hint, setHint] = useState('')

  // 初始加载：权限树 + 角色已分配权限
  useEffect(() => {
    let alive = true
    setLoading(true)
    Promise.all([getPermTree(), getRolePermSets(role.id)])
      .then(([permTree, sets]) => {
        if (!alive) return
        setTree(permTree)
        setChecked(new Set(sets.perm_ids))
      })
      .catch(() => setHint('权限数据加载失败'))
      .finally(() => alive && setLoading(false))
    return () => {
      alive = false
    }
  }, [role.id])

  // Esc 关闭
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  /** 切换某个节点的勾选状态，同时联动子节点 */
  const toggleNode = (node: PermissionTree) => {
    setChecked((prev) => {
      const next = new Set(prev)
      const childIds = node.children ? collectIds(node.children) : []
      const allSelfAndChild = [node.id, ...childIds]
      const allChecked = allSelfAndChild.every((id) => next.has(id))
      if (allChecked) {
        allSelfAndChild.forEach((id) => next.delete(id))
      } else {
        allSelfAndChild.forEach((id) => next.add(id))
      }
      return next
    })
  }

  /** 节点是否全选（用于 checkbox 状态） */
  const isNodeChecked = (node: PermissionTree): boolean => {
    const childIds = node.children ? collectIds(node.children) : []
    return [node.id, ...childIds].every((id) => checked.has(id))
  }

  /** 节点是否半选（部分子节点选中） */
  const isNodeIndeterminate = (node: PermissionTree): boolean => {
    if (!node.children?.length) return false
    const childIds = collectIds(node.children)
    const checkedCount = childIds.filter((id) => checked.has(id)).length
    return checkedCount > 0 && checkedCount < childIds.length
  }

  const checkedCount = useMemo(() => checked.size, [checked])

  const handleReset = () => {
    setDesc(role.desc)
    // 重新拉取已分配权限
    void getRolePermSets(role.id).then((sets) => setChecked(new Set(sets.perm_ids)))
  }

  const handleSave = async () => {
    setSubmitting(true)
    setHint('')
    try {
      await setRolePermSets(role.id, Array.from(checked))
      setHint('保存成功')
      window.setTimeout(() => {
        onSuccess?.()
        onClose()
      }, 500)
    } catch (err) {
      setHint(err instanceof Error ? err.message : '保存失败，请重试')
    } finally {
      setSubmitting(false)
    }
  }

  /** 递归渲染权限树节点 */
  const renderNode = (node: PermissionTree, depth: number) => {
    const hasChildren = !!node.children?.length
    return (
      <div key={node.id} className="perm-tree__node" style={{ paddingLeft: depth * 20 }}>
        <label className="perm-tree__item">
          <input
            type="checkbox"
            checked={isNodeChecked(node)}
            ref={(el) => {
              if (el) el.indeterminate = isNodeIndeterminate(node)
            }}
            onChange={() => toggleNode(node)}
          />
          <span className="perm-tree__name">{node.name}</span>
        </label>
        {hasChildren && <div className="perm-tree__children">{node.children!.map((c: PermissionTree) => renderNode(c, depth + 1))}</div>}
      </div>
    )
  }

  return (
    <div className="modal-mask" onClick={onClose}>
      <div
        className="perm-config-modal"
        role="dialog"
        aria-modal="true"
        aria-label="功能权限配置"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="perm-config-modal__header">
          <h3 className="perm-config-modal__title">功能权限配置</h3>
          <button type="button" className="perm-config-modal__close" title="关闭" onClick={onClose}>
            <IconClose width={18} height={18} />
          </button>
        </header>

        <div className="perm-config-modal__body">
          <div className="perm-config-form__item">
            <label className="perm-config-form__label">角色名称</label>
            <input type="text" value={role.name} readOnly className="perm-config-form__input perm-config-form__input--readonly" />
          </div>

          <div className="perm-config-form__item">
            <label className="perm-config-form__label">角色描述</label>
            <textarea
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              rows={3}
              className="perm-config-form__textarea"
              placeholder="请输入"
            />
          </div>

          <div className="perm-config-form__item">
            <label className="perm-config-form__label">角色功能权限</label>
            <div className="perm-tree">
              {loading ? (
                <div className="perm-tree__loading">加载中…</div>
              ) : tree.length === 0 ? (
                <div className="perm-tree__empty">暂无权限数据</div>
              ) : (
                tree.map((node) => renderNode(node, 0))
              )}
            </div>
            {checkedCount > 0 && <div className="perm-tree__count">已选 {checkedCount} 项</div>}
          </div>

          {hint && <div className="perm-config-form__hint">{hint}</div>}
        </div>

        <footer className="perm-config-form__footer">
          <button type="button" className="perm-config-form__btn perm-config-form__btn--plain" onClick={onClose}>
            取消
          </button>
          <button type="button" className="perm-config-form__btn perm-config-form__btn--plain" onClick={handleReset}>
            重置
          </button>
          <button
            type="button"
            className="perm-config-form__btn perm-config-form__btn--primary"
            onClick={handleSave}
            disabled={submitting || loading}
          >
            {submitting ? '保存中…' : '保存'}
          </button>
        </footer>
      </div>
    </div>
  )
}
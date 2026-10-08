import { useCallback, useEffect, useRef, useState } from 'react'

import {
  IconChevronRight,
  IconClose,
  IconRefresh,
  IconSearch,
  IconSettings,
} from './Icons'
import CreatePermissionModal, { type PermissionFormValues } from './CreatePermissionModal'

import { deletePerm, getPermList, type PermissionTree } from '../api/permission'

/** 毫秒时间戳格式化为 YYYY-MM-DD HH:mm */
function formatTime(ms?: number): string {
  if (!ms) return ''
  const d = new Date(ms)
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(
    d.getMinutes(),
  )}`
}

const typeText = (type: number) => (type === 1 ? '菜单' : type === 2 ? '操作' : '-')

export default function PermissionPage() {
  const [keyword, setKeyword] = useState('')
  const [appliedName, setAppliedName] = useState('')
  const [tree, setTree] = useState<PermissionTree[]>([])
  const [loading, setLoading] = useState(false)
  const [expanded, setExpanded] = useState<Set<number>>(new Set([1]))

  // 弹窗状态：编辑节点 / 新增（父级 id）
  const [modalOpen, setModalOpen] = useState(false)
  const [editingPerm, setEditingPerm] = useState<PermissionFormValues | null>(null)
  const [defaultParentId, setDefaultParentId] = useState(0)

  const openCreate = (parentId = 0) => {
    setEditingPerm(null)
    setDefaultParentId(parentId)
    setModalOpen(true)
  }

  const openEdit = (node: PermissionTree) => {
    setEditingPerm({
      id: node.id,
      name: node.name,
      code: node.code,
      type: node.type,
      page_path: node.page_path,
      parent_id: node.parent_id,
      sort: node.sort,
      desc: node.desc,
    })
    setDefaultParentId(node.parent_id)
    setModalOpen(true)
  }

  const handleDelete = async (node: PermissionTree) => {
    if (!window.confirm(`确定删除菜单「${node.name}」吗？`)) return
    try {
      await deletePerm(node.id)
      void load(appliedName)
    } catch (err) {
      window.alert(err instanceof Error ? err.message : '删除失败，请重试')
    }
  }

  const load = useCallback(async (name?: string) => {
    setLoading(true)
    try {
      setTree(await getPermList(name))
    } finally {
      setLoading(false)
    }
  }, [])

  // StrictMode 开发态会双调用 effect，用 ref 守卫保证首次加载只请求一次
  const didInitLoad = useRef(false)

  useEffect(() => {
    if (didInitLoad.current) return
    didInitLoad.current = true
    void load()
  }, [load])

  const handleSearch = () => {
    setAppliedName(keyword.trim())
    void load(keyword.trim())
  }

  const handleClear = () => {
    setKeyword('')
    setAppliedName('')
    void load('')
  }

  const toggleExpand = (id: number) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  /** 递归渲染可见树节点（父节点收起时不渲染子节点） */
  const renderNodes = (nodes: PermissionTree[], depth: number) =>
    nodes.flatMap((node) => {
      const hasChildren = !!node.children?.length
      const isOpen = expanded.has(node.id)
      const rows = [
        <tr key={node.id}>
          <td>
            <div className="tree-cell" style={{ paddingLeft: 12 + depth * 22 }}>
              {hasChildren ? (
                <button
                  type="button"
                  className="tree-caret"
                  onClick={() => toggleExpand(node.id)}
                  title={isOpen ? '收起' : '展开'}
                >
                  <IconChevronRight
                    width={14}
                    height={14}
                    style={{ transform: isOpen ? 'rotate(90deg)' : 'none' }}
                  />
                </button>
              ) : (
                <span className="tree-caret tree-caret--leaf" />
              )}
              <span className="tree-cell__name">{node.name}</span>
            </div>
          </td>
          <td>{node.code}</td>
          <td>{node.page_path}</td>
          <td>{typeText(node.type)}</td>
          <td>{node.sort}</td>
          <td>{node.desc}</td>
          <td>{formatTime(node.update_at)}</td>
          <td>
            <div className="row-actions">
              <button type="button" onClick={() => openEdit(node)}>编辑</button>
              <button type="button" onClick={() => openCreate(node.id)}>新增</button>
              <button type="button" className="row-actions__danger" onClick={() => void handleDelete(node)}>
                删除
              </button>
            </div>
          </td>
        </tr>,
      ]

      if (hasChildren && isOpen) {
        rows.push(...renderNodes(node.children!, depth + 1))
      }
      return rows
    })

  return (
    <div className="permission-page">
      {/* 搜索区 */}
      <section className="panel search-panel">
        <div className="search-panel__item">
          <label className="search-panel__label">菜单名：</label>
          <input
            type="text"
            placeholder="请输入"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
        </div>

        <div className="search-panel__buttons">
          <button type="button" className="btn btn--primary" onClick={handleSearch}>
            <IconSearch width={16} height={16} />
            搜索
          </button>
          <button type="button" className="btn" onClick={handleClear}>
            清空
          </button>
        </div>
      </section>

      {/* 表格区 */}
      <section className="panel table-panel">
        <div className="table-panel__toolbar">
          <button type="button" className="btn btn--primary" onClick={() => openCreate(0)}>
            新增菜单
          </button>
          <div className="table-panel__toolbar-actions">
            <button type="button" title="关闭" className="icon-btn">
              <IconClose width={17} height={17} />
            </button>
            <button
              type="button"
              title="刷新"
              className="icon-btn"
              disabled={loading}
              onClick={() => void load(appliedName)}
            >
              <IconRefresh width={17} height={17} />
            </button>
            <button type="button" title="设置" className="icon-btn">
              <IconSettings width={17} height={17} />
            </button>
          </div>
        </div>

        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>菜单名</th>
                <th>权限标识</th>
                <th>菜单路径</th>
                <th>类型</th>
                <th>排序</th>
                <th>描述</th>
                <th>更新时间</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="data-table__state">
                    加载中…
                  </td>
                </tr>
              ) : tree.length === 0 ? (
                <tr>
                  <td colSpan={8} className="data-table__state">
                    暂无数据
                  </td>
                </tr>
              ) : (
                renderNodes(tree, 0)
              )}
            </tbody>
          </table>
        </div>
      </section>

      {modalOpen && (
        <CreatePermissionModal
          perm={editingPerm}
          defaultParentId={defaultParentId}
          onClose={() => setModalOpen(false)}
          onSuccess={() => void load(appliedName)}
        />
      )}
    </div>
  )
}
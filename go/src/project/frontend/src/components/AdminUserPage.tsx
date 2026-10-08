import { useCallback, useEffect, useRef, useState } from 'react'

import CreateAdminModal from './CreateAdminModal'
import {
  IconChevronRight,
  IconClose,
  IconRefresh,
  IconSearch,
  IconSettings,
} from './Icons'

import {
  getUserList,
  sexText,
  statusText,
  UserStatus,
  type AdminUser,
} from '../api/adminUser'

/** 毫秒时间戳格式化为 YYYY-MM-DD HH:mm:ss */
function formatTime(ms?: number): string {
  if (!ms) return ''
  const d = new Date(ms)
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(
    d.getMinutes(),
  )}:${p(d.getSeconds())}`
}

const PAGE_SIZE = 10

export default function AdminUserPage() {
  const [keyword, setKeyword] = useState({ name: '', nick_name: '', mobile: '', status: 0 })
  const [applied, setApplied] = useState({ name: '', nick_name: '', mobile: '', status: 0 })
  const [list, setList] = useState<AdminUser[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [showCreate, setShowCreate] = useState(false)
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null)

  // StrictMode 双调用守卫
  const didInit = useRef(false)

  const load = useCallback(async (pageNum = 1) => {
    setLoading(true)
    try {
      const resp = await getUserList({ ...applied, page: pageNum, page_size: PAGE_SIZE })
      setList(resp.list)
      setTotal(resp.total)
      setPage(pageNum)
    } finally {
      setLoading(false)
    }
  }, [applied])

  useEffect(() => {
    if (didInit.current) return
    didInit.current = true
    void load(1)
  }, [load])

  const handleSearch = () => {
    setApplied({ ...keyword })
    setPage(1)
    void load(1)
  }

  const handleClear = () => {
    const empty = { name: '', nick_name: '', mobile: '', status: 0 }
    setKeyword(empty)
    setApplied(empty)
    setPage(1)
    void load(1)
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  return (
    <div className="admin-user-page">
      {/* 搜索区 */}
      <section className="panel search-panel">
        <div className="search-panel__item">
          <label className="search-panel__label">姓名：</label>
          <input
            type="text"
            placeholder="请输入"
            value={keyword.name}
            onChange={(e) => setKeyword({ ...keyword, name: e.target.value })}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
        </div>
        <div className="search-panel__item">
          <label className="search-panel__label">昵称：</label>
          <input
            type="text"
            placeholder="请输入"
            value={keyword.nick_name}
            onChange={(e) => setKeyword({ ...keyword, nick_name: e.target.value })}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
        </div>
        <div className="search-panel__item">
          <label className="search-panel__label">手机号：</label>
          <input
            type="text"
            placeholder="请输入"
            value={keyword.mobile}
            onChange={(e) => setKeyword({ ...keyword, mobile: e.target.value })}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
        </div>
        <div className="search-panel__item">
          <label className="search-panel__label">状态：</label>
          <select
            value={keyword.status}
            onChange={(e) => setKeyword({ ...keyword, status: Number(e.target.value) })}
          >
            <option value={0}>请选择</option>
            <option value={UserStatus.Enable}>启用</option>
            <option value={UserStatus.Disable}>禁用</option>
          </select>
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
          <button type="button" className="btn btn--primary" onClick={() => setShowCreate(true)}>
            新增管理员
          </button>
          <div className="table-panel__toolbar-right">
            <button type="button" title="关闭" className="icon-btn">
              <IconClose width={17} height={17} />
            </button>
            <button
              type="button"
              title="刷新"
              className="icon-btn"
              disabled={loading}
              onClick={() => void load(page)}
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
                <th>姓名</th>
                <th>昵称</th>
                <th>性别</th>
                <th>所属角色</th>
                <th>手机号</th>
                <th>添加时间</th>
                <th>状态</th>
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
              ) : list.length === 0 ? (
                <tr>
                  <td colSpan={8} className="data-table__state">
                    暂无数据
                  </td>
                </tr>
              ) : (
                list.map((u) => (
                  <tr key={u.user_id}>
                    <td>{u.name}</td>
                    <td>{u.nick_name}</td>
                    <td>{sexText(u.sex)}</td>
                    <td>{u.role_ids?.map((r) => r.name).join('、') || '-'}</td>
                    <td>{u.mobile}</td>
                    <td>{formatTime(u.create_at)}</td>
                    <td>
                      <span className={`status-tag ${u.status === UserStatus.Enable ? 'status-tag--on' : 'status-tag--off'}`}>
                        {statusText(u.status)}
                      </span>
                    </td>
                    <td>
                      <div className="row-actions">
                        <button type="button" onClick={() => setEditingUser(u)}>编辑</button>
                        <button type="button" className="row-actions__danger">
                          删除
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* 分页 */}
        <div className="pagination">
          <span className="pagination__total">共 {total} 条</span>
          <div className="pagination__pages">
            <button
              type="button"
              className="pagination__btn"
              disabled={page <= 1}
              onClick={() => load(page - 1)}
            >
              <IconChevronRight width={14} height={14} style={{ transform: 'rotate(180deg)' }} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                type="button"
                className={`pagination__btn ${p === page ? 'pagination__btn--active' : ''}`}
                onClick={() => load(p)}
              >
                {p}
              </button>
            ))}
            <button
              type="button"
              className="pagination__btn"
              disabled={page >= totalPages}
              onClick={() => load(page + 1)}
            >
              <IconChevronRight width={14} height={14} />
            </button>
          </div>
          <span className="pagination__size">{PAGE_SIZE} 条/页</span>
        </div>
      </section>

      {(showCreate || editingUser) && (
        <CreateAdminModal
          user={editingUser}
          onClose={() => {
            setShowCreate(false)
            setEditingUser(null)
          }}
          onSuccess={() => void load(page)}
        />
      )}
    </div>
  )
}
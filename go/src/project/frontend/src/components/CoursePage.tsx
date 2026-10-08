import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { IconEdit, IconInbox, IconRefresh, IconSearch, IconTrash } from './Icons'

import {
  deleteCourse,
  getCourseList,
  updateCourseStatus,
  type Course,
} from '../api/course'

function formatTime(ts: number): string {
  if (!ts) return '-'
  const d = new Date(ts)
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(
    d.getMinutes(),
  )}:${p(d.getSeconds())}`
}

export default function CoursePage() {
  const navigate = useNavigate()
  const [id, setId] = useState('')
  const [name, setName] = useState('')
  const [status, setStatus] = useState<number | ''>('')
  const [page, setPage] = useState(1)
  const [pageSize] = useState(20)
  const [total, setTotal] = useState(0)
  const [list, setList] = useState<Course[]>([])
  const [loading, setLoading] = useState(false)

  const fetchList = async () => {
    setLoading(true)
    try {
      const params: Record<string, number | string> = { page, page_size: pageSize }
      if (id) params.id = Number(id)
      if (name.trim()) params.name = name.trim()
      if (status !== '') params.status = status
      const resp = await getCourseList(params)
      setList(resp.list)
      setTotal(resp.total)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void fetchList()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page])

  const handleSearch = () => {
    setPage(1)
    void fetchList()
  }

  const handleReset = () => {
    setId('')
    setName('')
    setStatus('')
    setPage(1)
    setTimeout(fetchList, 0)
  }

  const handleDelete = async (item: Course) => {
    if (!window.confirm(`确定删除课程「${item.name}」？`)) return
    await deleteCourse(item.id)
    void fetchList()
  }

  const handleStatus = async (item: Course) => {
    const next = item.status === 1 ? -1 : 1
    const label = next === 1 ? '启用' : '禁用'
    if (!window.confirm(`确定${label}课程「${item.name}」？`)) return
    await updateCourseStatus(item.id, next)
    void fetchList()
  }

  return (
    <div className="panel">
      {/* 搜索区 */}
      <div className="filter-bar">
        <div className="filter-bar__item">
          <label>课程ID：</label>
          <input
            className="filter-bar__input"
            value={id}
            onChange={(e) => setId(e.target.value)}
            placeholder="请输入"
          />
        </div>
        <div className="filter-bar__item">
          <label>课程名称：</label>
          <input
            className="filter-bar__input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="请输入"
          />
        </div>
        <div className="filter-bar__item">
          <label>更新状态：</label>
          <select
            className="filter-bar__input"
            value={status}
            onChange={(e) =>
              setStatus(e.target.value === '' ? '' : Number(e.target.value))
            }
          >
            <option value="">请选择</option>
            <option value={1}>正常</option>
            <option value={-1}>禁用</option>
          </select>
        </div>
        <div className="filter-bar__actions">
          <button className="btn btn--primary" onClick={handleSearch}>
            <IconSearch width={14} height={14} /> 搜索
          </button>
          <button className="btn" onClick={handleReset}>
            清空
          </button>
        </div>
      </div>

      {/* 工具栏 */}
      <div className="table-toolbar">
        <button
          className="btn btn--primary"
          onClick={() => navigate('/course/create')}
        >
          新增课程
        </button>
        <button className="icon-btn" onClick={() => void fetchList()} title="刷新">
          <IconRefresh width={16} height={16} />
        </button>
      </div>

      {/* 表格 */}
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>课程ID</th>
              <th>课程名称</th>
              <th>课程封面</th>
              <th>课程价格</th>
              <th>课程特色</th>
              <th>服务时长</th>
              <th>状态</th>
              <th>创建人</th>
              <th>创建时间</th>
              <th>更新人</th>
              <th>更新时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={12} className="table-empty">
                  加载中…
                </td>
              </tr>
            ) : list.length === 0 ? (
              <tr>
                <td colSpan={12} className="table-empty">
                  <IconInbox width={48} height={48} />
                  <p>暂无数据</p>
                </td>
              </tr>
            ) : (
              list.map((item) => (
                <tr key={item.id}>
                  <td>{item.id}</td>
                  <td className="table-ellipsis" title={item.name}>
                    {item.name}
                  </td>
                  <td>
                    {item.cover_url ? (
                      <img
                        src={item.cover_url}
                        alt={item.name}
                        className="course-cover-thumb"
                      />
                    ) : (
                      '-'
                    )}
                  </td>
                  <td>¥{item.course_price.toFixed(2)}</td>
                  <td className="table-ellipsis" title={(item.features ?? []).join('、')}>
                    {(item.features ?? []).join('、') || '-'}
                  </td>
                  <td>{item.service_time}天</td>
                  <td>
                    <span
                      className={`status-pill ${item.status === 1 ? 'status-pill--on' : 'status-pill--off'}`}
                      onClick={() => handleStatus(item)}
                    >
                      {item.status === 1 ? '正常' : '禁用'}
                    </span>
                  </td>
                  <td>{item.create_by_name || '-'}</td>
                  <td>{formatTime(item.create_at)}</td>
                  <td>{item.update_by_name || '-'}</td>
                  <td>{formatTime(item.update_at)}</td>
                  <td>
                    <div className="row-actions">
                      <button
                        className="row-actions__btn"
                        onClick={() => navigate(`/course/create?id=${item.id}`)}
                      >
                        <IconEdit width={14} height={14} /> 编辑
                      </button>
                      <button
                        className="row-actions__btn row-actions__btn--danger"
                        onClick={() => handleDelete(item)}
                      >
                        <IconTrash width={14} height={14} /> 删除
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
        <button
          className="btn"
          disabled={page <= 1}
          onClick={() => setPage((p) => p - 1)}
        >
          上一页
        </button>
        <span className="pagination__info">
          第 {page} 页 / 共 {Math.ceil(total / pageSize) || 1} 页（{total} 条）
        </span>
        <button
          className="btn"
          disabled={page >= Math.ceil(total / pageSize)}
          onClick={() => setPage((p) => p + 1)}
        >
          下一页
        </button>
      </div>
    </div>
  )
}
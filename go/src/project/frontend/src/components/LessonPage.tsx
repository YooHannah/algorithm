import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import {
  IconChevronDown,
  IconChevronRight,
  IconClose,
  IconFolder,
  IconFolderLeaf,
  IconInbox,
  IconRefresh,
  IconSearch,
  IconSettings,
} from './Icons'
import LessonCategoryTree from './LessonCategoryTree'

import {
  deleteLesson,
  getLessonList,
  moveLesson,
  updateLessonStatus,
  type Lesson,
} from '../api/lesson'
import { getLessonCategoryList, type LessonCategoryTree as CategoryNode } from '../api/lessonCategory'

const PAGE_SIZE = 10

function formatTime(ms: number): string {
  if (!ms) return '-'
  const d = new Date(ms)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(
    d.getMinutes(),
  )}`
}

/**
 * 录播管理页：
 * - 左侧：录播目录（增删改查 + 层级排序）
 * - 右侧：录播列表（搜索 / 上下架 / 编辑 / 删除 / 新增）
 */
export default function LessonPage() {
  const navigate = useNavigate()
  const [panelCollapsed, setPanelCollapsed] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<CategoryNode | null>(null)

  const [lessonId, setLessonId] = useState('')
  // 实际参与查询的筛选条件（点击搜索后才更新）
  const [queryId, setQueryId] = useState<number | undefined>(undefined)
  const [page, setPage] = useState(1)

  const [list, setList] = useState<Lesson[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)

  const fetchList = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getLessonList({
        id: queryId,
        category_id: selectedCategory?.id,
        page,
        page_size: PAGE_SIZE,
      })
      setList(res.list ?? [])
      setTotal(res.total ?? 0)
    } catch (err) {
      window.alert(err instanceof Error ? err.message : '录播列表加载失败')
    } finally {
      setLoading(false)
    }
  }, [page, queryId, selectedCategory])

  useEffect(() => {
    void fetchList()
  }, [fetchList])

  const handleSearch = () => {
    setPage(1)
    setQueryId(lessonId.trim() ? Number(lessonId.trim()) : undefined)
  }

  const handleClear = () => {
    setLessonId('')
    setQueryId(undefined)
    setPage(1)
  }

  const goCreate = () => {
    if (!selectedCategory) {
      window.alert('请先在左侧选择录播所属目录')
      return
    }
    navigate('/course/lesson/create', {
      state: { categoryId: selectedCategory.id, categoryName: selectedCategory.name },
    })
  }

  const goEdit = (lesson: Lesson) => {
    navigate(`/course/lesson/create?id=${lesson.id}`)
  }

  const handleToggleStatus = async (lesson: Lesson) => {
    const next = lesson.status === 1 ? -1 : 1
    const action = next === 1 ? '上架' : '下架'
    if (!window.confirm(`确定要${action}「${lesson.name}」吗？`)) return
    try {
      await updateLessonStatus(lesson.id, next)
      void fetchList()
    } catch (err) {
      window.alert(err instanceof Error ? err.message : '状态更新失败')
    }
  }

  const handleDelete = async (lesson: Lesson) => {
    if (!window.confirm(`确定要删除录播「${lesson.name}」吗？删除后不可恢复。`)) return
    try {
      await deleteLesson(lesson.id)
      // 删完当前页最后一条时回退一页
      if (list.length === 1 && page > 1) setPage(page - 1)
      else void fetchList()
    } catch (err) {
      window.alert(err instanceof Error ? err.message : '删除失败')
    }
  }

  /* ------------------------------- 移动录播 ------------------------------- */

  const [moveTarget, setMoveTarget] = useState<Lesson | null>(null)
  const [moveTree, setMoveTree] = useState<CategoryNode[]>([])
  const [moveExpanded, setMoveExpanded] = useState<Set<number>>(new Set())
  const [moveSelectedId, setMoveSelectedId] = useState<number | null>(null)
  const [moveLoading, setMoveLoading] = useState(false)
  const [moveSubmitting, setMoveSubmitting] = useState(false)

  const openMoveModal = async (lesson: Lesson) => {
    setMoveTarget(lesson)
    setMoveSelectedId(lesson.category_id || null)
    setMoveExpanded(new Set())
    setMoveLoading(true)
    try {
      const tree = await getLessonCategoryList()
      setMoveTree(tree)
      // 默认展开所有含子节点的根节点
      setMoveExpanded(new Set(tree.filter((n) => n.children?.length).map((n) => n.id)))
    } catch (err) {
      window.alert(err instanceof Error ? err.message : '目录加载失败')
    } finally {
      setMoveLoading(false)
    }
  }

  const closeMoveModal = () => {
    if (moveSubmitting) return
    setMoveTarget(null)
    setMoveTree([])
    setMoveSelectedId(null)
  }

  const toggleMoveExpand = (id: number) => {
    setMoveExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleMoveConfirm = async () => {
    if (!moveTarget || moveSelectedId == null) {
      window.alert('请选择目标目录')
      return
    }
    if (moveSelectedId === moveTarget.category_id) {
      window.alert('录播已在该目录下')
      return
    }
    setMoveSubmitting(true)
    try {
      await moveLesson(moveTarget.id, moveSelectedId)
      closeMoveModal()
      void fetchList()
    } catch (err) {
      window.alert(err instanceof Error ? err.message : '移动失败')
    } finally {
      setMoveSubmitting(false)
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const filterLabel = selectedCategory ? `所属目录：${selectedCategory.name}` : '全部目录'

  return (
    <div className="lesson-page">
      {/* 左侧目录面板 */}
      {panelCollapsed ? (
        <button
          type="button"
          className="lesson-panel-rail"
          title="展开目录"
          onClick={() => setPanelCollapsed(false)}
        >
          <IconChevronDown width={16} height={16} style={{ transform: 'rotate(-90deg)' }} />
        </button>
      ) : (
        <aside className="lesson-panel panel">
          <LessonCategoryTree
            onCollapse={() => setPanelCollapsed(true)}
            onSelect={(node) => {
              setSelectedCategory(node)
              setPage(1)
            }}
          />
        </aside>
      )}

      {/* 右侧录播列表 */}
      <div className="lesson-main">
        {/* 搜索区 */}
        <section className="panel lesson-search">
          <div className="search-panel__item">
            <label className="search-panel__label">录播ID：</label>
            <input
              type="text"
              placeholder="请输入"
              value={lessonId}
              onChange={(e) => setLessonId(e.target.value.replace(/\D/g, ''))}
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
            <button type="button" className="btn lesson-search__expand">
              展开
              <IconChevronDown width={14} height={14} />
            </button>
          </div>
        </section>

        {/* 表格区 */}
        <section className="panel table-panel">
          <div className="table-panel__toolbar">
            <span className="lesson-toolbar__category">{filterLabel}</span>
            <div className="table-panel__toolbar-actions">
              <button type="button" className="btn" onClick={goCreate}>
                新增录播
              </button>
              <button type="button" className="btn" disabled title="暂未开放">
                批量移动
              </button>
              <button type="button" title="关闭" className="icon-btn" disabled>
                <IconClose width={17} height={17} />
              </button>
              <button type="button" title="刷新" className="icon-btn" onClick={() => void fetchList()}>
                <IconRefresh width={17} height={17} />
              </button>
              <button type="button" title="设置" className="icon-btn" disabled>
                <IconSettings width={17} height={17} />
              </button>
            </div>
          </div>

          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th className="lesson-col-check">
                    <input type="checkbox" disabled />
                  </th>
                  <th>录播ID</th>
                  <th>录播名称</th>
                  <th>时长</th>
                  <th>所属目录</th>
                  <th>创建时间</th>
                  <th>创建人</th>
                  <th>更新时间</th>
                  <th>状态</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={10} className="lesson-empty-cell">
                      加载中…
                    </td>
                  </tr>
                ) : list.length === 0 ? (
                  <tr>
                    <td colSpan={10}>
                      <div className="lesson-empty">
                        <IconInbox width={48} height={48} />
                        <span>暂无数据</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  list.map((lesson) => (
                    <tr key={lesson.id}>
                      <td>
                        <input type="checkbox" />
                      </td>
                      <td>{lesson.id}</td>
                      <td className="lesson-name-cell" title={lesson.name}>
                        {lesson.name}
                      </td>
                      <td>{lesson.duration > 0 ? formatDurationLocal(lesson.duration) : '-'}</td>
                      <td>{lesson.category_name || '-'}</td>
                      <td>{formatTime(lesson.create_at)}</td>
                      <td>{lesson.create_by_name || lesson.create_by || '-'}</td>
                      <td>{formatTime(lesson.update_at)}</td>
                      <td>
                        <button
                          type="button"
                          className={lesson.status === 1 ? 'le-status le-status--on' : 'le-status le-status--off'}
                          onClick={() => void handleToggleStatus(lesson)}
                          title={lesson.status === 1 ? '点击下架' : '点击上架'}
                        >
                          {lesson.status === 1 ? '已上架' : '已下架'}
                        </button>
                      </td>
                      <td>
                        <div className="le-row-actions">
                          <button type="button" onClick={() => goEdit(lesson)}>
                            编辑
                          </button>
                          <button type="button" onClick={() => void openMoveModal(lesson)}>
                            移动
                          </button>
                          <button
                            type="button"
                            className="le-row-actions__danger"
                            onClick={() => void handleDelete(lesson)}
                          >
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
          <div className="lesson-pagination">
            <span className="lesson-pagination__total">共 {total} 条</span>
            <button
              type="button"
              className="btn"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              上一页
            </button>
            <span className="lesson-pagination__page">
              {page} / {totalPages}
            </span>
            <button
              type="button"
              className="btn"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              下一页
            </button>
          </div>
        </section>
      </div>

      {/* 移动录播弹窗 */}
      {moveTarget && (
        <div className="modal-mask" onClick={closeMoveModal}>
          <div className="le-move-modal" onClick={(e) => e.stopPropagation()}>
            <div className="le-move-modal__header">
              <span>移动文件夹</span>
              <button type="button" className="icon-btn" onClick={closeMoveModal}>
                <IconClose width={16} height={16} />
              </button>
            </div>
            <div className="le-move-modal__body">
              {moveLoading ? (
                <div className="lc-state">加载中…</div>
              ) : moveTree.length === 0 ? (
                <div className="lc-state">暂无目录</div>
              ) : (
                <div className="le-move-tree">
                  {renderMoveTree({
                    nodes: moveTree,
                    depth: 0,
                    expanded: moveExpanded,
                    selectedId: moveSelectedId,
                    onSelect: setMoveSelectedId,
                    onToggle: toggleMoveExpand,
                  })}
                </div>
              )}
            </div>
            <div className="le-move-modal__footer">
              <button type="button" className="btn" onClick={closeMoveModal} disabled={moveSubmitting}>
                取消
              </button>
              <button
                type="button"
                className="btn btn--primary"
                onClick={() => void handleMoveConfirm()}
                disabled={moveSubmitting || moveSelectedId == null}
              >
                {moveSubmitting ? '移动中…' : '确定'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* --------------------------- 移动弹窗目录树渲染 --------------------------- */

interface MoveTreeProps {
  nodes: CategoryNode[]
  depth: number
  expanded: Set<number>
  selectedId: number | null
  onSelect: (id: number) => void
  onToggle: (id: number) => void
}

function renderMoveTree({ nodes, depth, expanded, selectedId, onSelect, onToggle }: MoveTreeProps): React.ReactNode {
  return nodes.map((node) => {
    const hasChildren = !!node.children?.length
    const isOpen = expanded.has(node.id)
    const isSelected = selectedId === node.id
    return (
      <div key={node.id}>
        <div
          className={['le-move-node', isSelected ? 'le-move-node--selected' : ''].filter(Boolean).join(' ')}
          style={{ paddingLeft: 12 + depth * 20 }}
          onClick={() => onSelect(node.id)}
        >
          {hasChildren ? (
            <button
              type="button"
              className="le-move-node__caret"
              onClick={(e) => {
                e.stopPropagation()
                onToggle(node.id)
              }}
            >
              <IconChevronRight
                width={14}
                height={14}
                style={{ transform: isOpen ? 'rotate(90deg)' : 'none' }}
              />
            </button>
          ) : (
            <span className="le-move-node__caret le-move-node__caret--leaf" />
          )}
          <span className="le-move-node__folder">
            {hasChildren ? <IconFolder width={16} height={16} /> : <IconFolderLeaf width={16} height={16} />}
          </span>
          <span className="le-move-node__name">{node.name}</span>
        </div>
        {hasChildren && isOpen && (
          <div className="le-move-children">
            {renderMoveTree({
              nodes: node.children!,
              depth: depth + 1,
              expanded,
              selectedId,
              onSelect,
              onToggle,
            })}
          </div>
        )}
      </div>
    )
  })
}

/** 本地格式化，避免跨页面循环依赖 */
function formatDurationLocal(sec: number): string {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

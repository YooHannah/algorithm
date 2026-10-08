import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import {
  IconChevronDown,
  IconChevronRight,
  IconClose,
  IconDrag,
  IconEdit,
  IconInbox,
  IconPlus,
  IconRefresh,
  IconSearch,
} from './Icons'
import { formatDuration } from './LessonEditPage'

import {
  addCatalog,
  addCatalogLessons,
  deleteCatalog,
  getCatalogInfo,
  removeCatalogLesson,
  sortCatalog,
  sortCatalogLessons,
  updateCatalog,
  updateCatalogLesson,
  type CatalogInfo,
  type CatalogLesson,
  type CatalogNode,
} from '../api/catalog'
import { getLessonList, type Lesson } from '../api/lesson'

/* ------------------------------ 时间工具 ------------------------------ */
const pad = (n: number) => String(n).padStart(2, '0')

/** 毫秒 -> datetime-local 值 */
function msToInput(ms: number): string {
  if (!ms) return ''
  const d = new Date(ms)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(
    d.getMinutes(),
  )}`
}

/** datetime-local 值 -> 毫秒 */
function inputToMs(v: string): number {
  return v ? new Date(v).getTime() : 0
}

function fmtFull(ms: number): string {
  if (!ms) return '-'
  const d = new Date(ms)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(
    d.getMinutes(),
  )}:${pad(d.getSeconds())}`
}

function reorder<T>(arr: T[], from: number, to: number): T[] {
  if (from === to || from < 0 || to < 0 || from >= arr.length || to >= arr.length) return arr
  const next = arr.slice()
  const [item] = next.splice(from, 1)
  next.splice(to, 0, item)
  return next
}

/* ------------------------------ 章节命名弹窗 ------------------------------ */

function NameModal({
  title,
  initial,
  suggestions,
  onClose,
  onSubmit,
}: {
  title: string
  initial: string
  suggestions: string[]
  onClose: () => void
  onSubmit: (name: string) => Promise<void>
}) {
  const [name, setName] = useState(initial)
  const [submitting, setSubmitting] = useState(false)
  const listId = useMemo(() => `name-suggest-${Math.random().toString(36).slice(2, 8)}`, [])

  const submit = async () => {
    if (!name.trim()) {
      window.alert('请输入名称')
      return
    }
    setSubmitting(true)
    try {
      await onSubmit(name.trim())
      onClose()
    } catch (err) {
      window.alert(err instanceof Error ? err.message : '操作失败')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="modal-mask" onClick={onClose}>
      <div className="cc-name-modal" onClick={(e) => e.stopPropagation()}>
        <div className="cc-name-modal__header">
          <span>{title}</span>
          <button className="icon-btn" onClick={onClose}>
            <IconClose width={16} height={16} />
          </button>
        </div>
        <div className="cc-name-modal__body">
          <label className="ce-label ce-label--required">名称：</label>
          <input
            className="ce-input"
            list={listId}
            value={name}
            autoFocus
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && void submit()}
            placeholder="请输入名称"
          />
          <datalist id={listId}>
            {suggestions.map((s) => (
              <option key={s} value={s} />
            ))}
          </datalist>
        </div>
        <div className="cc-name-modal__footer">
          <button className="btn" onClick={onClose}>
            取消
          </button>
          <button className="btn btn--primary" disabled={submitting} onClick={() => void submit()}>
            确定
          </button>
        </div>
      </div>
    </div>
  )
}

/* ------------------------------ 添加录播弹窗 ------------------------------ */

interface AddLessonModalProps {
  goodsId: number
  catalogId: number
  /** 该课程已关联的录播 id（禁选） */
  linkedIds: Set<number>
  onClose: () => void
  onSuccess: () => void
}

function AddLessonModal({ goodsId, catalogId, linkedIds, onClose, onSuccess }: AddLessonModalProps) {
  const [idInput, setIdInput] = useState('')
  const [name, setName] = useState('')
  const [updateFrom, setUpdateFrom] = useState('')
  const [updateTo, setUpdateTo] = useState('')
  const [createFrom, setCreateFrom] = useState('')
  const [createTo, setCreateTo] = useState('')

  const [page, setPage] = useState(1)
  const pageSize = 10
  const [total, setTotal] = useState(0)
  const [rows, setRows] = useState<Lesson[]>([])
  const [loading, setLoading] = useState(false)
  // 跨页保留的本次选择
  const [selected, setSelected] = useState<Record<number, Lesson>>({})
  const [submitting, setSubmitting] = useState(false)

  const fetchList = useCallback(
    async (targetPage: number) => {
      setLoading(true)
      try {
        const resp = await getLessonList({
          id: idInput ? Number(idInput) : undefined,
          name: name.trim() || undefined,
          update_start: updateFrom ? inputToMs(updateFrom) : undefined,
          update_end: updateTo ? inputToMs(updateTo) : undefined,
          create_start: createFrom ? inputToMs(createFrom) : undefined,
          create_end: createTo ? inputToMs(createTo) : undefined,
          page: targetPage,
          page_size: pageSize,
        })
        setRows(resp.list)
        setTotal(resp.total)
      } finally {
        setLoading(false)
      }
    },
    [idInput, name, updateFrom, updateTo, createFrom, createTo],
  )

  useEffect(() => {
    void fetchList(1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSearch = () => {
    setPage(1)
    void fetchList(1)
  }

  const handleReset = () => {
    setIdInput('')
    setName('')
    setUpdateFrom('')
    setUpdateTo('')
    setCreateFrom('')
    setCreateTo('')
  }

  const toggleSelect = (lesson: Lesson) => {
    if (linkedIds.has(lesson.id)) return
    setSelected((prev) => {
      const next = { ...prev }
      if (next[lesson.id]) delete next[lesson.id]
      else next[lesson.id] = lesson
      return next
    })
  }

  // 当前页可选项
  const pageSelectable = rows.filter((r) => !linkedIds.has(r.id))
  const pageAllSelected = pageSelectable.length > 0 && pageSelectable.every((r) => selected[r.id])

  const togglePageAll = () => {
    setSelected((prev) => {
      const next = { ...prev }
      if (pageAllSelected) {
        pageSelectable.forEach((r) => delete next[r.id])
      } else {
        pageSelectable.forEach((r) => (next[r.id] = r))
      }
      return next
    })
  }

  const selectedCount = Object.keys(selected).length
  const totalPages = Math.ceil(total / pageSize) || 1

  const submit = async () => {
    const ids = Object.keys(selected).map(Number)
    if (ids.length === 0) {
      window.alert('请先勾选录播')
      return
    }
    setSubmitting(true)
    try {
      await addCatalogLessons(goodsId, catalogId, ids)
      onSuccess()
    } catch (err) {
      window.alert(err instanceof Error ? err.message : '添加失败')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="modal-mask" onClick={onClose}>
      <div className="cc-add-modal" onClick={(e) => e.stopPropagation()}>
        <div className="cc-add-modal__header">
          <span>添加录播</span>
          <button className="icon-btn" onClick={onClose}>
            <IconClose width={16} height={16} />
          </button>
        </div>

        <div className="cc-add-modal__filters">
          <div className="cc-add-modal__filter">
            <label>录播ID：</label>
            <input
              className="ce-input"
              value={idInput}
              onChange={(e) => setIdInput(e.target.value)}
              placeholder="请输入"
            />
          </div>
          <div className="cc-add-modal__filter">
            <label>录播名称：</label>
            <input
              className="ce-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="请输入"
            />
          </div>
          <div className="cc-add-modal__filter cc-add-modal__filter--range">
            <label>更新时间：</label>
            <input
              type="datetime-local"
              className="ce-input"
              value={updateFrom}
              onChange={(e) => setUpdateFrom(e.target.value)}
            />
            <span className="cc-add-modal__arrow">→</span>
            <input
              type="datetime-local"
              className="ce-input"
              value={updateTo}
              onChange={(e) => setUpdateTo(e.target.value)}
            />
          </div>
          <div className="cc-add-modal__filter cc-add-modal__filter--range">
            <label>创建时间：</label>
            <input
              type="datetime-local"
              className="ce-input"
              value={createFrom}
              onChange={(e) => setCreateFrom(e.target.value)}
            />
            <span className="cc-add-modal__arrow">→</span>
            <input
              type="datetime-local"
              className="ce-input"
              value={createTo}
              onChange={(e) => setCreateTo(e.target.value)}
            />
          </div>
          <div className="cc-add-modal__filter-actions">
            <button className="btn btn--primary" onClick={handleSearch}>
              <IconSearch width={14} height={14} /> 搜索
            </button>
            <button className="btn" onClick={handleReset}>
              清空
            </button>
          </div>
        </div>

        <div className="cc-add-modal__selected-bar">
          <span>
            已选 <em>{selectedCount}</em> 条
          </span>
          <div className="cc-add-modal__tools">
            <button className="icon-btn" title="关闭" onClick={onClose}>
              <IconClose width={15} height={15} />
            </button>
            <button className="icon-btn" title="刷新" onClick={() => void fetchList(page)}>
              <IconRefresh width={15} height={15} />
            </button>
          </div>
        </div>

        <div className="table-wrap cc-add-modal__table">
          <table className="data-table">
            <thead>
              <tr>
                <th className="cc-col-check">
                  <input type="checkbox" checked={pageAllSelected} onChange={togglePageAll} />
                </th>
                <th>录播ID</th>
                <th>录播名称</th>
                <th>时长</th>
                <th>更新时间</th>
                <th>更新人</th>
                <th>创建时间</th>
                <th>创建人</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} className="table-empty">
                    加载中…
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={9} className="table-empty">
                    <IconInbox width={40} height={40} />
                    <p>暂无数据</p>
                  </td>
                </tr>
              ) : (
                rows.map((lesson) => {
                  const linked = linkedIds.has(lesson.id)
                  const checked = !!selected[lesson.id] || linked
                  return (
                    <tr key={lesson.id} className={linked ? 'cc-row--linked' : ''}>
                      <td>
                        <input
                          type="checkbox"
                          checked={checked}
                          disabled={linked}
                          onChange={() => toggleSelect(lesson)}
                        />
                      </td>
                      <td>{lesson.id}</td>
                      <td className="table-ellipsis" title={lesson.name}>
                        {lesson.name}
                      </td>
                      <td>{formatDuration(lesson.duration)}</td>
                      <td>{fmtFull(lesson.update_at)}</td>
                      <td>{lesson.update_by_name || '-'}</td>
                      <td>{fmtFull(lesson.create_at)}</td>
                      <td>{lesson.create_by_name || '-'}</td>
                      <td>
                        {lesson.video_url ? (
                          <button
                            className="btn btn--ghost cc-detail-btn"
                            onClick={() => window.open(lesson.video_url, '_blank')}
                          >
                            详情
                          </button>
                        ) : (
                          '-'
                        )}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="cc-add-modal__pager">
          <span>
            共{total}条
          </span>
          <button className="btn" disabled={page <= 1} onClick={() => { setPage(page - 1); void fetchList(page - 1) }}>
            上一页
          </button>
          <span className="cc-add-modal__page-num">{page}</span>
          <button
            className="btn"
            disabled={page >= totalPages}
            onClick={() => { setPage(page + 1); void fetchList(page + 1) }}
          >
            下一页
          </button>
          <span>{pageSize}条/页</span>
        </div>

        <div className="cc-name-modal__footer">
          <button className="btn" onClick={onClose}>
            取消
          </button>
          <button className="btn btn--primary" disabled={submitting} onClick={() => void submit()}>
            确定
          </button>
        </div>
      </div>
    </div>
  )
}

/* ------------------------------ 主组件 ------------------------------ */

type NameModalState = {
  mode: 'addTopic' | 'addChapter' | 'edit'
  id?: number
  parentId?: number
  title: string
  initial: string
}

const emptyInfo = (goodsId: number): CatalogInfo => ({
  goods_id: goodsId,
  total_duration: 0,
  list: [],
})

export default function CourseCatalogTab({
  courseId,
  onCourseCreated,
}: {
  /** 已保存课程的 id；新增未保存时为 0，第一次添加专题由后端自动建草稿课程并回传 */
  courseId: number
  /** 后端自动建课后回传新课程 id，父组件据此更新 URL/状态（会因 key 变化触发重挂载） */
  onCourseCreated?: (goodsId: number) => void
}) {
  const [info, setInfo] = useState<CatalogInfo>(() => emptyInfo(courseId))
  const [activeTopicId, setActiveTopicId] = useState<number>(0)
  const [collapsed, setCollapsed] = useState<Set<number>>(new Set())
  const [sortMode, setSortMode] = useState(false)
  const [nameModal, setNameModal] = useState<NameModalState | null>(null)
  const [lessonModalChapter, setLessonModalChapter] = useState<CatalogNode | null>(null)

  const dragChapterIdx = useRef<number | null>(null)
  const [dragChapterOver, setDragChapterOver] = useState<number | null>(null)
  const dragLessonKey = useRef<{ chapterId: number; idx: number } | null>(null)
  const [dragLessonOver, setDragLessonOver] = useState<{ chapterId: number; idx: number } | null>(
    null,
  )

  const load = useCallback(async () => {
    if (courseId <= 0) {
      setInfo(emptyInfo(0))
      return
    }
    const data = await getCatalogInfo(courseId)
    setInfo(data)
    setActiveTopicId((prev) => {
      if (prev && data.list.some((t) => t.id === prev)) return prev
      return data.list[0]?.id ?? 0
    })
  }, [courseId])

  useEffect(() => {
    void load()
  }, [load])

  const activeTopic = useMemo(
    () => info?.list.find((t) => t.id === activeTopicId) ?? null,
    [info, activeTopicId],
  )

  /** 已关联录播 id 集合（用于添加弹窗禁选） */
  const linkedLessonIds = useMemo(() => {
    const set = new Set<number>()
    info?.list.forEach((topic) =>
      topic.children.forEach((chapter) =>
        chapter.lessons.forEach((l) => set.add(l.lesson_id)),
      ),
    )
    return set
  }, [info])

  /** 已用过的章节名，作为命名弹窗的历史候选 */
  const usedNames = useMemo(() => {
    const names: string[] = []
    info?.list.forEach((topic) => {
      names.push(topic.name)
      topic.children.forEach((c) => names.push(c.name))
    })
    return Array.from(new Set(names))
  }, [info])

  const toggleCollapse = (id: number) => {
    setCollapsed((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  /* ---------- 目录增删改 ---------- */

  const handleNameSubmit = async (name: string) => {
    if (!nameModal) return
    if (nameModal.mode === 'addTopic') {
      // courseId 为 0（课程尚未保存）时，后端在该请求内自动建下架草稿课程并回传 goods_id
      const resp = await addCatalog(courseId, -1, name)
      if (resp.goods_id && resp.goods_id !== courseId) {
        onCourseCreated?.(resp.goods_id) // 父组件更新 courseId，本组件随 key 变化重挂载并自动 load
        return
      }
    } else if (nameModal.mode === 'addChapter') {
      await addCatalog(courseId, nameModal.parentId ?? activeTopicId, name)
    } else if (nameModal.mode === 'edit' && nameModal.id) {
      await updateCatalog(courseId, nameModal.id, name)
    }
    await load()
  }

  const handleDeleteCatalog = async (node: CatalogNode) => {
    const label = node.level === 1 ? '专题（其下章节与课时将一并移除）' : '章节（其下课时将一并移除）'
    if (!window.confirm(`确定删除${label}「${node.name}」？`)) return
    try {
      await deleteCatalog(courseId, node.id)
      await load()
    } catch (err) {
      window.alert(err instanceof Error ? err.message : '删除失败')
    }
  }

  /* ---------- 课时操作 ---------- */

  const handleToggleTrial = async (lesson: CatalogLesson) => {
    const next = lesson.enable_trial === 1 ? 0 : 1
    try {
      await updateCatalogLesson({ id: lesson.id, enable_trial: next })
      await load()
    } catch (err) {
      window.alert(err instanceof Error ? err.message : '操作失败')
    }
  }

  const handleShowTimeChange = async (lesson: CatalogLesson, value: string) => {
    const ms = inputToMs(value)
    if (!ms) return
    try {
      await updateCatalogLesson({ id: lesson.id, show_time: ms })
      await load()
    } catch (err) {
      window.alert(err instanceof Error ? err.message : '更新失败')
    }
  }

  const handleRemoveLesson = async (lesson: CatalogLesson) => {
    if (!window.confirm(`确定移除录播「${lesson.name}」？`)) return
    try {
      await removeCatalogLesson(courseId, lesson.id)
      await load()
    } catch (err) {
      window.alert(err instanceof Error ? err.message : '移除失败')
    }
  }

  const copyLessonId = (id: number) => {
    void navigator.clipboard?.writeText(String(id)).then(
      () => {},
      () => window.alert('复制失败'),
    )
  }

  /* ---------- 拖拽排序 ---------- */

  const onChapterDrop = async (toIdx: number) => {
    const fromIdx = dragChapterIdx.current
    dragChapterIdx.current = null
    setDragChapterOver(null)
    if (!activeTopic || fromIdx === null || fromIdx === toIdx) return
    const reordered = reorder(activeTopic.children, fromIdx, toIdx)

    // 乐观更新
    setInfo((prev) =>
      prev
        ? {
            ...prev,
            list: prev.list.map((t) =>
              t.id === activeTopic.id ? { ...t, children: reordered } : t,
            ),
          }
        : prev,
    )
    try {
      await sortCatalog(
        courseId,
        reordered.map((c, i) => ({ id: c.id, sort: i + 1 })),
      )
    } catch (err) {
      window.alert(err instanceof Error ? err.message : '排序失败')
      await load()
    }
  }

  const onLessonDrop = async (chapterId: number, toIdx: number) => {
    const drag = dragLessonKey.current
    dragLessonKey.current = null
    setDragLessonOver(null)
    if (!drag || drag.chapterId !== chapterId || drag.idx === toIdx) return

    const applyReorder = (chapter: CatalogNode): CatalogNode => ({
      ...chapter,
      lessons: reorder(chapter.lessons, drag.idx, toIdx),
    })

    let reordered: CatalogLesson[] = []
    setInfo((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        list: prev.list.map((t) =>
          t.id === activeTopicId
            ? {
                ...t,
                children: t.children.map((c) => {
                  if (c.id !== chapterId) return c
                  const next = applyReorder(c)
                  reordered = next.lessons
                  return next
                }),
              }
            : t,
        ),
      }
    })
    try {
      await sortCatalogLessons(
        courseId,
        reordered.map((l, i) => ({ id: l.id, sort: i + 1 })),
      )
    } catch (err) {
      window.alert(err instanceof Error ? err.message : '排序失败')
      await load()
    }
  }

  return (
    <div className="cc-tab">
      {/* 顶部信息栏 */}
      <div className="cc-toolbar">
        <div className="cc-total">
          课程总时长：<strong>{formatDuration(info.total_duration)}</strong>
        </div>
        <label className={`cc-switch ${sortMode ? 'cc-switch--on' : ''}`}>
          <input type="checkbox" checked={sortMode} onChange={(e) => setSortMode(e.target.checked)} />
          <span className="cc-switch__slider" />
          <span className="cc-switch__label">排序</span>
        </label>
      </div>

      {/* 专题 tabs */}
      <div className="cc-topics">
        {info.list.map((topic) => (
          <div
            key={topic.id}
            className={`cc-topic ${topic.id === activeTopicId ? 'cc-topic--active' : ''}`}
            onClick={() => setActiveTopicId(topic.id)}
          >
            <span className="cc-topic__name">{topic.name}</span>
            <button
              className="cc-topic__icon"
              title="编辑"
              onClick={(e) => {
                e.stopPropagation()
                setNameModal({
                  mode: 'edit',
                  id: topic.id,
                  title: '编辑专题',
                  initial: topic.name,
                })
              }}
            >
              <IconEdit width={13} height={13} />
            </button>
            <button
              className="cc-topic__icon cc-topic__icon--del"
              title="删除"
              onClick={(e) => {
                e.stopPropagation()
                void handleDeleteCatalog(topic)
              }}
            >
              <IconClose width={13} height={13} />
            </button>
          </div>
        ))}
        <button
          className="cc-topic cc-topic--add"
          title="添加专题"
          onClick={() =>
            setNameModal({ mode: 'addTopic', title: '添加专题', initial: '' })
          }
        >
          <IconPlus width={16} height={16} />
        </button>
      </div>

      {/* 添加章节 */}
      <div className="cc-add-chapter-bar">
        <button
          className="btn btn--primary"
          disabled={!activeTopic}
          onClick={() =>
            activeTopic &&
            setNameModal({
              mode: 'addChapter',
              parentId: activeTopic.id,
              title: '添加章节',
              initial: '',
            })
          }
        >
          添加章节
        </button>
      </div>

      {/* 章节卡片 */}
      {activeTopic && activeTopic.children.length > 0 ? (
        activeTopic.children.map((chapter, chapterIdx) => {
          const isCollapsed = collapsed.has(chapter.id)
          return (
            <div
              key={chapter.id}
              className={`cc-chapter ${dragChapterOver === chapterIdx ? 'cc-chapter--dragover' : ''}`}
              onDragOver={
                sortMode
                  ? (e) => {
                      e.preventDefault()
                      setDragChapterOver(chapterIdx)
                    }
                  : undefined
              }
              onDrop={sortMode ? () => void onChapterDrop(chapterIdx) : undefined}
            >
              <div
                className="cc-chapter__header"
                draggable={sortMode}
                onDragStart={
                  sortMode
                    ? () => {
                        dragChapterIdx.current = chapterIdx
                      }
                    : undefined
                }
              >
                <button className="cc-chapter__collapse" onClick={() => toggleCollapse(chapter.id)}>
                  {isCollapsed ? (
                    <IconChevronRight width={16} height={16} />
                  ) : (
                    <IconChevronDown width={16} height={16} />
                  )}
                </button>
                <span className="cc-chapter__name">{chapter.name}</span>
                {sortMode && (
                  <span className="cc-chapter__drag" title="拖拽排序">
                    <IconDrag width={16} height={16} />
                  </span>
                )}
                <div className="cc-chapter__actions">
                  <button
                    className="cc-link"
                    onClick={() => setLessonModalChapter(chapter)}
                  >
                    添加录播
                  </button>
                  <button
                    className="cc-link"
                    onClick={() =>
                      setNameModal({
                        mode: 'edit',
                        id: chapter.id,
                        title: '编辑章节',
                        initial: chapter.name,
                      })
                    }
                  >
                    编辑章节
                  </button>
                  <button
                    className="cc-link cc-link--danger"
                    onClick={() => void handleDeleteCatalog(chapter)}
                  >
                    删除
                  </button>
                </div>
              </div>

              {!isCollapsed && (
                <div className="cc-chapter__body">
                  {chapter.lessons.length === 0 ? (
                    <div className="cc-lessons-empty">暂无数据</div>
                  ) : (
                    chapter.lessons.map((lesson, lessonIdx) => (
                      <div
                        key={lesson.id}
                        className={`cc-lesson ${
                          dragLessonOver?.chapterId === chapter.id &&
                          dragLessonOver.idx === lessonIdx
                            ? 'cc-lesson--dragover'
                            : ''
                        }`}
                        draggable={sortMode}
                        onDragStart={
                          sortMode
                            ? () => {
                                dragLessonKey.current = { chapterId: chapter.id, idx: lessonIdx }
                              }
                            : undefined
                        }
                        onDragOver={
                          sortMode
                            ? (e) => {
                                e.preventDefault()
                                setDragLessonOver({ chapterId: chapter.id, idx: lessonIdx })
                              }
                            : undefined
                        }
                        onDrop={
                          sortMode ? () => void onLessonDrop(chapter.id, lessonIdx) : undefined
                        }
                      >
                        <div className="cc-lesson__left">
                          {sortMode && (
                            <span className="cc-lesson__drag">
                              <IconDrag width={15} height={15} />
                            </span>
                          )}
                          <span className="cc-lesson__idx">{lessonIdx + 1}</span>
                          <div className="cc-lesson__info">
                            <div className="cc-lesson__name" title={lesson.name}>
                              {lesson.name}
                            </div>
                            <div className="cc-lesson__meta">
                              <span>{formatDuration(lesson.duration)}</span>
                              <span className="cc-lesson__cat">{lesson.category_name || '-'}</span>
                            </div>
                          </div>
                        </div>
                        <div className="cc-lesson__right">
                          <button
                            className="cc-lesson__id"
                            title="点击复制录播ID"
                            onClick={() => copyLessonId(lesson.lesson_id)}
                          >
                            录播ID: {lesson.lesson_id}
                          </button>
                          <label className="cc-lesson__time">
                            显示时间
                            <input
                              type="datetime-local"
                              className="ce-input cc-lesson__time-input"
                              value={msToInput(lesson.show_time)}
                              onChange={(e) => void handleShowTimeChange(lesson, e.target.value)}
                            />
                          </label>
                          <label
                            className={`cc-switch cc-switch--sm ${
                              lesson.enable_trial === 1 ? 'cc-switch--on' : ''
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={lesson.enable_trial === 1}
                              onChange={() => void handleToggleTrial(lesson)}
                            />
                            <span className="cc-switch__slider" />
                            <span className="cc-switch__label">试听</span>
                          </label>
                          <button
                            className="cc-link"
                            onClick={() =>
                              lesson.video_url && window.open(lesson.video_url, '_blank')
                            }
                            disabled={!lesson.video_url}
                          >
                            播放
                          </button>
                          <button
                            className="cc-link cc-link--danger"
                            onClick={() => void handleRemoveLesson(lesson)}
                          >
                            移除
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )
        })
      ) : (
        <div className="cc-no-chapter">
          <IconInbox width={44} height={44} />
          <p>{activeTopic ? '暂无章节，请点击「添加章节」' : '请先添加专题'}</p>
        </div>
      )}

      {/* 弹窗 */}
      {nameModal && (
        <NameModal
          title={nameModal.title}
          initial={nameModal.initial}
          suggestions={usedNames}
          onClose={() => setNameModal(null)}
          onSubmit={handleNameSubmit}
        />
      )}
      {lessonModalChapter && (
        <AddLessonModal
          goodsId={courseId}
          catalogId={lessonModalChapter.id}
          linkedIds={linkedLessonIds}
          onClose={() => setLessonModalChapter(null)}
          onSuccess={() => {
            setLessonModalChapter(null)
            void load()
          }}
        />
      )}
    </div>
  )
}
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type DragEvent,
  type KeyboardEvent,
} from 'react'

import {
  IconBack,
  IconChevronRight,
  IconDrag,
  IconEdit,
  IconFolder,
  IconFolderLeaf,
  IconInbox,
  IconPlus,
  IconTrash,
} from './Icons'

import {
  createLessonCategory,
  deleteLessonCategory,
  flattenForSort,
  getLessonCategoryList,
  updateLessonCategory,
  updateLessonCategorySort,
  type LessonCategoryTree,
} from '../api/lessonCategory'

/* --------------------------------- 类型 --------------------------------- */

interface LessonCategoryTreeProps {
  /** 收起整个左侧面板 */
  onCollapse: () => void
  /** 选中目录变化（右侧录播列表按目录筛选时使用） */
  onSelect?: (node: LessonCategoryTree | null) => void
}

/** 行内编辑状态：根新增 / 子级新增 / 重命名 */
type EditorState =
  | { kind: 'create-root' }
  | { kind: 'create-child'; parentId: number }
  | { kind: 'edit'; id: number; parentId: number }
  | null

type DropZone = 'before' | 'inside' | 'after'

interface DropHint {
  id: number
  zone: DropZone
}

/* ------------------------------ 纯函数：树操作 ----------------------------- */

function findNode(nodes: LessonCategoryTree[], id: number): LessonCategoryTree | undefined {
  for (const node of nodes) {
    if (node.id === id) return node
    if (node.children?.length) {
      const hit = findNode(node.children, id)
      if (hit) return hit
    }
  }
  return undefined
}

/** targetId 是否为 rootId 自身或其子孙（用于拖拽防环） */
function isSelfOrDescendant(
  nodes: LessonCategoryTree[],
  rootId: number,
  targetId: number,
): boolean {
  const root = findNode(nodes, rootId)
  if (!root) return false
  if (root.id === targetId) return true
  const walk = (list?: LessonCategoryTree[]): boolean =>
    !!list?.some((n) => n.id === targetId || walk(n.children))
  return walk(root.children)
}

/** 找到存放 id 同级节点的数组（根数组或某个 children 引用） */
function findSiblingList(
  nodes: LessonCategoryTree[],
  id: number,
): LessonCategoryTree[] | null {
  if (nodes.some((n) => n.id === id)) return nodes
  for (const node of nodes) {
    if (node.children?.length) {
      const hit = findSiblingList(node.children, id)
      if (hit) return hit
    }
  }
  return null
}

function detachNode(nodes: LessonCategoryTree[], id: number): LessonCategoryTree | null {
  const list = findSiblingList(nodes, id)
  if (!list) return null
  const idx = list.findIndex((n) => n.id === id)
  if (idx < 0) return null
  return list.splice(idx, 1)[0]
}

/**
 * 拖拽移动：
 * - before/after 目标节点 → 成为其同级，插在前/后
 * - inside 目标节点 → 成为其第一个子节点
 * 禁止移动到自身或自己的子孙下。返回是否发生了移动。
 */
function moveNode(
  nodes: LessonCategoryTree[],
  dragId: number,
  targetId: number,
  zone: DropZone,
): boolean {
  if (dragId === targetId) return false
  if (isSelfOrDescendant(nodes, dragId, targetId)) return false

  const dragged = detachNode(nodes, dragId)
  if (!dragged) return false
  dragged.children = dragged.children ?? []

  if (zone === 'inside') {
    const target = findNode(nodes, targetId)
    if (!target) return false
    target.children = [dragged, ...(target.children ?? [])]
    return true
  }

  const siblings = findSiblingList(nodes, targetId)
  if (!siblings) return false
  const idx = siblings.findIndex((n) => n.id === targetId)
  if (idx < 0) return false
  siblings.splice(zone === 'before' ? idx : idx + 1, 0, dragged)
  return true
}

/* --------------------------------- 子组件 -------------------------------- */

function Switch({
  label,
  checked,
  disabled,
  onChange,
}: {
  label: string
  checked: boolean
  disabled?: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <button
      type="button"
      className={`lc-switch ${checked ? 'lc-switch--on' : ''}`}
      disabled={disabled}
      onClick={() => onChange(!checked)}
    >
      <span className="lc-switch__track">
        <span className="lc-switch__thumb" />
      </span>
      <span className="lc-switch__label">{label}</span>
    </button>
  )
}

/* --------------------------------- 主组件 -------------------------------- */

export default function LessonCategoryTree({ onCollapse, onSelect }: LessonCategoryTreeProps) {
  const [tree, setTree] = useState<LessonCategoryTree[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [expanded, setExpanded] = useState<Set<number>>(new Set())
  const [selectedId, setSelectedId] = useState<number | null>(null)

  const [sortMode, setSortMode] = useState(false)
  const [previewMode, setPreviewMode] = useState(false)
  const [savingSort, setSavingSort] = useState(false)
  const sortSnapshot = useRef<LessonCategoryTree[] | null>(null)

  const [editor, setEditor] = useState<EditorState>(null)
  const [inputValue, setInputValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const dragIdRef = useRef<number | null>(null)
  const [dragId, setDragId] = useState<number | null>(null)
  const [dropHint, setDropHint] = useState<DropHint | null>(null)

  const didInit = useRef(false)
  const autoExpanded = useRef(false)

  const reload = useCallback(async () => {
    setLoading(true)
    setLoadError('')
    try {
      const data = await getLessonCategoryList()
      setTree(data)
      // 仅首次加载默认展开所有根节点，之后保留用户的展开/收起状态
      if (!autoExpanded.current) {
        autoExpanded.current = true
        setExpanded(new Set(data.filter((n) => n.children?.length).map((n) => n.id)))
      }
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : '目录加载失败')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (didInit.current) return
    didInit.current = true
    void reload()
  }, [reload])

  // 编辑输入框出现时自动聚焦
  useEffect(() => {
    if (editor) inputRef.current?.focus()
  }, [editor])

  const toggleExpand = (id: number) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleSelect = (node: LessonCategoryTree) => {
    if (sortMode) return
    setSelectedId(node.id)
    onSelect?.(node)
  }

  /* ------------------------------ 新增 / 编辑 ----------------------------- */

  const beginCreateRoot = () => {
    if (previewMode || sortMode) return
    setEditor({ kind: 'create-root' })
    setInputValue('')
  }
  const beginCreateChild = (parent: LessonCategoryTree) => {
    if (previewMode || sortMode) return
    setExpanded((prev) => new Set(prev).add(parent.id))
    setEditor({ kind: 'create-child', parentId: parent.id })
    setInputValue('')
  }
  const beginEdit = (node: LessonCategoryTree) => {
    if (previewMode || sortMode) return
    setEditor({ kind: 'edit', id: node.id, parentId: node.parent_id })
    setInputValue(node.name)
  }
  const cancelEditor = () => {
    setEditor(null)
    setInputValue('')
  }

  const confirmEditor = async () => {
    if (!editor) return
    const name = inputValue.trim()
    if (!name) {
      window.alert('请输入目录名称')
      return
    }
    try {
      if (editor.kind === 'create-root') {
        await createLessonCategory({ name, parent_id: 0 })
      } else if (editor.kind === 'create-child') {
        await createLessonCategory({ name, parent_id: editor.parentId })
        setExpanded((prev) => new Set(prev).add(editor.parentId))
      } else {
        await updateLessonCategory({ id: editor.id, name, parent_id: editor.parentId })
      }
      cancelEditor()
      await reload()
    } catch (err) {
      window.alert(err instanceof Error ? err.message : '保存失败，请重试')
    }
  }

  const handleEditorKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') void confirmEditor()
    if (e.key === 'Escape') cancelEditor()
  }

  /* -------------------------------- 删除 -------------------------------- */

  const handleDelete = (node: LessonCategoryTree) => {
    if (!window.confirm(`确定删除目录「${node.name}」吗？`)) return
    void (async () => {
      try {
        await deleteLessonCategory(node.id)
        if (selectedId === node.id) {
          setSelectedId(null)
          onSelect?.(null)
        }
        await reload()
      } catch (err) {
        window.alert(err instanceof Error ? err.message : '删除失败，请重试')
      }
    })()
  }

  /* -------------------------------- 排序 -------------------------------- */

  const enterSortMode = () => {
    sortSnapshot.current = JSON.parse(JSON.stringify(tree)) as LessonCategoryTree[]
    setEditor(null)
    setSortMode(true)
  }

  const persistSort = async () => {
    setSavingSort(true)
    try {
      await updateLessonCategorySort(flattenForSort(tree))
      setSortMode(false)
      sortSnapshot.current = null
      await reload()
    } catch (err) {
      // 保存失败：回滚本地顺序并保持排序模式，便于用户重试
      if (sortSnapshot.current) setTree(sortSnapshot.current)
      window.alert(err instanceof Error ? err.message : '排序保存失败，请重试')
    } finally {
      setSavingSort(false)
    }
  }

  const handleSortToggle = (checked: boolean) => {
    if (checked) enterSortMode()
    else void persistSort()
  }

  const handlePreviewToggle = (checked: boolean) => {
    setPreviewMode(checked)
    if (checked) setEditor(null)
  }

  /* ------------------------------ 拖拽处理 ------------------------------- */

  const zoneFromEvent = (e: DragEvent<HTMLDivElement>): DropZone => {
    const rect = e.currentTarget.getBoundingClientRect()
    const ratio = (e.clientY - rect.top) / rect.height
    if (ratio < 0.32) return 'before'
    if (ratio > 0.68) return 'after'
    return 'inside'
  }

  const handleDragStart = (e: DragEvent<HTMLDivElement>, node: LessonCategoryTree) => {
    if (!sortMode) {
      e.preventDefault()
      return
    }
    dragIdRef.current = node.id
    setDragId(node.id)
    e.dataTransfer.effectAllowed = 'move'
    try {
      e.dataTransfer.setData('text/plain', String(node.id))
    } catch {
      /* 部分浏览器对 setData 无要求，拖拽仍可用 */
    }
  }

  const handleDragOver = (e: DragEvent<HTMLDivElement>, node: LessonCategoryTree) => {
    const activeId = dragIdRef.current
    if (!sortMode || activeId == null) return
    // 始终阻止冒泡：否则父行也会处理同一事件，覆盖掉子行的放置位置判定
    e.stopPropagation()
    if (activeId === node.id || isSelfOrDescendant(tree, activeId, node.id)) {
      setDropHint(null)
      return
    }
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    const zone = zoneFromEvent(e)
    setDropHint((prev) =>
      prev && prev.id === node.id && prev.zone === zone ? prev : { id: node.id, zone },
    )
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>, node: LessonCategoryTree) => {
    e.preventDefault()
    e.stopPropagation()
    const activeId = dragIdRef.current
    const hint = dropHint
    dragIdRef.current = null
    setDragId(null)
    setDropHint(null)
    if (activeId == null || !hint) return
    const draft = JSON.parse(JSON.stringify(tree)) as LessonCategoryTree[]
    if (moveNode(draft, activeId, node.id, hint.zone)) {
      if (hint.zone === 'inside') {
        setExpanded((prev) => new Set(prev).add(node.id))
      }
      setTree(draft)
    }
  }

  const handleDragEnd = () => {
    dragIdRef.current = null
    setDragId(null)
    setDropHint(null)
  }

  /* -------------------------------- 渲染 -------------------------------- */

  const renderEditor = (depth: number, autoFocusKey: string) => (
    <div className="lc-row lc-row--editing" style={{ paddingLeft: 10 + depth * 22 }}>
      <span className="lc-row__ghost" />
      <input
        key={autoFocusKey}
        ref={inputRef}
        className="lc-row__input"
        value={inputValue}
        maxLength={50}
        placeholder="请输入目录名称"
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleEditorKeyDown}
      />
      <span className="lc-row__confirm" onClick={() => void confirmEditor()}>
        确定
      </span>
      <span className="lc-row__cancel" onClick={cancelEditor}>
        取消
      </span>
    </div>
  )

  const renderNodes = (nodes: LessonCategoryTree[], depth: number) =>
    nodes.flatMap((node) => {
      const hasChildren = !!node.children?.length
      const isOpen = expanded.has(node.id)
      const isEditing = editor?.kind === 'edit' && editor.id === node.id
      const showActions = !sortMode && !previewMode && !isEditing
      const hint = dropHint?.id === node.id ? dropHint.zone : null

      const rows = [
        <div
          key={node.id}
          className={[
            'lc-row',
            selectedId === node.id ? 'lc-row--selected' : '',
            sortMode && dragId === node.id ? 'lc-row--dragging' : '',
            hint === 'before' ? 'lc-row--drop-before' : '',
            hint === 'after' ? 'lc-row--drop-after' : '',
            hint === 'inside' ? 'lc-row--drop-inside' : '',
          ]
            .filter(Boolean)
            .join(' ')}
          style={{ paddingLeft: 10 + depth * 22 }}
          draggable={sortMode}
          onDragStart={(e) => handleDragStart(e, node)}
          onDragOver={(e) => handleDragOver(e, node)}
          onDrop={(e) => handleDrop(e, node)}
          onDragEnd={handleDragEnd}
          onClick={() => handleSelect(node)}
        >
          {sortMode && (
            <span className="lc-row__drag" title="拖拽排序">
              <IconDrag width={14} height={14} />
            </span>
          )}

          {hasChildren ? (
            <button
              type="button"
              className="lc-row__caret"
              onClick={(e) => {
                e.stopPropagation()
                toggleExpand(node.id)
              }}
              title={isOpen ? '收起' : '展开'}
            >
              <IconChevronRight
                width={14}
                height={14}
                style={{ transform: isOpen ? 'rotate(90deg)' : 'none' }}
              />
            </button>
          ) : (
            <span className="lc-row__caret lc-row__caret--leaf" />
          )}

          <span className="lc-row__folder">
            {hasChildren ? <IconFolder width={16} height={16} /> : <IconFolderLeaf width={16} height={16} />}
          </span>

          {isEditing ? (
            <>
              <input
                key="edit-input"
                ref={inputRef}
                className="lc-row__input"
                value={inputValue}
                maxLength={50}
                onChange={(e) => setInputValue(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                onKeyDown={handleEditorKeyDown}
              />
              <span
                className="lc-row__confirm"
                onClick={(e) => {
                  e.stopPropagation()
                  void confirmEditor()
                }}
              >
                确定
              </span>
              <span
                className="lc-row__cancel"
                onClick={(e) => {
                  e.stopPropagation()
                  cancelEditor()
                }}
              >
                取消
              </span>
            </>
          ) : (
            <>
              <span className="lc-row__name" title={node.name}>
                {node.name}
              </span>
              {showActions && (
                <span className="lc-row__actions">
                  <button
                    type="button"
                    title="新增子目录"
                    onClick={(e) => {
                      e.stopPropagation()
                      beginCreateChild(node)
                    }}
                  >
                    <IconPlus width={15} height={15} />
                  </button>
                  <button
                    type="button"
                    title="重命名"
                    onClick={(e) => {
                      e.stopPropagation()
                      beginEdit(node)
                    }}
                  >
                    <IconEdit width={15} height={15} />
                  </button>
                  <button
                    type="button"
                    className="lc-row__action-danger"
                    title="删除"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDelete(node)
                    }}
                  >
                    <IconTrash width={15} height={15} />
                  </button>
                </span>
              )}
            </>
          )}
        </div>,
      ]

      if (editor?.kind === 'create-child' && editor.parentId === node.id) {
        rows.push(
          <div key={`create-child-${node.id}`}>{renderEditor(depth + 1, `child-${node.id}`)}</div>,
        )
      }
      if (hasChildren && isOpen) {
        rows.push(
          <div key={`children-${node.id}`} className="lc-children">
            {renderNodes(node.children!, depth + 1)}
          </div>,
        )
      }
      return rows
    })

  const readOnly = previewMode || sortMode

  return (
    <div className="lc">
      <div className="lc-header">
        <span className="lc-header__title">录播目录</span>
        <div className="lc-header__ops">
          <Switch label="排序" checked={sortMode} disabled={previewMode || savingSort} onChange={handleSortToggle} />
          <Switch label="预览" checked={previewMode} disabled={sortMode || savingSort} onChange={handlePreviewToggle} />
          <button type="button" className="lc-header__collapse" title="收起目录" onClick={onCollapse}>
            <IconBack width={15} height={15} />
          </button>
        </div>
      </div>

      <div className="lc-body">
        {!readOnly && (
          <button type="button" className="lc-add" onClick={beginCreateRoot}>
            <IconPlus width={15} height={15} />
            新增目录
          </button>
        )}

        {editor?.kind === 'create-root' && renderEditor(0, 'create-root')}

        <div className="lc-tree">
          {loading ? (
            <div className="lc-state">加载中…</div>
          ) : loadError ? (
            <div className="lc-state lc-state--error">
              <IconInbox width={40} height={40} />
              <span>{loadError}</span>
              <button type="button" className="btn" onClick={() => void reload()}>
                重新加载
              </button>
            </div>
          ) : tree.length === 0 ? (
            <div className="lc-state">
              <IconInbox width={40} height={40} />
              <span>暂无数据</span>
            </div>
          ) : (
            renderNodes(tree, 0)
          )}
        </div>

        {sortMode && <div className="lc-sort-tip">{savingSort ? '正在保存…' : '拖拽目录调整层级与顺序，关闭「排序」后自动保存'}</div>}
      </div>
    </div>
  )
}

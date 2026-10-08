import { request } from './request'

const API_PREFIX = '/api/mall/admin/v1/lesson/category'

/** 录播目录（与后端 dto.LessonCategoryDto 对齐，snake_case） */
export interface LessonCategory {
  id: number
  name: string
  /** 父目录 ID，0 表示根节点 */
  parent_id: number
  /** 同级排序值，越小越靠前 */
  sort: number
  /** 层级，根节点为 1 */
  level: number
}

/** 目录树节点 */
export interface LessonCategoryTree extends LessonCategory {
  children?: LessonCategoryTree[]
}

/** 排序 / 移动入参单项：sort 为同级序号（从 0 开始），level 由后端重算 */
export interface CategorySortItem {
  id: number
  parent_id: number
  sort: number
}

interface ListResp {
  total: number
  list: LessonCategory[]
}

/** 将后端扁平列表按 parent_id 组树，并按 sort 升序排列（兼容 0/-1 根节点） */
export function buildCategoryTree(list: LessonCategory[]): LessonCategoryTree[] {
  const map = new Map<number, LessonCategoryTree>()
  list.forEach((item) => map.set(item.id, { ...item, children: undefined }))

  const roots: LessonCategoryTree[] = []
  map.forEach((node) => {
    const pid = node.parent_id
    if (pid > 0 && map.has(pid)) {
      const parent = map.get(pid)!
      ;(parent.children ??= []).push(node)
    } else {
      roots.push(node)
    }
  })

  const sortRec = (nodes: LessonCategoryTree[]) => {
    nodes.sort((a, b) => a.sort - b.sort || a.id - b.id)
    nodes.forEach((n) => n.children && sortRec(n.children))
  }
  sortRec(roots)
  return roots
}

/** 深度优先摊平为排序接口入参（sort 取同级下标） */
export function flattenForSort(nodes: LessonCategoryTree[]): CategorySortItem[] {
  const out: CategorySortItem[] = []
  const walk = (list: LessonCategoryTree[], parentId: number) => {
    list.forEach((node, index) => {
      out.push({ id: node.id, parent_id: parentId, sort: index })
      if (node.children?.length) walk(node.children, node.id)
    })
  }
  walk(nodes, 0)
  return out
}

/**
 * 目录列表（全量扁平数据，前端组树）
 * GET /api/mall/admin/v1/lesson/category/list
 */
export async function getLessonCategoryList(name?: string): Promise<LessonCategoryTree[]> {
  const query = name?.trim() ? `?name=${encodeURIComponent(name.trim())}` : ''
  const data = await request<ListResp>(`${API_PREFIX}/list${query}`, { method: 'GET' })
  return buildCategoryTree(data.list ?? [])
}

/**
 * 新增目录
 * POST /api/mall/admin/v1/lesson/category/create
 */
export async function createLessonCategory(body: {
  name: string
  parent_id: number
}): Promise<number> {
  const data = await request<{ id: number }>(`${API_PREFIX}/create`, {
    method: 'POST',
    body: JSON.stringify(body),
  })
  return data.id
}

/**
 * 编辑目录（重命名 / 移动）
 * POST /api/mall/admin/v1/lesson/category/update
 */
export async function updateLessonCategory(body: {
  id: number
  name: string
  parent_id: number
}): Promise<void> {
  await request<void>(`${API_PREFIX}/update`, {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

/**
 * 删除目录（存在子目录 / 录播内容时后端拒绝）
 * POST /api/mall/admin/v1/lesson/category/delete
 */
export async function deleteLessonCategory(id: number): Promise<void> {
  await request<void>(`${API_PREFIX}/delete`, {
    method: 'POST',
    body: JSON.stringify({ id }),
  })
}

/**
 * 批量保存目录排序 / 层级
 * POST /api/mall/admin/v1/lesson/category/sort
 */
export async function updateLessonCategorySort(list: CategorySortItem[]): Promise<void> {
  await request<void>(`${API_PREFIX}/sort`, {
    method: 'POST',
    body: JSON.stringify({ list }),
  })
}

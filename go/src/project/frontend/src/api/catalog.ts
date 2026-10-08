import { request } from './request'

const API_PREFIX = '/api/mall/admin/v1/course/catalog'

/** 章节下的录播课时（与后端 dto.CatalogLessonDto 对齐） */
export interface CatalogLesson {
  id: number // course_lessons.id
  lesson_id: number
  name: string
  duration: number
  category_name: string
  video_url: string
  enable_trial: number // 1:试听 0:完整
  sort: number
  show_time: number // 毫秒时间戳
}

/** 课程目录节点：level 1 为专题，children 为章节；课时挂在章节的 lessons */
export interface CatalogNode {
  id: number
  parent_id: number
  level: number
  name: string
  sort: number
  children: CatalogNode[]
  lessons: CatalogLesson[]
}

export interface CatalogInfo {
  goods_id: number
  total_duration: number
  list: CatalogNode[]
}

export interface SortItem {
  id: number
  sort: number
}

/** 获取课程目录树（含课时信息） */
export async function getCatalogInfo(goodsId: number): Promise<CatalogInfo> {
  return request<CatalogInfo>(`${API_PREFIX}/info?goods_id=${goodsId}`, { method: 'GET' })
}

/** 新增目录：parentId 传 -1 为专题，传专题 id 为章节。
 *  goodsId 传 0 表示课程尚未创建，后端会自动建一条下架草稿课程并回传 goods_id */
export async function addCatalog(
  goodsId: number,
  parentId: number,
  name: string,
): Promise<{ id: number; goods_id: number }> {
  return request<{ id: number; goods_id: number }>(`${API_PREFIX}/add`, {
    method: 'POST',
    body: JSON.stringify({ goods_id: goodsId, parent_id: parentId, name }),
  })
}

/** 重命名目录 */
export async function updateCatalog(
  goodsId: number,
  id: number,
  name: string,
): Promise<void> {
  await request<void>(`${API_PREFIX}/update`, {
    method: 'POST',
    body: JSON.stringify({ goods_id: goodsId, id, name }),
  })
}

/** 删除目录（专题级联删除章节与课时关联） */
export async function deleteCatalog(goodsId: number, id: number): Promise<void> {
  await request<void>(`${API_PREFIX}/delete`, {
    method: 'POST',
    body: JSON.stringify({ goods_id: goodsId, id }),
  })
}

/** 目录排序 */
export async function sortCatalog(goodsId: number, list: SortItem[]): Promise<void> {
  await request<void>(`${API_PREFIX}/sort`, {
    method: 'POST',
    body: JSON.stringify({ goods_id: goodsId, list }),
  })
}

/** 向章节批量添加录播 */
export async function addCatalogLessons(
  goodsId: number,
  catalogId: number,
  lessonIds: number[],
): Promise<void> {
  await request<void>(`${API_PREFIX}/add_lesson`, {
    method: 'POST',
    body: JSON.stringify({
      goods_id: goodsId,
      catalog_id: catalogId,
      lesson_ids: lessonIds,
    }),
  })
}

/** 移除章节下的录播 */
export async function removeCatalogLesson(goodsId: number, id: number): Promise<void> {
  await request<void>(`${API_PREFIX}/remove_lesson`, {
    method: 'POST',
    body: JSON.stringify({ goods_id: goodsId, id }),
  })
}

/** 更新课时（试听开关 / 显示时间 / 排序），仅传需要更新的字段 */
export async function updateCatalogLesson(payload: {
  id: number
  enable_trial?: number
  show_time?: number
  sort?: number
}): Promise<void> {
  await request<void>(`${API_PREFIX}/update_lesson`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

/** 章节内录播排序 */
export async function sortCatalogLessons(
  goodsId: number,
  list: SortItem[],
): Promise<void> {
  await request<void>(`${API_PREFIX}/sort_lesson`, {
    method: 'POST',
    body: JSON.stringify({ goods_id: goodsId, list }),
  })
}

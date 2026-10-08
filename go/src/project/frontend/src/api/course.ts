import { request } from './request'

const API_PREFIX = '/api/mall/admin/v1/course'

/** 课程（与后端 dto.CourseDto 对齐） */
export interface Course {
  id: number
  name: string
  cover_key: string
  cover_url: string
  detail_cover_key: string
  detail: string
  course_price: number
  service_time: number
  status: number // 1:正常 -1:禁用
  features: string[]
  create_by: number
  create_by_name: string
  create_at: number
  update_by: number
  update_by_name: string
  update_at: number
}

export interface CourseListParams {
  id?: number
  name?: string
  status?: number
  page?: number
  page_size?: number
}

export interface CourseListResp {
  total: number
  list: Course[]
}

export interface CourseSavePayload {
  id?: number
  name: string
  cover_key: string
  detail_cover_key: string
  detail: string
  course_price: number
  service_time: number
  status?: number
  features: string[]
}

/** 课程列表 */
export async function getCourseList(params: CourseListParams = {}): Promise<CourseListResp> {
  const search = new URLSearchParams()
  if (params.id) search.set('id', String(params.id))
  if (params.name?.trim()) search.set('name', params.name.trim())
  if (params.status) search.set('status', String(params.status))
  if (params.page) search.set('page', String(params.page))
  if (params.page_size) search.set('page_size', String(params.page_size))
  const query = search.toString()
  return request<CourseListResp>(`${API_PREFIX}/list${query ? `?${query}` : ''}`, {
    method: 'GET',
  })
}

/** 新增课程，返回新 ID */
export async function createCourse(body: CourseSavePayload): Promise<number> {
  const data = await request<{ id: number }>(`${API_PREFIX}/create`, {
    method: 'POST',
    body: JSON.stringify(body),
  })
  return data.id
}

/** 编辑课程 */
export async function updateCourse(body: CourseSavePayload): Promise<void> {
  await request<void>(`${API_PREFIX}/update`, {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

/** 上架 / 下架 */
export async function updateCourseStatus(id: number, status: number): Promise<void> {
  await request<void>(`${API_PREFIX}/status`, {
    method: 'POST',
    body: JSON.stringify({ id, status }),
  })
}

/** 删除课程 */
export async function deleteCourse(id: number): Promise<void> {
  await request<void>(`${API_PREFIX}/delete`, {
    method: 'POST',
    body: JSON.stringify({ id }),
  })
}

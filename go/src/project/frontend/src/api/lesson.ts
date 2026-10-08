import { request } from './request'

const API_PREFIX = '/api/mall/admin/v1/lesson'
const STORAGE_PREFIX = '/api/mall/admin/v1/storage'

/** 课时章节（时间轴分割节点），begin/end 单位：秒 */
export interface LessonChapter {
  name: string
  begin: number
  end: number
}

export interface Attachment {
  origin_name: string
  file_key: string
}

/** 录播课时（与后端 dto.LessonDto 对齐） */
export interface Lesson {
  id: number
  name: string
  intro: string
  category_id: number
  category_name: string
  video_key: string
  video_url: string
  video_file_name: string
  duration: number
  status: number // 1: 上架 -1: 下架
  attachments: Attachment[]
  chapters: LessonChapter[]
  create_by: number
  create_by_name: string
  update_by_name: string
  create_at: number
  update_at: number
}

export interface LessonListParams {
  id?: number
  name?: string
  category_id?: number
  update_start?: number
  update_end?: number
  create_start?: number
  create_end?: number
  page?: number
  page_size?: number
}

export interface LessonListResp {
  total: number
  list: Lesson[]
}

export interface LessonSavePayload {
  id?: number
  name: string
  intro: string
  category_id: number
  video_key: string
  video_file_name: string
  duration: number
  chapters: LessonChapter[]
  attachments: Attachment[]
}

/** 上传文件响应 */
export interface UploadResult {
  scene: string
  key: string
  url: string
  file_name: string
  file_size: number
}

/** 录播列表 */
export async function getLessonList(params: LessonListParams = {}): Promise<LessonListResp> {
  const search = new URLSearchParams()
  if (params.id) search.set('id', String(params.id))
  if (params.name?.trim()) search.set('name', params.name.trim())
  if (params.category_id) search.set('category_id', String(params.category_id))
  if (params.page) search.set('page', String(params.page))
  if (params.page_size) search.set('page_size', String(params.page_size))
  if (params.update_start) search.set('update_start', String(params.update_start))
  if (params.update_end) search.set('update_end', String(params.update_end))
  if (params.create_start) search.set('create_start', String(params.create_start))
  if (params.create_end) search.set('create_end', String(params.create_end))
  const query = search.toString()
  return request<LessonListResp>(`${API_PREFIX}/list${query ? `?${query}` : ''}`, {
    method: 'GET',
  })
}

/** 新增录播，返回新 ID */
export async function createLesson(body: LessonSavePayload): Promise<number> {
  const data = await request<{ id: number }>(`${API_PREFIX}/create`, {
    method: 'POST',
    body: JSON.stringify(body),
  })
  return data.id
}

/** 编辑录播 */
export async function updateLesson(body: LessonSavePayload): Promise<void> {
  await request<void>(`${API_PREFIX}/update`, {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

/** 上架 / 下架 */
export async function updateLessonStatus(id: number, status: number): Promise<void> {
  await request<void>(`${API_PREFIX}/status`, {
    method: 'POST',
    body: JSON.stringify({ id, status }),
  })
}

/** 移动录播到指定目录 */
export async function moveLesson(id: number, categoryId: number): Promise<void> {
  await request<void>(`${API_PREFIX}/move`, {
    method: 'POST',
    body: JSON.stringify({ id, category_id: categoryId }),
  })
}

/** 删除录播 */
export async function deleteLesson(id: number): Promise<void> {
  await request<void>(`${API_PREFIX}/delete`, {
    method: 'POST',
    body: JSON.stringify({ id }),
  })
}

const BASE_URL: string = import.meta.env.VITE_API_BASE_URL ?? ''

/**
 * 上传文件到 COS：
 * 1. 调后端 /storage/tempsecret 获取 PUT 预签名 URL（file_url）与对象 key；
 * 2. 直接 PUT 文件到预签名 URL（需携带与签名一致的 Content-Type）；
 * 3. 返回对象 key 与访问地址 access_url（GET 预签名，过期时间由 expireHours 控制，默认 2 小时）。
 * @param expireHours access_url 过期小时数，0/不传默认 2 小时；富文本图片传 8760（1 年）
 */
export function uploadFile(
  file: File,
  scene: string,
  onProgress?: (percent: number) => void,
  expireHours = 0,
): Promise<UploadResult> {
  return new Promise((resolve, reject) => {
    // 第一步：获取预签名上传 URL
    fetch(`${BASE_URL}${STORAGE_PREFIX}/tempsecret`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        token: localStorage.getItem('mall_admin_token') ?? '',
      },
      body: JSON.stringify({
        scene,
        file_name: file.name,
        file_size: file.size,
        file_type: file.type || 'application/octet-stream',
        client_ip: '',
        expire_hours: expireHours,
      }),
    })
      .then(async (resp) => {
        const body = (await resp.json()) as {
          code: number
          msg: string
          err_msg: string
          data: {
            key: string
            file_url: string
            access_url: string
            security_token: string
            secret_id: string
            secret_key: string
            expired_time: number
            start_time: number
            bucket: string
            region: string
          }
        }
        if (body.code !== 200) {
          reject(new Error(body.err_msg || body.msg || '获取上传凭证失败'))
          return
        }
        if (!body.data?.file_url) {
          reject(new Error('上传凭证返回异常'))
          return
        }
        // 第二步：PUT 直传 COS。
        // 后端已用主密钥生成完整的 PUT 预签名 URL（query 中带签名），
        // 前端只需设置与签名一致的 Content-Type，无需再手动加 Authorization / x-cos-security-token。
        const xhr = new XMLHttpRequest()
        xhr.open('PUT', body.data.file_url)
        xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream')

        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable && onProgress) {
            onProgress(Math.round((e.loaded / e.total) * 100))
          }
        }
        xhr.onload = () => {
          if (xhr.status < 200 || xhr.status >= 300) {
            reject(new Error(`上传失败（${xhr.status}）`))
            return
          }
          resolve({
            scene,
            key: body.data.key,
            url: body.data.access_url,
            file_name: file.name,
            file_size: file.size,
          })
        }
        xhr.onerror = () => reject(new Error('网络异常，上传失败'))
        xhr.send(file)
      })
      .catch((err) => reject(err instanceof Error ? err : new Error('获取上传凭证失败')))
  })
}
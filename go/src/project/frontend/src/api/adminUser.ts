import { request } from './request'

/**
 * 管理员模块是否使用内置 Mock。
 * 后端接口就绪后置 VITE_USE_ADMIN_USER_MOCK=false。
 */
const USE_MOCK: boolean =
  String(import.meta.env.VITE_USE_ADMIN_USER_MOCK ?? 'true') !== 'false'

const API_PREFIX = '/api/mall/admin/v1/user'
const ROLE_API_PREFIX = '/api/mall/admin/v1/role'

/** 性别：1 男 / 2 女 / 3 未知 */
export const Sex = { Male: 1, Female: 2, Unknown: 3 } as const

/** 状态：1 启用 / -1 禁用 */
export const UserStatus = { Enable: 1, Disable: -1 } as const

/** 角色项 */
export interface RoleItem {
  id: number
  name: string
}

/** 管理员列表项（与后端 dto.ListUserItem 对齐，snake_case） */
export interface AdminUser {
  user_id: number
  name: string
  nick_name: string
  mobile: string
  sex: number
  status: number
  role_ids: RoleItem[]
  create_at: number
}

/** 列表查询参数 */
export interface ListUserParams {
  name?: string
  nick_name?: string
  mobile?: string
  status?: number
  page?: number
  page_size?: number
}

/** 列表响应 */
export interface ListUserResp {
  list: AdminUser[]
  total: number
}

/** 创建管理员入参 */
export interface CreateUserReq {
  name: string
  nick_name: string
  mobile: string
  sex: number
  role_ids: number[]
}

/** 编辑管理员入参（与后端 dto.UpdateUserReq 对齐，不含 mobile/status） */
export interface UpdateUserReq {
  id: number
  name: string
  nick_name: string
  sex: number
  role_ids: number[]
}

/** 角色（精简为 id + name） */
export interface Role {
  id: number
  name: string
}

/** 性别文案 */
export const sexText = (sex: number): string => {
  if (sex === Sex.Male) return '男'
  if (sex === Sex.Female) return '女'
  return '未知'
}

/** 状态文案 */
export const statusText = (status: number): string =>
  status === UserStatus.Enable ? '启用' : '禁用'

const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

/** Mock 角色列表 */
const MOCK_ROLES: Role[] = [
  { id: 1, name: '订单专员1' },
  { id: 2, name: '订单专员2' },
  { id: 3, name: '运营管理员' },
  { id: 4, name: '超级管理员' },
]

/** Mock 管理员数据（对应设计图） */
const MOCK_USERS: AdminUser[] = [
  {
    user_id: 1,
    name: '唐',
    nick_name: '唐老鸭',
    mobile: '19158013085',
    sex: Sex.Male,
    status: UserStatus.Enable,
    role_ids: [{ id: 1, name: '订单专员1' }],
    create_at: new Date('2025-11-24T19:25:08').getTime(),
  },
  {
    user_id: 2,
    name: '大秦',
    nick_name: '大秦的勤',
    mobile: '18529533919',
    sex: Sex.Unknown,
    status: UserStatus.Enable,
    role_ids: [
      { id: 1, name: '订单专员1' },
      { id: 2, name: '订单专员2' },
    ],
    create_at: new Date('2025-11-21T12:18:45').getTime(),
  },
]

/** 角色选项：优先调后端 GET /v1/role/list，失败回退 mock */
export async function getRoleList(): Promise<Role[]> {
  if (USE_MOCK) {
    await delay(100)
    return MOCK_ROLES
  }
  try {
    const resp = await request<{ list: Array<{ id: number; name: string }> }>(
      `${ROLE_API_PREFIX}/list?page=1&page_size=100`,
      { method: 'GET' },
    )
    return (resp?.list ?? []).map((r) => ({ id: r.id, name: r.name }))
  } catch {
    return MOCK_ROLES
  }
}

/** 管理员列表 */
export async function getUserList(params: ListUserParams): Promise<ListUserResp> {
  if (USE_MOCK) {
    await delay(150)
    let list = [...MOCK_USERS]
    if (params.name) list = list.filter((u) => u.name.includes(params.name!))
    if (params.nick_name) list = list.filter((u) => u.nick_name.includes(params.nick_name!))
    if (params.mobile) list = list.filter((u) => u.mobile.includes(params.mobile!))
    if (params.status) list = list.filter((u) => u.status === params.status)
    const total = list.length
    const page = params.page ?? 1
    const pageSize = params.page_size ?? 10
    list = list.slice((page - 1) * pageSize, page * pageSize)
    return { list, total }
  }

  const qs = new URLSearchParams()
  if (params.name) qs.set('name', params.name)
  if (params.nick_name) qs.set('nick_name', params.nick_name)
  if (params.mobile) qs.set('mobile', params.mobile)
  if (params.status) qs.set('status', String(params.status))
  qs.set('page', String(params.page ?? 1))
  qs.set('page_size', String(params.page_size ?? 10))

  const resp = await request(`${API_PREFIX}/list?${qs.toString()}`, { method: 'GET' })
  return resp as ListUserResp
}

/** 创建管理员 */
export async function createAdminUser(req: CreateUserReq): Promise<{ id: number }> {
  if (USE_MOCK) {
    await delay(150)
    const id = Math.max(0, ...MOCK_USERS.map((u) => u.user_id)) + 1
    MOCK_USERS.unshift({
      user_id: id,
      name: req.name,
      nick_name: req.nick_name,
      mobile: req.mobile,
      sex: req.sex,
      status: UserStatus.Enable,
      role_ids: req.role_ids.map((rid) => {
        const r = MOCK_ROLES.find((x) => x.id === rid)
        return { id: rid, name: r?.name ?? String(rid) }
      }),
      create_at: Date.now(),
    })
    return { id }
  }
  const resp = await request(`${API_PREFIX}/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  })
  return resp as { id: number }
}

/** 编辑管理员（后端 UpdateUserReq 不支持改 mobile/status） */
export async function updateAdminUser(req: UpdateUserReq): Promise<void> {
  if (USE_MOCK) {
    await delay(150)
    const idx = MOCK_USERS.findIndex((u) => u.user_id === req.id)
    if (idx >= 0) {
      const old = MOCK_USERS[idx]
      MOCK_USERS[idx] = {
        ...old,
        name: req.name,
        nick_name: req.nick_name,
        sex: req.sex,
        role_ids: req.role_ids.map((rid) => {
          const r = MOCK_ROLES.find((x) => x.id === rid)
          return { id: rid, name: r?.name ?? String(rid) }
        }),
      }
    }
    return
  }
  await request(`${API_PREFIX}/update`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  })
}

import { getAllPerms, type PermissionTree } from './permission'
import { request } from './request'

/**
 * 角色模块是否使用内置 Mock。
 * 后端 role 接口就绪后置 VITE_USE_ROLE_MOCK=false。
 */
const USE_MOCK: boolean =
  String(import.meta.env.VITE_USE_ROLE_MOCK ?? 'true') !== 'false'

const API_PREFIX = '/api/mall/admin/v1/role'

/** 状态：1 启用 / -1 禁用 */
export const RoleStatus = { Enable: 1, Disable: -1 } as const

/** 角色 */
export interface Role {
  id: number
  name: string
  desc: string
  status: number
  create_at: number
  update_at: number
  perms: PermissionTree[]
}

/** 角色列表查询参数 */
export interface ListRoleParams {
  name?: string
  status?: number
  page?: number
  page_size?: number
}

/** 列表响应 */
export interface ListRoleResp {
  list: Role[]
  total: number
}

/** 创建/更新角色入参 */
export interface SaveRoleReq {
  id?: number
  name: string
  desc: string
  status: number
}

/** 角色权限配置：角色已勾选的权限 ID 集合 */
export interface RolePermSets {
  role_id: number
  perm_ids: number[]
}

const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

/** Mock 角色数据 */
const MOCK_ROLES: Role[] = [
  {
    id: 1,
    name: '订单专员1',
    desc: '订单专员',
    status: RoleStatus.Enable,
    create_at: new Date('2025-11-20T10:00:00').getTime(),
    update_at: new Date('2025-11-20T10:00:00').getTime(),
    perms: [],
  },
  {
    id: 2,
    name: '订单专员2',
    desc: '',
    status: RoleStatus.Enable,
    create_at: new Date('2025-11-22T14:30:00').getTime(),
    update_at: new Date('2025-11-22T14:30:00').getTime(),
    perms: [],
  },
]

/** Mock 角色已分配的权限 ID（role_id -> perm_ids） */
const MOCK_ROLE_PERMS: Record<number, number[]> = {
  1: [1, 2],
  2: [1, 2],
}

/** 状态文案 */
export const roleStatusText = (status: number): string =>
  status === RoleStatus.Enable ? '启用' : '禁用'

/** 角色列表 */
export async function getRoleList(params: ListRoleParams): Promise<ListRoleResp> {
  if (USE_MOCK) {
    await delay(150)
    let list = [...MOCK_ROLES]
    if (params.name) list = list.filter((r) => r.name.includes(params.name!))
    if (params.status) list = list.filter((r) => r.status === params.status)
    const total = list.length
    const page = params.page ?? 1
    const pageSize = params.page_size ?? 10
    list = list.slice((page - 1) * pageSize, page * pageSize)
    return { list, total }
  }
  const qs = new URLSearchParams()
  if (params.name) qs.set('name', params.name)
  if (params.status) qs.set('status', String(params.status))
  qs.set('page', String(params.page ?? 1))
  qs.set('page_size', String(params.page_size ?? 10))
  const resp = await request(`${API_PREFIX}/list?${qs.toString()}`, { method: 'GET' })
  return resp as ListRoleResp
}

/** 创建角色 */
export async function createRole(req: SaveRoleReq): Promise<{ id: number }> {
  if (USE_MOCK) {
    await delay(150)
    const id = Math.max(0, ...MOCK_ROLES.map((r) => r.id)) + 1
    MOCK_ROLES.unshift({ id, name: req.name, desc: req.desc, status: req.status, create_at: Date.now(), update_at: Date.now(), perms: [] })
    return { id }
  }
  const resp = await request(`${API_PREFIX}/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  })
  return resp as { id: number }
}

/** 更新角色 */
export async function updateRole(req: SaveRoleReq): Promise<void> {
  if (USE_MOCK) {
    await delay(150)
    const idx = MOCK_ROLES.findIndex((r) => r.id === req.id)
    if (idx >= 0) {
      MOCK_ROLES[idx] = { ...MOCK_ROLES[idx], name: req.name, desc: req.desc, status: req.status }
    }
    return
  }
  await request(`${API_PREFIX}/update`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  })
}

/** 获取角色已分配的权限 ID（GET /v1/role/perm/sets） */
export async function getRolePermSets(roleId: number): Promise<RolePermSets> {
  if (USE_MOCK) {
    await delay(100)
    return { role_id: roleId, perm_ids: MOCK_ROLE_PERMS[roleId] ?? [] }
  }
  const resp = await request(`${API_PREFIX}/perm/sets?role_id=${roleId}`, { method: 'GET' })
  return resp as RolePermSets
}

/** 保存角色权限配置（POST /v1/role/perm/sets） */
export async function setRolePermSets(roleId: number, permIds: number[]): Promise<void> {
  if (USE_MOCK) {
    await delay(150)
    MOCK_ROLE_PERMS[roleId] = permIds
    return
  }
  await request(`${API_PREFIX}/perm/sets`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role_id: roleId, perm_ids: permIds }),
  })
}

/** 获取权限树（复用权限模块接口，用于功能权限配置弹窗） */
export async function getPermTree(): Promise<PermissionTree[]> {
  return getAllPerms()
}
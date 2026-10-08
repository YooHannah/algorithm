import { request } from './request'

/**
 * 菜单/权限模块是否使用内置 Mock。
 * 独立于全局 VITE_USE_MOCK：登录可走真实后端，而权限接口未实现前本模块单独用 mock。
 * 后端权限接口就绪后，置 VITE_USE_PERMISSION_MOCK=false。
 */
const PERM_USE_MOCK: boolean =
  String(import.meta.env.VITE_USE_PERMISSION_MOCK ?? 'true') !== 'false'

const API_PREFIX = '/api/mall/admin/v1/perm'

/**
 * 权限 / 菜单。
 * 字段与后端 adaptor/repo/query/permission.gen.go、model.Permission 对齐（snake_case）。
 */
export interface Permission {
  /** 主键ID */
  id: number
  /** 权限编码（权限标识） */
  code: string
  /** 类型 1:菜单 2:操作 */
  type: number
  /** 权限名称（菜单名） */
  name: string
  /** 菜单路径 */
  page_path: string
  /** 父级权限ID，0 表示顶级 */
  parent_id: number
  /** 状态 1:正常 -1:禁用 */
  status: number
  /** 排序（升序） */
  sort: number
  /** 权限描述 */
  desc: string
  /** 创建时间（毫秒时间戳），列表 DTO 不返回 */
  create_at?: number
  /** 更新时间（毫秒时间戳），列表 DTO 不返回 */
  update_at?: number
  /** 更新人ID，列表 DTO 不返回 */
  update_by?: number
}

/** 权限树形节点 */
export interface PermissionTree extends Permission {
  children?: PermissionTree[]
}

const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))

/** Mock 数据（对应设计图：系统管理 / 菜单管理） */
const MOCK_LIST: Permission[] = [
  {
    id: 1,
    code: 'system',
    type: 1,
    name: '系统管理',
    page_path: '',
    parent_id: 0,
    status: 1,
    sort: 123,
    desc: '',
    create_at: 1717200000000,
    update_at: 1717200000000,
    update_by: 0,
  },
  {
    id: 2,
    code: 'sys-perm',
    type: 1,
    name: '菜单管理',
    page_path: '/system/permission',
    parent_id: 1,
    status: 1,
    sort: 128,
    desc: '123',
    create_at: 1717286400000,
    update_at: 1717286400000,
    update_by: 1,
  },
  {
    id: 3,
    code: 'sys-role',
    type: 1,
    name: '角色管理',
    page_path: '/system/role',
    parent_id: 1,
    status: 1,
    sort: 129,
    desc: '',
    create_at: 1717286400000,
    update_at: 1717286400000,
    update_by: 1,
  },
  {
    id: 4,
    code: 'sys-user',
    type: 1,
    name: '管理员',
    page_path: '/system/user',
    parent_id: 1,
    status: 1,
    sort: 130,
    desc: '',
    create_at: 1717286400000,
    update_at: 1717286400000,
    update_by: 1,
  },
]

/**
 * 将扁平列表按 parent_id 组装为树，并按 sort 排序。
 * 主动剔除入参里可能自带的 children，兼容后端返回扁平列表或已组装树两种形态。
 */
function buildTree(list: Permission[]): PermissionTree[] {
  const map = new Map<number, PermissionTree>()
  list.forEach((item) => map.set(item.id, { ...item, children: undefined }))

  const roots: PermissionTree[] = []
  map.forEach((node) => {
    if (node.parent_id && map.has(node.parent_id)) {
      const parent = map.get(node.parent_id)!
      ;(parent.children ??= []).push(node)
    } else {
      roots.push(node)
    }
  })

  const sortRec = (nodes: PermissionTree[]) => {
    nodes.sort((a, b) => a.sort - b.sort)
    nodes.forEach((n) => n.children && sortRec(n.children))
  }
  sortRec(roots)
  return roots
}

/** 在树中按名称过滤：保留命中节点及其祖先链 */
export function filterTree(nodes: PermissionTree[], keyword: string): PermissionTree[] {
  return nodes.flatMap((node) => {
    const matchedChildren = node.children ? filterTree(node.children, keyword) : []
    if (node.name.includes(keyword) || matchedChildren.length > 0) {
      return [{ ...node, children: matchedChildren.length ? matchedChildren : node.children }]
    }
    return []
  })
}

/**
 * 获取全部权限（左侧菜单数据源）
 * GET /api/mall/admin/v1/perm/all
 */
export async function getAllPerms(): Promise<PermissionTree[]> {
  if (PERM_USE_MOCK) {
    await delay(300)
    return buildTree(MOCK_LIST)
  }
  const data = await request<{ list: Permission[] }>(`${API_PREFIX}/all`, { method: 'GET' })
  return buildTree(data.list)
}

/**
 * 获取权限列表（右侧表格数据源）
 * GET /api/mall/admin/v1/perm/list
 * @param name 菜单名（模糊筛选，可选）
 */
export async function getPermList(name?: string): Promise<PermissionTree[]> {
  if (PERM_USE_MOCK) {
    await delay(300)
    const keyword = name?.trim()
    const list = keyword
      ? MOCK_LIST.filter((item) => item.name.includes(keyword))
      : MOCK_LIST
    return buildTree(list)
  }
  const query = name?.trim() ? `?name=${encodeURIComponent(name.trim())}` : ''
  const data = await request<{ list: Permission[] }>(`${API_PREFIX}/list${query}`, { method: 'GET' })
  return buildTree(data.list)
}

/** 新建/编辑权限入参（与后端 dto.CreatePermissionReq 对齐） */
export interface SavePermissionReq {
  name: string
  code: string
  type: number
  page_path: string
  parent_id: number
  sort: number
  desc?: string
}

/** 编辑时单条更新项 */
export interface UpdatePermissionItem extends SavePermissionReq {
  id: number
}

/** 生成 mock 自增 ID */
let mockNextId = 1000

/**
 * 新增权限 / 菜单
 * POST /api/mall/admin/v1/perm/create
 */
export async function createPerm(req: SavePermissionReq): Promise<number> {
  if (PERM_USE_MOCK) {
    await delay(300)
    const now = Date.now()
    const id = ++mockNextId
    MOCK_LIST.push({
      id,
      name: req.name,
      code: req.code,
      type: req.type,
      page_path: req.page_path,
      parent_id: req.parent_id,
      sort: req.sort,
      desc: req.desc ?? '',
      status: 1,
      create_at: now,
      update_at: now,
      update_by: 0,
    })
    return id
  }
  const data = await request<{ id: number }>(`${API_PREFIX}/create`, {
    method: 'POST',
    body: JSON.stringify(req),
  })
  return data.id
}

/**
 * 批量更新权限 / 菜单
 * POST /api/mall/admin/v1/perm/update
 */
export async function updatePerm(list: UpdatePermissionItem[]): Promise<void> {
  if (PERM_USE_MOCK) {
    await delay(300)
    const now = Date.now()
    for (const item of list) {
      const target = MOCK_LIST.find((p) => p.id === item.id)
      if (target) {
        target.name = item.name
        target.code = item.code
        target.type = item.type
        target.page_path = item.page_path
        target.parent_id = item.parent_id
        target.sort = item.sort
        target.desc = item.desc ?? ''
        target.update_at = now
      }
    }
    return
  }
  await request<void>(`${API_PREFIX}/update`, {
    method: 'POST',
    body: JSON.stringify({ list }),
  })
}

/**
 * 删除权限 / 菜单
 * POST /api/mall/admin/v1/perm/delete
 */
export async function deletePerm(id: number): Promise<void> {
  if (PERM_USE_MOCK) {
    await delay(300)
    const idx = MOCK_LIST.findIndex((p) => p.id === id)
    if (idx >= 0) MOCK_LIST.splice(idx, 1)
    return
  }
  await request<void>(`${API_PREFIX}/delete`, {
    method: 'POST',
    body: JSON.stringify({ id }),
  })
}

/** 权限类型 1:菜单 2:操作 */
export const PermType = {
  Menu: 1,
  Action: 2,
} as const
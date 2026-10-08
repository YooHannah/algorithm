import { useEffect, useMemo, useRef, useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'

import FeishuQrCode from './FeishuQrCode'
import {
  IconBack,
  IconChevronDown,
  IconChevronRight,
  IconClose,
  IconSearch,
  IconSettings,
  IconUser,
} from './Icons'
import Logo from './Logo'
import ResetPasswordModal from './ResetPasswordModal'

import { logout, unbindLark, type UserInfo } from '../api/auth'
import { filterTree, getAllPerms, type PermissionTree } from '../api/permission'

interface LayoutProps {
  onLogout: () => void
}

/** 读取登录时持久化的用户名称 */
function useDisplayName(): string {
  return useMemo(() => {
    try {
      const raw = localStorage.getItem('mall_admin_user')
      if (raw) {
        const u = JSON.parse(raw) as { name?: string; nick_name?: string }
        return u.nick_name || u.name || '用户'
      }
    } catch {
      /* ignore */
    }
    return 'GOGO'
  }, [])
}

/* -------------------------------- Header -------------------------------- */

function AppHeader({ displayName, onOpenProfile }: { displayName: string; onOpenProfile: () => void }) {
  return (
    <header className="app-header">
      <div className="app-header__brand">
        <Logo size={30} />
        <span className="app-header__title">GOGO管理后台</span>
      </div>

      <button type="button" className="app-header__user" title="查看个人信息" onClick={onOpenProfile}>
        <IconUser width={20} height={20} />
        <span>{displayName}</span>
      </button>
    </header>
  )
}

/* -------------------------------- Sidebar -------------------------------- */

/** 找到树中第一个叶子节点（用于默认选中） */
function findFirstLeaf(nodes: PermissionTree[]): PermissionTree | undefined {
  for (const node of nodes) {
    if (node.children?.length) {
      const leaf = findFirstLeaf(node.children)
      if (leaf) return leaf
    } else {
      return node
    }
  }
}

/** 递归过滤掉指定 type 的节点（如 type=2 的操作权限），保留其余节点及其子树 */
function filterTreeByType(nodes: PermissionTree[], excludeType: number): PermissionTree[] {
  const result: PermissionTree[] = []
  for (const node of nodes) {
    if (node.type === excludeType) continue
    const children = node.children ? filterTreeByType(node.children, excludeType) : []
    result.push({ ...node, children })
  }
  return result
}

/** 按 page_path 在树中查找节点 */
function findNodeByPath(
  nodes: PermissionTree[],
  path: string,
): PermissionTree | undefined {
  for (const node of nodes) {
    if (node.page_path && node.page_path === path) return node
    if (node.children?.length) {
      const found = findNodeByPath(node.children, path)
      if (found) return found
    }
  }
  return undefined
}

function AppSidebar({ collapsed }: { collapsed: boolean }) {
  const navigate = useNavigate()
  const [tree, setTree] = useState<PermissionTree[]>([])
  const [openIds, setOpenIds] = useState<Set<number>>(new Set())
  const [activeId, setActiveId] = useState<number>(0)
  const [keyword, setKeyword] = useState('')

  // 左侧菜单数据：GET /v1/perm/all
  // StrictMode 开发态会双调用 effect，用 ref 守卫保证首次加载只请求一次
  const didInitMenu = useRef(false)
  useEffect(() => {
    if (didInitMenu.current) return
    didInitMenu.current = true

    getAllPerms()
      .then((data) => {
        // 侧边栏只展示菜单（type=1），过滤掉操作权限（type=2）
        const menuTree = filterTreeByType(data, 2)
        setTree(menuTree)
        // 默认展开全部一级分组
        setOpenIds(new Set(menuTree.map((n) => n.id)))
        // 根据当前路径高亮对应菜单
        const currentPath = window.location.pathname
        const match = findNodeByPath(menuTree, currentPath)
        if (match) {
          setActiveId(match.id)
        } else {
          const leaf = findFirstLeaf(menuTree)
          if (leaf) setActiveId(leaf.id)
        }
      })
      .catch(() => {
        /* 菜单加载失败时保持空白，避免阻塞页面 */
      })
  }, [])

  const searching = keyword.trim().length > 0
  const shownTree = useMemo(
    () => (searching ? filterTree(tree, keyword.trim()) : tree),
    [tree, keyword, searching],
  )

  const toggleOpen = (id: number) => {
    setOpenIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const renderNodes = (nodes: PermissionTree[], depth: number) =>
    nodes.map((node) => {
      const hasChildren = !!node.children?.length
      const isOpen = searching || openIds.has(node.id)

      return (
        <div key={node.id}>
          <button
            type="button"
            className={`app-menu__group ${
              !hasChildren && activeId === node.id ? 'app-menu__group--active' : ''
            }`}
            style={!collapsed ? { paddingLeft: 8 + depth * 14 } : undefined}
            onClick={() => {
              if (hasChildren) {
                toggleOpen(node.id)
              } else {
                setActiveId(node.id)
                if (node.page_path) navigate(node.page_path)
              }
            }}
          >
            {hasChildren ? (
              <span className="app-menu__icon">
                <IconSettings width={18} height={18} />
              </span>
            ) : (
              <span className="app-menu__icon">
                <span className="app-menu__dot" />
              </span>
            )}

            {!collapsed && <span className="app-menu__label">{node.name}</span>}

            {!collapsed && hasChildren && (
              <span className="app-menu__caret">
                {isOpen ? (
                  <IconChevronDown width={16} height={16} />
                ) : (
                  <IconChevronRight width={16} height={16} />
                )}
              </span>
            )}
          </button>

          {hasChildren && isOpen && !collapsed && renderNodes(node.children!, depth + 1)}
        </div>
      )
    })

  return (
    <aside className={`app-sidebar ${collapsed ? 'app-sidebar--collapsed' : ''}`}>
      <div className="app-sidebar__search">
        <IconSearch width={16} height={16} />
        {!collapsed && (
          <input
            type="text"
            placeholder="搜索菜单"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
        )}
      </div>

      <nav className="app-menu">{renderNodes(shownTree, 0)}</nav>
    </aside>
  )
}

/* ----------------------------- Profile Modal ----------------------------- */

/** 性别编码转文案：1 男 / 2 女 / 其余 未知 */
function sexText(sex: number): string {
  if (sex === 1) return '男'
  if (sex === 2) return '女'
  return '未知'
}

function UserProfileModal({ onClose, onLogout }: { onClose: () => void; onLogout: () => void }) {
  const user = useMemo<Partial<UserInfo>>(() => {
    try {
      const raw = localStorage.getItem('mall_admin_user')
      if (raw) return JSON.parse(raw) as Partial<UserInfo>
    } catch {
      /* ignore */
    }
    return {}
  }, [])

  const [hint, setHint] = useState('')
  const [busy, setBusy] = useState(false)
  // 绑定状态用 state 维护，解绑成功后可即时切换为展示绑定二维码
  const [bound, setBound] = useState(!!user.lark_open_id)
  // 是否展示重置密码弹窗
  const [showResetPwd, setShowResetPwd] = useState(false)

  // Esc 关闭
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const displayName = user.nick_name || user.name || '用户'

  // 点击解绑：二次确认后调接口，成功则更新本地缓存并切换为绑定二维码
  const handleUnbind = async () => {
    if (!window.confirm('确定要解除飞书账号绑定吗？')) return
    setBusy(true)
    setHint('')
    try {
      await unbindLark()

      // 同步清空本地缓存用户信息中的 lark_open_id
      try {
        const raw = localStorage.getItem('mall_admin_user')
        const u = raw ? (JSON.parse(raw) as Record<string, unknown>) : {}
        u.lark_open_id = ''
        localStorage.setItem('mall_admin_user', JSON.stringify(u))
      } catch {
        /* 本地信息更新失败不阻断解绑结果 */
      }

      setBound(false)
    } catch (err) {
      setHint(err instanceof Error ? err.message : '解绑失败，请重试')
    } finally {
      setBusy(false)
    }
  }

  // 退出登录：先调后端使 token 失效，再清理本地态并通知父组件
  const handleLogout = async () => {
    if (!window.confirm('确定要退出登录吗？')) return
    // 接口失败不阻塞登出流程（token 可能已失效），始终清理本地态
    try {
      await logout()
    } catch {
      /* ignore */
    }
    onLogout()
  }

  return (
    <div className="modal-mask" onClick={onClose}>
      <div
        className="profile-modal"
        role="dialog"
        aria-modal="true"
        aria-label="个人信息"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="profile-modal__header">
          <h3 className="profile-modal__title">个人信息</h3>
          <button type="button" className="profile-modal__close" title="关闭" onClick={onClose}>
            <IconClose width={18} height={18} />
          </button>
        </header>

        <div className="profile-modal__body">
          <div className="profile-modal__row">
            <div className="profile-field">
              <span className="profile-field__label">姓名：</span>
              <span className="profile-field__value">{displayName}</span>
            </div>
            <div className="profile-field">
              <span className="profile-field__label">性别：</span>
              <span className="profile-field__value">{sexText(user.sex ?? 0)}</span>
            </div>
            <div className="profile-field">
              <span className="profile-field__label">手机号：</span>
              <span className="profile-field__value">{user.mobile || '未绑定'}</span>
            </div>
          </div>

          <div className="profile-bind">
            <div className="profile-bind__head">
              <span className="profile-field__label">飞书账号：</span>
              {bound ? (
                <>
                  <button
                    type="button"
                    className="profile-unbind"
                    onClick={handleUnbind}
                    disabled={busy}
                  >
                    {busy ? '解绑中…' : '解绑'}
                  </button>
                  {hint && <span className="profile-modal__hint">{hint}</span>}
                </>
              ) : (
                <span className="profile-bind__title">扫码绑定飞书账号</span>
              )}
            </div>

            {!bound && (
              <div className="profile-bind__qr">
                <FeishuQrCode mode="bind" size={260} />
                <p className="profile-bind__desc">
                  打开「飞书 App」扫码并确认，即可将飞书与当前账号绑定
                </p>
              </div>
            )}
          </div>
        </div>

        <footer className="profile-modal__footer">
          <button type="button" className="profile-resetpwd" onClick={() => setShowResetPwd(true)}>
            修改密码
          </button>
          <button type="button" className="profile-logout" onClick={handleLogout}>
            退出登录
          </button>
        </footer>
      </div>

      {showResetPwd && (
        <ResetPasswordModal
          mobile={user.mobile || ''}
          onClose={() => setShowResetPwd(false)}
          onSuccess={() => {
            /* 密码重置成功后可在此刷新用户信息 */
            setHint('密码重置成功')
            window.setTimeout(() => {
              onClose()
            }, 700)
          }}
        />
      )}
    </div>
  )
}

/* -------------------------------- Layout -------------------------------- */

export default function AdminLayout({ onLogout }: LayoutProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const displayName = useDisplayName()

  return (
    <div className="app-layout">
      <AppHeader displayName={displayName} onOpenProfile={() => setProfileOpen(true)} />

      <div className="app-layout__body">
        <AppSidebar collapsed={collapsed} />

        <button
          type="button"
          className="app-layout__collapse"
          title={collapsed ? '展开菜单' : '收起菜单'}
          onClick={() => setCollapsed((v) => !v)}
        >
          <IconBack
            width={14}
            height={14}
            style={{ transform: collapsed ? 'rotate(180deg)' : 'none' }}
          />
        </button>

        <main className="app-content"><Outlet /></main>
      </div>

      {profileOpen && (
        <UserProfileModal onClose={() => setProfileOpen(false)} onLogout={onLogout} />
      )}
    </div>
  )
}
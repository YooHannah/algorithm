import { BrowserRouter, Navigate, Route, Routes, useNavigate } from 'react-router-dom'

import AdminLayout from './components/AdminLayout'
import AdminUserPage from './components/AdminUserPage'
import CourseEditPage from './components/CourseEditPage'
import CoursePage from './components/CoursePage'
import LarkAuthCallback from './components/LarkAuthCallback'
import LessonEditPage from './components/LessonEditPage'
import LessonPage from './components/LessonPage'
import LoginPage from './components/LoginPage'
import PermissionPage from './components/PermissionPage'
import RolePage from './components/RolePage'

const TOKEN_KEY = 'mall_admin_token'

/** 登录页路由：已登录则直接进入后台 */
function LoginRoute() {
  const navigate = useNavigate()
  if (localStorage.getItem(TOKEN_KEY)) {
    return <Navigate to="/system/permission" replace />
  }
  return <LoginPage onLoggedIn={() => navigate('/system/permission')} />
}

/** 飞书 OAuth 回调路由：处理扫码登录 / 绑定回调 */
function CallbackRoute() {
  const navigate = useNavigate()
  return <LarkAuthCallback onLoggedIn={() => navigate('/system/permission')} />
}

/** 后台布局路由：未登录跳转登录页 */
function AdminLayoutRoute() {
  const navigate = useNavigate()
  if (!localStorage.getItem(TOKEN_KEY)) {
    return <Navigate to="/login" replace />
  }
  return (
    <AdminLayout
      onLogout={() => {
        localStorage.removeItem(TOKEN_KEY)
        localStorage.removeItem('mall_admin_user')
        navigate('/login')
      }}
    />
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginRoute />} />
        <Route path="/login/feishu/callback" element={<CallbackRoute />} />

        {/* 后台布局：所有管理页面共享顶部栏 + 左侧菜单 */}
        <Route element={<AdminLayoutRoute />}>
          <Route path="/system/permission" element={<PermissionPage />} />
          <Route path="/system/role" element={<RolePage />} />
          <Route path="/system/user" element={<AdminUserPage />} />
          <Route path="/course/lesson" element={<LessonPage />} />
          <Route path="/course/lesson/create" element={<LessonEditPage />} />
          <Route path="/course/list" element={<CoursePage />} />
          <Route path="/course/create" element={<CourseEditPage />} />
          <Route path="/" element={<Navigate to="/system/permission" replace />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

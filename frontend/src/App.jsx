import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Login        from './pages/Login'
import Dashboard    from './pages/Dashboard'
import ApplyLeave   from './pages/ApplyLeave'
import MyLeaves     from './pages/MyLeaves'
import ManageLeaves from './pages/ManageLeaves'
import AdminPanel   from './pages/AdminPanel'
import Layout       from './components/Layout'

function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"/></div>
  if (!user)   return <Navigate to="/login" replace />
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />
  return children
}

export default function App() {
  const { user } = useAuth()

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />

      <Route path="/" element={
        <ProtectedRoute><Layout /></ProtectedRoute>
      }>
        <Route index element={<Navigate to="/dashboard" replace />} />

        <Route path="dashboard" element={<Dashboard />} />

        <Route path="apply-leave" element={<ApplyLeave />} />

        <Route path="my-leaves" element={<MyLeaves />} />

        <Route path="manage-leaves" element={
          <ProtectedRoute roles={['ROLE_MANAGER', 'ROLE_ADMIN']}>
            <ManageLeaves />
          </ProtectedRoute>
        } />

        <Route path="admin" element={
          <ProtectedRoute roles={['ROLE_ADMIN']}>
            <AdminPanel />
          </ProtectedRoute>
        } />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

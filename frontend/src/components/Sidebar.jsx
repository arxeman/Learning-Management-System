import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  LayoutDashboard, CalendarPlus, CalendarCheck, Users, ClipboardList, X, LogOut
} from 'lucide-react'

const navItems = [
  { to: '/dashboard',     label: 'Dashboard',     icon: LayoutDashboard, roles: null },
  { to: '/apply-leave',   label: 'Apply Leave',   icon: CalendarPlus,    roles: null },
  { to: '/my-leaves',     label: 'My Leaves',     icon: CalendarCheck,   roles: null },
  { to: '/manage-leaves', label: 'Manage Leaves', icon: ClipboardList,   roles: ['ROLE_MANAGER', 'ROLE_ADMIN'] },
  { to: '/admin',         label: 'Admin Panel',   icon: Users,           roles: ['ROLE_ADMIN'] },
]

export default function Sidebar({ open, onClose }) {
  const { user, logout, isAdmin, isManager } = useAuth()

  const visible = (item) => {
    if (!item.roles) return true
    return item.roles.includes(user?.role)
  }

  const roleBadge = {
    ROLE_ADMIN:    { label: 'Admin',    cls: 'bg-red-100 text-red-700' },
    ROLE_MANAGER:  { label: 'Manager',  cls: 'bg-indigo-100 text-indigo-700' },
    ROLE_EMPLOYEE: { label: 'Employee', cls: 'bg-green-100 text-green-700' },
  }
  const badge = roleBadge[user?.role] || { label: user?.role, cls: 'bg-gray-100 text-gray-700' }

  return (
    <>
      {/* Desktop sidebar */}
      <aside className={`
        hidden lg:flex flex-col w-64 bg-white border-r border-gray-200 min-h-screen
      `}>
        <SidebarContent user={user} badge={badge} visible={visible} logout={logout} />
      </aside>

      {/* Mobile sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-gray-200
        transform transition-transform duration-300 lg:hidden
        ${open ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X size={20} />
        </button>
        <SidebarContent user={user} badge={badge} visible={visible} logout={logout} />
      </aside>
    </>
  )
}

function SidebarContent({ user, badge, visible, logout }) {
  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <CalendarCheck size={16} className="text-white" />
          </div>
          <span className="font-bold text-gray-900 text-lg">LeavePro</span>
        </div>
      </div>

      {/* User profile */}
      <div className="px-6 py-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-semibold text-sm">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${badge.cls}`}>
              {badge.label}
            </span>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.filter(visible).map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-gray-100">
        <button
          onClick={logout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm
                     font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </div>
  )
}

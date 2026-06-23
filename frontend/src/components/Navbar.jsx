import { Menu, Bell } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useLocation } from 'react-router-dom'

const titles = {
  '/dashboard':     'Dashboard',
  '/apply-leave':   'Apply Leave',
  '/my-leaves':     'My Leaves',
  '/manage-leaves': 'Manage Leaves',
  '/admin':         'Admin Panel',
}

export default function Navbar({ onMenuClick }) {
  const { user } = useAuth()
  const { pathname } = useLocation()
  const title = titles[pathname] || 'LeavePro'

  return (
    <header className="bg-white border-b border-gray-200 px-4 md:px-6 py-3 flex items-center justify-between sticky top-0 z-10">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100"
        >
          <Menu size={20} />
        </button>
        <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
      </div>

      <div className="flex items-center gap-3">
        <button className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 relative">
          <Bell size={18} />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center
                          text-indigo-700 font-semibold text-sm">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <span className="hidden md:block text-sm font-medium text-gray-700">{user?.name}</span>
        </div>
      </div>
    </header>
  )
}

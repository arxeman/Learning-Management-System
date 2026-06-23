import { useEffect, useState } from 'react'
import api from '../api/axiosConfig'
import toast from 'react-hot-toast'
import {
  Users, UserPlus, Pencil, Trash2, X, CheckCircle,
  CalendarDays, Shield, Building, Database
} from 'lucide-react'

// ── Role badge ────────────────────────────────────────────────────────────────
const ROLE_BADGE = {
  ROLE_ADMIN:    { label: 'Admin',    cls: 'bg-red-100 text-red-700' },
  ROLE_MANAGER:  { label: 'Manager',  cls: 'bg-indigo-100 text-indigo-700' },
  ROLE_EMPLOYEE: { label: 'Employee', cls: 'bg-green-100 text-green-700' },
}

function RoleBadge({ role }) {
  const b = ROLE_BADGE[role] || { label: role, cls: 'bg-gray-100 text-gray-600' }
  return <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${b.cls}`}>{b.label}</span>
}

// ── Add/Edit User Modal ───────────────────────────────────────────────────────
function UserModal({ user, managers, onClose, onSave }) {
  const isEdit = !!user?.id
  const [form, setForm] = useState({
    name:       user?.name       || '',
    email:      user?.email      || '',
    password:   '',
    role:       user?.role       || 'ROLE_EMPLOYEE',
    department: user?.department || '',
    managerId:  user?.managerId  || '',
  })
  const [loading, setLoading] = useState(false)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSave = async () => {
    if (!form.name || !form.email) return toast.error('Name and email are required')
    if (!isEdit && !form.password) return toast.error('Password is required for new users')
    setLoading(true)
    try {
      await onSave(isEdit ? user.id : null, form)
      onClose()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">
            {isEdit ? 'Edit User' : 'Add New User'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name *</label>
              <input className="input-field" placeholder="John Doe"
                value={form.name} onChange={e => set('name', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email *</label>
              <input className="input-field" type="email" placeholder="john@company.com"
                value={form.email} onChange={e => set('email', e.target.value)}
                disabled={isEdit} />
            </div>
          </div>

          {!isEdit && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password *</label>
              <input className="input-field" type="password" placeholder="Min 6 characters"
                value={form.password} onChange={e => set('password', e.target.value)} />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Role</label>
              <select className="input-field" value={form.role} onChange={e => set('role', e.target.value)}>
                <option value="ROLE_EMPLOYEE">Employee</option>
                <option value="ROLE_MANAGER">Manager</option>
                <option value="ROLE_ADMIN">Admin</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Department</label>
              <input className="input-field" placeholder="Engineering"
                value={form.department} onChange={e => set('department', e.target.value)} />
            </div>
          </div>

          {form.role === 'ROLE_EMPLOYEE' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Manager</label>
              <select className="input-field" value={form.managerId} onChange={e => set('managerId', e.target.value)}>
                <option value="">— No Manager —</option>
                {managers.map(m => (
                  <option key={m.id} value={m.id}>{m.name} ({m.department || 'N/A'})</option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="flex gap-3 p-6 pt-0">
          <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="btn-primary flex-1 flex items-center justify-center gap-2"
          >
            {loading
              ? <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              : <CheckCircle size={16} />
            }
            {isEdit ? 'Save Changes' : 'Create User'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main AdminPanel ───────────────────────────────────────────────────────────
const ADMIN_TABS = ['Users', 'All Leaves']

export default function AdminPanel() {
  const [tab,      setTab]      = useState('Users')
  const [users,    setUsers]    = useState([])
  const [leaves,   setLeaves]   = useState([])
  const [managers, setManagers] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [modal,    setModal]    = useState(null) // null | 'add' | {user}
  const [seeding,  setSeeding]  = useState(false)
  const [leaveFilter, setLeaveFilter] = useState('ALL')

  const fetchUsers = async () => {
    const [u, m] = await Promise.all([
      api.get('/admin/users'),
      api.get('/users/managers'),
    ])
    setUsers(u.data.data || [])
    setManagers(m.data.data || [])
  }

  const fetchLeaves = async () => {
    const { data } = await api.get('/leaves/all')
    setLeaves(data.data || [])
  }

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try { await Promise.all([fetchUsers(), fetchLeaves()]) }
      catch { toast.error('Failed to load data') }
      finally { setLoading(false) }
    }
    load()
  }, [])

  const handleSaveUser = async (id, form) => {
    if (id) {
      await api.put(`/admin/users/${id}`, {
        name: form.name, department: form.department,
        role: form.role, managerId: form.managerId || null,
      })
      toast.success('User updated')
    } else {
      await api.post('/admin/users', form)
      toast.success('User created')
    }
    await fetchUsers()
  }

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete user "${name}"? This cannot be undone.`)) return
    try {
      await api.delete(`/admin/users/${id}`)
      toast.success('User deleted')
      setUsers(prev => prev.filter(u => u.id !== id))
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed')
    }
  }

  const handleSeed = async () => {
    setSeeding(true)
    try {
      const { data } = await api.post('/admin/seed')
      toast.success(data.message || 'Demo data seeded!')
      await fetchUsers()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Seed failed')
    } finally {
      setSeeding(false)
    }
  }

  const filteredLeaves = leaveFilter === 'ALL'
    ? leaves
    : leaves.filter(l => l.status === leaveFilter)

  const stats = {
    total:     users.length,
    admins:    users.filter(u => u.role === 'ROLE_ADMIN').length,
    managers:  users.filter(u => u.role === 'ROLE_MANAGER').length,
    employees: users.filter(u => u.role === 'ROLE_EMPLOYEE').length,
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-indigo-600" />
    </div>
  )

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Admin Panel</h2>
          <p className="text-gray-500 text-sm mt-0.5">Manage users and view all leave requests</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={handleSeed}
            disabled={seeding}
            className="btn-secondary flex items-center gap-2 text-sm"
          >
            {seeding
              ? <span className="animate-spin rounded-full h-4 w-4 border-2 border-gray-400 border-t-transparent" />
              : <Database size={15} />
            }
            Seed Demo Data
          </button>
          <button
            onClick={() => setModal('add')}
            className="btn-primary flex items-center gap-2 text-sm"
          >
            <UserPlus size={15} />
            Add User
          </button>
        </div>
      </div>

      {/* System stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Users',  val: stats.total,     icon: Users,    bg: 'bg-gray-50    text-gray-600' },
          { label: 'Admins',       val: stats.admins,    icon: Shield,   bg: 'bg-red-50     text-red-600' },
          { label: 'Managers',     val: stats.managers,  icon: Building, bg: 'bg-indigo-50  text-indigo-600' },
          { label: 'Employees',    val: stats.employees, icon: Users,    bg: 'bg-green-50   text-green-600' },
        ].map(({ label, val, icon: Icon, bg }) => (
          <div key={label} className="card flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${bg}`}>
              <Icon size={18} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{val}</p>
              <p className="text-xs text-gray-500">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {ADMIN_TABS.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-1.5 rounded-lg text-sm font-medium transition-all ${
              tab === t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* ── Users Tab ── */}
      {tab === 'Users' && (
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Name', 'Email', 'Role', 'Department', 'Manager', 'Status', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-semibold text-xs flex-shrink-0">
                          {u.name?.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-gray-900">{u.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-gray-600">{u.email}</td>
                    <td className="px-4 py-3.5"><RoleBadge role={u.role} /></td>
                    <td className="px-4 py-3.5 text-gray-600">{u.department || '—'}</td>
                    <td className="px-4 py-3.5 text-gray-600">{u.managerName || '—'}</td>
                    <td className="px-4 py-3.5">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                        u.active
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-500'
                      }`}>
                        {u.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setModal(u)}
                          className="p-1.5 rounded-lg text-gray-400 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                          title="Edit"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(u.id, u.name)}
                          className="p-1.5 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {users.length === 0 && (
              <div className="text-center py-14 text-gray-400">
                <Users size={32} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm">No users found. Click "Seed Demo Data" to get started.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── All Leaves Tab ── */}
      {tab === 'All Leaves' && (
        <div className="space-y-4">
          {/* Leave filter */}
          <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
            {['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'].map(f => (
              <button
                key={f}
                onClick={() => setLeaveFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  leaveFilter === f
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {f}
                <span className={`ml-1 px-1.5 py-0.5 rounded-full text-xs ${
                  leaveFilter === f ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-200 text-gray-500'
                }`}>
                  {f === 'ALL' ? leaves.length : leaves.filter(l => l.status === f).length}
                </span>
              </button>
            ))}
          </div>

          <div className="card p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    {['Employee', 'Type', 'From', 'To', 'Days', 'Manager', 'Status', 'Applied'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredLeaves.map(l => (
                    <tr key={l.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="px-4 py-3.5">
                        <p className="font-medium text-gray-900">{l.employeeName}</p>
                        <p className="text-xs text-gray-400">{l.employeeEmail}</p>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="text-xs font-semibold bg-indigo-50 text-indigo-700 px-2 py-1 rounded-md">
                          {l.leaveType}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-gray-600 whitespace-nowrap">{formatDate(l.startDate)}</td>
                      <td className="px-4 py-3.5 text-gray-600 whitespace-nowrap">{formatDate(l.endDate)}</td>
                      <td className="px-4 py-3.5 font-semibold text-gray-900">{l.numberOfDays}</td>
                      <td className="px-4 py-3.5 text-gray-600">{l.managerName || '—'}</td>
                      <td className="px-4 py-3.5">
                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                          l.status === 'PENDING'   ? 'bg-yellow-100 text-yellow-800' :
                          l.status === 'APPROVED'  ? 'bg-green-100 text-green-800'  :
                          l.status === 'REJECTED'  ? 'bg-red-100 text-red-800'      :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {l.status}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-gray-500 text-xs whitespace-nowrap">
                        {l.createdAt ? new Date(l.createdAt).toLocaleDateString('en-IN') : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredLeaves.length === 0 && (
                <div className="text-center py-14 text-gray-400">
                  <CalendarDays size={32} className="mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No leave requests found</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* User Modal */}
      {modal && (
        <UserModal
          user={modal === 'add' ? null : modal}
          managers={managers}
          onClose={() => setModal(null)}
          onSave={handleSaveUser}
        />
      )}
    </div>
  )
}

function formatDate(arr) {
  if (!arr) return '-'
  const [y, m, d] = arr
  return new Date(y, m - 1, d).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric'
  })
}

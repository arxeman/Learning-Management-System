import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/axiosConfig'
import toast from 'react-hot-toast'
import {
  CalendarDays, CalendarCheck, CalendarX, Clock,
  TrendingUp, Users, ArrowRight, AlertCircle
} from 'lucide-react'

const statusBadge = (status) => {
  const map = {
    PENDING:   'badge-pending',
    APPROVED:  'badge-approved',
    REJECTED:  'badge-rejected',
    CANCELLED: 'badge-cancelled',
  }
  return <span className={map[status] || 'badge-pending'}>{status}</span>
}

function BalanceCard({ label, used, total, color }) {
  const remaining = total - used
  const pct = total > 0 ? Math.round((used / total) * 100) : 0
  const colors = {
    blue:   { bar: 'bg-blue-500',   bg: 'bg-blue-50',   text: 'text-blue-700',   icon: 'bg-blue-100' },
    green:  { bar: 'bg-green-500',  bg: 'bg-green-50',  text: 'text-green-700',  icon: 'bg-green-100' },
    purple: { bar: 'bg-purple-500', bg: 'bg-purple-50', text: 'text-purple-700', icon: 'bg-purple-100' },
  }
  const c = colors[color] || colors.blue

  return (
    <div className={`rounded-xl p-5 ${c.bg} border border-white`}>
      <div className="flex items-center justify-between mb-3">
        <p className={`text-sm font-semibold ${c.text}`}>{label}</p>
        <div className={`w-8 h-8 rounded-lg ${c.icon} flex items-center justify-center`}>
          <CalendarDays size={16} className={c.text} />
        </div>
      </div>
      <div className="flex items-end gap-1 mb-3">
        <span className={`text-3xl font-bold ${c.text}`}>{remaining}</span>
        <span className={`text-sm mb-1 ${c.text} opacity-70`}>/ {total} days left</span>
      </div>
      <div className="w-full bg-white/60 rounded-full h-1.5">
        <div
          className={`${c.bar} h-1.5 rounded-full transition-all duration-500`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className={`text-xs mt-1.5 ${c.text} opacity-70`}>{used} used this year</p>
    </div>
  )
}

function StatBox({ label, value, icon: Icon, color }) {
  const colors = {
    yellow: 'bg-yellow-50 text-yellow-700 border-yellow-100',
    green:  'bg-green-50  text-green-700  border-green-100',
    red:    'bg-red-50    text-red-700    border-red-100',
    indigo: 'bg-indigo-50 text-indigo-700 border-indigo-100',
  }
  return (
    <div className={`card flex items-center gap-4`}>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colors[color]}`}>
        <Icon size={22} />
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-sm text-gray-500">{label}</p>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { user, isAdmin, isManager } = useAuth()
  const [balance,  setBalance]  = useState(null)
  const [leaves,   setLeaves]   = useState([])
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const [balRes, leavRes] = await Promise.all([
          api.get('/leaves/balance'),
          isManager()
            ? api.get('/leaves/team')
            : api.get('/leaves/my'),
        ])
        setBalance(balRes.data.data)
        setLeaves(leavRes.data.data || [])
      } catch {
        toast.error('Failed to load dashboard data')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
    </div>
  )

  const pending   = leaves.filter(l => l.status === 'PENDING').length
  const approved  = leaves.filter(l => l.status === 'APPROVED').length
  const rejected  = leaves.filter(l => l.status === 'REJECTED').length
  const recent    = leaves.slice(0, 5)

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Welcome */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Good {getGreeting()}, {user?.name?.split(' ')[0]} 👋
          </h2>
          <p className="text-gray-500 mt-1 text-sm">
            {user?.department ? `${user.department} Department` : "Here's your leave overview"}
          </p>
        </div>
        <Link to="/apply-leave" className="btn-primary flex items-center gap-2 text-sm">
          <CalendarCheck size={16} />
          Apply Leave
        </Link>
      </div>

      {/* Leave Balance (own balance for everyone) */}
      {balance && (
        <div>
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Your Leave Balance — {balance.year}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <BalanceCard label="Casual Leave"  used={balance.casualUsed}  total={balance.casualTotal}  color="blue"   />
            <BalanceCard label="Sick Leave"    used={balance.sickUsed}    total={balance.sickTotal}    color="green"  />
            <BalanceCard label="Earned Leave"  used={balance.earnedUsed}  total={balance.earnedTotal}  color="purple" />
          </div>
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatBox label="Total Requests" value={leaves.length} icon={CalendarDays} color="indigo" />
        <StatBox label="Pending"        value={pending}       icon={Clock}        color="yellow" />
        <StatBox label="Approved"       value={approved}      icon={CalendarCheck} color="green" />
        <StatBox label="Rejected"       value={rejected}      icon={CalendarX}    color="red"   />
      </div>

      {/* Recent leaves table */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-gray-900">
            {isManager() ? 'Recent Team Leaves' : 'My Recent Leaves'}
          </h3>
          <Link
            to={isManager() ? '/manage-leaves' : '/my-leaves'}
            className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
          >
            View all <ArrowRight size={14} />
          </Link>
        </div>

        {recent.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            <CalendarDays size={32} className="mx-auto mb-2 opacity-40" />
            <p className="text-sm">No leave requests yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  {isManager() && <th className="text-left pb-3 font-medium text-gray-500">Employee</th>}
                  <th className="text-left pb-3 font-medium text-gray-500">Type</th>
                  <th className="text-left pb-3 font-medium text-gray-500">Dates</th>
                  <th className="text-left pb-3 font-medium text-gray-500">Days</th>
                  <th className="text-left pb-3 font-medium text-gray-500">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recent.map(l => (
                  <tr key={l.id} className="hover:bg-gray-50/50">
                    {isManager() && (
                      <td className="py-3 font-medium text-gray-900">{l.employeeName}</td>
                    )}
                    <td className="py-3">
                      <span className="px-2 py-1 bg-indigo-50 text-indigo-700 text-xs rounded-md font-medium">
                        {l.leaveType}
                      </span>
                    </td>
                    <td className="py-3 text-gray-600">
                      {formatDate(l.startDate)} → {formatDate(l.endDate)}
                    </td>
                    <td className="py-3 text-gray-600">{l.numberOfDays}d</td>
                    <td className="py-3">{statusBadge(l.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Manager pending alert */}
      {isManager() && pending > 0 && (
        <div className="flex items-center gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
          <AlertCircle size={18} className="text-yellow-600 flex-shrink-0" />
          <p className="text-sm text-yellow-800">
            <span className="font-semibold">{pending} leave request{pending > 1 ? 's' : ''}</span> awaiting your review.
          </p>
          <Link to="/manage-leaves" className="ml-auto text-sm font-medium text-yellow-700 hover:text-yellow-900 whitespace-nowrap">
            Review now →
          </Link>
        </div>
      )}
    </div>
  )
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Morning'
  if (h < 17) return 'Afternoon'
  return 'Evening'
}

function formatDate(d) {
  if (!d) return '-'
  const [y, m, day] = d
  return new Date(y, m - 1, day).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

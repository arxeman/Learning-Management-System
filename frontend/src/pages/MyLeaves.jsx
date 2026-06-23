import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axiosConfig'
import toast from 'react-hot-toast'
import { CalendarPlus, CalendarDays, X } from 'lucide-react'

const TABS = ['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'CANCELLED']

const TYPE_COLOR = {
  CASUAL: 'bg-blue-100 text-blue-700',
  SICK:   'bg-green-100 text-green-700',
  EARNED: 'bg-purple-100 text-purple-700',
  UNPAID: 'bg-orange-100 text-orange-700',
}

function formatDate(arr) {
  if (!arr) return '-'
  const [y, m, d] = arr
  return new Date(y, m - 1, d).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric'
  })
}

function LeaveRow({ leave, onCancel }) {
  const canCancel = leave.status === 'PENDING' || leave.status === 'APPROVED'
  const [cancelling, setCancelling] = useState(false)

  const handleCancel = async () => {
    if (!window.confirm('Cancel this leave request?')) return
    setCancelling(true)
    try {
      await onCancel(leave.id)
    } finally {
      setCancelling(false)
    }
  }

  return (
    <tr className="hover:bg-gray-50/60 transition-colors">
      <td className="px-4 py-3.5">
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-md ${TYPE_COLOR[leave.leaveType] || 'bg-gray-100 text-gray-600'}`}>
          {leave.leaveType}
        </span>
      </td>
      <td className="px-4 py-3.5 text-sm text-gray-700">{formatDate(leave.startDate)}</td>
      <td className="px-4 py-3.5 text-sm text-gray-700">{formatDate(leave.endDate)}</td>
      <td className="px-4 py-3.5">
        <span className="text-sm font-semibold text-gray-900">{leave.numberOfDays}</span>
        <span className="text-xs text-gray-400 ml-1">day{leave.numberOfDays > 1 ? 's' : ''}</span>
      </td>
      <td className="px-4 py-3.5 text-sm text-gray-600 max-w-xs truncate">{leave.reason}</td>
      <td className="px-4 py-3.5">
        <StatusBadge status={leave.status} />
      </td>
      <td className="px-4 py-3.5 text-sm text-gray-500">
        {leave.status === 'REJECTED' && leave.rejectionReason
          ? <span className="text-red-600 text-xs">{leave.rejectionReason}</span>
          : leave.managerName || '—'
        }
      </td>
      <td className="px-4 py-3.5">
        {canCancel && (
          <button
            onClick={handleCancel}
            disabled={cancelling}
            className="p-1.5 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors disabled:opacity-50"
            title="Cancel leave"
          >
            {cancelling
              ? <span className="animate-spin inline-block rounded-full h-4 w-4 border-2 border-red-400 border-t-transparent" />
              : <X size={15} />
            }
          </button>
        )}
      </td>
    </tr>
  )
}

function StatusBadge({ status }) {
  const cls = {
    PENDING:   'badge-pending',
    APPROVED:  'badge-approved',
    REJECTED:  'badge-rejected',
    CANCELLED: 'badge-cancelled',
  }
  return <span className={cls[status] || 'badge-pending'}>{status}</span>
}

export default function MyLeaves() {
  const [leaves,  setLeaves]  = useState([])
  const [tab,     setTab]     = useState('ALL')
  const [loading, setLoading] = useState(true)

  const fetchLeaves = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/leaves/my')
      setLeaves(data.data || [])
    } catch {
      toast.error('Failed to load leave history')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchLeaves() }, [])

  const handleCancel = async (id) => {
    try {
      await api.patch(`/leaves/${id}/cancel`)
      toast.success('Leave cancelled successfully')
      fetchLeaves()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel leave')
    }
  }

  const filtered = tab === 'ALL' ? leaves : leaves.filter(l => l.status === tab)

  const counts = TABS.reduce((acc, t) => {
    acc[t] = t === 'ALL' ? leaves.length : leaves.filter(l => l.status === t).length
    return acc
  }, {})

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">My Leave History</h2>
          <p className="text-gray-500 text-sm mt-0.5">{leaves.length} total requests</p>
        </div>
        <Link to="/apply-leave" className="btn-primary flex items-center gap-2 text-sm">
          <CalendarPlus size={16} />
          Apply Leave
        </Link>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit flex-wrap">
        {TABS.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
              tab === t
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t}
            <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${
              tab === t ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-200 text-gray-500'
            }`}>
              {counts[t]}
            </span>
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-indigo-600" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <CalendarDays size={36} className="mx-auto mb-3 opacity-30" />
            <p className="font-medium text-gray-500">No {tab !== 'ALL' ? tab.toLowerCase() : ''} leaves found</p>
            <p className="text-sm mt-1">
              <Link to="/apply-leave" className="text-indigo-600 hover:underline">Apply for leave →</Link>
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Type', 'From', 'To', 'Days', 'Reason', 'Status', 'Reviewer', 'Action'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(l => (
                  <LeaveRow key={l.id} leave={l} onCancel={handleCancel} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

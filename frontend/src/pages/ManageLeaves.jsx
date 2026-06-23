import { useEffect, useState } from 'react'
import api from '../api/axiosConfig'
import toast from 'react-hot-toast'
import { CheckCircle, XCircle, Calendar, Users, Clock, Filter } from 'lucide-react'

const TYPE_COLOR = {
  CASUAL: 'bg-blue-50 text-blue-700',
  SICK:   'bg-green-50 text-green-700',
  EARNED: 'bg-purple-50 text-purple-700',
  UNPAID: 'bg-orange-50 text-orange-700',
}

function formatDate(arr) {
  if (!arr) return '-'
  const [y, m, d] = arr
  return new Date(y, m - 1, d).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric'
  })
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

// ── Action Modal ──────────────────────────────────────────────────────────────
function ActionModal({ leave, onClose, onConfirm }) {
  const [action,  setAction]  = useState('APPROVED')
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)

  const handleConfirm = async () => {
    if (action === 'REJECTED' && !comment.trim()) {
      return toast.error('Please provide a rejection reason')
    }
    setLoading(true)
    try {
      await onConfirm(leave.id, action, comment)
      onClose()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-in">
        {/* Header */}
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">Review Leave Request</h3>
          <p className="text-sm text-gray-500 mt-0.5">
            {leave.employeeName} · {leave.leaveType} · {leave.numberOfDays} day{leave.numberOfDays > 1 ? 's' : ''}
          </p>
        </div>

        {/* Details */}
        <div className="p-6 space-y-4">
          <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Period</span>
              <span className="font-medium text-gray-900">
                {formatDate(leave.startDate)} – {formatDate(leave.endDate)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Reason</span>
              <span className="font-medium text-gray-900 text-right max-w-[60%]">{leave.reason}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Applied on</span>
              <span className="font-medium text-gray-900">
                {leave.createdAt ? new Date(leave.createdAt).toLocaleDateString('en-IN') : '—'}
              </span>
            </div>
          </div>

          {/* Action toggle */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Decision</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setAction('APPROVED')}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 text-sm font-medium transition-all
                  ${action === 'APPROVED'
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-200 text-gray-500 hover:border-gray-300'
                  }`}
              >
                <CheckCircle size={16} />
                Approve
              </button>
              <button
                onClick={() => setAction('REJECTED')}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 text-sm font-medium transition-all
                  ${action === 'REJECTED'
                    ? 'border-red-500 bg-red-50 text-red-700'
                    : 'border-gray-200 text-gray-500 hover:border-gray-300'
                  }`}
              >
                <XCircle size={16} />
                Reject
              </button>
            </div>
          </div>

          {/* Comment / reason */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              {action === 'REJECTED' ? 'Rejection Reason *' : 'Comment (optional)'}
            </label>
            <textarea
              rows={3}
              placeholder={action === 'REJECTED' ? 'Provide a reason for rejection...' : 'Add a comment (optional)'}
              value={comment}
              onChange={e => setComment(e.target.value)}
              className="input-field resize-none text-sm"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 pt-0 flex gap-3">
          <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className={`flex-1 flex items-center justify-center gap-2 font-medium py-2 px-4 rounded-lg transition-colors ${
              action === 'APPROVED'
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-red-600 hover:bg-red-700 text-white'
            } disabled:opacity-50`}
          >
            {loading
              ? <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              : action === 'APPROVED' ? <CheckCircle size={16} /> : <XCircle size={16} />
            }
            {loading ? 'Processing…' : action === 'APPROVED' ? 'Approve' : 'Reject'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function ManageLeaves() {
  const [leaves,   setLeaves]   = useState([])
  const [loading,  setLoading]  = useState(true)
  const [filter,   setFilter]   = useState('PENDING')
  const [selected, setSelected] = useState(null)

  const fetchLeaves = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/leaves/team')
      setLeaves(data.data || [])
    } catch {
      toast.error('Failed to load team leaves')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchLeaves() }, [])

  const handleAction = async (id, status, comment) => {
    try {
      await api.patch(`/leaves/${id}/status`, { status, comment })
      toast.success(`Leave ${status.toLowerCase()} successfully`)
      fetchLeaves()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed')
      throw err
    }
  }

  const filtered = filter === 'ALL' ? leaves : leaves.filter(l => l.status === filter)
  const counts   = {
    ALL:       leaves.length,
    PENDING:   leaves.filter(l => l.status === 'PENDING').length,
    APPROVED:  leaves.filter(l => l.status === 'APPROVED').length,
    REJECTED:  leaves.filter(l => l.status === 'REJECTED').length,
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Manage Team Leaves</h2>
        <p className="text-gray-500 text-sm mt-0.5">Review and action leave requests from your team</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total',    count: counts.ALL,      icon: Calendar, color: 'text-gray-600 bg-gray-50' },
          { label: 'Pending',  count: counts.PENDING,  icon: Clock,     color: 'text-yellow-700 bg-yellow-50' },
          { label: 'Approved', count: counts.APPROVED, icon: CheckCircle, color: 'text-green-700 bg-green-50' },
          { label: 'Rejected', count: counts.REJECTED, icon: XCircle,  color: 'text-red-700 bg-red-50' },
        ].map(({ label, count, icon: Icon, color }) => (
          <div key={label} className="card flex items-center gap-3 py-4">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
              <Icon size={18} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{count}</p>
              <p className="text-xs text-gray-500">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
              filter === f
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {f}
            <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${
              filter === f ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-200 text-gray-500'
            }`}>
              {counts[f] ?? 0}
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
            <Users size={36} className="mx-auto mb-3 opacity-30" />
            <p className="font-medium text-gray-500">No {filter !== 'ALL' ? filter.toLowerCase() : ''} requests</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Employee', 'Type', 'From', 'To', 'Days', 'Reason', 'Applied', 'Status', 'Action'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(l => (
                  <tr key={l.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-4 py-3.5">
                      <div>
                        <p className="font-medium text-gray-900">{l.employeeName}</p>
                        <p className="text-xs text-gray-400">{l.employeeEmail}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-md ${TYPE_COLOR[l.leaveType] || 'bg-gray-100 text-gray-600'}`}>
                        {l.leaveType}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-gray-600 whitespace-nowrap">{formatDate(l.startDate)}</td>
                    <td className="px-4 py-3.5 text-gray-600 whitespace-nowrap">{formatDate(l.endDate)}</td>
                    <td className="px-4 py-3.5 font-semibold text-gray-900">{l.numberOfDays}</td>
                    <td className="px-4 py-3.5 text-gray-600 max-w-[160px]">
                      <p className="truncate">{l.reason}</p>
                      {l.rejectionReason && (
                        <p className="text-xs text-red-500 mt-0.5 truncate">↳ {l.rejectionReason}</p>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-gray-500 whitespace-nowrap text-xs">
                      {l.createdAt ? new Date(l.createdAt).toLocaleDateString('en-IN') : '—'}
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusBadge status={l.status} />
                    </td>
                    <td className="px-4 py-3.5">
                      {l.status === 'PENDING' ? (
                        <button
                          onClick={() => setSelected(l)}
                          className="flex items-center gap-1.5 text-xs font-medium text-indigo-600
                                     hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100
                                     px-3 py-1.5 rounded-lg transition-colors"
                        >
                          Review
                        </button>
                      ) : (
                        <span className="text-xs text-gray-400">
                          {l.actionDate ? new Date(l.actionDate).toLocaleDateString('en-IN') : '—'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {selected && (
        <ActionModal
          leave={selected}
          onClose={() => setSelected(null)}
          onConfirm={handleAction}
        />
      )}
    </div>
  )
}

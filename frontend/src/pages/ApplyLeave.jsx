import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axiosConfig'
import toast from 'react-hot-toast'
import { CalendarCheck, Info } from 'lucide-react'

const LEAVE_TYPES = [
  { value: 'CASUAL', label: 'Casual Leave',  desc: 'For personal errands and short breaks' },
  { value: 'SICK',   label: 'Sick Leave',    desc: 'Medical reasons and health issues' },
  { value: 'EARNED', label: 'Earned Leave',  desc: 'Accrued annual leave entitlement' },
  { value: 'UNPAID', label: 'Unpaid Leave',  desc: 'Leave without pay (no balance cap)' },
]

export default function ApplyLeave() {
  const navigate = useNavigate()
  const [balance,  setBalance]  = useState(null)
  const [loading,  setLoading]  = useState(false)
  const [form, setForm] = useState({
    leaveType: 'CASUAL',
    startDate: '',
    endDate:   '',
    reason:    '',
  })

  useEffect(() => {
    api.get('/leaves/balance').then(r => setBalance(r.data.data)).catch(() => {})
  }, [])

  const getRemaining = (type) => {
    if (!balance) return '—'
    const map = {
      CASUAL: balance.casualTotal  - balance.casualUsed,
      SICK:   balance.sickTotal    - balance.sickUsed,
      EARNED: balance.earnedTotal  - balance.earnedUsed,
      UNPAID: '∞',
    }
    return map[type] ?? '—'
  }

  const calcWorkingDays = () => {
    if (!form.startDate || !form.endDate) return 0
    const start = new Date(form.startDate)
    const end   = new Date(form.endDate)
    if (start > end) return 0
    let count = 0
    const cur = new Date(start)
    while (cur <= end) {
      const d = cur.getDay()
      if (d !== 0 && d !== 6) count++
      cur.setDate(cur.getDate() + 1)
    }
    return count
  }

  const workingDays = calcWorkingDays()
  const today       = new Date().toISOString().split('T')[0]

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.startDate || !form.endDate) return toast.error('Select start and end dates')
    if (form.startDate > form.endDate)    return toast.error('Start must be before end date')
    if (workingDays === 0)                return toast.error('No working days in selected range')

    setLoading(true)
    try {
      await api.post('/leaves/apply', {
        leaveType: form.leaveType,
        startDate: form.startDate,
        endDate:   form.endDate,
        reason:    form.reason,
      })
      toast.success('Leave applied successfully!')
      navigate('/my-leaves')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to apply leave')
    } finally {
      setLoading(false)
    }
  }

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }))

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Apply for Leave</h2>
        <p className="text-gray-500 text-sm mt-1">Fill out the form below to submit a leave request</p>
      </div>

      {/* Balance quick view */}
      {balance && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { type: 'CASUAL', label: 'Casual', color: 'bg-blue-50   text-blue-700   border-blue-100' },
            { type: 'SICK',   label: 'Sick',   color: 'bg-green-50  text-green-700  border-green-100' },
            { type: 'EARNED', label: 'Earned', color: 'bg-purple-50 text-purple-700 border-purple-100' },
          ].map(({ type, label, color }) => (
            <button
              key={type}
              type="button"
              onClick={() => set('leaveType', type)}
              className={`p-3 rounded-xl border text-center transition-all
                ${form.leaveType === type
                  ? 'ring-2 ring-indigo-500 ' + color
                  : 'bg-white border-gray-200 hover:border-gray-300'
                }`}
            >
              <div className={`text-xl font-bold ${form.leaveType === type ? '' : 'text-gray-900'}`}>
                {getRemaining(type)}
              </div>
              <div className={`text-xs mt-0.5 ${form.leaveType === type ? '' : 'text-gray-500'}`}>
                {label} left
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Form card */}
      <form onSubmit={handleSubmit} className="card space-y-5">

        {/* Leave type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Leave Type</label>
          <div className="grid grid-cols-2 gap-3">
            {LEAVE_TYPES.map(({ value, label, desc }) => (
              <label
                key={value}
                className={`relative flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all
                  ${form.leaveType === value
                    ? 'border-indigo-500 bg-indigo-50 ring-1 ring-indigo-500'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
              >
                <input
                  type="radio"
                  name="leaveType"
                  value={value}
                  checked={form.leaveType === value}
                  onChange={e => set('leaveType', e.target.value)}
                  className="mt-0.5 accent-indigo-600"
                />
                <div>
                  <p className={`text-sm font-medium ${form.leaveType === value ? 'text-indigo-700' : 'text-gray-900'}`}>
                    {label}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
                  {value !== 'UNPAID' && (
                    <p className="text-xs font-semibold mt-1 text-indigo-600">
                      {getRemaining(value)} days available
                    </p>
                  )}
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Date range */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Start Date</label>
            <input
              type="date"
              required
              min={today}
              value={form.startDate}
              onChange={e => {
                set('startDate', e.target.value)
                if (form.endDate && e.target.value > form.endDate)
                  set('endDate', e.target.value)
              }}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">End Date</label>
            <input
              type="date"
              required
              min={form.startDate || today}
              value={form.endDate}
              onChange={e => set('endDate', e.target.value)}
              className="input-field"
            />
          </div>
        </div>

        {/* Working days preview */}
        {form.startDate && form.endDate && (
          <div className={`flex items-center gap-2 p-3 rounded-lg text-sm
            ${workingDays === 0
              ? 'bg-red-50 text-red-700 border border-red-200'
              : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
            }`}>
            <Info size={15} />
            {workingDays === 0
              ? 'No working days in this range (weekends only)'
              : `This leave spans ${workingDays} working day${workingDays > 1 ? 's' : ''}`
            }
          </div>
        )}

        {/* Reason */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Reason <span className="text-gray-400">(required)</span>
          </label>
          <textarea
            required
            rows={4}
            placeholder="Please provide a brief reason for your leave..."
            value={form.reason}
            onChange={e => set('reason', e.target.value)}
            className="input-field resize-none"
          />
          <p className="text-xs text-gray-400 mt-1">{form.reason.length}/500 characters</p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate('/my-leaves')}
            className="btn-secondary flex-1"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || workingDays === 0}
            className="btn-primary flex-1 flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
            ) : (
              <CalendarCheck size={16} />
            )}
            {loading ? 'Submitting…' : 'Submit Request'}
          </button>
        </div>
      </form>
    </div>
  )
}

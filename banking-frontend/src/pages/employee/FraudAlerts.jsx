import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import API from '../../services/api'

const FraudAlerts = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [alerts, setAlerts] = useState([])
  const [selectedAlert, setSelectedAlert] = useState(null)
  const [showResolveModal, setShowResolveModal] = useState(false)
  const [resolutionNote, setResolutionNote] = useState('')
  const [action, setAction] = useState('resolve') // 'resolve' or 'freeze_account'
  const [freezeAccountId, setFreezeAccountId] = useState('')
  const [userAccounts, setUserAccounts] = useState([])
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [processingId, setProcessingId] = useState(null)
  const [loadingAccounts, setLoadingAccounts] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('employeeToken')
    if (!token) {
      navigate('/employee/login')
      return
    }
    fetchAlerts()
  }, [])

  const fetchAlerts = async () => {
    try {
      const response = await API.get('/employee/alerts/open')
      setAlerts(response.data)
      setLoading(false)
    } catch (err) {
      console.error('Error fetching alerts:', err)
      setError('Failed to load alerts')
      setLoading(false)
      if (err.response?.status === 401) {
        localStorage.removeItem('employeeToken')
        navigate('/employee/login')
      }
    }
  }

  const fetchUserAccounts = async (userId) => {
    setLoadingAccounts(true)
    try {
      const response = await API.get(`/employee/users/${userId}`)
      setUserAccounts(response.data.accounts)
    } catch (err) {
      console.error('Error fetching user accounts:', err)
      setError('Failed to load user accounts')
    } finally {
      setLoadingAccounts(false)
    }
  }

  const handleFreezeAccount = async (accountId) => {
    try {
      await API.post('/employee/accounts/freeze', { accountId, freeze: true })
      setMessage('Account frozen successfully')
      fetchAlerts()
      setShowResolveModal(false)
      setSelectedAlert(null)
      setResolutionNote('')
      setAction('resolve')
      setTimeout(() => setMessage(''), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to freeze account')
      setTimeout(() => setError(''), 3000)
    }
  }

  const handleResolve = async (alertId) => {
    setProcessingId(alertId)
    try {
      const response = await API.post(`/employee/alerts/${alertId}/resolve`, {
        resolution_note: resolutionNote,
        markFalsePositive: action === 'resolve' && resolutionNote.includes('false positive') ? true : false
      })
      setMessage(response.data.message || 'Alert resolved successfully')
      setShowResolveModal(false)
      setSelectedAlert(null)
      setResolutionNote('')
      setAction('resolve')
      fetchAlerts()
      setTimeout(() => setMessage(''), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resolve alert')
      setTimeout(() => setError(''), 3000)
    } finally {
      setProcessingId(null)
    }
  }

  const openResolveModal = async (alert) => {
    setSelectedAlert(alert)
    setResolutionNote('')
    setAction('resolve')
    setFreezeAccountId('')
    await fetchUserAccounts(alert.user_id._id)
    setShowResolveModal(true)
  }

  const getSeverityBadge = (severity) => {
    const badges = {
      high: 'bg-red-100 text-red-700',
      medium: 'bg-amber-100 text-amber-700',
      low: 'bg-blue-100 text-blue-700'
    }
    return badges[severity] || badges.low
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-PK', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-emerald border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      
      <header className="border-b border-gray-100 bg-white sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <Link to="/employee/dashboard" className="text-gray-400 hover:text-gray-600 text-sm">← Back</Link>
            <div className="text-xl font-light tracking-wide text-gray-900">COMET Admin</div>
            <div className="w-16"></div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        
        <div className="mb-8">
          <h1 className="text-3xl font-light text-gray-900">Fraud Alerts</h1>
          <p className="text-gray-400 text-sm mt-1">Review and resolve suspicious activity alerts</p>
        </div>

        {message && (
          <div className="mb-6 p-3 bg-emerald/10 border border-emerald/20 rounded-xl">
            <p className="text-emerald text-sm text-center">{message}</p>
          </div>
        )}
        
        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-red-600 text-sm text-center">{error}</p>
          </div>
        )}

        {alerts.length === 0 ? (
          <div className="bg-gray-50 rounded-2xl py-16 text-center">
            <p className="text-gray-500 text-lg">No open fraud alerts</p>
            <p className="text-gray-400 text-sm mt-1">All alerts have been resolved</p>
          </div>
        ) : (
          <div className="space-y-4">
            {alerts.map((alert) => (
              <div key={alert._id} className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-medium text-gray-900">{alert.user_id?.full_name}</h3>
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs ${getSeverityBadge(alert.severity)}`}>
                          {alert.severity}
                        </span>
                      </div>
                      <p className="text-gray-500 text-sm">{alert.user_id?.email}</p>
                      <p className="text-gray-400 text-xs mt-1">Created on {formatDate(alert.created_at)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-600 text-sm">Fraud Type</p>
                      <p className="text-gray-800 font-medium capitalize">{alert.fraud_type?.replace(/_/g, ' ')}</p>
                    </div>
                  </div>
                  
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-gray-600 text-sm">Reason:</p>
                    <p className="text-gray-800 text-sm mt-1">{alert.reason}</p>
                  </div>

                  {alert.transaction_id && (
                    <div className="mb-4 text-sm">
                      <p className="text-gray-500">Transaction ID: <span className="font-mono text-gray-700">{alert.transaction_id._id || alert.transaction_id}</span></p>
                    </div>
                  )}
                  
                  <div className="flex gap-3 pt-4 border-t border-gray-100">
                    <button
                      onClick={() => openResolveModal(alert)}
                      disabled={processingId === alert._id}
                      className="flex-1 px-4 py-2 bg-emerald hover:bg-emerald-dark text-white rounded-lg text-sm font-medium transition-all disabled:opacity-50"
                    >
                      Investigate
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 text-center">
          <p className="text-gray-400 text-xs">
            {alerts.length} open alert{alerts.length !== 1 ? 's' : ''}
          </p>
        </div>
      </main>

      {/* Resolve Modal */}
      {showResolveModal && selectedAlert && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-light text-gray-900">Investigate Alert</h2>
              <button 
                onClick={() => setShowResolveModal(false)} 
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-gray-50 rounded-xl p-3 text-sm">
                <p className="text-gray-500">Alert Type: <span className="text-gray-700 capitalize">{selectedAlert.fraud_type?.replace(/_/g, ' ')}</span></p>
                <p className="text-gray-500 mt-1">User: <span className="text-gray-700">{selectedAlert.user_id?.full_name}</span></p>
              </div>

              {/* Action Radio Buttons */}
              <div className="space-y-2">
                <label className="block text-gray-600 text-sm mb-2">Action to take</label>
                <label className="flex items-center gap-2 p-2 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer">
                  <input
                    type="radio"
                    value="resolve"
                    checked={action === 'resolve'}
                    onChange={(e) => setAction(e.target.value)}
                    className="text-emerald"
                  />
                  <span className="text-gray-700 text-sm">Resolve (mark as resolved)</span>
                </label>
                <label className="flex items-center gap-2 p-2 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer">
                  <input
                    type="radio"
                    value="freeze_account"
                    checked={action === 'freeze_account'}
                    onChange={(e) => {
                      setAction(e.target.value)
                      if (e.target.value === 'freeze_account') {
                        fetchUserAccounts(selectedAlert.user_id._id)
                      }
                    }}
                    className="text-emerald"
                  />
                  <span className="text-gray-700 text-sm">Freeze user's account</span>
                </label>
              </div>

              {/* Account Selection (if freeze_account is selected) */}
              {action === 'freeze_account' && (
                <div>
                  <label className="block text-gray-600 text-sm mb-1">Select account to freeze</label>
                  {loadingAccounts ? (
                    <p className="text-gray-400 text-sm">Loading accounts...</p>
                  ) : (
                    <select
                      value={freezeAccountId}
                      onChange={(e) => setFreezeAccountId(e.target.value)}
                      className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-emerald"
                    >
                      <option value="">Select an account</option>
                      {userAccounts.map((acc) => (
                        <option key={acc._id} value={acc._id}>
                          {acc.account_type?.toUpperCase()} Account - Balance: {new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR' }).format(acc.balance)}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              )}

              {/* Resolution Note */}
              {action === 'resolve' && (
                <div>
                  <label className="block text-gray-600 text-sm mb-1">Resolution Note</label>
                  <textarea
                    value={resolutionNote}
                    onChange={(e) => setResolutionNote(e.target.value)}
                    rows="3"
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-emerald"
                    placeholder="Describe how this alert was resolved..."
                  />
                </div>
              )}

              <button
                onClick={() => {
                  if (action === 'freeze_account' && freezeAccountId) {
                    handleFreezeAccount(freezeAccountId)
                  } else if (action === 'resolve') {
                    handleResolve(selectedAlert._id)
                  } else {
                    setError('Please select an account to freeze')
                  }
                }}
                disabled={processingId === selectedAlert._id || (action === 'freeze_account' && !freezeAccountId)}
                className="w-full bg-emerald hover:bg-emerald-dark text-white py-2.5 rounded-xl font-medium transition-all disabled:opacity-50"
              >
                {processingId === selectedAlert._id 
                  ? 'Processing...' 
                  : action === 'freeze_account' 
                    ? 'Freeze Account & Resolve' 
                    : 'Resolve Alert'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default FraudAlerts
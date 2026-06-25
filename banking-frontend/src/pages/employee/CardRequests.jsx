import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import API from '../../services/api'

const CardRequests = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [requests, setRequests] = useState([])
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [approvingId, setApprovingId] = useState(null)
  const [rejectingId, setRejectingId] = useState(null)

  useEffect(() => {
    const token = localStorage.getItem('employeeToken')
    if (!token) {
      navigate('/employee/login')
      return
    }
    fetchRequests()
  }, [])

  const fetchRequests = async () => {
    try {
      const response = await API.get('/employee/card-requests')
      setRequests(response.data)
      setLoading(false)
    } catch (err) {
      console.error('Error fetching card requests:', err)
      setError('Failed to load card requests')
      setLoading(false)
      if (err.response?.status === 401) {
        localStorage.removeItem('employeeToken')
        navigate('/employee/login')
      }
    }
  }

  const handleApprove = async (requestId) => {
    setApprovingId(requestId)
    try {
      const response = await API.post(`/employee/card-requests/${requestId}/approve`)
      setMessage(response.data.message || 'Card request approved successfully')
      fetchRequests()
      setTimeout(() => setMessage(''), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to approve request')
      setTimeout(() => setError(''), 3000)
    } finally {
      setApprovingId(null)
    }
  }

  const handleReject = async (requestId) => {
    setRejectingId(requestId)
    try {
      const response = await API.post(`/employee/card-requests/${requestId}/reject`)
      setMessage(response.data.message || 'Card request rejected')
      fetchRequests()
      setTimeout(() => setMessage(''), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reject request')
      setTimeout(() => setError(''), 3000)
    } finally {
      setRejectingId(null)
    }
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
          <h1 className="text-3xl font-light text-gray-900">Card Requests</h1>
          <p className="text-gray-400 text-sm mt-1">Review and process customer card requests</p>
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

        {requests.length === 0 ? (
          <div className="bg-gray-50 rounded-2xl py-16 text-center">
            <p className="text-gray-500 text-lg">No pending card requests</p>
            <p className="text-gray-400 text-sm mt-1">All card requests have been processed</p>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => (
              <div key={request._id} className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-medium text-gray-900">{request.user_id?.full_name}</h3>
                        <span className="inline-block px-2 py-0.5 rounded-full text-xs bg-amber-100 text-amber-700">
                          {request.status}
                        </span>
                      </div>
                      <p className="text-gray-500 text-sm">{request.user_id?.email}</p>
                      <p className="text-gray-400 text-xs mt-1">Requested on {formatDate(request.requested_at)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-600 text-sm">Card Type</p>
                      <p className="text-gray-800 font-medium capitalize">{request.type} Card</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-3 pt-4 border-t border-gray-100">
                    <button
                      onClick={() => handleApprove(request._id)}
                      disabled={approvingId === request._id || rejectingId === request._id}
                      className="flex-1 px-4 py-2 bg-emerald hover:bg-emerald-dark text-white rounded-lg text-sm font-medium transition-all disabled:opacity-50"
                    >
                      {approvingId === request._id ? 'Approving...' : 'Approve'}
                    </button>
                    <button
                      onClick={() => handleReject(request._id)}
                      disabled={approvingId === request._id || rejectingId === request._id}
                      className="flex-1 px-4 py-2 border border-red-300 text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium transition-all disabled:opacity-50"
                    >
                      {rejectingId === request._id ? 'Rejecting...' : 'Reject'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 text-center">
          <p className="text-gray-400 text-xs">
            {requests.length} pending request{requests.length !== 1 ? 's' : ''}
          </p>
        </div>
      </main>
    </div>
  )
}

export default CardRequests
import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import API from '../../services/api'

const LoanApplications = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [allLoans, setAllLoans] = useState([])
  const [activeTab, setActiveTab] = useState('pending')
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
    fetchAllLoans()
  }, [])

  const fetchAllLoans = async () => {
    try {
      const response = await API.get('/loans/all')
      setAllLoans(response.data)
      setLoading(false)
    } catch (err) {
      console.error('Error fetching loans:', err)
      setError('Failed to load loans')
      setLoading(false)
    }
  }

  const handleApprove = async (loanId) => {
    setApprovingId(loanId)
    try {
      const response = await API.post(`/loans/${loanId}/approve`)
      setMessage(response.data.message || 'Loan approved successfully')
      fetchAllLoans()
      setTimeout(() => setMessage(''), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to approve loan')
      setTimeout(() => setError(''), 3000)
    } finally {
      setApprovingId(null)
    }
  }

  const handleReject = async (loanId) => {
    setRejectingId(loanId)
    try {
      const response = await API.post(`/loans/${loanId}/reject`)
      setMessage(response.data.message || 'Loan rejected')
      fetchAllLoans()
      setTimeout(() => setMessage(''), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reject loan')
      setTimeout(() => setError(''), 3000)
    } finally {
      setRejectingId(null)
    }
  }

  const getFilteredLoans = () => {
    switch(activeTab) {
      case 'pending':
        return allLoans.filter(l => l.status === 'pending')
      case 'active':
        return allLoans.filter(l => l.status === 'active')
      case 'paid':
        return allLoans.filter(l => l.status === 'paid')
      case 'rejected':
        return allLoans.filter(l => l.status === 'rejected')
      default:
        return allLoans.filter(l => l.status === 'pending')
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-PK', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric'
    })
  }

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'bg-amber-100 text-amber-700',
      active: 'bg-emerald/10 text-emerald',
      paid: 'bg-gray-100 text-gray-600',
      rejected: 'bg-red-50 text-red-600'
    }
    return badges[status] || badges.pending
  }

  const filteredLoans = getFilteredLoans()

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
          <h1 className="text-3xl font-light text-gray-900">Loan Management</h1>
          <p className="text-gray-400 text-sm mt-1">View and manage all customer loans</p>
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

        {/* Tabs */}
        <div className="flex gap-2 border-b border-gray-200 mb-6">
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-6 py-2 text-sm font-medium transition-all ${
              activeTab === 'pending' 
                ? 'text-emerald border-b-2 border-emerald' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Pending ({allLoans.filter(l => l.status === 'pending').length})
          </button>
          <button
            onClick={() => setActiveTab('active')}
            className={`px-6 py-2 text-sm font-medium transition-all ${
              activeTab === 'active' 
                ? 'text-emerald border-b-2 border-emerald' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Active ({allLoans.filter(l => l.status === 'active').length})
          </button>
          <button
            onClick={() => setActiveTab('paid')}
            className={`px-6 py-2 text-sm font-medium transition-all ${
              activeTab === 'paid' 
                ? 'text-emerald border-b-2 border-emerald' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Paid ({allLoans.filter(l => l.status === 'paid').length})
          </button>
          <button
            onClick={() => setActiveTab('rejected')}
            className={`px-6 py-2 text-sm font-medium transition-all ${
              activeTab === 'rejected' 
                ? 'text-emerald border-b-2 border-emerald' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Rejected ({allLoans.filter(l => l.status === 'rejected').length})
          </button>
        </div>

        {filteredLoans.length === 0 ? (
          <div className="bg-gray-50 rounded-2xl py-16 text-center">
            <p className="text-gray-500 text-lg">No {activeTab} loans found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredLoans.map((loan) => (
              <div key={loan._id} className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-medium text-gray-900">{loan.user_id?.full_name}</h3>
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs ${getStatusBadge(loan.status)}`}>
                          {loan.status}
                        </span>
                      </div>
                      <p className="text-gray-500 text-sm">{loan.user_id?.email}</p>
                      <p className="text-gray-400 text-xs mt-1">
                        {activeTab === 'pending' ? 'Applied' : activeTab === 'active' ? 'Approved' : 'Processed'} on {formatDate(loan.created_at)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-600 text-sm">Loan Amount</p>
                      <p className="text-gray-800 font-medium">{formatCurrency(loan.principal)}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 pt-2">
                    <div>
                      <p className="text-gray-400 text-xs">Interest Rate</p>
                      <p className="text-gray-700 font-medium">{loan.interest_rate}% p.a.</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs">Duration</p>
                      <p className="text-gray-700 font-medium">{loan.duration_months} months</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs">Monthly Payment</p>
                      <p className="text-gray-700 font-medium">{formatCurrency(loan.monthly_installment)}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs">Remaining Balance</p>
                      <p className="text-gray-700 font-medium">{formatCurrency(loan.remaining_balance)}</p>
                    </div>
                  </div>

                  {/* Repayment progress bar for active loans */}
                  {loan.status === 'active' && (
                    <div className="mb-4">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>Repayment progress</span>
                        <span>{Math.round((1 - loan.remaining_balance / loan.principal) * 100)}%</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div 
                          className="bg-emerald h-2 rounded-full" 
                          style={{ width: `${(1 - loan.remaining_balance / loan.principal) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                  
                  {/* Action buttons - only show for pending loans */}
                  {activeTab === 'pending' && (
                    <div className="flex gap-3 pt-4 border-t border-gray-100">
                      <button
                        onClick={() => handleApprove(loan._id)}
                        disabled={approvingId === loan._id || rejectingId === loan._id}
                        className="flex-1 px-4 py-2 bg-emerald hover:bg-emerald-dark text-white rounded-lg text-sm font-medium transition-all disabled:opacity-50"
                      >
                        {approvingId === loan._id ? 'Approving...' : 'Approve'}
                      </button>
                      <button
                        onClick={() => handleReject(loan._id)}
                        disabled={approvingId === loan._id || rejectingId === loan._id}
                        className="flex-1 px-4 py-2 border border-red-300 text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium transition-all disabled:opacity-50"
                      >
                        {rejectingId === loan._id ? 'Rejecting...' : 'Reject'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

export default LoanApplications
import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import API from '../../services/api'

const Loans = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [loans, setLoans] = useState([])
  const [showApplyModal, setShowApplyModal] = useState(false)
  const [showRepayModal, setShowRepayModal] = useState(false)
  const [selectedLoan, setSelectedLoan] = useState(null)
  const [repayAmount, setRepayAmount] = useState('')
  const [formData, setFormData] = useState({
    principal: '',
    duration_months: '12'
  })
  const [calculatedRate, setCalculatedRate] = useState(null)
  const [monthlyInstallment, setMonthlyInstallment] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    fetchLoans()
  }, [])

  const fetchLoans = async () => {
    try {
      const response = await API.get('/loans/my-loans')
      setLoans(response.data)
      setLoading(false)
    } catch (err) {
      console.error('Error fetching loans:', err)
      setError('Failed to load loans')
      setLoading(false)
    }
  }

  const calculateMonthlyInstallment = (principal, annualRate, months) => {
    const monthlyRate = annualRate / 100 / 12
    if (monthlyRate === 0) return principal / months
    const installment = principal * monthlyRate * Math.pow(1 + monthlyRate, months) / (Math.pow(1 + monthlyRate, months) - 1)
    return Math.round(installment)
  }

  // Calculate estimated rate based on loan amount and duration (frontend preview)
  useEffect(() => {
    const principal = parseFloat(formData.principal)
    const duration = parseInt(formData.duration_months)
    
    if (principal && principal >= 10000 && duration) {
      let baseRate = 12
      
      // Amount-based adjustment
      if (principal >= 500000) baseRate -= 1.5
      else if (principal >= 100000) baseRate -= 0.5
      else if (principal < 30000) baseRate += 2
      
      // Duration-based adjustment
      if (duration <= 12) baseRate -= 0.5
      else if (duration > 36) baseRate += 1.5
      
      const finalRate = Math.min(28, Math.max(8, baseRate))
      setCalculatedRate(finalRate)
      
      const installment = calculateMonthlyInstallment(principal, finalRate, duration)
      setMonthlyInstallment(installment)
    } else {
      setCalculatedRate(null)
      setMonthlyInstallment(0)
    }
  }, [formData.principal, formData.duration_months])

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    setMessage('')
    setError('')
  }

  const handleApplyLoan = async () => {
    const principal = parseFloat(formData.principal)
    if (!principal || principal < 10000) {
      setError('Minimum loan amount is Rs 10,000')
      return
    }
    if (principal > 10000000) {
      setError('Maximum loan amount is Rs 10,000,000')
      return
    }

    setSubmitting(true)
    setMessage('')
    setError('')

    try {
      const response = await API.post('/loans/apply', {
        principal: principal,
        duration_months: parseInt(formData.duration_months)
      })

      setMessage(response.data.message || 'Loan application submitted successfully')
      setShowApplyModal(false)
      setFormData({ principal: '', duration_months: '12' })
      setCalculatedRate(null)
      fetchLoans()
      setTimeout(() => setMessage(''), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to apply for loan')
      setTimeout(() => setError(''), 3000)
    } finally {
      setSubmitting(false)
    }
  }

  const handleRepayLoan = async () => {
    const amount = parseFloat(repayAmount)
    if (!amount || amount <= 0) {
      setError('Please enter a valid amount')
      return
    }
    if (amount > selectedLoan.remaining_balance) {
      setError('Amount exceeds remaining balance')
      return
    }

    setSubmitting(true)
    setMessage('')
    setError('')

    try {
      const response = await API.post('/loans/repay', {
        loanId: selectedLoan._id,
        amount: amount
      })

      setMessage(response.data.message || `Repayment of Rs ${amount.toLocaleString()} successful`)
      setShowRepayModal(false)
      setRepayAmount('')
      setSelectedLoan(null)
      fetchLoans()
      setTimeout(() => setMessage(''), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Repayment failed')
      setTimeout(() => setError(''), 3000)
    } finally {
      setSubmitting(false)
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
    if (!dateString) return 'Pending'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-PK', { year: 'numeric', month: 'short', day: 'numeric' })
  }

  const getLoanStatusBadge = (status) => {
    const badges = {
      pending: 'bg-amber-100 text-amber-700',
      active: 'bg-emerald/10 text-emerald',
      paid: 'bg-gray-100 text-gray-600',
      rejected: 'bg-red-50 text-red-600',
      defaulted: 'bg-red-100 text-red-700'
    }
    return badges[status] || badges.pending
  }

  const activeLoans = loans.filter(l => l.status === 'active')
  const pendingLoans = loans.filter(l => l.status === 'pending')
  const paidLoans = loans.filter(l => l.status === 'paid')
  const rejectedLoans = loans.filter(l => l.status === 'rejected')

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-emerald border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      
      {/* Header */}
      <header className="border-b border-gray-100 bg-white sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <Link to="/dashboard" className="text-gray-400 hover:text-gray-600 text-sm">← Back</Link>
            <div className="text-xl font-light tracking-wide text-gray-900">COMET</div>
            <div className="w-16"></div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10">
        
        {/* Page Title */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-light text-gray-900">Loans</h1>
            <p className="text-gray-400 text-sm mt-1">Apply for loans and manage repayments</p>
          </div>
          <button
            onClick={() => setShowApplyModal(true)}
            className="px-5 py-2.5 bg-emerald text-white rounded-xl text-sm font-medium hover:bg-emerald-dark transition-all"
          >
            + Apply for loan
          </button>
        </div>

        {/* Messages */}
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

        {/* Active Loans Section */}
        {activeLoans.length > 0 && (
          <div className="mb-8">
            <h2 className="text-gray-800 font-medium mb-4">Active Loans</h2>
            <div className="space-y-4">
              {activeLoans.map((loan) => (
                <div key={loan._id} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <span className={`px-2 py-0.5 rounded-full text-xs ${getLoanStatusBadge(loan.status)}`}>
                        {loan.status}
                      </span>
                      <p className="text-gray-500 text-xs mt-2">Applied on {formatDate(loan.created_at)}</p>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedLoan(loan)
                        setShowRepayModal(true)
                      }}
                      className="text-emerald text-sm font-medium hover:underline"
                    >
                      Make repayment →
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-gray-400 text-xs">Principal</p>
                      <p className="text-gray-800 font-medium">{formatCurrency(loan.principal)}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs">Interest Rate</p>
                      <p className="text-gray-800 font-medium">{loan.interest_rate}% p.a.</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs">Monthly Payment</p>
                      <p className="text-gray-800 font-medium">{formatCurrency(loan.monthly_installment)}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs">Remaining</p>
                      <p className="text-gray-800 font-medium">{formatCurrency(loan.remaining_balance)}</p>
                    </div>
                  </div>
                  
                  <div>
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
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pending Loans Section */}
        {pendingLoans.length > 0 && (
          <div className="mb-8">
            <h2 className="text-gray-800 font-medium mb-4">Pending Applications</h2>
            <div className="space-y-3">
              {pendingLoans.map((loan) => (
                <div key={loan._id} className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="px-2 py-0.5 rounded-full text-xs bg-amber-100 text-amber-700">pending</span>
                      <p className="text-gray-700 font-medium mt-2">{formatCurrency(loan.principal)}</p>
                      <p className="text-gray-500 text-xs">{loan.interest_rate}% p.a. • {loan.duration_months} months</p>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-400 text-xs">Monthly installment</p>
                      <p className="text-gray-700 font-medium">{formatCurrency(loan.monthly_installment)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Paid & Rejected Loans Section */}
        {(paidLoans.length > 0 || rejectedLoans.length > 0) && (
          <div className="mb-8">
            <h2 className="text-gray-800 font-medium mb-4">Past Loans</h2>
            <div className="space-y-3">
              {paidLoans.map((loan) => (
                <div key={loan._id} className="bg-gray-50 rounded-xl p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="px-2 py-0.5 rounded-full text-xs bg-gray-200 text-gray-600">paid</span>
                      <p className="text-gray-700 font-medium mt-2">{formatCurrency(loan.principal)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-400 text-xs">Paid on</p>
                      <p className="text-gray-600 text-sm">{formatDate(loan.approved_at)}</p>
                    </div>
                  </div>
                </div>
              ))}
              {rejectedLoans.map((loan) => (
                <div key={loan._id} className="bg-gray-50 rounded-xl p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="px-2 py-0.5 rounded-full text-xs bg-red-100 text-red-600">rejected</span>
                      <p className="text-gray-700 font-medium mt-2">{formatCurrency(loan.principal)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-400 text-xs">Applied on</p>
                      <p className="text-gray-600 text-sm">{formatDate(loan.created_at)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No Loans State */}
        {loans.length === 0 && (
          <div className="bg-gray-50 rounded-2xl py-16 text-center">
            <p className="text-gray-500 text-lg">No loans yet</p>
            <p className="text-gray-400 text-sm mt-1">Apply for a loan to get started</p>
          </div>
        )}

        {/* Apply Loan Modal */}
        {showApplyModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-light text-gray-900">Apply for a loan</h2>
                <button onClick={() => setShowApplyModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors">✕</button>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-gray-600 text-sm mb-1">Loan amount (Rs)</label>
                  <input
                    type="number"
                    name="principal"
                    value={formData.principal}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-emerald transition-all"
                    placeholder="Minimum Rs 10,000"
                    min="10000"
                    step="10000"
                  />
                  <p className="text-gray-400 text-xs mt-1">Minimum: Rs 10,000 | Maximum: Rs 10,000,000</p>
                </div>

                <div>
                  <label className="block text-gray-600 text-sm mb-1">Duration</label>
                  <select
                    name="duration_months"
                    value={formData.duration_months}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-emerald transition-all"
                  >
                    <option value="6">6 months</option>
                    <option value="12">12 months (1 year)</option>
                    <option value="24">24 months (2 years)</option>
                    <option value="36">36 months (3 years)</option>
                    <option value="48">48 months (4 years)</option>
                    <option value="60">60 months (5 years)</option>
                  </select>
                </div>

                {calculatedRate && monthlyInstallment > 0 && (
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-gray-500 text-sm">Interest rate</span>
                      <span className="text-emerald font-semibold">{calculatedRate}% per annum</span>
                    </div>
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-gray-500 text-sm">Monthly installment</span>
                      <span className="text-gray-900 font-medium">{formatCurrency(monthlyInstallment)}</span>
                    </div>
                    <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                      <span className="text-gray-500 text-sm">Total repayment</span>
                      <span className="text-gray-900 font-medium">{formatCurrency(monthlyInstallment * parseInt(formData.duration_months))}</span>
                    </div>
                    <p className="text-gray-400 text-xs mt-3 pt-2 border-t border-gray-200">
                      Rate calculated based on loan amount, duration, and your risk profile.
                    </p>
                  </div>
                )}

                <button
                  onClick={handleApplyLoan}
                  disabled={submitting || !formData.principal || parseFloat(formData.principal) < 10000}
                  className="w-full bg-emerald hover:bg-emerald-dark text-white py-3 rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Submitting...' : 'Submit application'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Repayment Modal */}
        {showRepayModal && selectedLoan && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-light text-gray-900">Make a repayment</h2>
                <button onClick={() => setShowRepayModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors">✕</button>
              </div>

              <div className="space-y-5">
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-500 text-sm">Loan principal</span>
                    <span className="text-gray-800 font-medium">{formatCurrency(selectedLoan.principal)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 text-sm">Remaining balance</span>
                    <span className="text-emerald font-semibold">{formatCurrency(selectedLoan.remaining_balance)}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-gray-600 text-sm mb-1">Repayment amount</label>
                  <input
                    type="number"
                    value={repayAmount}
                    onChange={(e) => setRepayAmount(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-emerald transition-all"
                    placeholder={`Suggested: ${formatCurrency(selectedLoan.monthly_installment)}`}
                    min={selectedLoan.monthly_installment}
                    max={selectedLoan.remaining_balance}
                    step="1000"
                  />
                  <p className="text-gray-400 text-xs mt-1">
                    Suggested monthly payment: {formatCurrency(selectedLoan.monthly_installment)}
                  </p>
                </div>

                <button
                  onClick={handleRepayLoan}
                  disabled={submitting || !repayAmount}
                  className="w-full bg-emerald hover:bg-emerald-dark text-white py-3 rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Processing...' : `Repay ${repayAmount ? formatCurrency(parseFloat(repayAmount)) : ''}`}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default Loans
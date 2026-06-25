import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import API from '../../services/api'

const History = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [transactions, setTransactions] = useState([])
  const [filteredTransactions, setFilteredTransactions] = useState([])
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [dateRange, setDateRange] = useState({ start: '', end: '' })
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    fetchTransactions()
  }, [])

  const fetchTransactions = async () => {
    try {
      const response = await API.get('/transactions/history')
      setTransactions(response.data)
      setFilteredTransactions(response.data)
      setLoading(false)
    } catch (err) {
      console.error('Error fetching transactions:', err)
      setError('Failed to load transaction history')
      setLoading(false)
    }
  }

  // Apply filters whenever filter, searchTerm, dateRange, or transactions change
  useEffect(() => {
    let filtered = [...transactions]

    // Filter by type
    if (filter !== 'all') {
      filtered = filtered.filter(tx => tx.type === filter)
    }

    // Filter by search term (looks in to_account and from_account)
    if (searchTerm) {
      filtered = filtered.filter(tx => 
        tx.to_account?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.from_account?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by date range
    if (dateRange.start) {
      const startDate = new Date(dateRange.start)
      startDate.setHours(0, 0, 0, 0)
      filtered = filtered.filter(tx => new Date(tx.timestamp) >= startDate)
    }
    if (dateRange.end) {
      const endDate = new Date(dateRange.end)
      endDate.setHours(23, 59, 59, 999)
      filtered = filtered.filter(tx => new Date(tx.timestamp) <= endDate)
    }

    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))

    setFilteredTransactions(filtered)
  }, [filter, searchTerm, dateRange, transactions])

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
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getTransactionIcon = (type, isIncoming) => {
    if (type === 'deposit' || type === 'loan_disbursement') return '↓'
    if (type === 'withdrawal') return '↑'
    if (type === 'payment') return '📋'
    if (type === 'loan_repayment') return '◷'
    return isIncoming ? '↓' : '↑'
  }

  const getTransactionColor = (type, isIncoming) => {
    if (type === 'deposit' || type === 'loan_disbursement') return 'text-emerald'
    if (type === 'withdrawal') return 'text-red-500'
    if (type === 'payment') return 'text-blue-500'
    if (type === 'loan_repayment') return 'text-purple-500'
    return isIncoming ? 'text-emerald' : 'text-gray-700'
  }

  const getTransactionTitle = (tx) => {
    if (tx.type === 'deposit') return 'Deposit'
    if (tx.type === 'withdrawal') return 'Withdrawal'
    if (tx.type === 'payment') return `Payment to ${tx.to_account?.slice(-6) || 'Merchant'}`
    if (tx.type === 'loan_repayment') return 'Loan Repayment'
    if (tx.type === 'loan_disbursement') return 'Loan Disbursement'
    if (tx.type === 'transfer') {
      const isIncoming = tx.type === 'deposit' || tx.type === 'loan_disbursement'
      return isIncoming ? 'Money Received' : 'Money Sent'
    }
    return 'Transaction'
  }

  const resetFilters = () => {
    setFilter('all')
    setSearchTerm('')
    setDateRange({ start: '', end: '' })
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
      
      {/* Header */}
      <header className="border-b border-gray-100 bg-white sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <Link to="/dashboard" className="text-gray-400 hover:text-gray-600 text-sm">← Back</Link>
            <div className="text-xl font-light tracking-wide text-gray-900">COMET</div>
            <div className="w-16"></div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-light text-gray-900">Transaction History</h1>
          <p className="text-gray-400 text-sm mt-1">View and filter all your transactions</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-red-600 text-sm text-center">{error}</p>
          </div>
        )}

        {/* Filters Section */}
        <div className="bg-gray-50 rounded-2xl p-5 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Transaction Type Filter */}
            <div>
              <label className="block text-gray-500 text-xs mb-1">Transaction type</label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white focus:outline-none focus:border-emerald text-sm"
              >
                <option value="all">All transactions</option>
                <option value="transfer">Transfers</option>
                <option value="deposit">Deposits</option>
                <option value="withdrawal">Withdrawals</option>
                <option value="payment">Payments</option>
                <option value="loan_repayment">Loan Repayments</option>
                <option value="loan_disbursement">Loan Disbursements</option>
              </select>
            </div>

            {/* Search */}
            <div>
              <label className="block text-gray-500 text-xs mb-1">Search</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Account number..."
                className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white focus:outline-none focus:border-emerald text-sm"
              />
            </div>

            {/* Date Range - Start */}
            <div>
              <label className="block text-gray-500 text-xs mb-1">From date</label>
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white focus:outline-none focus:border-emerald text-sm"
              />
            </div>

            {/* Date Range - End */}
            <div>
              <label className="block text-gray-500 text-xs mb-1">To date</label>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white focus:outline-none focus:border-emerald text-sm"
              />
            </div>
          </div>

          {/* Reset Filters Button */}
          {(filter !== 'all' || searchTerm || dateRange.start || dateRange.end) && (
            <div className="mt-4 text-right">
              <button
                onClick={resetFilters}
                className="text-emerald text-sm hover:underline"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>

        {/* Transactions Count */}
        <div className="mb-4 flex justify-between items-center">
          <p className="text-gray-500 text-sm">
            Showing {filteredTransactions.length} of {transactions.length} transactions
          </p>
        </div>

        {/* Transactions List */}
        {filteredTransactions.length > 0 ? (
          <div className="space-y-2">
            {filteredTransactions.map((tx, idx) => {
              const isIncoming = tx.type === 'deposit' || tx.type === 'loan_disbursement'
              const amount = isIncoming ? tx.amount : -tx.amount
              
              return (
                <div key={idx} className="bg-white border border-gray-100 rounded-xl p-4 hover:shadow-sm transition-shadow">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        isIncoming ? 'bg-emerald/10' : 'bg-gray-100'
                      }`}>
                        <span className={`text-lg ${getTransactionColor(tx.type, isIncoming)}`}>
                          {getTransactionIcon(tx.type, isIncoming)}
                        </span>
                      </div>
                      <div>
                        <p className="text-gray-800 font-medium">{getTransactionTitle(tx)}</p>
                        <p className="text-gray-400 text-xs">{formatDate(tx.timestamp)}</p>
                        {tx.fraud_flags && tx.fraud_flags.length > 0 && (
                          <div className="flex gap-1 mt-1">
                            {tx.fraud_flags.map((flag, i) => (
                              <span key={i} className="text-amber-600 text-[10px] bg-amber-50 px-1.5 py-0.5 rounded">
                                {flag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-medium ${isIncoming ? 'text-emerald' : 'text-gray-700'}`}>
                        {isIncoming ? '+' : '-'}{formatCurrency(Math.abs(amount))}
                      </p>
                      <p className="text-gray-400 text-xs capitalize">{tx.status}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="bg-gray-50 rounded-2xl py-16 text-center">
            <p className="text-gray-500 text-lg">No transactions found</p>
            <p className="text-gray-400 text-sm mt-1">Try adjusting your filters or make your first transaction</p>
          </div>
        )}
      </main>
    </div>
  )
}

export default History
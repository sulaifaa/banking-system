import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import API from '../../services/api'

const Deposit = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [accounts, setAccounts] = useState([])
  const [formData, setFormData] = useState({
    account_id: '',
    amount: ''
  })
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    fetchAccounts()
  }, [])

  const fetchAccounts = async () => {
    try {
      const response = await API.get('/users/accounts')
      setAccounts(response.data)
      if (response.data.length > 0) {
        setFormData(prev => ({ ...prev, account_id: response.data[0]._id }))
      }
    } catch (err) {
      console.error('Error fetching accounts:', err)
      setError('Failed to load accounts')
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    setMessage('')
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      setError('Please enter a valid amount')
      return
    }

    setLoading(true)
    setMessage('')
    setError('')

    try {
      const response = await API.post(`/accounts/${formData.account_id}/deposit`, {
        amount: parseFloat(formData.amount)
      })

      const amountNum = parseFloat(formData.amount)
      setMessage(`Successfully deposited ${new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR' }).format(amountNum)}`)
      setFormData({ ...formData, amount: '' })
      
      // Refresh account balance in parent component if needed
      setTimeout(() => {
        navigate('/dashboard')
      }, 2000)
    } catch (err) {
      setError(err.response?.data?.message || 'Deposit failed. Please try again.')
    } finally {
      setLoading(false)
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

  const selectedAccount = accounts.find(acc => acc._id === formData.account_id)

  // Quick amount buttons
  const quickAmounts = [1000, 5000, 10000, 25000, 50000]

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
        <div className="mb-8">
          <h1 className="text-3xl font-light text-gray-900">Deposit money</h1>
          <p className="text-gray-400 text-sm mt-1">Add funds to your account</p>
        </div>

        {/* Deposit Card */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
          
          {/* Account Selection */}
          <div className="p-6 border-b border-gray-50">
            <label className="block text-gray-500 text-sm mb-2">Select account</label>
            <select
              name="account_id"
              value={formData.account_id}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-800 focus:outline-none focus:border-emerald"
            >
              {accounts.map(acc => (
                <option key={acc._id} value={acc._id}>
                  {acc.account_type?.toUpperCase()} •••• {acc._id?.slice(-4)} — Balance: {formatCurrency(acc.balance)}
                </option>
              ))}
            </select>
            {selectedAccount && (
              <p className="text-gray-400 text-xs mt-2">
                Current balance: {formatCurrency(selectedAccount.balance)}
              </p>
            )}
          </div>

          {/* Amount Input */}
          <div className="p-6 border-b border-gray-50">
            <label className="block text-gray-500 text-sm mb-2">Amount to deposit</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">PKR</span>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                className="w-full pl-16 pr-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-emerald"
                placeholder="0.00"
                min="0"
                step="100"
                required
              />
            </div>
          </div>

          {/* Quick Amount Buttons */}
          <div className="p-6 border-b border-gray-50">
            <label className="block text-gray-500 text-sm mb-3">Quick deposit</label>
            <div className="flex flex-wrap gap-3">
              {quickAmounts.map((amount) => (
                <button
                  key={amount}
                  type="button"
                  onClick={() => setFormData({ ...formData, amount: amount.toString() })}
                  className="px-4 py-2 bg-gray-50 hover:bg-emerald/10 border border-gray-200 rounded-lg text-gray-700 text-sm transition-all hover:border-emerald"
                >
                  {formatCurrency(amount)}
                </button>
              ))}
            </div>
          </div>

          {/* Message & Error */}
          {message && (
            <div className="mx-6 mt-4 p-3 bg-emerald/10 border border-emerald/20 rounded-xl">
              <p className="text-emerald text-sm text-center">{message}</p>
            </div>
          )}
          
          {error && (
            <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-red-600 text-sm text-center">{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <div className="p-6 bg-gray-50">
            <button
              onClick={handleSubmit}
              disabled={loading || !formData.amount}
              className="w-full bg-emerald hover:bg-emerald-dark text-white font-medium py-3.5 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Processing...' : `Deposit ${formData.amount ? `PKR ${parseFloat(formData.amount).toLocaleString()}` : ''}`}
            </button>
          </div>
        </div>

        {/* Info Note */}
        <div className="mt-6 text-center">
          <p className="text-gray-400 text-xs">
            Deposits are instant and reflected immediately in your balance.
          </p>
        </div>
      </main>
    </div>
  )
}

export default Deposit
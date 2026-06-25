import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import API from '../../services/api'

const Payments = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [accounts, setAccounts] = useState([])
  const [payments, setPayments] = useState([])
  const [spendingData, setSpendingData] = useState([])
  const [formData, setFormData] = useState({
    account_id: '',
    merchant: '',
    amount: '',
    category: 'utility'
  })
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const merchants = [
    { name: 'K-Electric', category: 'utility', icon: '⚡' },
    { name: 'SSGC', category: 'utility', icon: '🔥' },
    { name: 'PTCL', category: 'utility', icon: '📞' },
    { name: 'JazzCash', category: 'mobile', icon: '📱' },
    { name: 'Zong', category: 'mobile', icon: '📱' },
    { name: 'Daraz', category: 'shopping', icon: '🛍️' },
    { name: 'Foodpanda', category: 'food', icon: '🍔' },
    { name: 'Uber', category: 'transport', icon: '🚗' }
  ]

  useEffect(() => {
    fetchAccounts()
    fetchPaymentHistory()
    fetchSpendingData()
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
    }
  }

  const fetchPaymentHistory = async () => {
    try {
      const response = await API.get('/payments/history')
      setPayments(response.data.slice(0, 10))
    } catch (err) {
      console.error('Error fetching payments:', err)
    }
  }

  const fetchSpendingData = async () => {
    try {
      const response = await API.get('/payments/spending-by-category')
      setSpendingData(response.data)
    } catch (err) {
      console.error('Error fetching spending data:', err)
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

  const handleMerchantSelect = (merchant) => {
    setFormData({
      ...formData,
      merchant: merchant.name,
      category: merchant.category
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    setError('')

    try {
      const response = await API.post('/payments/pay', {
        account_id: formData.account_id,
        merchant: formData.merchant,
        amount: parseFloat(formData.amount),
        category: formData.category
      })

      setMessage(`Payment of PKR ${formData.amount} to ${formData.merchant} successful!`)
      setFormData({ ...formData, merchant: '', amount: '' })
      
      // Refresh data
      fetchPaymentHistory()
      fetchSpendingData()
      
      setTimeout(() => {
        setMessage('')
      }, 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Payment failed')
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

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-PK', { month: 'short', day: 'numeric' })
  }

  const getCategoryColor = (category) => {
    const colors = {
      utility: 'bg-blue-100 text-blue-700',
      mobile: 'bg-purple-100 text-purple-700',
      shopping: 'bg-pink-100 text-pink-700',
      food: 'bg-orange-100 text-orange-700',
      transport: 'bg-cyan-100 text-cyan-700',
      education: 'bg-indigo-100 text-indigo-700',
      other: 'bg-gray-100 text-gray-700'
    }
    return colors[category] || colors.other
  }

  const selectedAccount = accounts.find(acc => acc._id === formData.account_id)

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
          <h1 className="text-3xl font-light text-gray-900">Payments</h1>
          <p className="text-gray-400 text-sm mt-1">Pay bills, top-up mobile, and manage expenses</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Left Column - Make Payment */}
          <div>
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-50">
                <h2 className="text-gray-800 font-medium">Make a payment</h2>
                <p className="text-gray-400 text-sm mt-1">Select a merchant and enter amount</p>
              </div>

              <div className="p-6 space-y-5">
                {/* Account Selection */}
                <div>
                  <label className="block text-gray-500 text-sm mb-2">Pay from</label>
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
                      Available: {formatCurrency(selectedAccount.balance)}
                    </p>
                  )}
                </div>

                {/* Merchant Quick Select */}
                <div>
                  <label className="block text-gray-500 text-sm mb-2">Select merchant</label>
                  <div className="grid grid-cols-4 gap-2 mb-3">
                    {merchants.map((merchant, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleMerchantSelect(merchant)}
                        className="bg-gray-50 hover:bg-emerald/5 border border-gray-100 rounded-xl py-2 text-center transition-all hover:border-emerald/30"
                      >
                        <div className="text-gray-600 text-lg">{merchant.icon}</div>
                        <div className="text-gray-600 text-xs mt-0.5">{merchant.name.split(' ')[0]}</div>
                      </button>
                    ))}
                  </div>
                  <input
                    type="text"
                    name="merchant"
                    value={formData.merchant}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-emerald"
                    placeholder="Or enter merchant name"
                  />
                </div>

                {/* Amount */}
                <div>
                  <label className="block text-gray-500 text-sm mb-2">Amount</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">PKR</span>
                    <input
                      type="number"
                      name="amount"
                      value={formData.amount}
                      onChange={handleChange}
                      className="w-full pl-16 pr-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-emerald"
                      placeholder="0.00"
                      required
                    />
                  </div>
                </div>

                {/* Category */}
                <div>
                  <label className="block text-gray-500 text-sm mb-2">Category</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-800 focus:outline-none focus:border-emerald"
                  >
                    <option value="utility">Utility (Electricity, Gas, Internet)</option>
                    <option value="mobile">Mobile Top-up</option>
                    <option value="shopping">Shopping</option>
                    <option value="food">Food & Dining</option>
                    <option value="transport">Transport</option>
                    <option value="education">Education</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                {message && (
                  <div className="p-3 bg-emerald/10 border border-emerald/20 rounded-xl">
                    <p className="text-emerald text-sm text-center">{message}</p>
                  </div>
                )}
                
                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
                    <p className="text-red-600 text-sm text-center">{error}</p>
                  </div>
                )}

                <button
                  onClick={handleSubmit}
                  disabled={loading || !formData.merchant || !formData.amount}
                  className="w-full bg-emerald hover:bg-emerald-dark text-white font-medium py-3.5 rounded-xl transition-all disabled:opacity-50"
                >
                  {loading ? 'Processing...' : `Pay ${formData.amount ? `PKR ${parseFloat(formData.amount).toLocaleString()}` : ''}`}
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - History & Stats */}
          <div className="space-y-6">
            
            {/* Spending by Category Chart */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
              <h3 className="text-gray-800 font-medium mb-4">Spending by category</h3>
              {spendingData.length > 0 ? (
                <div className="space-y-3">
                  {spendingData.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center">
                      <span className={`px-2 py-1 rounded-full text-xs ${getCategoryColor(item._id)}`}>
                        {item._id}
                      </span>
                      <span className="text-gray-800 font-light">{formatCurrency(item.total)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-sm text-center py-6">No spending data yet</p>
              )}
            </div>

            {/* Recent Payments */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-gray-800 font-medium">Recent payments</h3>
                <Link to="/payments/history" className="text-emerald text-xs">View all →</Link>
              </div>
              
              {payments.length > 0 ? (
                <div className="space-y-3">
                  {payments.map((payment, idx) => (
                    <div key={idx} className="flex justify-between items-center py-2 border-b border-gray-50">
                      <div>
                        <p className="text-gray-800 text-sm">{payment.merchant}</p>
                        <p className="text-gray-400 text-xs">{formatDate(payment.timestamp)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-gray-700 text-sm">{formatCurrency(payment.amount)}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${getCategoryColor(payment.category)}`}>
                          {payment.category}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-sm text-center py-6">No payments yet</p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Payments
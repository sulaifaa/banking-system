import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import API from '../../services/api'

const Transfer = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [accounts, setAccounts] = useState([])
  const [beneficiaries, setBeneficiaries] = useState([])
  const [formData, setFormData] = useState({
    from_account_id: '',
    to_account_id: '',
    amount: '',
    channel: 'app'
  })
  const [transferType, setTransferType] = useState('beneficiary') // 'beneficiary' or 'new'
  const [newAccountId, setNewAccountId] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    fetchUserData()
  }, [])

  const fetchUserData = async () => {
    try {
      const accountsRes = await API.get('/users/accounts')
      setAccounts(accountsRes.data)
      
      const beneficiariesRes = await API.get('/users/beneficiaries')
      setBeneficiaries(beneficiariesRes.data)
      
      // Set default from account
      if (accountsRes.data.length > 0) {
        setFormData(prev => ({ ...prev, from_account_id: accountsRes.data[0]._id }))
      }
    } catch (err) {
      console.error('Error fetching data:', err)
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
    setLoading(true)
    setMessage('')
    setError('')

    // Determine the to_account_id
    let toAccountId = formData.to_account_id
    if (transferType === 'new') {
      toAccountId = newAccountId
    }

    if (!toAccountId) {
      setError('Please select or enter a recipient account')
      setLoading(false)
      return
    }

    try {
      const response = await API.post('/transactions/transfer', {
        from_account_id: formData.from_account_id,
        to_account_id: toAccountId,
        amount: parseFloat(formData.amount),
        channel: formData.channel
      })

      setMessage(response.data.message || 'Transfer completed successfully!')
      
      // Reset form after success
      setFormData({ ...formData, amount: '', to_account_id: '' })
      setNewAccountId('')
      
      // Redirect after 2 seconds
      setTimeout(() => {
        navigate('/dashboard')
      }, 2000)
      
    } catch (err) {
      console.error('Transfer error:', err)
      setError(err.response?.data?.message || 'Transfer failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const getSelectedAccount = () => {
    return accounts.find(acc => acc._id === formData.from_account_id)
  }

  const selectedAccount = getSelectedAccount()

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
          <h1 className="text-3xl font-light text-gray-900">Transfer money</h1>
          <p className="text-gray-400 text-sm mt-1">Send money to your saved contacts or a new account</p>
        </div>

        {/* Transfer Card */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
          
          {/* From Account Section */}
          <div className="p-6 border-b border-gray-50">
            <label className="block text-gray-500 text-sm mb-2">From account</label>
            <select
              name="from_account_id"
              value={formData.from_account_id}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-800 focus:outline-none focus:border-emerald focus:ring-1 focus:ring-emerald"
            >
              {accounts.map(acc => (
                <option key={acc._id} value={acc._id}>
                  {acc.account_type?.toUpperCase()} •••• {acc._id?.slice(-4)} — {new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR' }).format(acc.balance)}
                </option>
              ))}
            </select>
            {selectedAccount && (
              <p className="text-gray-400 text-xs mt-2">
                Available balance: {new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR' }).format(selectedAccount.balance)}
              </p>
            )}
          </div>

          {/* Transfer Type Toggle */}
          <div className="p-6 border-b border-gray-50">
            <label className="block text-gray-500 text-sm mb-3">Send to</label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setTransferType('beneficiary')}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  transferType === 'beneficiary'
                    ? 'bg-emerald text-white shadow-sm'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                Saved contact
              </button>
              <button
                type="button"
                onClick={() => setTransferType('new')}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  transferType === 'new'
                    ? 'bg-emerald text-white shadow-sm'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                New account
              </button>
            </div>
          </div>

          {/* Recipient Selection */}
          <div className="p-6 border-b border-gray-50">
            {transferType === 'beneficiary' ? (
              <>
                <label className="block text-gray-500 text-sm mb-2">Select beneficiary</label>
                <select
                  name="to_account_id"
                  value={formData.to_account_id}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-800 focus:outline-none focus:border-emerald focus:ring-1 focus:ring-emerald"
                >
                  <option value="">Select a beneficiary</option>
                  {beneficiaries.map(b => (
                    <option key={b._id} value={b.account_number}>
                      {b.name} — {b.bank} •••• {b.account_number?.slice(-6)}
                    </option>
                  ))}
                </select>
                {beneficiaries.length === 0 && (
                  <p className="text-gray-400 text-xs mt-2">
                    No beneficiaries added.{' '}
                    <Link to="/beneficiaries" className="text-emerald hover:underline">Add one →</Link>
                  </p>
                )}
              </>
            ) : (
              <>
                <label className="block text-gray-500 text-sm mb-2">Recipient account number</label>
                <input
                  type="text"
                  value={newAccountId}
                  onChange={(e) => setNewAccountId(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-emerald focus:ring-1 focus:ring-emerald"
                  placeholder="Enter account number"
                />
                <p className="text-gray-400 text-xs mt-2">
                  First time sending to this account? It will be flagged for security review.
                </p>
              </>
            )}
          </div>

          {/* Amount Section */}
          <div className="p-6 border-b border-gray-50">
            <label className="block text-gray-500 text-sm mb-2">Amount</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">PKR</span>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                className="w-full pl-16 pr-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-emerald focus:ring-1 focus:ring-emerald"
                placeholder="0.00"
                required
              />
            </div>
          </div>

          {/* Message & Error Display */}
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
              disabled={loading || !formData.amount || (!formData.to_account_id && transferType === 'beneficiary') || (transferType === 'new' && !newAccountId)}
              className="w-full bg-emerald hover:bg-emerald-dark text-white font-medium py-3.5 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Processing...' : `Transfer ${formData.amount ? `PKR ${parseFloat(formData.amount).toLocaleString()}` : ''}`}
            </button>
          </div>
        </div>

        {/* Info Note */}
        <div className="mt-6 text-center">
          <p className="text-gray-400 text-xs">
            Daily transfer limit: 200,000 PKR for new accounts • 1,000,000 PKR for saved beneficiaries
          </p>
        </div>
      </main>
    </div>
  )
}

export default Transfer
import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import API from '../../services/api'

const Beneficiaries = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [beneficiaries, setBeneficiaries] = useState([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [otpSent, setOtpSent] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    bank: '',
    account_number: '',
    relation: '',
    otp: ''
  })
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchBeneficiaries()
  }, [])

  const fetchBeneficiaries = async () => {
    try {
      const response = await API.get('/users/beneficiaries')
      setBeneficiaries(response.data)
      setLoading(false)
    } catch (err) {
      console.error('Error fetching beneficiaries:', err)
      setError('Failed to load beneficiaries')
      setLoading(false)
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

  // Handle OTP input change with auto-focus
  const handleOtpChange = (value, index) => {
    const newOtp = formData.otp.split('')
    newOtp[index] = value
    setFormData({ ...formData, otp: newOtp.join('') })
    
    if (value && index < 5) {
      const nextInput = document.getElementById(`beneficiary-otp-${index + 1}`)
      if (nextInput) nextInput.focus()
    }
  }

  const handleOtpKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !formData.otp[index] && index > 0) {
      const prevInput = document.getElementById(`beneficiary-otp-${index - 1}`)
      if (prevInput) prevInput.focus()
    }
  }

  // Step 1: Request OTP
  const requestOtp = async () => {
    if (!formData.name || !formData.bank || !formData.account_number) {
      setError('Please fill in all required fields')
      return
    }

    setSubmitting(true)
    setError('')
    
    try {
      await API.post('/users/beneficiaries', {
        name: formData.name,
        bank: formData.bank,
        account_number: formData.account_number,
        relation: formData.relation
      })
      setOtpSent(true)
      setMessage('OTP sent to your email. Please verify to add beneficiary.')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP')
    } finally {
      setSubmitting(false)
    }
  }

  // Step 2: Verify OTP and complete addition
  const verifyOtpAndAdd = async () => {
    if (!formData.otp || formData.otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP')
      return
    }

    setSubmitting(true)
    setError('')

    try {
      await API.post('/users/beneficiaries', {
        name: formData.name,
        bank: formData.bank,
        account_number: formData.account_number,
        relation: formData.relation,
        otp: formData.otp
      })
      
      setMessage('Beneficiary added successfully!')
      setShowAddModal(false)
      setOtpSent(false)
      setFormData({
        name: '',
        bank: '',
        account_number: '',
        relation: '',
        otp: ''
      })
      fetchBeneficiaries()
      
      setTimeout(() => setMessage(''), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  // Remove beneficiary with delete API call
  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to remove "${name}" from your beneficiaries?`)) {
      try {
        await API.delete(`/users/beneficiaries/${id}`)
        fetchBeneficiaries()
        setMessage(`${name} removed from beneficiaries`)
        setTimeout(() => setMessage(''), 3000)
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to remove beneficiary')
        setTimeout(() => setError(''), 3000)
      }
    }
  }

  const handleCloseModal = () => {
    setShowAddModal(false)
    setOtpSent(false)
    setFormData({
      name: '',
      bank: '',
      account_number: '',
      relation: '',
      otp: ''
    })
    setMessage('')
    setError('')
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
            <h1 className="text-3xl font-light text-gray-900">Beneficiaries</h1>
            <p className="text-gray-400 text-sm mt-1">Manage your trusted contacts for faster transfers</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-5 py-2.5 bg-emerald text-white rounded-xl text-sm font-medium hover:bg-emerald-dark transition-all"
          >
            + Add beneficiary
          </button>
        </div>

        {/* Message Display */}
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

        {/* Beneficiaries List */}
        {beneficiaries.length > 0 ? (
          <div className="space-y-3">
            {beneficiaries.map((b) => (
              <div key={b._id} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-gray-800 font-medium">{b.name}</h3>
                      <span className="text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">{b.relation || 'contact'}</span>
                    </div>
                    <p className="text-gray-500 text-sm mt-1">{b.bank}</p>
                    <p className="text-gray-400 text-xs mt-0.5">Account: •••• {b.account_number?.slice(-6)}</p>
                  </div>
                  <div className="flex gap-4">
                    <Link 
                      to="/transfer" 
                      className="text-emerald text-sm hover:underline"
                      state={{ beneficiary: b }}
                    >
                      Send ↑↓
                    </Link>
                    <button
                      onClick={() => handleDelete(b._id, b.name)}
                      className="text-gray-400 hover:text-red-500 text-sm transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-gray-50 rounded-xl py-16 text-center">
            <p className="text-gray-400 text-lg">No beneficiaries yet</p>
            <p className="text-gray-400 text-sm mt-1">Add your first contact to send money easily</p>
          </div>
        )}

        {/* Elegant Add Beneficiary Modal with OTP */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all duration-300">
            <div className="bg-gradient-to-br from-white via-white to-gray-50 rounded-2xl max-w-md w-full p-0 shadow-2xl transform transition-all duration-300 scale-100">
              
              {/* Header with gradient accent */}
              <div className="relative">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald to-emerald-dark rounded-t-2xl"></div>
                <div className="pt-8 px-8 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald/10 to-emerald/5 rounded-2xl mb-4 shadow-sm">
                    <svg className="w-8 h-8 text-emerald" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-light text-gray-900">
                    {otpSent ? 'Verification required' : 'Add beneficiary'}
                  </h2>
                  <p className="text-gray-500 text-sm mt-2 font-light">
                    {otpSent 
                      ? `Enter the 6-digit code sent to your email to add ${formData.name || 'beneficiary'}`
                      : 'Enter the details of the person you want to add'
                    }
                  </p>
                </div>
              </div>

              {!otpSent ? (
                // Step 1: Add beneficiary details
                <div className="px-8 mt-6 space-y-4">
                  <div>
                    <label className="block text-gray-600 text-sm mb-1 font-medium">Full name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-emerald transition-all"
                      placeholder="Ahmed Raza"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-600 text-sm mb-1 font-medium">Bank name</label>
                    <input
                      type="text"
                      name="bank"
                      value={formData.bank}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-emerald transition-all"
                      placeholder="HBL, UBL, Standard Chartered"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-600 text-sm mb-1 font-medium">Account number</label>
                    <input
                      type="text"
                      name="account_number"
                      value={formData.account_number}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-emerald transition-all"
                      placeholder="Enter account number"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-600 text-sm mb-1 font-medium">Relation (optional)</label>
                    <select
                      name="relation"
                      value={formData.relation}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-emerald transition-all bg-white"
                    >
                      <option value="">Select relation</option>
                      <option value="family">Family</option>
                      <option value="friend">Friend</option>
                      <option value="colleague">Colleague</option>
                      <option value="business">Business</option>
                    </select>
                  </div>

                  <button
                    onClick={requestOtp}
                    disabled={submitting}
                    className="w-full bg-gradient-to-r from-emerald to-emerald-dark hover:from-emerald-dark hover:to-emerald text-white font-medium py-3.5 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-emerald/25 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                  >
                    {submitting ? 'Sending...' : 'Continue →'}
                  </button>
                </div>
              ) : (
                // Step 2: Verify OTP (Elegant design matching Login)
                <div className="px-8 mt-6">
                  <div className="space-y-2">
                    <div className="flex justify-center gap-3">
                      {[...Array(6)].map((_, index) => (
                        <input
                          key={index}
                          type="text"
                          maxLength="1"
                          value={formData.otp[index] || ''}
                          onChange={(e) => handleOtpChange(e.target.value, index)}
                          onKeyDown={(e) => handleOtpKeyDown(e, index)}
                          id={`beneficiary-otp-${index}`}
                          className="w-12 h-14 text-center text-2xl font-semibold rounded-xl border-2 border-gray-200 bg-white text-gray-900 focus:outline-none focus:border-emerald focus:ring-2 focus:ring-emerald/20 transition-all duration-200"
                          autoFocus={index === 0}
                        />
                      ))}
                    </div>
                    {error && (
                      <p className="text-red-500 text-sm text-center mt-3">{error}</p>
                    )}
                  </div>

                  {/* Resend hint */}
                  <div className="mt-6 text-center">
                    <p className="text-gray-400 text-xs">
                      Didn't receive a code?{' '}
                      <button 
                        onClick={requestOtp}
                        className="text-emerald hover:text-emerald-dark font-medium transition-colors"
                      >
                        Click to resend
                      </button>
                    </p>
                  </div>

                  {/* Beneficiary summary */}
                  <div className="mt-6 p-4 bg-gray-50 rounded-xl">
                    <p className="text-gray-500 text-xs">Beneficiary to add:</p>
                    <p className="text-gray-800 text-sm font-medium mt-1">{formData.name}</p>
                    <p className="text-gray-500 text-xs mt-1">{formData.bank} • {formData.account_number?.slice(-6)}</p>
                  </div>

                  <button
                    onClick={verifyOtpAndAdd}
                    disabled={submitting || formData.otp.length !== 6}
                    className="w-full bg-gradient-to-r from-emerald to-emerald-dark hover:from-emerald-dark hover:to-emerald text-white font-medium py-3.5 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-emerald/25 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                  >
                    {submitting ? 'Verifying...' : 'Verify & add →'}
                  </button>
                </div>
              )}

              {/* Cancel button */}
              <div className="p-8 pt-0">
                <button
                  onClick={handleCloseModal}
                  className="w-full text-gray-500 text-sm py-2 hover:text-gray-700 transition-colors font-light"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default Beneficiaries
import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import API from '../../services/api'

const ForgotPassword = () => {
  const navigate = useNavigate()
  const [step, setStep] = useState(1) // 1: email, 2: otp, 3: new password
  const [email, setEmail] = useState('')
  const [userId, setUserId] = useState('')
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [otpError, setOtpError] = useState('')
  const [otpLoading, setOtpLoading] = useState(false)

  const handleSendOtp = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    try {
      const response = await API.post('/auth/forgot-password', { email })
      setUserId(response.data.userId)
      setMessage('OTP sent to your email. Please check your inbox.')
      setStep(2)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP')
    } finally {
      setLoading(false)
    }
  }

  // Handle OTP input change with auto-focus
  const handleOtpChange = (value, index) => {
    const newOtp = otp.split('')
    newOtp[index] = value
    setOtp(newOtp.join(''))
    
    if (value && index < 5) {
      const nextInput = document.getElementById(`reset-otp-${index + 1}`)
      if (nextInput) nextInput.focus()
    }
  }

  const handleOtpKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`reset-otp-${index - 1}`)
      if (prevInput) prevInput.focus()
    }
  }

  const handleVerifyOtp = async () => {
    if (!otp || otp.length !== 6) {
      setOtpError('Please enter a valid 6-digit OTP')
      return
    }

    setOtpLoading(true)
    setOtpError('')
    setError('')

    try {
      // First, verify OTP only (without resetting password)
      const response = await API.post('/auth/verify-reset-otp', {
        userId: userId,
        otp: otp
      })
      
      // OTP verified, move to password reset
      setMessage('OTP verified! Please enter your new password.')
      setStep(3)
    } catch (err) {
      setOtpError(err.response?.data?.message || 'Invalid OTP. Please try again.')
    } finally {
      setOtpLoading(false)
    }
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)
    setError('')
    setMessage('')

    try {
      await API.post('/auth/reset-password', { 
        userId, 
        otp, 
        newPassword 
      })
      setMessage('Password reset successful! Redirecting to login...')
      setTimeout(() => navigate('/login'), 2000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-dark via-slate to-slate-dark p-4">
      <div className="w-full max-w-md animate-fade-in">
        
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="text-4xl font-light tracking-wider text-white mb-2">COMET</div>
          <div className="flex justify-center gap-2 mt-2">
            <div className="w-8 h-px bg-emerald/40"></div>
            <div className="w-12 h-px bg-emerald"></div>
            <div className="w-8 h-px bg-emerald/40"></div>
          </div>
        </div>

        {/* Card */}
        <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20 shadow-xl">
          <h2 className="text-2xl font-medium text-white mb-6 tracking-tight">
            {step === 1 && 'Reset password'}
            {step === 2 && 'Verify OTP'}
            {step === 3 && 'New password'}
          </h2>

          {message && (
            <div className="mb-4 p-3 bg-emerald/10 border border-emerald/20 rounded-xl">
              <p className="text-emerald text-sm text-center">{message}</p>
            </div>
          )}
          
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-red-600 text-sm text-center">{error}</p>
            </div>
          )}

          {step === 1 && (
            <form onSubmit={handleSendOtp} className="space-y-5">
              <div>
                <label className="block text-white/60 text-sm mb-2">Email address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/20 text-white placeholder:text-white/30 focus:outline-none focus:border-emerald"
                  placeholder="Enter your registered email"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald hover:bg-emerald-dark text-white font-medium py-3 rounded-xl transition-all disabled:opacity-50"
              >
                {loading ? 'Sending...' : 'Send OTP →'}
              </button>
            </form>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <div className="text-center">
                <p className="text-white/60 text-sm mb-4">
                  Enter the 6-digit code sent to your email
                </p>
                <div className="flex justify-center gap-3">
                  {[...Array(6)].map((_, index) => (
                    <input
                      key={index}
                      type="text"
                      maxLength="1"
                      value={otp[index] || ''}
                      onChange={(e) => handleOtpChange(e.target.value, index)}
                      onKeyDown={(e) => handleOtpKeyDown(e, index)}
                      id={`reset-otp-${index}`}
                      className="w-12 h-14 text-center text-2xl font-semibold rounded-xl border-2 border-white/20 bg-white/5 text-white focus:outline-none focus:border-emerald transition-all"
                      autoFocus={index === 0}
                    />
                  ))}
                </div>
                {otpError && (
                  <p className="text-red-500 text-sm text-center mt-3">{otpError}</p>
                )}
              </div>
              <button
                onClick={handleVerifyOtp}
                disabled={otpLoading || otp.length !== 6}
                className="w-full bg-emerald hover:bg-emerald-dark text-white font-medium py-3 rounded-xl transition-all disabled:opacity-50"
              >
                {otpLoading ? 'Verifying...' : 'Verify OTP →'}
              </button>
            </div>
          )}

          {step === 3 && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-white/60 text-sm mb-2">New password</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/20 text-white placeholder:text-white/30 focus:outline-none focus:border-emerald"
                  placeholder="Minimum 6 characters"
                  required
                />
              </div>
              <div>
                <label className="block text-white/60 text-sm mb-2">Confirm password</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/20 text-white placeholder:text-white/30 focus:outline-none focus:border-emerald"
                  placeholder="Confirm your new password"
                  required
                />
              </div>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-white/40 text-xs hover:text-white/60"
              >
                {showPassword ? 'Hide password' : 'Show password'}
              </button>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald hover:bg-emerald-dark text-white font-medium py-3 rounded-xl transition-all disabled:opacity-50 mt-2"
              >
                {loading ? 'Resetting...' : 'Reset password →'}
              </button>
            </form>
          )}

          <div className="mt-6 text-center">
            <Link to="/login" className="text-white/40 hover:text-white/60 text-sm">
              ← Back to login
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword
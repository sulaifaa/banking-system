import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import API from '../../services/api'

const EmployeeLogin = () => {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const response = await API.post('/auth/employee-login', { email, password })
      console.log('Employee login response:', response.data)
      
      localStorage.setItem('employeeToken', response.data.token)
      localStorage.setItem('employeeRole', response.data.role)
      
      navigate('/employee/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Invalid credentials.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-dark via-slate to-slate-dark p-4">
      <div className="w-full max-w-md animate-fade-in">
        
        {/* Logo Section */}
        <div className="text-center mb-12">
          <div className="text-5xl font-light tracking-wider text-white mb-2">COMET</div>
          <div className="flex justify-center gap-2 mt-3">
            <div className="w-8 h-px bg-emerald/40"></div>
            <div className="w-12 h-px bg-emerald"></div>
            <div className="w-8 h-px bg-emerald/40"></div>
          </div>
          <p className="text-white/50 text-sm mt-3 font-light">Employee Portal</p>
        </div>

        {/* Login Card */}
        <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20 shadow-xl">
          <h2 className="text-2xl font-medium text-white mb-8 tracking-tight">Employee Sign in</h2>

          {error && (
            <div className="mb-4 p-3 bg-red-50/10 border border-red-500/30 rounded-xl">
              <p className="text-red-400 text-sm text-center">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-white/60 text-sm mb-2 font-light">Email</label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-xl bg-white/5 border border-white/20 text-white placeholder:text-white/30 focus:outline-none focus:border-emerald transition-all duration-200"
                  placeholder="employee@comet.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-white/60 text-sm mb-2 font-light">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-xl bg-white/5 border border-white/20 text-white placeholder:text-white/30 focus:outline-none focus:border-emerald pr-24 transition-all duration-200"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-emerald text-xs transition-colors"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-emerald hover:bg-emerald-dark text-white font-medium py-3.5 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-emerald/25 group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="inline-flex items-center justify-center gap-2">
                {isLoading ? 'Signing in...' : 'Sign in'}
                {!isLoading && <span className="group-hover:translate-x-1 transition-transform duration-200">→</span>}
              </span>
            </button>
          </form>

          <div className="mt-8 text-center">
            <Link to="/login" className="text-white/50 hover:text-emerald text-sm transition-colors">
              ← Customer login
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EmployeeLogin
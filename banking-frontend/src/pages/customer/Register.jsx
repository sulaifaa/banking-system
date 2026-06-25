import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import API from '../../services/api'

const Register = () => {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    cnic: '',
    password: '',
    confirmPassword: '',
    address: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isFocused, setIsFocused] = useState({})

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords don't match")
      return
    }

    setIsLoading(true)

    try {
      const response = await API.post('/auth/register', {
        full_name: formData.full_name,
        email: formData.email,
        phone: formData.phone,
        cnic: formData.cnic,
        password: formData.password,
        address: formData.address
      })

      console.log('Registration success:', response.data)
      alert('Account created successfully! Please sign in.')
      navigate('/login')
    } catch (error) {
      console.error('Registration error:', error.response?.data || error.message)
      alert(error.response?.data?.message || 'Registration failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleFocus = (field) => {
    setIsFocused({ ...isFocused, [field]: true })
  }

  const handleBlur = (field) => {
    setIsFocused({ ...isFocused, [field]: false })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-dark via-slate to-slate-dark p-4">
      <div className="w-full max-w-lg animate-fade-in">
        
        {/* Logo Section */}
        <div className="text-center mb-8">
          <div className="text-4xl font-light tracking-wider text-white mb-2">COMET</div>
          <div className="flex justify-center gap-2 mt-2">
            <div className="w-8 h-px bg-emerald/40"></div>
            <div className="w-12 h-px bg-emerald"></div>
            <div className="w-8 h-px bg-emerald/40"></div>
          </div>
          <p className="text-white/50 text-sm mt-3 font-light">Create your account</p>
        </div>

        {/* Register Card */}
        <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20 shadow-xl">
          <h2 className="text-2xl font-medium text-white mb-6 tracking-tight">Get started</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-white/60 text-sm mb-1 font-light">Full Name</label>
              <input
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                onFocus={() => handleFocus('full_name')}
                onBlur={() => handleBlur('full_name')}
                className={`w-full px-4 py-3 rounded-xl bg-white/5 border ${isFocused.full_name ? 'border-emerald ring-2 ring-emerald/20' : 'border-white/20'} text-white placeholder:text-white/30 focus:outline-none transition-all duration-200`}
                placeholder="e.g., Sarah Ahmed"
                required
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-white/60 text-sm mb-1 font-light">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                onFocus={() => handleFocus('email')}
                onBlur={() => handleBlur('email')}
                className={`w-full px-4 py-3 rounded-xl bg-white/5 border ${isFocused.email ? 'border-emerald ring-2 ring-emerald/20' : 'border-white/20'} text-white placeholder:text-white/30 focus:outline-none transition-all duration-200`}
                placeholder="name@company.com"
                required
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-white/60 text-sm mb-1 font-light">Phone</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                onFocus={() => handleFocus('phone')}
                onBlur={() => handleBlur('phone')}
                className={`w-full px-4 py-3 rounded-xl bg-white/5 border ${isFocused.phone ? 'border-emerald ring-2 ring-emerald/20' : 'border-white/20'} text-white placeholder:text-white/30 focus:outline-none transition-all duration-200`}
                placeholder="0300 1234567"
                required
              />
            </div>

            {/* CNIC */}
            <div>
              <label className="block text-white/60 text-sm mb-1 font-light">CNIC</label>
              <input
                type="text"
                name="cnic"
                value={formData.cnic}
                onChange={handleChange}
                onFocus={() => handleFocus('cnic')}
                onBlur={() => handleBlur('cnic')}
                className={`w-full px-4 py-3 rounded-xl bg-white/5 border ${isFocused.cnic ? 'border-emerald ring-2 ring-emerald/20' : 'border-white/20'} text-white placeholder:text-white/30 focus:outline-none transition-all duration-200`}
                placeholder="42101-1234567-1"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-white/60 text-sm mb-1 font-light">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  onFocus={() => handleFocus('password')}
                  onBlur={() => handleBlur('password')}
                  className={`w-full px-4 py-3 rounded-xl bg-white/5 border ${isFocused.password ? 'border-emerald ring-2 ring-emerald/20' : 'border-white/20'} text-white placeholder:text-white/30 focus:outline-none pr-24 transition-all duration-200`}
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-white/60 text-sm mb-1 font-light">Confirm Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  onFocus={() => handleFocus('confirmPassword')}
                  onBlur={() => handleBlur('confirmPassword')}
                  className={`w-full px-4 py-3 rounded-xl bg-white/5 border ${isFocused.confirmPassword ? 'border-emerald ring-2 ring-emerald/20' : 'border-white/20'} text-white placeholder:text-white/30 focus:outline-none pr-24 transition-all duration-200`}
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

            {/* Address */}
            <div>
              <label className="block text-white/60 text-sm mb-1 font-light">Address</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                onFocus={() => handleFocus('address')}
                onBlur={() => handleBlur('address')}
                className={`w-full px-4 py-3 rounded-xl bg-white/5 border ${isFocused.address ? 'border-emerald ring-2 ring-emerald/20' : 'border-white/20'} text-white placeholder:text-white/30 focus:outline-none transition-all duration-200`}
                placeholder="Karachi, Pakistan"
                required
              />
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-emerald hover:bg-emerald-dark text-white font-medium py-3.5 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-emerald/25 group mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="inline-flex items-center justify-center gap-2">
                {isLoading ? 'Creating account...' : 'Create account'}
                {!isLoading && <span className="group-hover:translate-x-1 transition-transform duration-200">→</span>}
              </span>
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link to="/login" className="text-white/50 hover:text-emerald text-sm transition-colors">
              Already have an account? <span className="font-medium">Sign in</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Register
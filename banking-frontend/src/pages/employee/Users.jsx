import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import API from '../../services/api'

const Users = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState([])
  const [filteredUsers, setFilteredUsers] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    const token = localStorage.getItem('employeeToken')
    if (!token) {
      navigate('/employee/login')
      return
    }
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await API.get('/employee/users')
      const validUsers = response.data.filter(user => {
        return user._id && typeof user._id === 'string' && /^[0-9a-fA-F]{24}$/.test(user._id)
      })
      setUsers(validUsers)
      setFilteredUsers(validUsers)
      setLoading(false)
    } catch (err) {
      console.error('Error fetching users:', err)
      setError('Failed to load users')
      setLoading(false)
      if (err.response?.status === 401) {
        localStorage.removeItem('employeeToken')
        navigate('/employee/login')
      }
    }
  }

  useEffect(() => {
    if (searchTerm) {
      const filtered = users.filter(user =>
        user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.phone?.includes(searchTerm)
      )
      setFilteredUsers(filtered)
    } else {
      setFilteredUsers(users)
    }
  }, [searchTerm, users])

  const getStatusBadge = (status) => {
    const badges = {
      active: 'bg-emerald/10 text-emerald',
      frozen: 'bg-amber-50 text-amber-600',
      suspended: 'bg-red-50 text-red-600',
      locked: 'bg-gray-100 text-gray-600'
    }
    return badges[status] || badges.active
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
      
      <header className="border-b border-gray-100 bg-white sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <Link to="/employee/dashboard" className="text-gray-400 hover:text-gray-600 text-sm">← Back</Link>
            <div className="text-xl font-light tracking-wide text-gray-900">COMET</div>
            <div className="w-16"></div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        
        <div className="mb-8">
          <h1 className="text-3xl font-light text-gray-900">User Management</h1>
          <p className="text-gray-400 text-sm mt-1">View and manage all customer accounts</p>
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

        <div className="mb-6">
          <div className="relative max-w-md">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, email, or phone..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-emerald transition-colors"
            />
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-6 py-4 text-gray-500 text-xs font-medium uppercase tracking-wide">User</th>
                  <th className="text-left px-6 py-4 text-gray-500 text-xs font-medium uppercase tracking-wide">Contact</th>
                  <th className="text-left px-6 py-4 text-gray-500 text-xs font-medium uppercase tracking-wide">KYC</th>
                  <th className="text-left px-6 py-4 text-gray-500 text-xs font-medium uppercase tracking-wide">Status</th>
                  <th className="text-left px-6 py-4 text-gray-500 text-xs font-medium uppercase tracking-wide">Member Since</th>
                  <th className="text-right px-6 py-4 text-gray-500 text-xs font-medium uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-gray-800 font-medium">{user.full_name}</p>
                        <p className="text-gray-400 text-xs">{user.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-gray-600 text-sm">{user.phone}</p>
                      <p className="text-gray-400 text-xs">{user.cnic}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-block px-2 py-1 rounded-full text-xs bg-emerald/10 text-emerald">
                        {user.kyc_status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs ${getStatusBadge(user.status)}`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-gray-600 text-sm">
                        {new Date(user.created_at).toLocaleDateString('en-PK', { year: 'numeric', month: 'short' })}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        to={`/employee/users/${user._id}`}
                        className="text-emerald text-sm hover:underline"
                      >
                        View Details →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredUsers.length === 0 && (
            <div className="py-12 text-center">
              <p className="text-gray-400">No valid users found</p>
            </div>
          )}
        </div>

        <div className="mt-4 text-right">
          <p className="text-gray-400 text-sm">
            Showing {filteredUsers.length} of {users.length} users
          </p>
        </div>
      </main>
    </div>
  )
}

export default Users
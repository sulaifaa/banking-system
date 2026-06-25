import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import API from '../../services/api'

const Branches = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [branches, setBranches] = useState([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedBranch, setSelectedBranch] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    city: '',
    address: '',
    contact: '',
    longitude: '',
    latitude: ''
  })
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('employeeToken')
    if (!token) {
      navigate('/employee/login')
      return
    }
    fetchBranches()
  }, [])

  const fetchBranches = async () => {
    try {
      const response = await API.get('/branches')
      setBranches(response.data)
      setLoading(false)
    } catch (err) {
      console.error('Error fetching branches:', err)
      setError('Failed to load branches')
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleAddBranch = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    setMessage('')

    try {
      const data = {
        name: formData.name,
        city: formData.city,
        address: formData.address,
        contact: formData.contact
      }
      
      if (formData.longitude && formData.latitude) {
        data.longitude = parseFloat(formData.longitude)
        data.latitude = parseFloat(formData.latitude)
      }
      
      await API.post('/branches', data)
      setMessage('Branch added successfully')
      setShowAddModal(false)
      setFormData({ name: '', city: '', address: '', contact: '', longitude: '', latitude: '' })
      fetchBranches()
      setTimeout(() => setMessage(''), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add branch')
      setTimeout(() => setError(''), 3000)
    } finally {
      setSubmitting(false)
    }
  }

  const handleEditBranch = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    setMessage('')

    try {
      const data = {
        name: formData.name,
        city: formData.city,
        address: formData.address,
        contact: formData.contact
      }
      
      if (formData.longitude && formData.latitude) {
        data.longitude = parseFloat(formData.longitude)
        data.latitude = parseFloat(formData.latitude)
      }
      
      await API.put(`/branches/${selectedBranch._id}`, data)
      setMessage('Branch updated successfully')
      setShowEditModal(false)
      setSelectedBranch(null)
      setFormData({ name: '', city: '', address: '', contact: '', longitude: '', latitude: '' })
      fetchBranches()
      setTimeout(() => setMessage(''), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update branch')
      setTimeout(() => setError(''), 3000)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteBranch = async (branchId, branchName) => {
    if (window.confirm(`Are you sure you want to delete "${branchName}"?`)) {
      try {
        await API.delete(`/branches/${branchId}`)
        setMessage('Branch deleted successfully')
        fetchBranches()
        setTimeout(() => setMessage(''), 3000)
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete branch')
        setTimeout(() => setError(''), 3000)
      }
    }
  }

  const openEditModal = (branch) => {
    setSelectedBranch(branch)
    setFormData({
      name: branch.name || '',
      city: branch.city || '',
      address: branch.address || '',
      contact: branch.contact || '',
      longitude: branch.location?.coordinates?.[0] || '',
      latitude: branch.location?.coordinates?.[1] || ''
    })
    setShowEditModal(true)
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
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <Link to="/employee/dashboard" className="text-gray-400 hover:text-gray-600 text-sm">← Back</Link>
            <div className="text-xl font-light tracking-wide text-gray-900">COMET Admin</div>
            <div className="w-16"></div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-light text-gray-900">Branch Management</h1>
            <p className="text-gray-400 text-sm mt-1">Manage bank branches and locations</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-5 py-2.5 bg-emerald text-white rounded-xl text-sm font-medium hover:bg-emerald-dark transition-all"
          >
            + Add Branch
          </button>
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

        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-6 py-4 text-gray-500 text-xs font-medium uppercase tracking-wide">Branch Name</th>
                  <th className="text-left px-6 py-4 text-gray-500 text-xs font-medium uppercase tracking-wide">City</th>
                  <th className="text-left px-6 py-4 text-gray-500 text-xs font-medium uppercase tracking-wide">Address</th>
                  <th className="text-left px-6 py-4 text-gray-500 text-xs font-medium uppercase tracking-wide">Contact</th>
                  <th className="text-right px-6 py-4 text-gray-500 text-xs font-medium uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {branches.map((branch) => (
                  <tr key={branch._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-gray-800 font-medium">{branch.name}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-gray-600 text-sm">{branch.city}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-gray-500 text-sm">{branch.address}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-gray-500 text-sm">{branch.contact}</p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => openEditModal(branch)}
                        className="text-emerald text-sm hover:underline mr-3"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteBranch(branch._id, branch.name)}
                        className="text-red-500 text-sm hover:underline"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add Branch Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-light text-gray-900">Add Branch</h2>
                <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
              </div>

              <form onSubmit={handleAddBranch} className="space-y-4">
                <div>
                  <label className="block text-gray-600 text-sm mb-1">Branch Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-emerald"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-600 text-sm mb-1">City</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-emerald"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-600 text-sm mb-1">Address</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-emerald"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-600 text-sm mb-1">Contact</label>
                  <input
                    type="text"
                    name="contact"
                    value={formData.contact}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-emerald"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-600 text-sm mb-1">Longitude</label>
                    <input
                      type="number"
                      step="any"
                      name="longitude"
                      value={formData.longitude}
                      onChange={handleChange}
                      className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-emerald"
                      placeholder="67.0011"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-600 text-sm mb-1">Latitude</label>
                    <input
                      type="number"
                      step="any"
                      name="latitude"
                      value={formData.latitude}
                      onChange={handleChange}
                      className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-emerald"
                      placeholder="24.8607"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-emerald hover:bg-emerald-dark text-white py-2.5 rounded-xl font-medium transition-all disabled:opacity-50"
                >
                  {submitting ? 'Adding...' : 'Add Branch'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Edit Branch Modal */}
        {showEditModal && selectedBranch && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-light text-gray-900">Edit Branch</h2>
                <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
              </div>

              <form onSubmit={handleEditBranch} className="space-y-4">
                <div>
                  <label className="block text-gray-600 text-sm mb-1">Branch Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-emerald"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-600 text-sm mb-1">City</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-emerald"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-600 text-sm mb-1">Address</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-emerald"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-600 text-sm mb-1">Contact</label>
                  <input
                    type="text"
                    name="contact"
                    value={formData.contact}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-emerald"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-600 text-sm mb-1">Longitude</label>
                    <input
                      type="number"
                      step="any"
                      name="longitude"
                      value={formData.longitude}
                      onChange={handleChange}
                      className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-emerald"
                      placeholder="67.0011"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-600 text-sm mb-1">Latitude</label>
                    <input
                      type="number"
                      step="any"
                      name="latitude"
                      value={formData.latitude}
                      onChange={handleChange}
                      className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-emerald"
                      placeholder="24.8607"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-emerald hover:bg-emerald-dark text-white py-2.5 rounded-xl font-medium transition-all disabled:opacity-50"
                >
                  {submitting ? 'Updating...' : 'Update Branch'}
                </button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default Branches
import axios from 'axios'

const API = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add token to every request if it exists (customer or employee)
API.interceptors.request.use(
  (config) => {
    // Check for customer token first, then employee token
    const token = localStorage.getItem('token') || localStorage.getItem('employeeToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

export default API
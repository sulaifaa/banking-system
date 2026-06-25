import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import API from '../../services/api'
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Filler
} from 'chart.js'
import { Pie, Line, Bar } from 'react-chartjs-2'

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Filler
)

const Analytics = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [fraudData, setFraudData] = useState([])
  const [transactionData, setTransactionData] = useState([])
  const [riskData, setRiskData] = useState([])
  const [topRiskyUsers, setTopRiskyUsers] = useState([])
  const [volumeReport, setVolumeReport] = useState(null)

  useEffect(() => {
    const token = localStorage.getItem('employeeToken')
    if (!token) {
      navigate('/employee/login')
      return
    }
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      const [fraudRes, transactionRes, riskRes, topUsersRes, volumeRes] = await Promise.all([
        API.get('/analytics/fraud-category'),
        API.get('/analytics/transactions-over-time?days=30'),
        API.get('/analytics/risk-distribution'),
        API.get('/analytics/top-risky-users'),
        API.get('/analytics/volume-report')
      ])

      setFraudData(fraudRes.data)
      setTransactionData(transactionRes.data)
      setRiskData(riskRes.data)
      setTopRiskyUsers(topUsersRes.data)
      setVolumeReport(volumeRes.data)
      setLoading(false)
    } catch (err) {
      console.error('Error fetching analytics:', err)
      setLoading(false)
    }
  }

  // Elegant Slate Grey + Emerald color palette
  const slateColors = {
    primary: '#0F172A',
    secondary: '#1E293B',
    accent: '#10B981',
    accentLight: '#34D399',
    slateLight: '#64748B',
    slateLighter: '#94A3B8',
    bg: '#F8FAFC',
    white: '#FFFFFF',
    red: '#EF4444',
    amber: '#F59E0B'
  }

  const fraudColors = ['#10B981', '#34D399', '#059669', '#047857', '#6EE7B7', '#A7F3D0']
  const riskColors = ['#10B981', '#F59E0B', '#EF4444']

  const fraudChartData = {
    labels: fraudData.map(item => item._id?.replace(/_/g, ' ')?.toUpperCase() || 'Unknown'),
    datasets: [{
      data: fraudData.map(item => item.count),
      backgroundColor: fraudColors.slice(0, fraudData.length),
      borderWidth: 0,
      hoverOffset: 10,
      cutout: '0%'
    }]
  }

  const transactionChartData = {
    labels: transactionData.map(item => item._id),
    datasets: [{
      label: 'Transactions',
      data: transactionData.map(item => item.count),
      borderColor: slateColors.accent,
      backgroundColor: 'rgba(16, 185, 129, 0.08)',
      fill: true,
      tension: 0.4,
      pointBackgroundColor: slateColors.accent,
      pointBorderColor: slateColors.white,
      pointBorderWidth: 2,
      pointRadius: 3,
      pointHoverRadius: 6,
      pointHoverBackgroundColor: slateColors.primary
    }]
  }

  const riskChartData = {
    labels: riskData.map(item => item._id?.charAt(0).toUpperCase() + item._id?.slice(1) || 'Unknown'),
    datasets: [{
      label: 'Number of Users',
      data: riskData.map(item => item.count),
      backgroundColor: riskColors.slice(0, riskData.length),
      borderRadius: 8,
      barPercentage: 0.65,
      categoryPercentage: 0.8,
      hoverBackgroundColor: [slateColors.accentLight, slateColors.amber, slateColors.red]
    }]
  }

  // Premium chart options
  const pieOptions = {
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          font: { size: 11, family: "'Inter', system-ui, sans-serif", weight: '500' },
          usePointStyle: true,
          boxWidth: 8,
          padding: 16,
          color: slateColors.slateLight
        }
      },
      tooltip: {
        backgroundColor: slateColors.primary,
        titleFont: { size: 12, family: "'Inter', sans-serif", weight: '600' },
        bodyFont: { size: 11, family: "'Inter', sans-serif" },
        padding: 10,
        cornerRadius: 8,
        callbacks: {
          label: (context) => `${context.label}: ${context.raw} alerts`
        }
      }
    },
    elements: {
      arc: {
        borderWidth: 0
      }
    }
  }

  const lineOptions = {
    maintainAspectRatio: false,
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: slateColors.primary,
        titleFont: { size: 12, family: "'Inter', sans-serif", weight: '600' },
        bodyFont: { size: 11, family: "'Inter', sans-serif" },
        padding: 10,
        cornerRadius: 8,
        callbacks: {
          label: (context) => `${context.raw} transactions`
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: '#E2E8F0', drawBorder: false, lineWidth: 0.5 },
        ticks: { font: { size: 11, family: "'Inter', sans-serif" }, color: slateColors.slateLighter, stepSize: 1 }
      },
      x: {
        grid: { display: false },
        ticks: { font: { size: 10, family: "'Inter', sans-serif" }, color: slateColors.slateLighter, maxRotation: 45, minRotation: 45 }
      }
    }
  }

  const barOptions = {
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: slateColors.primary,
        titleFont: { size: 12, family: "'Inter', sans-serif", weight: '600' },
        bodyFont: { size: 11, family: "'Inter', sans-serif" },
        padding: 10,
        cornerRadius: 8,
        callbacks: {
          label: (context) => `${context.raw} users`
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: '#E2E8F0', drawBorder: false, lineWidth: 0.5 },
        ticks: { font: { size: 11, family: "'Inter', sans-serif" }, color: slateColors.slateLighter, stepSize: 1 }
      },
      x: {
        grid: { display: false },
        ticks: { font: { size: 12, family: "'Inter', sans-serif", weight: '500' }, color: slateColors.secondary }
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-emerald border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      
      <header className="border-b border-slate-200 bg-white/95 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <Link to="/employee/dashboard" className="text-slate-400 hover:text-slate-600 text-sm transition">← Back to Dashboard</Link>
            <div className="text-xl font-light tracking-wide text-slate-800">COMET</div>
            <div className="w-16"></div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        
        <div className="mb-8">
          <h1 className="text-3xl font-light text-slate-800">Analytics</h1>
          <p className="text-slate-400 text-sm mt-1">Banking insights and performance metrics</p>
        </div>

        {/* Summary Cards */}
        {volumeReport && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
            <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-xs uppercase tracking-wide">Total Transactions</p>
                  <p className="text-3xl font-light text-slate-800 mt-1">{volumeReport.total}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-emerald/10 flex items-center justify-center">
                  <svg className="w-5 h-5 text-emerald" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-xs uppercase tracking-wide">Flagged Transactions</p>
                  <p className="text-3xl font-light text-red-500 mt-1">{volumeReport.flagged}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
                  <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-xs uppercase tracking-wide">Failed Transactions</p>
                  <p className="text-3xl font-light text-amber-500 mt-1">{volumeReport.failed}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center">
                  <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Charts Grid - 2 columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          
          {/* Fraud by Category - Pie Chart */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
            <div className="px-6 pt-5 pb-2 border-b border-slate-50">
              <h2 className="text-slate-800 font-medium">Fraud by Category</h2>
              <p className="text-slate-400 text-xs mt-0.5">Distribution of fraud types detected</p>
            </div>
            <div className="p-6">
              {fraudData.length > 0 ? (
                <div className="h-64">
                  <Pie data={fraudChartData} options={pieOptions} />
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center">
                  <p className="text-slate-400 text-sm">No fraud data available</p>
                </div>
              )}
            </div>
          </div>

          {/* Risk Distribution - Bar Chart */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
            <div className="px-6 pt-5 pb-2 border-b border-slate-50">
              <h2 className="text-slate-800 font-medium">Risk Distribution</h2>
              <p className="text-slate-400 text-xs mt-0.5">Customer risk profile breakdown</p>
            </div>
            <div className="p-6">
              {riskData.length > 0 ? (
                <div className="h-64">
                  <Bar data={riskChartData} options={barOptions} />
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center">
                  <p className="text-slate-400 text-sm">No risk data available</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Transactions Over Time - Full width */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden mb-8">
          <div className="px-6 pt-5 pb-2 border-b border-slate-50">
            <h2 className="text-slate-800 font-medium">Transaction Activity</h2>
            <p className="text-slate-400 text-xs mt-0.5">Daily transaction volume over the last 30 days</p>
          </div>
          <div className="p-6">
            {transactionData.length > 0 ? (
              <div className="h-80">
                <Line data={transactionChartData} options={lineOptions} />
              </div>
            ) : (
              <div className="h-80 flex items-center justify-center">
                <p className="text-slate-400 text-sm">No transaction data available</p>
              </div>
            )}
          </div>
        </div>

        {/* Top Risky Users - Table */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-50">
            <h2 className="text-slate-800 font-medium">High Risk Users</h2>
            <p className="text-slate-400 text-xs mt-0.5">Customers with elevated risk scores requiring attention</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/30">
                  <th className="text-left px-6 py-3 text-slate-500 text-xs font-medium uppercase tracking-wide">User</th>
                  <th className="text-left px-6 py-3 text-slate-500 text-xs font-medium uppercase tracking-wide">Email</th>
                  <th className="text-right px-6 py-3 text-slate-500 text-xs font-medium uppercase tracking-wide">Risk Score</th>
                  <th className="text-right px-6 py-3 text-slate-500 text-xs font-medium uppercase tracking-wide">Risk Level</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {topRiskyUsers.length > 0 ? (
                  topRiskyUsers.map((user, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/40 transition-colors">
                      <td className="px-6 py-3">
                        <p className="text-slate-800 text-sm font-medium">{user.user_id?.full_name || 'N/A'}</p>
                      </td>
                      <td className="px-6 py-3">
                        <p className="text-slate-500 text-sm">{user.user_id?.email || 'N/A'}</p>
                      </td>
                      <td className="px-6 py-3 text-right">
                        <div className="inline-flex items-center gap-2">
                          <div className="w-12 h-1 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-red-500 rounded-full" style={{ width: `${user.risk_score}%` }}></div>
                          </div>
                          <span className="text-red-500 font-mono text-sm font-medium">{user.risk_score}</span>
                        </div>
                      </td>
                      <td className="px-6 py-3 text-right">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${
                          user.risk_level === 'high' ? 'bg-red-50 text-red-600' :
                          user.risk_level === 'medium' ? 'bg-amber-50 text-amber-600' :
                          'bg-emerald-50 text-emerald-600'
                        }`}>
                          {user.risk_level}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center">
                      <p className="text-slate-400 text-sm">No high risk users found</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Analytics
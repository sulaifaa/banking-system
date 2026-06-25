import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../../services/api";

const EmployeeDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    pendingCards: 0,
    pendingLoans: 0,
    openAlerts: 0,
  });
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("employeeToken");
    if (!token) {
      navigate("/employee/login");
      return;
    }
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const usersRes = await API.get("/employee/users");
      const cardsRes = await API.get("/employee/card-requests");
      const loansRes = await API.get("/loans/pending");
      const alertsRes = await API.get("/employee/alerts/open");

      setStats({
        totalUsers: usersRes.data.length,
        pendingCards: cardsRes.data.length,
        pendingLoans: loansRes.data.length,
        openAlerts: alertsRes.data.length,
      });

      setLoading(false);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      if (err.response?.status === 401) {
        localStorage.removeItem("employeeToken");
        navigate("/employee/login");
      }
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("employeeToken");
    localStorage.removeItem("employeeRole");
    navigate("/employee/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-emerald border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-100 bg-white/95 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="text-2xl font-light tracking-wide text-gray-900">
              COMET
            </div>
            <div className="flex items-center gap-6">
              <button
                onClick={handleLogout}
                className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-3xl font-light text-gray-900">Admin Panel</h1>
          <p className="text-gray-400 text-sm mt-1">
            Overview of banking operations
          </p>
        </div>
        {/* Analytics CTA */}
        <div
          style={{
            background: "linear-gradient(135deg, #17232ffa, #141f29fa)",
            borderRadius: "12px",
            padding: "20px",
            border: "1px solid #9c9c9c",
            marginBottom: "32px",
            boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "16px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  backgroundColor: "#ffffff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg
                  style={{ width: "20px", height: "20px", color: "#047857" }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <div>
                <p style={{ fontWeight: "500", color: "#ffffff" }}>
                  Analytics & Reports
                </p>
                <p style={{ color: "#ffffff", fontSize: "14px" }}>
                  View detailed insights and performance metrics
                </p>
              </div>
            </div>
            <Link
              to="/employee/analytics"
              style={{
                padding: "8px 20px",
                backgroundColor: "#ffffff",
                color: "#000000",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: "500",
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#14775d";
                e.currentTarget.style.color = "#ffffff";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#ffffff";
                e.currentTarget.style.color = "#000000";
              }}
            >
              View Analytics
              <svg
                style={{ width: "16px", height: "16px" }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
          </div>
        </div>

        {/* Stats Card - Single Card, Icons on Left */}
<div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm mb-8">
  <div className="grid grid-cols-4 gap-4">
    {/* Total Users */}
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-full bg-emerald/10 flex items-center justify-center flex-shrink-0">
        <svg className="w-4 h-4 text-emerald" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      </div>
      <div>
        <p className="text-gray-400 text-xs uppercase tracking-wide">Total Users</p>
        <p className="text-xl font-semibold text-gray-900">{stats.totalUsers}</p>
      </div>
    </div>

    {/* Pending Cards */}
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center flex-shrink-0">
        <svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      </div>
      <div>
        <p className="text-gray-400 text-xs uppercase tracking-wide">Pending Cards</p>
        <p className="text-xl font-semibold text-gray-900">{stats.pendingCards}</p>
      </div>
    </div>

    {/* Pending Loans */}
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
        <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <div>
        <p className="text-gray-400 text-xs uppercase tracking-wide">Pending Loans</p>
        <p className="text-xl font-semibold text-gray-900">{stats.pendingLoans}</p>
      </div>
    </div>

    {/* Open Alerts */}
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
        <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <div>
        <p className="text-gray-400 text-xs uppercase tracking-wide">Open Alerts</p>
        <p className="text-xl font-semibold text-gray-900">{stats.openAlerts}</p>
      </div>
    </div>
  </div>
</div>

        {/* Quick Actions Grid - 5 actions including Branches */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <Link
            to="/employee/users"
            className="group bg-white border border-gray-100 rounded-xl p-5 text-center hover:shadow-md transition-all hover:border-emerald/20"
          >
            <div className="w-12 h-12 rounded-full bg-gray-50 group-hover:bg-emerald/10 flex items-center justify-center mx-auto mb-3 transition-colors">
              <svg
                className="w-6 h-6 text-gray-600 group-hover:text-emerald transition-colors"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            </div>
            <p className="text-gray-800 font-medium">User Management</p>
            <p className="text-gray-400 text-xs mt-1">
              View and manage customers
            </p>
          </Link>

          <Link
            to="/employee/card-requests"
            className="group bg-white border border-gray-100 rounded-xl p-5 text-center hover:shadow-md transition-all hover:border-emerald/20"
          >
            <div className="w-12 h-12 rounded-full bg-gray-50 group-hover:bg-emerald/10 flex items-center justify-center mx-auto mb-3 transition-colors">
              <svg
                className="w-6 h-6 text-gray-600 group-hover:text-emerald transition-colors"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                />
              </svg>
            </div>
            <p className="text-gray-800 font-medium">Card Requests</p>
            <p className="text-gray-400 text-xs mt-1">
              {stats.pendingCards > 0
                ? `${stats.pendingCards} pending approval`
                : "No pending requests"}
            </p>
          </Link>

          <Link
            to="/employee/loans"
            className="group bg-white border border-gray-100 rounded-xl p-5 text-center hover:shadow-md transition-all hover:border-emerald/20"
          >
            <div className="w-12 h-12 rounded-full bg-gray-50 group-hover:bg-emerald/10 flex items-center justify-center mx-auto mb-3 transition-colors">
              <svg
                className="w-6 h-6 text-gray-600 group-hover:text-emerald transition-colors"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <p className="text-gray-800 font-medium">Loan Applications</p>
            <p className="text-gray-400 text-xs mt-1">
              {stats.pendingLoans > 0
                ? `${stats.pendingLoans} pending review`
                : "No pending applications"}
            </p>
          </Link>

          <Link
            to="/employee/alerts"
            className="group bg-white border border-gray-100 rounded-xl p-5 text-center hover:shadow-md transition-all hover:border-emerald/20"
          >
            <div className="w-12 h-12 rounded-full bg-gray-50 group-hover:bg-emerald/10 flex items-center justify-center mx-auto mb-3 transition-colors">
              <svg
                className="w-6 h-6 text-gray-600 group-hover:text-emerald transition-colors"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <p className="text-gray-800 font-medium">Fraud Alerts</p>
            <p className="text-gray-400 text-xs mt-1">
              {stats.openAlerts > 0
                ? `${stats.openAlerts} open alerts`
                : "No active alerts"}
            </p>
          </Link>

          <Link
            to="/employee/branches"
            className="group bg-white border border-gray-100 rounded-xl p-5 text-center hover:shadow-md transition-all hover:border-emerald/20"
          >
            <div className="w-12 h-12 rounded-full bg-gray-50 group-hover:bg-emerald/10 flex items-center justify-center mx-auto mb-3 transition-colors">
              <svg
                className="w-6 h-6 text-gray-600 group-hover:text-emerald transition-colors"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
            </div>
            <p className="text-gray-800 font-medium">Branch Management</p>
            <p className="text-gray-400 text-xs mt-1">Manage bank branches</p>
          </Link>
        </div>
      </main>
    </div>
  );
};

export default EmployeeDashboard;

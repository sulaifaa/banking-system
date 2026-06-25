import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../../services/api";

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [cards, setCards] = useState([]);
  const [loans, setLoans] = useState([]);
  const [branches, setBranches] = useState([]);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const profileRes = await API.get("/users/profile");
      setUser(profileRes.data);

      const accountsRes = await API.get("/users/accounts");
      setAccounts(accountsRes.data);

      const transactionsRes = await API.get("/transactions/history");
      setTransactions(transactionsRes.data.slice(0, 4));

      const beneficiariesRes = await API.get("/users/beneficiaries");
      setBeneficiaries(beneficiariesRes.data);

      const cardsRes = await API.get("/cards/my-cards");
      setCards(cardsRes.data);

      const loansRes = await API.get("/loans/my-loans");
      setLoans(loansRes.data);

      const branchesRes = await API.get("/branches");
      setBranches(branchesRes.data);

      setLoading(false);
    } catch (err) {
      console.error("Error:", err);
      setLoading(false);
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);
  const activeCards = cards.filter((c) => c.status === "active").length;
  const pendingCards = cards.filter((c) => c.status === "inactive").length;
  const activeLoans = loans.filter((l) => l.status === "active").length;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-PK", {
      style: "currency",
      currency: "PKR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    if (date.toDateString() === today.toDateString()) return "Today";
    return date.toLocaleDateString("en-PK", { month: "short", day: "numeric" });
  };

  // Hover states
  const [hoveredAction, setHoveredAction] = useState(null);
  const [hoveredService, setHoveredService] = useState(null);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-emerald border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-100 bg-white sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="text-2xl font-light tracking-wide text-gray-900">COMET</div>
            <div className="flex items-center gap-6">
              <Link to="/profile" className="text-sm text-gray-500 hover:text-emerald">
                {user?.full_name?.split(" ")[0]}
              </Link>
              <button onClick={handleLogout} className="text-sm text-gray-400 hover:text-gray-600">
                Sign out
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-light text-gray-900">
            Welcome, <span className="font-medium">{user?.full_name?.split(" ")[0]}</span>
          </h1>
          <p className="text-gray-400 text-sm mt-1">Your financial overview at a glance.</p>
        </div>

        {/* Top Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Balance Card */}
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 text-white">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-white/40 text-sm">Total Balance</p>
                <p className="text-4xl font-light tracking-tight mt-1">{formatCurrency(totalBalance)}</p>
                <p className="text-white/25 text-xs mt-2">{accounts.length} account{accounts.length !== 1 ? "s" : ""}</p>
              </div>
              <div className="text-right">
                <p className="text-white/40 text-xs">Member since</p>
                <p className="text-white/60 text-sm">
                  {user?.created_at ? new Date(user.created_at).toLocaleDateString("en-PK", { month: "long", year: "numeric" }) : "2024"}
                </p>
                <div className="mt-2">
                  <span className="inline-block px-2 py-0.5 bg-white/10 rounded-full text-white/60 text-xs">Low Risk</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
            <p className="text-gray-500 text-xs uppercase tracking-wide mb-3">Quick Actions</p>
            <div className="grid grid-cols-4 gap-3">
              {/* Transfer */}
              <Link
                to="/transfer"
                style={{
                  display: "block",
                  backgroundColor: hoveredAction === 0 ? "#ecfdf5" : "white",
                  border: hoveredAction === 0 ? "1px solid #10b981" : "1px solid #e5e7eb",
                  borderRadius: "12px",
                  padding: "12px 0",
                  textAlign: "center",
                  textDecoration: "none",
                  transition: "all 0.2s",
                }}
                onMouseEnter={() => setHoveredAction(0)}
                onMouseLeave={() => setHoveredAction(null)}
              >
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    backgroundColor: hoveredAction === 0 ? "#d1fae5" : "#f3f4f6",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 4px auto",
                  }}
                >
                  <svg
                    style={{
                      width: "20px",
                      height: "20px",
                      color: hoveredAction === 0 ? "#059669" : "#4b5563",
                    }}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 16l-4-4m0 0l4-4m-4 4h18" />
                  </svg>
                </div>
                <span
                  style={{
                    fontSize: "12px",
                    color: hoveredAction === 0 ? "#059669" : "#374151",
                  }}
                >
                  Transfer
                </span>
              </Link>

              {/* Deposit */}
              <Link
                to="/deposit"
                style={{
                  display: "block",
                  backgroundColor: hoveredAction === 1 ? "#ecfdf5" : "white",
                  border: hoveredAction === 1 ? "1px solid #10b981" : "1px solid #e5e7eb",
                  borderRadius: "12px",
                  padding: "12px 0",
                  textAlign: "center",
                  textDecoration: "none",
                  transition: "all 0.2s",
                }}
                onMouseEnter={() => setHoveredAction(1)}
                onMouseLeave={() => setHoveredAction(null)}
              >
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    backgroundColor: hoveredAction === 1 ? "#d1fae5" : "#f3f4f6",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 4px auto",
                  }}
                >
                  <svg
                    style={{
                      width: "20px",
                      height: "20px",
                      color: hoveredAction === 1 ? "#059669" : "#4b5563",
                    }}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <span
                  style={{
                    fontSize: "12px",
                    color: hoveredAction === 1 ? "#059669" : "#374151",
                  }}
                >
                  Deposit
                </span>
              </Link>

              {/* Withdraw */}
              <Link
                to="/withdraw"
                style={{
                  display: "block",
                  backgroundColor: hoveredAction === 2 ? "#ecfdf5" : "white",
                  border: hoveredAction === 2 ? "1px solid #10b981" : "1px solid #e5e7eb",
                  borderRadius: "12px",
                  padding: "12px 0",
                  textAlign: "center",
                  textDecoration: "none",
                  transition: "all 0.2s",
                }}
                onMouseEnter={() => setHoveredAction(2)}
                onMouseLeave={() => setHoveredAction(null)}
              >
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    backgroundColor: hoveredAction === 2 ? "#d1fae5" : "#f3f4f6",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 4px auto",
                  }}
                >
                  <svg
                    style={{
                      width: "20px",
                      height: "20px",
                      color: hoveredAction === 2 ? "#059669" : "#4b5563",
                    }}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <span
                  style={{
                    fontSize: "12px",
                    color: hoveredAction === 2 ? "#059669" : "#374151",
                  }}
                >
                  Withdraw
                </span>
              </Link>

              {/* Pay Bills */}
              <Link
                to="/payments"
                style={{
                  display: "block",
                  backgroundColor: hoveredAction === 3 ? "#ecfdf5" : "white",
                  border: hoveredAction === 3 ? "1px solid #10b981" : "1px solid #e5e7eb",
                  borderRadius: "12px",
                  padding: "12px 0",
                  textAlign: "center",
                  textDecoration: "none",
                  transition: "all 0.2s",
                }}
                onMouseEnter={() => setHoveredAction(3)}
                onMouseLeave={() => setHoveredAction(null)}
              >
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    backgroundColor: hoveredAction === 3 ? "#d1fae5" : "#f3f4f6",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 4px auto",
                  }}
                >
                  <svg
                    style={{
                      width: "20px",
                      height: "20px",
                      color: hoveredAction === 3 ? "#059669" : "#4b5563",
                    }}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
                <span
                  style={{
                    fontSize: "12px",
                    color: hoveredAction === 3 ? "#059669" : "#374151",
                  }}
                >
                  Pay Bills
                </span>
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-7">
            <div>
              <h3 className="text-gray-900 font-medium text-sm uppercase tracking-wide mb-4">Services</h3>
              <div className="grid grid-cols-2 gap-3">
                {/* Cards */}
                <Link
                  to="/cards"
                  style={{
                    display: "block",
                    backgroundColor: hoveredService === 0 ? "#ecfdf5" : "#f9fafb",
                    border: hoveredService === 0 ? "1px solid #10b981" : "1px solid #e5e7eb",
                    borderRadius: "12px",
                    padding: "16px",
                    textAlign: "center",
                    textDecoration: "none",
                    transition: "all 0.2s",
                    position: "relative",
                  }}
                  onMouseEnter={() => setHoveredService(0)}
                  onMouseLeave={() => setHoveredService(null)}
                >
                  <div
                    style={{
                      width: "48px",
                      height: "48px",
                      borderRadius: "50%",
                      backgroundColor: hoveredService === 0 ? "#d1fae5" : "#f3f4f6",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto 8px auto",
                    }}
                  >
                    <svg
                      style={{
                        width: "24px",
                        height: "24px",
                        color: hoveredService === 0 ? "#059669" : "#4b5563",
                      }}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                  </div>
                  <span
                    style={{
                      fontSize: "14px",
                      color: hoveredService === 0 ? "#059669" : "#374151",
                    }}
                  >
                    Cards
                  </span>
                  <p style={{ fontSize: "12px", color: "#10b981", marginTop: "4px" }}>
                    {activeCards > 0 ? `${activeCards} active` : pendingCards > 0 ? `${pendingCards} pending` : "No cards"}
                  </p>
                </Link>

                {/* Loans */}
                <Link
                  to="/loans"
                  style={{
                    display: "block",
                    backgroundColor: hoveredService === 1 ? "#ecfdf5" : "#f9fafb",
                    border: hoveredService === 1 ? "1px solid #10b981" : "1px solid #e5e7eb",
                    borderRadius: "12px",
                    padding: "16px",
                    textAlign: "center",
                    textDecoration: "none",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={() => setHoveredService(1)}
                  onMouseLeave={() => setHoveredService(null)}
                >
                  <div
                    style={{
                      width: "48px",
                      height: "48px",
                      borderRadius: "50%",
                      backgroundColor: hoveredService === 1 ? "#d1fae5" : "#f3f4f6",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto 8px auto",
                    }}
                  >
                    <svg
                      style={{
                        width: "24px",
                        height: "24px",
                        color: hoveredService === 1 ? "#059669" : "#4b5563",
                      }}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span
                    style={{
                      fontSize: "14px",
                      color: hoveredService === 1 ? "#059669" : "#374151",
                    }}
                  >
                    Loans
                  </span>
                  <p style={{ fontSize: "12px", color: "#10b981", marginTop: "4px" }}>
                    {activeLoans > 0 ? `${activeLoans} active` : "No active loans"}
                  </p>
                </Link>

                {/* Beneficiaries */}
                <Link
                  to="/beneficiaries"
                  style={{
                    display: "block",
                    backgroundColor: hoveredService === 2 ? "#ecfdf5" : "#f9fafb",
                    border: hoveredService === 2 ? "1px solid #10b981" : "1px solid #e5e7eb",
                    borderRadius: "12px",
                    padding: "16px",
                    textAlign: "center",
                    textDecoration: "none",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={() => setHoveredService(2)}
                  onMouseLeave={() => setHoveredService(null)}
                >
                  <div
                    style={{
                      width: "48px",
                      height: "48px",
                      borderRadius: "50%",
                      backgroundColor: hoveredService === 2 ? "#d1fae5" : "#f3f4f6",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto 8px auto",
                    }}
                  >
                    <svg
                      style={{
                        width: "24px",
                        height: "24px",
                        color: hoveredService === 2 ? "#059669" : "#4b5563",
                      }}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <span
                    style={{
                      fontSize: "14px",
                      color: hoveredService === 2 ? "#059669" : "#374151",
                    }}
                  >
                    Beneficiaries
                  </span>
                  <p style={{ fontSize: "12px", color: "#9ca3af", marginTop: "4px" }}>{beneficiaries.length} saved</p>
                </Link>

                {/* Find Branch */}
                <Link
                  to="/branches"
                  style={{
                    display: "block",
                    backgroundColor: hoveredService === 3 ? "#ecfdf5" : "#f9fafb",
                    border: hoveredService === 3 ? "1px solid #10b981" : "1px solid #e5e7eb",
                    borderRadius: "12px",
                    padding: "16px",
                    textAlign: "center",
                    textDecoration: "none",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={() => setHoveredService(3)}
                  onMouseLeave={() => setHoveredService(null)}
                >
                  <div
                    style={{
                      width: "48px",
                      height: "48px",
                      borderRadius: "50%",
                      backgroundColor: hoveredService === 3 ? "#d1fae5" : "#f3f4f6",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto 8px auto",
                    }}
                  >
                    <svg
                      style={{
                        width: "24px",
                        height: "24px",
                        color: hoveredService === 3 ? "#059669" : "#4b5563",
                      }}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <span
                    style={{
                      fontSize: "14px",
                      color: hoveredService === 3 ? "#059669" : "#374151",
                    }}
                  >
                    Find Branch
                  </span>
                  <p style={{ fontSize: "12px", color: "#9ca3af", marginTop: "4px" }}>{branches.length} locations</p>
                </Link>
              </div>
            </div>

            {/* Accounts */}
            <div>
              <h3 className="text-gray-900 font-medium text-sm uppercase tracking-wide mb-4">Your Accounts</h3>
              <div className="space-y-3">
                {accounts.map((acc, idx) => (
                  <div key={idx} className="flex justify-between items-center py-2 border-b border-gray-50">
                    <div>
                      <p className="text-gray-800 text-sm">{acc.account_type === "savings" ? "Savings" : "Current"}</p>
                      <p className="text-gray-400 text-xs">•••• {acc._id?.slice(-4)}</p>
                      <p className="text-gray-400 text-xs">Daily limit: {formatCurrency(acc.daily_limit || 50000)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-800 font-light">{formatCurrency(acc.balance)}</p>
                      <p className="text-gray-400 text-xs">{acc.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Separated Containers */}
          <div className="space-y-7">
            {/* Recent Activity - Separate Container */}
            <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
              <div className="px-5 py-3 border-b border-gray-100 bg-gray-50/50">
                <div className="flex justify-between items-center">
                  <h3 className="text-gray-800 font-medium text-sm uppercase tracking-wide">Recent Activity</h3>
                  <Link to="/history" className="text-emerald text-xs hover:underline">View all →</Link>
                </div>
              </div>
              <div className="p-4">
                <div className="space-y-3">
                  {transactions.length > 0 ? (
                    transactions.map((tx, idx) => {
                      const isIncoming = tx.type === "deposit" || tx.type === "loan_disbursement";
                      return (
                        <div key={idx} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                          <div>
                            <p className="text-gray-800 text-sm font-medium">{isIncoming ? "Money received" : "Money sent"}</p>
                            <p className="text-gray-400 text-xs">{formatDate(tx.timestamp)}</p>
                          </div>
                          <p className={`text-sm font-semibold ${isIncoming ? "text-emerald" : "text-gray-700"}`}>
                            {isIncoming ? "+" : "-"}{formatCurrency(tx.amount)}
                          </p>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-gray-400 text-sm text-center py-6">No transactions yet</p>
                  )}
                </div>
              </div>
            </div>

            {/* Credit & Access - Separate Container */}
            <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
              <div className="px-5 py-3 border-b border-gray-100 bg-gray-50/50">
                <h3 className="text-gray-800 font-medium text-sm uppercase tracking-wide">Credit & Access</h3>
              </div>
              <div className="p-4">
                {/* Cards */}
                <div className="flex justify-between items-center py-3 border-b border-gray-50">
                  <div>
                    <p className="text-gray-800 text-sm font-medium">Active cards</p>
                    <p className="text-gray-400 text-xs">{activeCards} card{activeCards !== 1 ? "s" : ""} ready for use</p>
                  </div>
                  <Link to="/cards" className="text-emerald text-sm hover:underline">Manage →</Link>
                </div>

                {/* Loans */}
                <div className="pt-3">
                  {activeLoans > 0 ? (
                    <>
                      <div className="flex justify-between items-center mb-2">
                        <p className="text-gray-800 text-sm font-medium">Active loans</p>
                        <Link to="/loans" className="text-emerald text-sm hover:underline">Repay →</Link>
                      </div>
                      {loans.filter(l => l.status === "active").slice(0, 1).map((loan, idx) => (
                        <div key={idx} className="mt-2">
                          <div className="flex justify-between text-xs text-gray-500 mb-1">
                            <span>Remaining balance</span>
                            <span>{formatCurrency(loan.remaining_balance)}</span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-1.5">
                            <div
                              className="bg-emerald h-1.5 rounded-full"
                              style={{ width: `${(1 - loan.remaining_balance / loan.principal) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-gray-400 text-sm">No active loans</p>
                      <Link to="/loans" className="text-emerald text-xs mt-1 inline-block">Apply for a loan →</Link>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-gray-400 text-xs uppercase tracking-wide">Saved Beneficiaries</p>
                  <p className="text-gray-800 text-2xl font-light mt-1">{beneficiaries.length}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs uppercase tracking-wide">Branches Nationwide</p>
                  <p className="text-gray-800 text-2xl font-light mt-1">{branches.length}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import API from "../../services/api";

const UserDetails = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [showTransactions, setShowTransactions] = useState(false);
  const [selectedAccountId, setSelectedAccountId] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("employeeToken");
    if (!token) {
      navigate("/employee/login");
      return;
    }
    fetchUserDetails();
  }, [userId]);

  const fetchUserDetails = async () => {
    try {
      const response = await API.get(`/employee/users/${userId}`);
      setUser(response.data.user);
      setAccounts(response.data.accounts);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching user details:", err);
      setError("Failed to load user details");
      setLoading(false);
      if (err.response?.status === 401) {
        localStorage.removeItem("employeeToken");
        navigate("/employee/login");
      }
    }
  };

  const fetchUserTransactions = async (accountId) => {
    setSelectedAccountId(accountId);
    try {
      const response = await API.get(
        `/employee/users/${userId}/accounts/${accountId}/transactions`,
      );
      setTransactions(response.data);
      setShowTransactions(true);
    } catch (err) {
      console.error("Error fetching transactions:", err);
      setError("Failed to load transactions");
      setTimeout(() => setError(""), 3000);
    }
  };

  const handleFreezeAccount = async (accountId, freeze) => {
    try {
      await API.post("/employee/accounts/freeze", { accountId, freeze });
      setMessage(`Account ${freeze ? "frozen" : "unfrozen"} successfully`);
      fetchUserDetails();
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Action failed");
      setTimeout(() => setError(""), 3000);
    }
  };

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
    return date.toLocaleDateString("en-PK", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status) => {
    const badges = {
      active: "bg-emerald/10 text-emerald",
      frozen: "bg-amber-50 text-amber-600",
      suspended: "bg-red-50 text-red-600",
      locked: "bg-gray-100 text-gray-600",
    };
    return badges[status] || badges.active;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-emerald border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-gray-500">User not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-100 bg-white sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <Link
              to="/employee/users"
              className="text-gray-400 hover:text-gray-600 text-sm"
            >
              ← Back to Users
            </Link>
            <div className="text-xl font-light tracking-wide text-gray-900">
              COMET
            </div>
            <div className="w-16"></div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
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

        {/* User Profile Card */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden mb-6">
          <div className="p-6 border-b border-gray-50">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-light text-gray-900">
                  {user.full_name}
                </h2>
                <p className="text-gray-400 text-sm mt-1">
                  Member since {formatDate(user.created_at)}
                </p>
              </div>
              <div className="text-right">
                <span
                  className={`inline-block px-3 py-1 rounded-full text-sm ${getStatusBadge(user.status)}`}
                >
                  {user.status}
                </span>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-gray-400 text-xs uppercase tracking-wide mb-2">
                  Contact Information
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between py-2 border-b border-gray-50">
                    <span className="text-gray-500 text-sm">Email</span>
                    <span className="text-gray-800 text-sm">{user.email}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-50">
                    <span className="text-gray-500 text-sm">Phone</span>
                    <span className="text-gray-800 text-sm">{user.phone}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-50">
                    <span className="text-gray-500 text-sm">CNIC</span>
                    <span className="text-gray-800 text-sm">{user.cnic}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-gray-500 text-sm">Address</span>
                    <span className="text-gray-800 text-sm">
                      {user.address}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-gray-400 text-xs uppercase tracking-wide mb-2">
                  KYC & Security
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between py-2 border-b border-gray-50">
                    <span className="text-gray-500 text-sm">KYC Status</span>
                    <span className="inline-block px-2 py-0.5 rounded-full text-xs bg-emerald/10 text-emerald">
                      {user.kyc_status}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-50">
                    <span className="text-gray-500 text-sm">Risk Level</span>
                    <span className="text-gray-800 text-sm">-</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-gray-500 text-sm">
                      Failed Attempts
                    </span>
                    <span className="text-gray-800 text-sm">
                      {user.failed_login_attempts || 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Accounts Section */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-50">
            <h3 className="text-gray-800 font-medium">Bank Accounts</h3>
          </div>
          <div className="divide-y divide-gray-50">
            {accounts.map((acc) => (
              <div key={acc._id} className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-gray-800 font-medium capitalize">
                      {acc.account_type} Account
                    </p>
                    <p className="text-gray-400 text-xs">
                      •••• {acc._id?.slice(-6)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-800 text-xl font-light">
                      {formatCurrency(acc.balance)}
                    </p>
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-xs ${getStatusBadge(acc.status)}`}
                    >
                      {acc.status}
                    </span>
                  </div>
                </div>

                <div className="flex gap-3">
                  {acc.status === "active" && (
                    <button
                      onClick={() => handleFreezeAccount(acc._id, true)}
                      className="px-4 py-2 border border-amber-200 rounded-lg text-amber-600 text-sm hover:bg-amber-50 transition-colors"
                    >
                      Freeze Account
                    </button>
                  )}
                  {acc.status === "frozen" && (
                    <button
                      onClick={() => handleFreezeAccount(acc._id, false)}
                      className="px-4 py-2 border border-emerald-200 rounded-lg text-emerald text-sm hover:bg-emerald/5 transition-colors"
                    >
                      Unfreeze Account
                    </button>
                  )}
                  <button
                    onClick={() => fetchUserTransactions(acc._id)}
                    className="px-4 py-2 border border-gray-200 rounded-lg text-gray-600 text-sm hover:bg-gray-50 transition-colors"
                  >
                    View Transactions
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Transactions Modal */}
      {showTransactions && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[80vh] overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h2 className="text-xl font-light text-gray-900">
                Transaction History
              </h2>
              <button
                onClick={() => setShowTransactions(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <div className="overflow-y-auto p-6 max-h-[calc(80vh-80px)]">
              {transactions.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No transactions found for this account
                </p>
              ) : (
                <div className="space-y-3">
                  {transactions.map((tx, idx) => {
                    const isIncoming =
                      tx.type === "deposit" || tx.type === "loan_disbursement";
                    return (
                      <div
                        key={idx}
                        className="flex justify-between items-center p-3 border-b border-gray-50 hover:bg-gray-50 rounded-lg"
                      >
                        <div>
                          <p className="text-gray-800 text-sm font-medium capitalize">
                            {tx.type}
                          </p>
                          <p className="text-gray-400 text-xs">
                            {formatDate(tx.timestamp)}
                          </p>
                          {tx.fraud_flags && tx.fraud_flags.length > 0 && (
                            <div className="flex gap-1 mt-1">
                              {tx.fraud_flags.map((flag, i) => (
                                <span
                                  key={i}
                                  className="text-amber-600 text-[10px] bg-amber-50 px-1.5 py-0.5 rounded"
                                >
                                  {flag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                          <p
                            className={`font-medium ${isIncoming ? "text-emerald" : "text-gray-700"}`}
                          >
                            {isIncoming ? "+" : "-"}
                            {formatCurrency(tx.amount)}
                          </p>
                          <p className="text-gray-400 text-xs capitalize">
                            {tx.status}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDetails;

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../../services/api";

const Profile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [riskProfile, setRiskProfile] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
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

      setLoading(false);
    } catch (err) {
      console.error("Error fetching profile:", err);
      setError("Failed to load profile");
      setLoading(false);
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
      }
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    // Clear previous messages
    setError("");
    setMessage("");
    
    // Validation
    if (!passwordData.currentPassword) {
      setError("Please enter your current password");
      return;
    }
    if (!passwordData.newPassword) {
      setError("Please enter a new password");
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError("New passwords do not match");
      return;
    }
    if (passwordData.newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setSubmitting(true);

    try {
      const response = await API.post("/auth/change-password", {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      setMessage(response.data.message || "Password changed successfully");
      setShowChangePassword(false);
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      console.error("Change password error:", err.response?.data);
      const errorMsg = err.response?.data?.message || "Failed to change password";
      setError(errorMsg);
      // Don't close modal on error
    } finally {
      setSubmitting(false);
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
      month: "long",
      day: "numeric",
    });
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
      <header className="border-b border-gray-100 bg-white sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <Link
              to="/dashboard"
              className="text-gray-400 hover:text-gray-600 text-sm"
            >
              ← Back
            </Link>
            <div className="text-xl font-light tracking-wide text-gray-900">
              COMET
            </div>
            <div className="w-16"></div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-light text-gray-900">Profile</h1>
          <p className="text-gray-400 text-sm mt-1">
            Manage your personal information and security
          </p>
        </div>

        {/* Messages */}
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

        {/* Profile Card */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden mb-6">
          <div className="p-6 border-b border-gray-50">
            <h2 className="text-gray-800 font-medium">Personal Information</h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-gray-400 text-xs">Full Name</p>
                <p className="text-gray-800 font-medium">{user?.full_name}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs">Email</p>
                <p className="text-gray-800">{user?.email}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs">Phone</p>
                <p className="text-gray-800">{user?.phone}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs">CNIC</p>
                <p className="text-gray-800">{user?.cnic}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs">Address</p>
                <p className="text-gray-800">{user?.address}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs">Member Since</p>
                <p className="text-gray-800">{formatDate(user?.created_at)}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs">KYC Status</p>
                <p className="inline-block px-2 py-0.5 bg-emerald/10 text-emerald rounded-full text-xs">
                  {user?.kyc_status || "Verified"}
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-xs">Account Status</p>
                <p className="inline-block px-2 py-0.5 bg-green-50 text-green-600 rounded-full text-xs">
                  {user?.status || "Active"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Accounts Card */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden mb-6">
          <div className="p-6 border-b border-gray-50">
            <h2 className="text-gray-800 font-medium">Your Accounts</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {accounts.map((acc, idx) => (
              <div key={idx} className="p-6 flex justify-between items-center">
                <div>
                  <p className="text-gray-800 font-medium capitalize">
                    {acc.account_type} Account
                  </p>
                  <p className="text-gray-400 text-xs">
                    •••• {acc._id?.slice(-6)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-gray-800 font-light">
                    {formatCurrency(acc.balance)}
                  </p>
                  <p className="text-gray-400 text-xs capitalize">
                    {acc.status}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Security Card */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-50">
            <h2 className="text-gray-800 font-medium">Security</h2>
          </div>
          <div className="p-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-800 font-medium">Password</p>
                <p className="text-gray-400 text-sm">Last changed: Recently</p>
              </div>
              <button
                onClick={() => setShowChangePassword(true)}
                className="px-4 py-2 border border-gray-200 rounded-lg text-emerald text-sm hover:bg-emerald/5 transition-all"
              >
                Change password
              </button>
            </div>
          </div>
        </div>

        {/* Change Password Modal */}
        {showChangePassword && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-light text-gray-900">
                  Change password
                </h2>
                <button
                  onClick={() => {
                    setShowChangePassword(false);
                    setError("");
                    setMessage("");
                    setPasswordData({
                      currentPassword: "",
                      newPassword: "",
                      confirmPassword: "",
                    });
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div>
                  <label className="block text-gray-600 text-sm mb-1">
                    Current password
                  </label>
                  <input
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        currentPassword: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-emerald"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-600 text-sm mb-1">
                    New password
                  </label>
                  <input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        newPassword: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-emerald"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-600 text-sm mb-1">
                    Confirm new password
                  </label>
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        confirmPassword: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-emerald"
                    required
                  />
                </div>
                
                {/* Display error inside modal */}
                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
                    <p className="text-red-600 text-sm text-center">{error}</p>
                  </div>
                )}
                
                {message && (
                  <div className="p-3 bg-emerald/10 border border-emerald/20 rounded-xl">
                    <p className="text-emerald text-sm text-center">{message}</p>
                  </div>
                )}
                
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-emerald hover:bg-emerald-dark text-white py-2.5 rounded-xl font-medium transition-all disabled:opacity-50"
                >
                  {submitting ? "Updating..." : "Update password"}
                </button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Profile;
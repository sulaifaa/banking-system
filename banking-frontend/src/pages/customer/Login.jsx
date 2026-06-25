import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../../services/api";

const Login = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState({ email: false, password: false });

  // OTP state
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [userId, setUserId] = useState("");
  const [otpError, setOtpError] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await API.post("/auth/login", { email, password });
      console.log("Login response:", response.data);

      if (response.data.otpRequired) {
        setSessionId(response.data.sessionId);
        setUserId(response.data.userId || response.data.user?._id);
        setShowOtpModal(true);
        setIsLoading(false);
      } else {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem(
          "userId",
          response.data.userId || response.data.user?._id,
        );
        console.log("Token saved:", localStorage.getItem("token"));
        alert("Login successful! Redirecting to dashboard...");
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Login error:", error.response?.data || error.message);
      alert(
        error.response?.data?.message ||
          "Login failed. Please check your credentials.",
      );
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setResendLoading(true);
    setOtpError("");
    setOtp("");

    try {
      const response = await API.post("/auth/resend-otp", {
        userId: userId,
        email: email,
        purpose: "login",
      });

      alert("A new OTP has been sent to your email.");
    } catch (error) {
      console.error("Resend error:", error.response?.data || error.message);
      setOtpError("Failed to resend OTP. Please try again.");
    } finally {
      setResendLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length !== 6) {
      setOtpError("Please enter a valid 6-digit OTP");
      return;
    }

    setOtpLoading(true);
    setOtpError("");

    try {
      const response = await API.post("/auth/verify-otp", {
        userId: userId,
        otp: otp,
        sessionId: sessionId,
      });

      localStorage.setItem("token", response.data.token);
      console.log("Token saved after OTP:", localStorage.getItem("token"));
      alert("OTP verified! Login successful.");
      setShowOtpModal(false);
      navigate("/dashboard");
    } catch (err) {
      setOtpError(
        err.response?.data?.message || "Invalid OTP. Please try again.",
      );
    } finally {
      setOtpLoading(false);
    }
  };

  // Handle OTP input change with auto-focus
  const handleOtpChange = (value, index) => {
    const newOtp = otp.split("");
    newOtp[index] = value;
    setOtp(newOtp.join(""));

    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleOtpKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-dark via-slate to-slate-dark p-4">
      <div className="w-full max-w-md animate-fade-in">
        {/* Logo Section */}
        <div className="text-center mb-12">
          <div className="text-5xl font-light tracking-wider text-white mb-2">
            COMET
          </div>
          <div className="flex justify-center gap-2 mt-3">
            <div className="w-8 h-px bg-emerald/40"></div>
            <div className="w-12 h-px bg-emerald"></div>
            <div className="w-8 h-px bg-emerald/40"></div>
          </div>
          <p className="text-white/50 text-sm mt-3 font-light">
            Secure digital banking
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20 shadow-xl">
          <h2 className="text-2xl font-medium text-white mb-8 tracking-tight">
            Sign in
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-white/60 text-sm mb-2 font-light">
                Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setIsFocused({ ...isFocused, email: true })}
                  onBlur={() => setIsFocused({ ...isFocused, email: false })}
                  className={`w-full px-4 py-3.5 rounded-xl bg-white/5 border ${isFocused.email ? "border-emerald ring-2 ring-emerald/20" : "border-white/20"} text-white placeholder:text-white/30 focus:outline-none transition-all duration-200`}
                  placeholder="name@company.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-white/60 text-sm mb-2 font-light">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setIsFocused({ ...isFocused, password: true })}
                  onBlur={() => setIsFocused({ ...isFocused, password: false })}
                  className={`w-full px-4 py-3.5 rounded-xl bg-white/5 border ${isFocused.password ? "border-emerald ring-2 ring-emerald/20" : "border-white/20"} text-white placeholder:text-white/30 focus:outline-none pr-24 transition-all duration-200`}
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-emerald text-xs transition-colors"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              {/* Forgot Password Link */}
              <div className="text-right mt-2">
                <Link
                  to="/forgot-password"
                  className="text-white/30 hover:text-white/50 text-xs transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-emerald hover:bg-emerald-dark text-white font-medium py-3.5 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-emerald/25 group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="inline-flex items-center justify-center gap-2">
                {isLoading ? "Signing in..." : "Sign in"}
                {!isLoading && (
                  <span className="group-hover:translate-x-1 transition-transform duration-200">
                    →
                  </span>
                )}
              </span>
            </button>
          </form>

          <div className="mt-8 text-center">
            <Link
              to="/register"
              className="text-white/50 hover:text-emerald text-sm transition-colors"
            >
              No account? <span className="font-medium">Create one</span>
            </Link>
          </div>

          <div className="mt-6 pt-6 border-t border-white/10 text-center">
            <Link
              to="/employee/login"
              className="text-white/30 hover:text-white/50 text-xs transition-colors"
            >
              Employee portal
            </Link>
          </div>
        </div>
      </div>

      {/* Elegant OTP Modal */}
      {showOtpModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all duration-300">
          <div className="bg-gradient-to-br from-white via-white to-gray-50 rounded-2xl max-w-md w-full p-0 shadow-2xl transform transition-all duration-300 scale-100">
            {/* Header with gradient accent */}
            <div className="relative">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald to-emerald-dark rounded-t-2xl"></div>
              <div className="pt-8 px-8 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald/10 to-emerald/5 rounded-2xl mb-4 shadow-sm">
                  <svg
                    className="w-8 h-8 text-emerald"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.5"
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-light text-gray-900">
                  Verification required
                </h2>
                <p className="text-gray-500 text-sm mt-2 font-light">
                  Enter the 6-digit code sent to your email
                </p>
              </div>
            </div>

            {/* OTP Input Section */}
            <div className="px-8 mt-6">
              <div className="space-y-2">
                <div className="flex justify-center gap-3">
                  {[...Array(6)].map((_, index) => (
                    <input
                      key={index}
                      type="text"
                      maxLength="1"
                      value={otp[index] || ""}
                      onChange={(e) => handleOtpChange(e.target.value, index)}
                      onKeyDown={(e) => handleOtpKeyDown(e, index)}
                      id={`otp-${index}`}
                      className="w-12 h-14 text-center text-2xl font-semibold rounded-xl border-2 border-gray-200 bg-white text-gray-900 focus:outline-none focus:border-emerald focus:ring-2 focus:ring-emerald/20 transition-all duration-200"
                      autoFocus={index === 0}
                    />
                  ))}
                </div>
                {otpError && (
                  <p className="text-red-500 text-sm text-center mt-3">
                    {otpError}
                  </p>
                )}
              </div>

              {/* Resend button */}
              <div className="mt-6 text-center">
                <p className="text-gray-400 text-xs">
                  Didn't receive a code?{" "}
                  <button
                    onClick={handleResendOtp}
                    disabled={resendLoading}
                    className="text-emerald hover:text-emerald-dark font-medium transition-colors disabled:opacity-50"
                  >
                    {resendLoading ? "Sending..." : "Click to resend"}
                  </button>
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="p-8 pt-6 space-y-3">
              <button
                onClick={handleVerifyOtp}
                disabled={otpLoading || otp.length !== 6}
                className="w-full bg-gradient-to-r from-emerald to-emerald-dark hover:from-emerald-dark hover:to-emerald text-white font-medium py-3.5 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-emerald/25 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-98"
              >
                {otpLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Verifying...
                  </span>
                ) : (
                  "Verify & continue →"
                )}
              </button>

              <button
                onClick={() => setShowOtpModal(false)}
                className="w-full text-gray-500 text-sm py-2 hover:text-gray-700 transition-colors font-light"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
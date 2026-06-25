import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/customer/Login";
import Register from "./pages/customer/Register";
import Dashboard from "./pages/customer/Dashboard";
import Transfer from "./pages/customer/Transfer";
import Beneficiaries from "./pages/customer/Beneficiaries";
import Deposit from "./pages/customer/Deposit";
import Withdraw from "./pages/customer/Withdraw";
import Payments from "./pages/customer/Payments";
import Cards from "./pages/customer/Cards";
import Loans from "./pages/customer/Loans";
import History from "./pages/customer/History";
import Profile from "./pages/customer/Profile";
import Branches from "./pages/customer/Branches";
import ForgotPassword from "./pages/customer/ForgotPassword";
import EmployeeLogin from "./pages/employee/Login";
import EmployeeDashboard from './pages/employee/Dashboard'
import EmployeeUsers from './pages/employee/Users'
import EmployeeUserDetails from './pages/employee/UserDetails'
import EmployeeCardRequests from './pages/employee/CardRequests'
import EmployeeLoanApplications from './pages/employee/LoanApplications'
import EmployeeFraudAlerts from './pages/employee/FraudAlerts'
import EmployeeBranches from './pages/employee/Branches'
import EmployeeAnalytics from './pages/employee/Analytics'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/transfer" element={<Transfer />} />
        <Route path="/beneficiaries" element={<Beneficiaries />} />
        <Route path="/deposit" element={<Deposit />} />
        <Route path="/withdraw" element={<Withdraw />} />
        <Route path="/payments" element={<Payments />} />
        <Route path="/cards" element={<Cards />} />
        <Route path="/loans" element={<Loans />} />
        <Route path="/history" element={<History />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/branches" element={<Branches />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/employee/login" element={<EmployeeLogin />} />
        <Route path="/employee/dashboard" element={<EmployeeDashboard />} />
        <Route path="/employee/users" element={<EmployeeUsers />} />
        <Route path="/employee/users/:userId" element={<EmployeeUserDetails />} />
        <Route path="/employee/card-requests" element={<EmployeeCardRequests />} />
        <Route path="/employee/loans" element={<EmployeeLoanApplications />} />
        <Route path="/employee/alerts" element={<EmployeeFraudAlerts />} />
        <Route path="/employee/branches" element={<EmployeeBranches />} />
        <Route path="/employee/analytics" element={<EmployeeAnalytics />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

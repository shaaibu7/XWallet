import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { appkit } from "../connection";
import XWalletHeader from "../layout/component/XWalletHeader";
import XWalletFooter from "../layout/component/XWalletFooter";
import Home from "../pages/home/Home";
import Dashboard from "../pages/dashboard/Dashboard";
import RegisterWallet from "../pages/registerWallet/RegisterWallet";
import OnboardMember from "../pages/onboardMembers/OnboardMember";
import ReimburseMember from "../pages/reimburseMember/ReimburseMember";
import ReimburseOrganization from "../pages/reimburseOganization/ReimburseOraganization";
import Spending from "../pages/spending/Spending";
import TransactionHistory from "../pages/transactionHistory/TransactionHistory";

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-[hsl(var(--background))]">
        <XWalletHeader />
        <main className="flex-grow py-8 px-4 md:px-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/register-wallet" element={<RegisterWallet />} />
            <Route path="/onboard-member" element={<OnboardMember />} />
            <Route path="/reimburse-member" element={<ReimburseMember />} />
            <Route path="/reimburse-organization" element={<ReimburseOrganization />} />
            <Route path="/spending" element={<Spending />} />
            <Route path="/transaction-history" element={<TransactionHistory />} />
          </Routes>
        </main>
        <XWalletFooter />
      </div>
    </Router>
  );
}

export default App;

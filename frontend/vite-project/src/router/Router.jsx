import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";

// LAYOUTS

// PAGES
import Home from "../pages/home/Home";
import DashboardLayout from "../layout/DashboardLayout";
import Dashboard from "../pages/dashboard/Dashboard";
import RegisterWallet from "../pages/registerWallet/RegisterWallet";
import OnboardMembers from "../pages/onboardMembers/OnboardMember";
import ReimburseOrganization from "../pages/reimburseOrganization/ReimburseOrganization";
import ReimburseMember from "../pages/reimburseMember/ReimburseMember";
import Spending from "../pages/spending/Spending";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/">
      {/* LANDING PAGE */}
      <Route index element={<Home />} />

      {/* EVERY OTHER PAGE ROUTING SHOULD BE DONE IN HERE */}
      <Route path="/dashboard" element={<DashboardLayout />}>
        {/* TO NAVIGATE TO THIS ROUTE JUST GO TO: /dashboard */}
        <Route path="" element={<Dashboard />} />
        <Route path="register-wallet" element={<RegisterWallet />} />
        <Route path="onboard-member" element={<OnboardMembers />} />
        <Route path="reimburse-org" element={<ReimburseOrganization />} />
        <Route path="reimburse-member" element={<ReimburseMember />} />
        <Route path="spending" element={<Spending />} />
        {/* <Route path="*" element={<NotFound />} /> */}
      </Route>
    </Route>
  )
);

const Router = () => {
  return <RouterProvider router={router} />;
};

export default Router;
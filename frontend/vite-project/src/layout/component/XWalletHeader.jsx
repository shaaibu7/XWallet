import React, { useCallback, useEffect, useState } from "react";
import logo from "../../assets/logo.png";
import { IconSun, IconMoon } from "@tabler/icons-react";
import { motion } from "framer-motion";
import { NavLink } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAppKitAccount } from "@reown/appkit/react";
import useContract from "../../hooks/useContract";
import useAdminRole from "../../hooks/useAdminRole";

const XWalletHeader = () => {
  const { address: connectedWalletAddress } = useAppKitAccount();
  const [darkMode, setDarkMode] = useState(false);
   const [memberInfo, setMemberInfo] = useState(null);  
 

  const { adminRole } = useAdminRole(connectedWalletAddress);

  const readOnlyOnboardContract = useContract(true);

  const fetchMemberInfo = useCallback(async () => {
    if (!readOnlyOnboardContract) return;

    try {
      const info = await readOnlyOnboardContract.getMember();

      const parsedInfo = {
        address: info[0],
        firstName: info[1],
        lastName: info[2],
        isActive: info[3],
        spendLimit: info[4],
        role: info[7],
      };

      // console.log(parsedInfo);
      // console.log(info);
      
      
      setMemberInfo(parsedInfo);
    } catch (error) {
      console.log("Error fetching member info: ", error);
    }
  }, [readOnlyOnboardContract]);

  const isAdminOrEmptyRole = useCallback(() => {
    return adminRole === "admin" || memberInfo?.role === "member";
  }, [adminRole, memberInfo]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  const handleWalletNavigation = (e) => {
    if (!connectedWalletAddress) {
      e.preventDefault(); // Prevent navigation
      toast.error("Please connect your wallet!");
    }
  };

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([fetchMemberInfo()]);
    };
    loadData();
  }, [fetchMemberInfo]);

  return (
    <header className="w-full py-2 px-4 md:px-8 shadow-sm bg-primay dark:bg-card">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-2xl font-bold text-primary flex items-center"
        >
          <img src={logo} alt="XWALLET LOGO" className="w-[80px] h-[90px]" />
          XWallet
        </motion.h1>
        <nav className="space-x-6 hidden md:flex">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `font-semibold ${
                isActive ? "text-primary" : "hover:text-primary"
              }`
            }
          >
            Home
          </NavLink>

          {connectedWalletAddress && !isAdminOrEmptyRole() && (
            <NavLink
              to="/dashboard/register-wallet"
              onClick={handleWalletNavigation}
              className={({ isActive }) =>
                `font-semibold ${
                  isActive ? "text-primary" : "hover:text-primary"
                }`
              }
            >
              Register Wallet
            </NavLink>
          )}

          {connectedWalletAddress && isAdminOrEmptyRole() && (
            <>
              <NavLink
                to="/dashboard"
                onClick={handleWalletNavigation}
                className={({ isActive }) =>
                  `font-semibold ${
                    isActive ? "text-primary" : "hover:text-primary"
                  }`
                }
              >
                Dashboard
              </NavLink>
              <NavLink
                to="/transaction-history"
                onClick={handleWalletNavigation}
                className={({ isActive }) =>
                  `font-semibold ${
                    isActive ? "text-primary" : "hover:text-primary"
                  }`
                }
              >
                Transactions
              </NavLink>
            </>
          )}

          {connectedWalletAddress && (
            <NavLink
              to="/spending"
              onClick={handleWalletNavigation}
              className={({ isActive }) =>
                `font-semibold ${
                  isActive ? "text-primary" : "hover:text-primary"
                }`
              }
            >
              Spend
            </NavLink>
          )}

          <NavLink
            to="/contact"
            className={({ isActive }) =>
              `font-semibold ${
                isActive ? "text-primary" : "hover:text-primary"
              }`
            }
          >
            Contact
          </NavLink>
        </nav>
        {/* Dark Mode Toggler */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="ml-4 p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition"
        >
          {darkMode ? (
            <IconSun size={24} className="text-yellow-500" />
          ) : (
            <IconMoon size={24} className="text-gray-800 dark:text-gray-200" />
          )}
        </button>
      </div>
      <ToastContainer />
    </header>
  );
};

export default XWalletHeader;
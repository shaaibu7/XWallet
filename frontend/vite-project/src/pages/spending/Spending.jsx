import React, { useState, useEffect } from "react";
import useMemberWithdrawal from "../../hooks/useMemberWithdrawal";
import useGetMemberTransactions from "../../hooks/useGetMemberTransactions";
import { IconLoader, IconEye } from "@tabler/icons-react"; // Added IconEye
import { useAppKitAccount } from "@reown/appkit/react";

const Spending = () => {
  const [amount, setAmount] = useState("");
  const [receiver, setReceiver] = useState("");
  const [loading, setLoading] = useState(false);
  const [transactionHistory, setTransactionHistory] = useState([]);
  const [showFullAddress, setShowFullAddress] = useState({}); // State to track toggled addresses
  const memberWithdrawal = useMemberWithdrawal();
  const { fetchMemberTransactions } = useGetMemberTransactions();

  const { address } = useAppKitAccount();

  const handleWithdraw = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await memberWithdrawal(amount, receiver);

      // Reset form after success
      setAmount("");
      setReceiver("");
    } catch (error) {
      console.error("Withdrawal failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatTokenAmount = (amountBigInt, decimals = 18, symbol = "USDT") => {
    const divisor = BigInt(10) ** BigInt(decimals);
    const whole = amountBigInt / divisor;
    const fraction = amountBigInt % divisor;

    const fractionStr = fraction.toString().padStart(decimals, "0").slice(0, 2);

    return `${whole.toString()}.${fractionStr} ${symbol}`;
  };

  const shortenAddress = (address) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const toggleAddressVisibility = (index) => {
    setShowFullAddress((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  useEffect(() => {
    const fetchTransactions = async () => {
      if (address) {
        const response = await fetchMemberTransactions(address);

        if (Array.isArray(response)) {
          const parsedTransactions = response.map((tx) => {
            const amountRaw = tx?.[0] ?? 0n;
            const receiverRaw = tx?.[1] ?? "";

            return {
              amount: formatTokenAmount(amountRaw, 0, "USDT"),
              receiver: receiverRaw,
            };
          });

          setTransactionHistory(parsedTransactions);
        }
      } else {
        console.error("No connected address found.");
      }
    };

    fetchTransactions();
  }, [address]);
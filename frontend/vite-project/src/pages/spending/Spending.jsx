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

return (
    <div className="max-w-xl mx-auto bg-[hsl(var(--card))] border border-[hsl(var(--border))] p-8 rounded-2xl shadow-md">
      <h2 className="text-2xl font-semibold mb-6 text-[hsl(var(--foreground))]">
        Spend From Wallet
      </h2>

      <form onSubmit={handleWithdraw} className="space-y-5">
        <div>
          <label
            htmlFor="receiver"
            className="block mb-2 text-sm font-medium text-[hsl(var(--muted-text))]"
          >
            Receiver Address
          </label>
          <input
            type="text"
            id="receiver"
            placeholder="0x..."
            value={receiver}
            onChange={(e) => setReceiver(e.target.value)}
            required
            className="w-full px-4 py-2 rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--input))] text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-text))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary)/0.4)]"
          />
        </div>

        <div>
          <label
            htmlFor="amount"
            className="block mb-2 text-sm font-medium text-[hsl(var(--muted-text))]"
          >
            Amount
          </label>
          <input
            type="number"
            id="amount"
            placeholder="Enter amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            min="0"
            className="w-full px-4 py-2 rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--input))] text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-text))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary)/0.4)]"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="border border-[hsl(var(--primary))] w-full text-[hsl(var(--primary))] px-4 py-2 rounded-md hover:bg-[hsl(var(--primary)/0.05)] transition disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading && <IconLoader size={18} className="animate-spin" />}
          {loading ? "Processing..." : "Withdraw"}
        </button>
      </form>

      <h3 className="text-xl font-semibold mt-8 text-[hsl(var(--foreground))]">
        Transaction History
      </h3>
      <div className="overflow-x-auto mt-4">
        <table className="w-full border-collapse border border-[hsl(var(--border))]">
          <thead>
            <tr className="bg-[hsl(var(--muted))]">
              <th className="border border-[hsl(var(--border))] px-4 py-2 text-left text-[hsl(var(--foreground))]">
                Amount
              </th>
              <th className="border border-[hsl(var(--border))] px-4 py-2 text-left text-[hsl(var(--foreground))]">
                Receiver
              </th>
            </tr>
          </thead>
          <tbody>
            {transactionHistory.length > 0 ? (
              transactionHistory.map((tx, index) => (
                <tr key={index} className="hover:bg-[hsl(var(--muted)/0.1)]">
                  <td
                    className="border border-[hsl(var(--border))] px-4 py-2 text-[hsl(var(--foreground))] whitespace-nowrap"
                  >
                    {tx.amount}
                  </td>
                  <td className="border border-[hsl(var(--border))] px-4 py-2 text-[hsl(var(--foreground))] flex items-center gap-2">
                    {showFullAddress[index]
                      ? tx.receiver
                      : shortenAddress(tx.receiver)}
                    <button
                      onClick={() => toggleAddressVisibility(index)}
                      className="text-[hsl(var(--primary))] hover:text-[hsl(var(--primary)/0.8)]"
                    >
                      <IconEye size={16} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="2"
                  className="border border-[hsl(var(--border))] px-4 py-2 text-center text-[hsl(var(--muted-text))]"
                >
                  No transactions found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Spending;
import React, { useCallback, useEffect, useState } from "react";
import {
  IconFilter,
  IconSearch,
  IconDownload,
  IconCalendar,
  IconCurrencyDollar,
  IconUser,
  IconTrendingUp,
  IconX,
} from "@tabler/icons-react";
import useContract from "../../hooks/useContract";
import { useAppKitAccount } from "@reown/appkit/react";
import useAdminRole from "../../hooks/useAdminRole";

const TransactionHistory = () => {
  const { address: connectedWalletAddress } = useAppKitAccount();
  const { adminRole } = useAdminRole(connectedWalletAddress);
  const userRole = adminRole || "member";

  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState([]);

  // Filter states
  const [filters, setFilters] = useState({
    searchTerm: "",
    selectedMember: "",
    startDate: "",
    endDate: "",
    minAmount: "",
    maxAmount: "",
  });

  const [showFilters, setShowFilters] = useState(false);
  const [stats, setStats] = useState({
    totalTransactions: 0,
    totalAmount: 0,
    averageAmount: 0,
  });

  const readOnlyContract = useContract(true);

  // Fetch members for admin
  const fetchMembers = useCallback(async () => {
    if (!readOnlyContract || userRole !== "admin") return;

    try {
      const data = await readOnlyContract.getMembers();
      const result = await data.toArray();

      const parsedMembers = result.map((member) => ({
        id: member[0],
        name: member[3],
        address: member[0],
      }));

      setMembers(parsedMembers);
    } catch (error) {
      console.log("Error fetching members: ", error);
    }
  }, [readOnlyContract, userRole]);

  // Fetch all transactions
  const fetchTransactions = useCallback(async () => {
    if (!readOnlyContract) return;

    try {
      setLoading(true);
      let allTransactions = [];

      if (userRole === "admin") {
        // Fetch transactions for all members
        const membersList = await readOnlyContract.getMembers();
        const membersArray = await membersList.toArray();

        for (const member of membersArray) {
          const memberAddress = member[0];
          const memberName = member[3];
          try {
            const txs = await readOnlyContract.getMemberTransactions(memberAddress);
            const parsedTxs = txs.map((tx) => ({
              amount: Number(tx[0]),
              receiver: tx[1],
              memberAddress,
              memberName,
              timestamp: new Date().toISOString(), // Note: Contract doesn't store timestamps
            }));
            allTransactions = [...allTransactions, ...parsedTxs];
          } catch (error) {
            console.log(`Error fetching transactions for ${memberAddress}:`, error);
          }
        }
      } else {
        // Fetch transactions for current member
        const txs = await readOnlyContract.getMemberTransactions(connectedWalletAddress);
        allTransactions = txs.map((tx) => ({
          amount: Number(tx[0]),
          receiver: tx[1],
          memberAddress: connectedWalletAddress,
          memberName: "You",
          timestamp: new Date().toISOString(),
        }));
      }

      setTransactions(allTransactions);
      calculateStats(allTransactions);
      applyFilters(allTransactions, filters);
    } catch (error) {
      console.log("Error fetching transactions: ", error);
    } finally {
      setLoading(false);
    }
  }, [readOnlyContract, userRole, connectedWalletAddress, filters]);

  // Calculate statistics
  const calculateStats = (txs) => {
    if (txs.length === 0) {
      setStats({ totalTransactions: 0, totalAmount: 0, averageAmount: 0 });
      return;
    }

    const totalAmount = txs.reduce((sum, tx) => sum + tx.amount, 0);
    setStats({
      totalTransactions: txs.length,
      totalAmount,
      averageAmount: Math.round(totalAmount / txs.length),
    });
  };

  // Apply filters
  const applyFilters = (txs, filterObj) => {
    let filtered = [...txs];

    // Search term filter
    if (filterObj.searchTerm) {
      const term = filterObj.searchTerm.toLowerCase();
      filtered = filtered.filter(
        (tx) =>
          tx.receiver.toLowerCase().includes(term) ||
          tx.memberName.toLowerCase().includes(term) ||
          tx.memberAddress.toLowerCase().includes(term)
      );
    }

    // Member filter
    if (filterObj.selectedMember) {
      filtered = filtered.filter((tx) => tx.memberAddress === filterObj.selectedMember);
    }

    // Date range filter
    if (filterObj.startDate) {
      const startDate = new Date(filterObj.startDate);
      filtered = filtered.filter((tx) => new Date(tx.timestamp) >= startDate);
    }

    if (filterObj.endDate) {
      const endDate = new Date(filterObj.endDate);
      endDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter((tx) => new Date(tx.timestamp) <= endDate);
    }

    // Amount range filter
    if (filterObj.minAmount) {
      const minAmount = Number(filterObj.minAmount);
      filtered = filtered.filter((tx) => tx.amount >= minAmount);
    }

    if (filterObj.maxAmount) {
      const maxAmount = Number(filterObj.maxAmount);
      filtered = filtered.filter((tx) => tx.amount <= maxAmount);
    }

    setFilteredTransactions(filtered);
  };

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    applyFilters(transactions, newFilters);
  };

  // Reset filters
  const resetFilters = () => {
    const emptyFilters = {
      searchTerm: "",
      selectedMember: "",
      startDate: "",
      endDate: "",
      minAmount: "",
      maxAmount: "",
    };
    setFilters(emptyFilters);
    applyFilters(transactions, emptyFilters);
  };

  // Export to CSV
  const exportToCSV = () => {
    if (filteredTransactions.length === 0) {
      alert("No transactions to export");
      return;
    }

    const headers = ["Member", "Amount (USDT)", "Receiver", "Date"];
    const rows = filteredTransactions.map((tx) => [
      tx.memberName,
      tx.amount,
      tx.receiver,
      new Date(tx.timestamp).toLocaleDateString(),
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `transactions-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  useEffect(() => {
    const loadData = async () => {
      await fetchMembers();
      await fetchTransactions();
    };
    loadData();
  }, [fetchMembers, fetchTransactions]);

  if (loading) {
    return <TransactionHistorySkeleton />;
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-[hsl(var(--foreground))]">
          Transaction History
        </h2>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[hsl(var(--border))] hover:bg-[hsl(var(--muted)/0.5)] transition"
        >
          <IconFilter size={20} />
          Filters
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
        <StatCard
          icon={<IconTrendingUp size={24} />}
          title="Total Transactions"
          value={stats.totalTransactions}
        />
        <StatCard
          icon={<IconCurrencyDollar size={24} />}
          title="Total Amount"
          value={`${stats.totalAmount} USDT`}
        />
        <StatCard
          icon={<IconCurrencyDollar size={24} />}
          title="Average Amount"
          value={`${stats.averageAmount} USDT`}
        />
      </div>

      {/* Filters Section */}
      {showFilters && (
        <FilterPanel
          filters={filters}
          members={members}
          onFilterChange={handleFilterChange}
          onReset={resetFilters}
          userRole={userRole}
        />
      )}

      {/* Export Button */}
      <div className="flex justify-end">
        <button
          onClick={exportToCSV}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[hsl(var(--primary))] text-white hover:bg-[hsl(var(--primary)/0.9)] transition"
        >
          <IconDownload size={18} />
          Export CSV
        </button>
      </div>

      {/* Transactions Table */}
      <div className="bg-[hsl(var(--card))] rounded-xl border border-[hsl(var(--border))] overflow-hidden">
        {filteredTransactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[hsl(var(--muted))]">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-[hsl(var(--foreground))]">
                    Member
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-[hsl(var(--foreground))]">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-[hsl(var(--foreground))]">
                    Receiver
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-[hsl(var(--foreground))]">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[hsl(var(--border))]">
                {filteredTransactions.map((tx, idx) => (
                  <tr
                    key={idx}
                    className="hover:bg-[hsl(var(--muted)/0.3)] transition"
                  >
                    <td className="px-6 py-4 text-sm text-[hsl(var(--foreground))]">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-[hsl(var(--primary)/0.2)] flex items-center justify-center">
                          <IconUser size={16} className="text-[hsl(var(--primary))]" />
                        </div>
                        {tx.memberName}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-green-600">
                      {tx.amount} USDT
                    </td>
                    <td className="px-6 py-4 text-sm text-[hsl(var(--muted-text))] font-mono">
                      {tx.receiver.slice(0, 6)}...{tx.receiver.slice(-4)}
                    </td>
                    <td className="px-6 py-4 text-sm text-[hsl(var(--muted-text))]">
                      {new Date(tx.timestamp).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <IconTrendingUp size={48} className="mx-auto text-[hsl(var(--muted-text))] mb-4 opacity-50" />
            <p className="text-[hsl(var(--muted-text))]">No transactions found</p>
          </div>
        )}
      </div>
    </div>
  );
};

const StatCard = ({ icon, title, value }) => (
  <div className="bg-[hsl(var(--card))] p-6 rounded-xl border border-[hsl(var(--border))] hover:border-[hsl(var(--primary)/0.5)] transition">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm text-[hsl(var(--muted-text))] mb-2">{title}</p>
        <p className="text-2xl font-bold text-[hsl(var(--foreground))]">{value}</p>
      </div>
      <div className="p-3 rounded-lg bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))]">
        {icon}
      </div>
    </div>
  </div>
);

const FilterPanel = ({ filters, members, onFilterChange, onReset, userRole }) => (
  <div className="bg-[hsl(var(--card))] p-6 rounded-xl border border-[hsl(var(--border))] space-y-4">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-lg font-semibold text-[hsl(var(--foreground))]">Filters</h3>
      <button
        onClick={onReset}
        className="text-sm text-[hsl(var(--primary))] hover:underline flex items-center gap-1"
      >
        <IconX size={16} />
        Reset
      </button>
    </div>

    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {/* Search */}
      <div>
        <label className="block text-sm text-[hsl(var(--muted-text))] mb-2">
          Search
        </label>
        <div className="relative">
          <IconSearch size={18} className="absolute left-3 top-2.5 text-[hsl(var(--muted-text))]" />
          <input
            type="text"
            placeholder="Search receiver or member..."
            value={filters.searchTerm}
            onChange={(e) => onFilterChange("searchTerm", e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--input))] text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-text))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary)/0.4)]"
          />
        </div>
      </div>

      {/* Member Filter (Admin only) */}
      {userRole === "admin" && (
        <div>
          <label className="block text-sm text-[hsl(var(--muted-text))] mb-2">
            Member
          </label>
          <select
            value={filters.selectedMember}
            onChange={(e) => onFilterChange("selectedMember", e.target.value)}
            className="w-full px-4 py-2 rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--input))] text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary)/0.4)]"
          >
            <option value="">All Members</option>
            {members.map((member) => (
              <option key={member.id} value={member.address}>
                {member.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Start Date */}
      <div>
        <label className="block text-sm text-[hsl(var(--muted-text))] mb-2">
          Start Date
        </label>
        <div className="relative">
          <IconCalendar size={18} className="absolute left-3 top-2.5 text-[hsl(var(--muted-text))]" />
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => onFilterChange("startDate", e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--input))] text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary)/0.4)]"
          />
        </div>
      </div>

      {/* End Date */}
      <div>
        <label className="block text-sm text-[hsl(var(--muted-text))] mb-2">
          End Date
        </label>
        <div className="relative">
          <IconCalendar size={18} className="absolute left-3 top-2.5 text-[hsl(var(--muted-text))]" />
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => onFilterChange("endDate", e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--input))] text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary)/0.4)]"
          />
        </div>
      </div>

      {/* Min Amount */}
      <div>
        <label className="block text-sm text-[hsl(var(--muted-text))] mb-2">
          Min Amount
        </label>
        <div className="relative">
          <IconCurrencyDollar size={18} className="absolute left-3 top-2.5 text-[hsl(var(--muted-text))]" />
          <input
            type="number"
            placeholder="0"
            value={filters.minAmount}
            onChange={(e) => onFilterChange("minAmount", e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--input))] text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-text))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary)/0.4)]"
          />
        </div>
      </div>

      {/* Max Amount */}
      <div>
        <label className="block text-sm text-[hsl(var(--muted-text))] mb-2">
          Max Amount
        </label>
        <div className="relative">
          <IconCurrencyDollar size={18} className="absolute left-3 top-2.5 text-[hsl(var(--muted-text))]" />
          <input
            type="number"
            placeholder="∞"
            value={filters.maxAmount}
            onChange={(e) => onFilterChange("maxAmount", e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--input))] text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-text))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary)/0.4)]"
          />
        </div>
      </div>
    </div>
  </div>
);

const TransactionHistorySkeleton = () => (
  <div className="space-y-6 max-w-7xl mx-auto">
    <div className="h-8 bg-gray-300 rounded w-1/3 animate-pulse"></div>
    <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="p-6 rounded-xl border border-[hsl(var(--border))] animate-pulse">
          <div className="h-4 bg-gray-300 rounded w-1/2 mb-2"></div>
          <div className="h-6 bg-gray-300 rounded w-3/4"></div>
        </div>
      ))}
    </div>
    <div className="p-6 rounded-xl border border-[hsl(var(--border))] animate-pulse">
      <div className="h-64 bg-gray-300 rounded"></div>
    </div>
  </div>
);

export default TransactionHistory;

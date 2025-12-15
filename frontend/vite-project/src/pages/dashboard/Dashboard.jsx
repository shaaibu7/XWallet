import React, { useCallback, useEffect, useState } from "react";
import "react-toastify/dist/ReactToastify.css";
import useContract from "../../hooks/useContract";
import { useAppKitAccount } from "@reown/appkit/react";
import useAdminRole from "../../hooks/useAdminRole";
import useRemoveMember from "../../hooks/useRemoveMember";
import useFreezeMember from "../../hooks/useFreezeMember";
import useUnfreezeMember from "../../hooks/useUnfreezeMember";
import { IconUserMinus, IconSnowflake, IconFlame, IconTrendingUp, IconUsers, IconWallet, IconActivity, IconRefresh } from "@tabler/icons-react";

const Dashboard = () => {
  const { address: connectedWalletAddress } = useAppKitAccount();
  const { adminRole } = useAdminRole(connectedWalletAddress);
  const removeMember = useRemoveMember();
  const freezeMember = useFreezeMember();
  const unfreezeMember = useUnfreezeMember();

  const userRole = adminRole || "member";
  const [members, setMembers] = useState([]);
  const [memberInfo, setMemberInfo] = useState(null);
  const [walletInfo, setWalletInfo] = useState({
    walletName: "",
    walletBalance: 0,
    organizationName: "",
    memberSpendLimit: "",
  });
  const [removingMember, setRemovingMember] = useState(null);
  const [freezingMember, setFreezingMember] = useState(null);
  const [unfreezingMember, setUnfreezingMember] = useState(null);
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    totalMembers: 0,
    totalAllocated: 0,
    utilizationRate: 0,
  });

  const readOnlyOnboardContract = useContract(true);

  const fetchMembers = useCallback(async () => {
    if (!readOnlyOnboardContract) return;

    try {
      const data = await readOnlyOnboardContract.getMembers();
      const result = await data.toArray();

      const parsedMembers = result.map((member) => ({
        id: member[0],
        name: member[3],
        active: member[4],
        frozen: member[5],
        spendLimit: member[6],
      }));

      setMembers(parsedMembers);

      // Calculate stats
      const totalAllocated = parsedMembers.reduce((sum, m) => sum + Number(m.spendLimit), 0);
      setStats((prev) => ({
        ...prev,
        totalMembers: parsedMembers.length,
        totalAllocated,
      }));
    } catch (error) {
      console.log("Error fetching members: ", error);
    }
  }, [readOnlyOnboardContract]);

  const fetchWalletInfo = useCallback(async () => {
    if (!readOnlyOnboardContract) return;

    try {
      const adminInfo = await readOnlyOnboardContract.getWalletAdmin();
      const balance = Number(adminInfo.walletBalance);
      setWalletInfo({
        walletName: adminInfo.walletName,
        walletBalance: balance,
        organizationName: adminInfo.organizationName || "N/A",
        memberSpendLimit: "N/A",
      });

      // Calculate utilization rate
      setStats((prev) => ({
        ...prev,
        utilizationRate: balance > 0 ? Math.round((prev.totalAllocated / balance) * 100) : 0,
      }));
    } catch (error) {
      console.log("Error fetching wallet info: ", error);
    }
  }, [readOnlyOnboardContract]);

  const fetchMemberInfo = useCallback(async () => {
    if (!readOnlyOnboardContract) return;

    try {
      const info = await readOnlyOnboardContract.getMember();

      const parsedInfo = {
        address: info[0],
        firstName: info[2],
        lastName: info[3],
        isActive: info[4],
        spendLimit: info[5],
        role: info[7],
      };

      setMemberInfo(parsedInfo);
    } catch (error) {
      console.log("Error fetching member info: ", error);
    }
  }, [readOnlyOnboardContract]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchMembers(), fetchWalletInfo(), fetchMemberInfo()]);
    setRefreshing(false);
  };

  const handleFreezeMember = async (memberAddress) => {
    try {
      setFreezingMember(memberAddress);
      await freezeMember(memberAddress);
      // Refresh member list after successful freeze
      await fetchMembers();
    } catch (error) {
      console.error("Failed to freeze member:", error);
    } finally {
      setFreezingMember(null);
    }
  };

  const handleUnfreezeMember = async (memberAddress) => {
    try {
      setUnfreezingMember(memberAddress);
      await unfreezeMember(memberAddress);
      // Refresh member list after successful unfreeze
      await fetchMembers();
    } catch (error) {
      console.error("Failed to unfreeze member:", error);
    } finally {
      setUnfreezingMember(null);
    }
  };

  const handleRemoveMember = async (memberAddress) => {
    try {
      setRemovingMember(memberAddress);
      await removeMember(memberAddress);
      // Refresh member list after successful removal
      await fetchMembers();
      await fetchWalletInfo(); // Refresh wallet info to show updated balance
    } catch (error) {
      console.error("Failed to remove member:", error);
    } finally {
      setRemovingMember(null);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([fetchMembers(), fetchWalletInfo(), fetchMemberInfo()]);
      setLoading(false);
    };
    loadData();
  }, [fetchMembers, fetchWalletInfo, fetchMemberInfo]);

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header with Refresh */}
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-[hsl(var(--foreground))]">
          {userRole === "admin" ? "Admin Dashboard" : "Member Dashboard"}
        </h2>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="p-2 rounded-lg border border-[hsl(var(--border))] hover:bg-[hsl(var(--muted)/0.5)] transition disabled:opacity-50"
          title="Refresh data"
        >
          <IconRefresh
            size={20}
            className={refreshing ? "animate-spin" : ""}
          />
        </button>
      </div>

      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-[hsl(var(--primary)/0.1)] to-[hsl(var(--primary)/0.05)] p-6 rounded-xl border border-[hsl(var(--primary)/0.2)]">
        <p className="text-[hsl(var(--foreground))] text-lg">
          Welcome back,{" "}
          <span className="font-semibold">
            {userRole === "admin"
              ? "Admin"
              : `${memberInfo?.firstName || "Member"}`}
          </span>
        </p>
        <p className="text-[hsl(var(--muted-text))] text-sm mt-1">
          {userRole === "admin"
            ? "Monitor your wallet and manage members"
            : "View your spending limits and activity"}
        </p>
      </div>

      {/* Key Metrics */}
      {userRole === "admin" && (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            icon={<IconWallet size={24} />}
            title="Wallet Balance"
            value={`${walletInfo.walletBalance} USDT`}
            trend="stable"
          />
          <MetricCard
            icon={<IconUsers size={24} />}
            title="Total Members"
            value={stats.totalMembers}
            trend="up"
          />
          <MetricCard
            icon={<IconTrendingUp size={24} />}
            title="Total Allocated"
            value={`${stats.totalAllocated} USDT`}
            trend="up"
          />
          <MetricCard
            icon={<IconActivity size={24} />}
            title="Utilization Rate"
            value={`${stats.utilizationRate}%`}
            trend={stats.utilizationRate > 80 ? "warning" : "stable"}
          />
        </div>
      )}

      {/* Main Info Cards */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {userRole === "admin" || memberInfo?.role === "" ? (
          <>
            <Card title="Wallet Name" icon={<IconWallet size={18} />}>
              {walletInfo.walletName}
            </Card>
            <Card title="Wallet Balance" icon={<IconTrendingUp size={18} />}>
              {walletInfo.walletBalance} USDT
            </Card>
            <Card title="Role" icon={<IconUsers size={18} />} className="capitalize">
              {userRole}
            </Card>
            <Card title="Wallet Address" colSpanFull icon={<IconActivity size={18} />}>
              {connectedWalletAddress ? (
                <CopyableAddress address={connectedWalletAddress} chars={6} />
              ) : (
                <span className="text-sm text-[hsl(var(--muted-text))]">Not Connected</span>
              )}
            </Card>
          </>
        ) : (
          <>
            <Card title="Organisation Name" icon={<IconWallet size={18} />}>
              {memberInfo?.firstName || "N/A"}
            </Card>
            <Card title="Name" icon={<IconUsers size={18} />}>
              {memberInfo?.lastName || "N/A"}
            </Card>
            <Card title="Spend Limit" icon={<IconTrendingUp size={18} />}>
              {memberInfo?.spendLimit ? `${memberInfo.spendLimit} USDT` : "N/A"}
            </Card>
            <Card title="Role" icon={<IconActivity size={18} />} className="capitalize">
              {memberInfo?.role || "N/A"}
            </Card>
            <Card title="Wallet Address" colSpanFull icon={<IconWallet size={18} />}>
              {memberInfo?.address ? (
                <CopyableAddress address={memberInfo.address} chars={6} />
              ) : (
                <span className="text-sm text-[hsl(var(--muted-text))]">Not Connected</span>
              )}
            </Card>
          </>
        )}
      </div>

      {/* Member List for Admins */}
      {userRole === "admin" && members.length > 0 && (
        <section className="space-y-4">
          <h3 className="text-2xl font-semibold text-[hsl(var(--foreground))]">
            Members Overview
          </h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {members.map((member) => (
              <MemberCard 
                key={member.id} 
                member={member}
                onFreeze={handleFreezeMember}
                onUnfreeze={handleUnfreezeMember}
                onRemove={handleRemoveMember}
                freezingMember={freezingMember}
                unfreezingMember={unfreezingMember}
                removingMember={removingMember}
              />
            ))}
          </div>
        </section>
      )}

      {/* Empty State for Members */}
      {userRole === "admin" && members.length === 0 && (
        <div className="text-center py-12 bg-[hsl(var(--card))] rounded-xl border border-[hsl(var(--border))]">
          <IconUsers size={48} className="mx-auto text-[hsl(var(--muted-text))] mb-4 opacity-50" />
          <p className="text-[hsl(var(--muted-text))]">No members onboarded yet</p>
        </div>
      )}
    </div>
  );
};

const DashboardSkeleton = () => (
  <div className="space-y-8 max-w-7xl mx-auto">
    <div className="h-8 bg-gray-300 rounded w-1/3 animate-pulse"></div>
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="p-6 rounded-xl shadow border border-[hsl(var(--border))] animate-pulse">
          <div className="h-4 bg-gray-300 rounded w-1/2 mb-2"></div>
          <div className="h-6 bg-gray-300 rounded w-3/4"></div>
        </div>
      ))}
    </div>
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="p-6 rounded-xl shadow border border-[hsl(var(--border))] animate-pulse">
          <div className="h-4 bg-gray-300 rounded w-1/2 mb-2"></div>
          <div className="h-6 bg-gray-300 rounded w-3/4"></div>
        </div>
      ))}
    </div>
  </div>
);

const Card = ({ title, children, className = "", colSpanFull = false, icon }) => (
  <div
    className={`relative bg-[hsl(var(--card))] p-6 rounded-xl shadow border border-[hsl(var(--border))] hover:border-[hsl(var(--primary)/0.5)] transition ${
      colSpanFull ? "col-span-full lg:col-span-1" : ""
    }`}
    style={{
      backgroundImage:
        "linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0))",
    }}
  >
    <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-[hsl(var(--foreground))] to-transparent opacity-10 pointer-events-none"></div>
    <div className="flex items-center gap-2 mb-2">
      {icon && <span className="text-[hsl(var(--primary))]">{icon}</span>}
      <p className="text-sm text-[hsl(var(--muted-text))]">{title}</p>
    </div>
    <p
      className={`text-lg font-medium text-[hsl(var(--foreground))] ${className}`}
    >
      {children}
    </p>
  </div>
);

const MetricCard = ({ icon, title, value, trend }) => {
  const trendColor =
    trend === "up"
      ? "text-green-500"
      : trend === "warning"
      ? "text-yellow-500"
      : "text-blue-500";

  return (
    <div className="relative bg-[hsl(var(--card))] p-6 rounded-xl shadow border border-[hsl(var(--border))] hover:border-[hsl(var(--primary)/0.5)] transition">
      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-[hsl(var(--foreground))] to-transparent opacity-10 pointer-events-none"></div>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-[hsl(var(--muted-text))] mb-2">{title}</p>
          <p className="text-2xl font-bold text-[hsl(var(--foreground))]">{value}</p>
        </div>
        <div className={`p-3 rounded-lg bg-[hsl(var(--primary)/0.1)] ${trendColor}`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

const MemberCard = ({ 
  member, 
  onFreeze, 
  onUnfreeze, 
  onRemove, 
  freezingMember, 
  unfreezingMember, 
  removingMember 
}) => {
  const spendPercentage = member.spendLimit ? Math.min(100, (member.spendLimit / 1000) * 100) : 0;

  return (
    <div className="relative bg-[hsl(var(--card))] p-5 rounded-lg border border-[hsl(var(--border))] hover:border-[hsl(var(--primary)/0.5)] transition shadow">
      <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-[hsl(var(--foreground))] to-transparent opacity-10 pointer-events-none"></div>
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-[hsl(var(--foreground))]">{member.name}</h4>
            {member.frozen && (
              <span className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                <IconSnowflake size={10} />
                Frozen
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`text-xs px-2 py-1 rounded-full ${
                member.active
                  ? "bg-green-500/20 text-green-700"
                  : "bg-gray-500/20 text-gray-700"
              }`}
            >
              {member.active ? "Active" : "Inactive"}
            </span>
            
            {/* Action Buttons */}
            <div className="flex gap-1">
              {member.active && (
                <>
                  {member.frozen ? (
                    <button
                      onClick={() => onUnfreeze(member.id)}
                      disabled={unfreezingMember === member.id}
                      className="text-orange-500 hover:text-orange-700 disabled:opacity-50 p-1 rounded transition-colors"
                      title="Unfreeze Member"
                    >
                      {unfreezingMember === member.id ? (
                        <div className="animate-spin w-3 h-3 border-2 border-orange-500 border-t-transparent rounded-full"></div>
                      ) : (
                        <IconFlame size={14} />
                      )}
                    </button>
                  ) : (
                    <button
                      onClick={() => onFreeze(member.id)}
                      disabled={freezingMember === member.id}
                      className="text-blue-500 hover:text-blue-700 disabled:opacity-50 p-1 rounded transition-colors"
                      title="Freeze Member"
                    >
                      {freezingMember === member.id ? (
                        <div className="animate-spin w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                      ) : (
                        <IconSnowflake size={14} />
                      )}
                    </button>
                  )}
                </>
              )}
              <button
                onClick={() => onRemove(member.id)}
                disabled={removingMember === member.id}
                className="text-red-500 hover:text-red-700 disabled:opacity-50 p-1 rounded transition-colors"
                title="Remove Member"
              >
                {removingMember === member.id ? (
                  <div className="animate-spin w-3 h-3 border-2 border-red-500 border-t-transparent rounded-full"></div>
                ) : (
                  <IconUserMinus size={14} />
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-[hsl(var(--muted-text))]">Spend Limit:</span>
            <span className="font-medium text-[hsl(var(--foreground))]">
              {member.spendLimit ? `${member.spendLimit} USDT` : "N/A"}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="mt-3">
            <div className="w-full bg-[hsl(var(--muted)/0.3)] rounded-full h-2">
              <div
                className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${spendPercentage}%` }}
              ></div>
            </div>
          </div>

          <div className="text-xs">
            <CopyableAddress address={member.id} chars={6} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
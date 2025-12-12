import React, { useCallback, useEffect, useState } from "react";
import "react-toastify/dist/ReactToastify.css";
import useContract from "../../hooks/useContract";
import { useAppKitAccount } from "@reown/appkit/react";
import useAdminRole from "../../hooks/useAdminRole";
import useRemoveMember from "../../hooks/useRemoveMember";
import useFreezeMember from "../../hooks/useFreezeMember";
import useUnfreezeMember from "../../hooks/useUnfreezeMember";
import { IconUserMinus, IconSnowflake, IconFlame } from "@tabler/icons-react";

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
    walletBalance: "",
    organizationName: "",
    memberSpendLimit: "",
  });
  const [removingMember, setRemovingMember] = useState(null);
  const [freezingMember, setFreezingMember] = useState(null);
  const [unfreezingMember, setUnfreezingMember] = useState(null);
  
  const [loading, setLoading] = useState(true);

  const readOnlyOnboardContract = useContract(true);

  const fetchMembers = useCallback(async () => {
    if (!readOnlyOnboardContract) return;

    try {
      const data = await readOnlyOnboardContract.getMembers();
      const result = await data.toArray();

      // console.log("Members Data: ", result);
      
      const parsedMembers = result.map((member) => ({
        id: member[0],
        name: member[3],
        active: member[4],
        frozen: member[5],
        spendLimit: member[6],
      }));

      setMembers(parsedMembers);
    } catch (error) {
      console.log("Error fetching members: ", error);
    }
  }, [readOnlyOnboardContract]);

  const fetchWalletInfo = useCallback(async () => {
    if (!readOnlyOnboardContract) return;

    try {
      const adminInfo = await readOnlyOnboardContract.getWalletAdmin();
      const balance = adminInfo.walletBalance;
      setWalletInfo({
        walletName: adminInfo.walletName,
        walletBalance: `${balance} USDT`,
        organizationName: adminInfo.organizationName || "N/A",
        memberSpendLimit: "N/A",
      });
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

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([fetchMembers(), fetchWalletInfo(), fetchMemberInfo()]);
      setLoading(false);
    };
    loadData();
  }, [fetchMembers, fetchWalletInfo, fetchMemberInfo]);

  if (loading) {
    return (
      <div className="space-y-10 max-w-7xl mx-auto">
        <div className="space-y-4">
          <div className="h-8 bg-gray-300 rounded w-1/3 animate-pulse"></div>
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            <div className="p-6 rounded-xl shadow border border-[hsl(var(--border))]">
              <div className="h-4 bg-gray-300 rounded w-1/2 mb-2 animate-pulse"></div>
              <div className="h-6 bg-gray-300 rounded w-3/4 animate-pulse"></div>
            </div>
            <div className="p-6 rounded-xl shadow border border-[hsl(var(--border))]">
              <div className="h-4 bg-gray-300 rounded w-1/2 mb-2 animate-pulse"></div>
              <div className="h-6 bg-gray-300 rounded w-3/4 animate-pulse"></div>
            </div>
            <div className="p-6 rounded-xl shadow border border-[hsl(var(--border))]">
              <div className="h-4 bg-gray-300 rounded w-1/2 mb-2 animate-pulse"></div>
              <div className="h-6 bg-gray-300 rounded w-3/4 animate-pulse"></div>
            </div>
          </div>
          <div className="h-8 bg-gray-300 rounded w-1/4 animate-pulse"></div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="p-6 rounded-xl shadow border border-[hsl(var(--border))]">
              <div className="h-4 bg-gray-300 rounded w-1/2 mb-2 animate-pulse"></div>
              <div className="h-6 bg-gray-300 rounded w-3/4 animate-pulse"></div>
            </div>
            <div className="p-6 rounded-xl shadow border border-[hsl(var(--border))]">
              <div className="h-4 bg-gray-300 rounded w-1/2 mb-2 animate-pulse"></div>
              <div className="h-6 bg-gray-300 rounded w-3/4 animate-pulse"></div>
            </div>
            <div className="p-6 rounded-xl shadow border border-[hsl(var(--border))]">
              <div className="h-4 bg-gray-300 rounded w-1/2 mb-2 animate-pulse"></div>
              <div className="h-6 bg-gray-300 rounded w-3/4 animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 max-w-7xl mx-auto">
      {/* Welcome Section */}
      <h2 className="text-2xl font-semibold text-[hsl(var(--foreground))]">
        Welcome,{" "}
        {userRole === "admin"
          ? "Admin"
          : `${memberInfo?.firstName || "Member"}`}
      </h2>

      {/* Info Cards */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {userRole === "admin" || memberInfo?.role === "" ? (
          <>
            <Card title="Wallet Name">{walletInfo.walletName}</Card>
            <Card title="Wallet Balance">{walletInfo.walletBalance}</Card>
            <Card title="Role" className="capitalize">
              {userRole}
            </Card>
            <Card title="Wallet Address" colSpanFull>
              <span className="text-sm font-mono">
                {connectedWalletAddress
                  ? `${connectedWalletAddress.slice(
                      0,
                      6
                    )}...${connectedWalletAddress.slice(-4)}`
                  : "Not Connected"}
              </span>
            </Card>
          </>
        ) : (
          <>
            <Card title="Organisation Name">{memberInfo?.firstName || "N/A"}</Card>
            <Card title="Name">{memberInfo?.lastName || "N/A"}</Card>
            <Card title="Spend Limit">
              {memberInfo?.spendLimit ? `${memberInfo.spendLimit} USDT` : "N/A"}
            </Card>
            <Card title="Role" className="capitalize">
              {memberInfo?.role || "N/A"}
            </Card>
            <Card title="Wallet Address" colSpanFull>
              <span className="text-sm font-mono">
                {memberInfo?.address
                  ? `${memberInfo.address.slice(
                      0,
                      6
                    )}...${memberInfo.address.slice(-4)}`
                  : "Not Connected"}
              </span>
            </Card>
          </>
        )}
      </div>

      {/* Member List */}
      {userRole === "admin" && (
        <section>
          <h3 className="text-xl font-semibold mb-4 text-[hsl(var(--foreground))]">
            Members
          </h3>
          <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {members.map((member) => (
              <li
                key={member.id}
                className="relative bg-[hsl(var(--card))] p-5 rounded-lg border border-[hsl(var(--border))] shadow"
                style={{
                  backgroundImage:
                    "linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0))",
                }}
              >
                <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-[hsl(var(--foreground))] to-transparent opacity-10 pointer-events-none"></div>
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-[hsl(var(--foreground))]">
                      {member.name}
                    </h4>
                    {member.frozen && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                        <IconSnowflake size={12} />
                        Frozen
                      </span>
                    )}
                  </div>
                  <div className="flex gap-1">
                    {member.frozen ? (
                      <button
                        onClick={() => handleUnfreezeMember(member.id)}
                        disabled={unfreezingMember === member.id}
                        className="text-orange-500 hover:text-orange-700 disabled:opacity-50 p-1 rounded transition-colors"
                        title="Unfreeze Member"
                      >
                        {unfreezingMember === member.id ? (
                          <div className="animate-spin w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full"></div>
                        ) : (
                          <IconFlame size={16} />
                        )}
                      </button>
                    ) : (
                      <button
                        onClick={() => handleFreezeMember(member.id)}
                        disabled={freezingMember === member.id}
                        className="text-blue-500 hover:text-blue-700 disabled:opacity-50 p-1 rounded transition-colors"
                        title="Freeze Member"
                      >
                        {freezingMember === member.id ? (
                          <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                        ) : (
                          <IconSnowflake size={16} />
                        )}
                      </button>
                    )}
                    <button
                      onClick={() => handleRemoveMember(member.id)}
                      disabled={removingMember === member.id}
                      className="text-red-500 hover:text-red-700 disabled:opacity-50 p-1 rounded transition-colors"
                      title="Remove Member"
                    >
                      {removingMember === member.id ? (
                        <div className="animate-spin w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full"></div>
                      ) : (
                        <IconUserMinus size={16} />
                      )}
                    </button>
                  </div>
                </div>
                <p className="text-sm text-[hsl(var(--muted-text))] mb-1">
                  Role: Member {member.frozen && "(Frozen)"}
                </p>
                <p className="text-sm text-[hsl(var(--muted-text))] mb-1">
                  Spend Limit: {member.spendLimit ? `${member.spendLimit} USDT` : "N/A"}
                </p>
                <p className="text-sm text-[hsl(var(--muted-text))] break-words">
                  Wallet: {`${member.id.slice(0, 6)}...${member.id.slice(-4)}`}
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
};

const Card = ({ title, children, className = "", colSpanFull = false }) => (
  <div
    className={`relative bg-[hsl(var(--card))] p-6 rounded-xl shadow border border-[hsl(var(--border))] ${
      colSpanFull ? "col-span-full lg:col-span-1" : ""
    }`}
    style={{
      backgroundImage:
        "linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0))",
    }}
  >
    <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-[hsl(var(--foreground))] to-transparent opacity-10 pointer-events-none"></div>
    <p className="text-sm text-[hsl(var(--muted-text))] mb-1">{title}</p>
    <p
      className={`text-lg font-medium text-[hsl(var(--foreground))] ${className}`}
    >
      {children}
    </p>
  </div>
);

export default Dashboard;
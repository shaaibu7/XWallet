import React, { useCallback, useEffect, useState } from "react";
import { IconUsers, IconSnowflake, IconFlame, IconUserMinus, IconLoader } from "@tabler/icons-react";
import useContract from "../../hooks/useContract";
import useFreezeMember from "../../hooks/useFreezeMember";
import useUnfreezeMember from "../../hooks/useUnfreezeMember";
import useRemoveMember from "../../hooks/useRemoveMember";
import { useAppKitAccount } from "@reown/appkit/react";

const MemberManagement = () => {
  const { address: connectedWalletAddress } = useAppKitAccount();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});

  const readOnlyContract = useContract(true);
  const freezeMember = useFreezeMember();
  const unfreezeMember = useUnfreezeMember();
  const removeMember = useRemoveMember();

  const fetchMembers = useCallback(async () => {
    if (!readOnlyContract) return;

    try {
      const data = await readOnlyContract.getMembers();
      const result = await data.toArray();

      const parsedMembers = result.map((member) => ({
        id: member[0],
        adminAddress: member[1],
        organizationName: member[2],
        name: member[3],
        active: member[4],
        frozen: member[5],
        spendLimit: member[6],
        memberIdentifier: member[7],
        role: member[8],
      }));

      setMembers(parsedMembers);
    } catch (error) {
      console.error("Error fetching members:", error);
    } finally {
      setLoading(false);
    }
  }, [readOnlyContract]);

  const handleAction = async (action, memberAddress, actionName) => {
    try {
      setActionLoading(prev => ({ ...prev, [memberAddress]: actionName }));
      await action(memberAddress);
      await fetchMembers(); // Refresh the list
    } catch (error) {
      console.error(`Failed to ${actionName} member:`, error);
    } finally {
      setActionLoading(prev => ({ ...prev, [memberAddress]: null }));
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <IconLoader className="animate-spin" size={32} />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center gap-3 mb-6">
        <IconUsers size={28} />
        <h1 className="text-2xl font-bold text-[hsl(var(--foreground))]">
          Member Management
        </h1>
      </div>

      <div className="bg-[hsl(var(--card))] rounded-xl border border-[hsl(var(--border))] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[hsl(var(--muted))]">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-[hsl(var(--foreground))]">
                  Member
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-[hsl(var(--foreground))]">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-[hsl(var(--foreground))]">
                  Spend Limit
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-[hsl(var(--foreground))]">
                  Wallet Address
                </th>
                <th className="px-6 py-4 text-center text-sm font-medium text-[hsl(var(--foreground))]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[hsl(var(--border))]">
              {members.map((member) => (
                <tr key={member.id} className="hover:bg-[hsl(var(--muted)/0.1)]">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-[hsl(var(--primary)/0.1)] rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-[hsl(var(--primary))]">
                          {member.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-[hsl(var(--foreground))]">
                          {member.name}
                        </p>
                        <p className="text-sm text-[hsl(var(--muted-text))]">
                          ID: {member.memberIdentifier}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full ${
                        member.active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {member.active ? 'Active' : 'Inactive'}
                      </span>
                      {member.frozen && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                          <IconSnowflake size={10} />
                          Frozen
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[hsl(var(--foreground))]">
                      {member.spendLimit} USDT
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-mono text-sm text-[hsl(var(--muted-text))]">
                      {`${member.id.slice(0, 6)}...${member.id.slice(-4)}`}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      {member.active && (
                        <>
                          {member.frozen ? (
                            <button
                              onClick={() => handleAction(unfreezeMember, member.id, 'unfreeze')}
                              disabled={actionLoading[member.id] === 'unfreeze'}
                              className="p-2 text-orange-500 hover:text-orange-700 hover:bg-orange-50 rounded-lg transition-colors disabled:opacity-50"
                              title="Unfreeze Member"
                            >
                              {actionLoading[member.id] === 'unfreeze' ? (
                                <IconLoader size={16} className="animate-spin" />
                              ) : (
                                <IconFlame size={16} />
                              )}
                            </button>
                          ) : (
                            <button
                              onClick={() => handleAction(freezeMember, member.id, 'freeze')}
                              disabled={actionLoading[member.id] === 'freeze'}
                              className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
                              title="Freeze Member"
                            >
                              {actionLoading[member.id] === 'freeze' ? (
                                <IconLoader size={16} className="animate-spin" />
                              ) : (
                                <IconSnowflake size={16} />
                              )}
                            </button>
                          )}
                        </>
                      )}
                      <button
                        onClick={() => handleAction(removeMember, member.id, 'remove')}
                        disabled={actionLoading[member.id] === 'remove'}
                        className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                        title="Remove Member"
                      >
                        {actionLoading[member.id] === 'remove' ? (
                          <IconLoader size={16} className="animate-spin" />
                        ) : (
                          <IconUserMinus size={16} />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {members.length === 0 && (
          <div className="text-center py-12">
            <IconUsers size={48} className="mx-auto text-[hsl(var(--muted-text))] mb-4" />
            <p className="text-[hsl(var(--muted-text))]">No members found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MemberManagement;
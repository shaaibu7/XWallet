import React, { useState, useCallback, useEffect } from "react";
import { IconUserDollar, IconLoader2, IconLoader } from "@tabler/icons-react";
import useContract from "../../hooks/useContract";
import useReimburseMember from "../../hooks/useReimburseMember";

const ReimburseMember = () => {
  const [selectedMember, setSelectedMember] = useState("");
  const [amount, setAmount] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const readOnlyOnboardContract = useContract(true);
  const reimburseMember = useReimburseMember();
  const [members, setMembers] = useState([]);

  const fetchMembers = useCallback(async () => {
    if (!readOnlyOnboardContract) return;

    try {
      const data = await readOnlyOnboardContract.getMembers();
      const result = await data.toArray();

      console.log(result);

      const parsedMembers = result.map((member) => ({
        id: member[6],
        name: member[3],
      }));

      setMembers(parsedMembers);
    } catch (error) {
      console.log("Error fetching members: ", error);
    }
  }, [readOnlyOnboardContract]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const handleReimburse = async () => {
    if (!selectedMember || !amount) return;

    setIsProcessing(true);
    try {
      await reimburseMember(selectedMember, amount);
      // Clear the form fields after successful transaction
      setSelectedMember("");
      setAmount("");
    } catch (error) {
      console.error("Error during reimbursement: ", error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10 bg-[hsl(var(--card))] p-8 rounded-xl border border-[hsl(var(--border))] shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-[hsl(var(--foreground))] flex items-center gap-2">
        <IconUserDollar size={24} />
        Reimburse Member
      </h2>

      <div className="space-y-4">
        {/* Member Dropdown */}
        <div>
          <label className="block text-sm text-[hsl(var(--muted-text))] mb-1">
            Select Member
          </label>
          <select
            value={selectedMember}
            onChange={(e) => setSelectedMember(e.target.value)}
            className="w-full px-4 py-2 rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--input))] text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-text))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary)/0.4)] appearance-none"
          >
            <option
              value=""
              disabled
              className="bg-[hsl(var(--input))] text-[hsl(var(--muted-text))]"
            >
              -- Select Member --
            </option>
            {members.map((member) => (
              <option
                key={member.id}
                value={member.id}
                className="bg-[hsl(var(--input))] text-[hsl(var(--foreground))]"
              >
                {member.name} ({member.id})
              </option>
            ))}
          </select>
        </div>

        {/* Amount Input */}
        <div>
          <label className="block text-sm text-[hsl(var(--muted-text))] mb-1">
            Fund Amount
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter reimbursement amount"
            className="w-full px-4 py-2 rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--input))] text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-text))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary)/0.4)]"
          />
        </div>

        {/* Reimburse Button */}
        <div className="pt-4">
          <button
            className="border border-[hsl(var(--primary))] text-[hsl(var(--primary))] px-4 py-2 rounded-md hover:bg-[hsl(var(--primary)/0.05)] transition disabled:opacity-50 flex items-center gap-2"
            onClick={handleReimburse}
            disabled={!selectedMember || !amount || isProcessing}
          >
            {isProcessing && <IconLoader size={18} className="animate-spin" />}
            {isProcessing ? "Processing..." : "Reimburse"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReimburseMember;
import React, { useState } from "react";
import { IconUserPlus, IconLoader } from "@tabler/icons-react";
import { useNavigate } from "react-router-dom"; // Added import for navigation
import useOnboardMember from "../../hooks/useOnboardMember";

const OnboardMembers = () => {
  const handleOnboardMember = useOnboardMember();
  const navigate = useNavigate(); // Initialize navigation
  const [member, setMember] = useState({
    walletAddress: "",
    memberName: "",
    fundAmount: 0,
    memberId: "",
  });
  const [isProcessing, setIsProcessing] = useState(false);

  const handleInputChange = (name, e) => {
    setMember((preState) => ({ ...preState, [name]: e.target.value }));
  };

  const { walletAddress, memberName, fundAmount, memberId } = member;

   return (
    <div className="max-w-xl mx-auto mt-10 bg-[hsl(var(--card))] p-8 rounded-xl border border-[hsl(var(--border))] shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-[hsl(var(--foreground))] flex items-center gap-2">
        <IconUserPlus size={24} />
        Onboard Member
      </h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm text-[hsl(var(--muted-text))] mb-1">
            Member Wallet Address
          </label>
          <input
            type="text"
            value={walletAddress}
            onChange={(e) => handleInputChange("walletAddress", e)}
            placeholder="0x..."
            className="w-full px-4 py-2 rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--input))] text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-text))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary)/0.4)]"
          />
        </div>

        <div>
          <label className="block text-sm text-[hsl(var(--muted-text))] mb-1">
            Member Name
          </label>
          <input
            type="text"
            value={memberName}
            onChange={(e) => handleInputChange("memberName", e)}
            placeholder="John Doe"
            className="w-full px-4 py-2 rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--input))] text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-text))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary)/0.4)]"
          />
        </div>

        <div>
          <label className="block text-sm text-[hsl(var(--muted-text))] mb-1">
            Spend Limit
          </label>
          <input
            type="number"
            value={fundAmount}
            onChange={(e) => handleInputChange("fundAmount", e)}
            placeholder="100"
            className="w-full px-4 py-2 rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--input))] text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-text))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary)/0.4)]"
          />
        </div>

        <div>
          <label className="block text-sm text-[hsl(var(--muted-text))] mb-1">
            Unique Member Identifier
          </label>
          <input
            type="text"
            value={memberId}
            onChange={(e) => handleInputChange("memberId", e)}
            placeholder="E.g. employee123"
            className="w-full px-4 py-2 rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--input))] text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-text))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary)/0.4)]"
          />
        </div>

        <div className="flex gap-4 pt-4">
          <button
            onClick={async (e) => {
              e.preventDefault();
              setIsProcessing(true);
              try {
                await handleOnboardMember(
                  walletAddress,
                  memberName,
                  fundAmount,
                  memberId
                );
                setMember({
                  walletAddress: "",
                  memberName: "",
                  fundAmount: 0,
                  memberId: "",
                }); // Clear input fields after onboarding
                navigate("/dashboard"); 
              } catch (error) {
                console.error("Error during onboarding: ", error);
              } finally {
                setIsProcessing(false);
              }
            }}
            className="border border-[hsl(var(--primary))] text-[hsl(var(--primary))] px-4 py-2 rounded-md hover:bg-[hsl(var(--primary)/0.05)] transition disabled:opacity-50 flex items-center gap-2"
            disabled={isProcessing}
          >
            {isProcessing && <IconLoader size={18} className="animate-spin" />}
            {isProcessing ? "Processing..." : "Onboard Member"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OnboardMembers;
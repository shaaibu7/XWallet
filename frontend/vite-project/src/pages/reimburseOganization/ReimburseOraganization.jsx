import React, { useState } from "react";
import { IconBuildingBank, IconLoader } from "@tabler/icons-react";
import useReimburseWallet from "../../hooks/useReimburseWallet";

const ReimburseOrganization = () => {
  const handleReimburseWallet = useReimburseWallet();
  const [reimburse, setReimburse] = useState({
    reimburseAmount: 0,
  });
  const [isProcessing, setIsProcessing] = useState(false);

  const handleInputChange = (name, e) => {
    // console.log(e.target.name);
    setReimburse((preState) => ({ ...preState, [name]: e.target.value }));
  };

  const { reimburseAmount } = reimburse;

 return (
    <div className="max-w-xl mx-auto mt-10 bg-[hsl(var(--card))] p-8 rounded-xl border border-[hsl(var(--border))] shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-[hsl(var(--foreground))] flex items-center gap-2">
        <IconBuildingBank size={24} />
        Reimburse Organization
      </h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm text-[hsl(var(--muted-text))] mb-1">
            Fund Amount
          </label>
          <input
            type="number"
            value={reimburseAmount}
            onChange={(e) => handleInputChange("reimburseAmount", e)}
            placeholder="Enter amount to reimburse"
            className="w-full px-4 py-2 rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--input))] text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-text))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary)/0.4)]"
          />
        </div>

        <div className="flex gap-4 pt-4">
          <button
            onClick={async (e) => {
              e.preventDefault();
              setIsProcessing(true);
              try {
                await handleReimburseWallet(reimburseAmount);
                setReimburse({ reimburseAmount: 0 }); // Clear input field
              } catch (error) {
                console.error("Error during reimbursement: ", error);
              } finally {
                setIsProcessing(false);
              }
            }}
            className="border border-[hsl(var(--primary))] text-[hsl(var(--primary))] px-4 py-2 rounded-md hover:bg-[hsl(var(--primary)/0.05)] transition disabled:opacity-50 flex items-center gap-2"
            disabled={isProcessing}
          >
            {isProcessing && <IconLoader size={18} className="animate-spin" />}
            {isProcessing ? "Processing..." : "Reimburse"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReimburseOrganization;
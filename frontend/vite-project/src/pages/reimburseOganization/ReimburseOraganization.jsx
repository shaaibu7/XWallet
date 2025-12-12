import React, { useState } from "react";
import { IconBuildingBank, IconLoader } from "@tabler/icons-react";
import useReimburseWallet from "../../hooks/useReimburseWallet";
import useFormValidation from "../../hooks/useFormValidation";
import FormInput from "../../components/FormInput";
import { validateAmount } from "../../utils/validation";

const ReimburseOrganization = () => {
  const handleReimburseWallet = useReimburseWallet();
  const [isProcessing, setIsProcessing] = useState(false);

  const validators = {
    reimburseAmount: (value) =>
      validateAmount(value, { min: 0.01, fieldName: "Reimbursement amount" }),
  };

  const {
    errors,
    touched,
    handleFieldChange,
    handleFieldBlur,
    validateAll,
    clearAllErrors,
    getFieldError,
    isFormValid,
  } = useFormValidation(
    { reimburseAmount: "" },
    validators
  );

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = {
      reimburseAmount: e.target.reimburseAmount.value,
    };

    if (!validateAll(formData)) {
      return;
    }

    setIsProcessing(true);
    try {
      await handleReimburseWallet(formData.reimburseAmount);
      clearAllErrors();
      e.target.reset();
    } catch (error) {
      console.error("Error during reimbursement: ", error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10 bg-[hsl(var(--card))] p-8 rounded-xl border border-[hsl(var(--border))] shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-[hsl(var(--foreground))] flex items-center gap-2">
        <IconBuildingBank size={24} />
        Reimburse Organization
      </h2>

      <form onSubmit={handleSubmit} className="space-y-5">
        <FormInput
          label="Reimbursement Amount"
          name="reimburseAmount"
          type="number"
          placeholder="Enter amount to reimburse"
          onChange={(e) => handleFieldChange("reimburseAmount", e.target.value)}
          onBlur={() => handleFieldBlur("reimburseAmount")}
          error={getFieldError("reimburseAmount")}
          touched={touched.reimburseAmount}
          required
          step="0.01"
          min="0"
          helperText="Minimum is 0.01 USDT"
        />

        <button
          type="submit"
          disabled={isProcessing || !isFormValid()}
          className="w-full border border-[hsl(var(--primary))] text-[hsl(var(--primary))] px-4 py-2 rounded-md hover:bg-[hsl(var(--primary)/0.05)] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium"
        >
          {isProcessing && <IconLoader size={18} className="animate-spin" />}
          {isProcessing ? "Processing..." : "Reimburse"}
        </button>
      </form>
    </div>
  );
};

export default ReimburseOrganization;
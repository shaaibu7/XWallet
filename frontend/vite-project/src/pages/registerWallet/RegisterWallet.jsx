import React, { useState } from "react";
import { IconWallet, IconLoader } from "@tabler/icons-react";
import useRegisterWallet from "../../hooks/useRegisterWallet";
import useFormValidation from "../../hooks/useFormValidation";
import FormInput from "../../components/FormInput";
import ConfirmationDialog from "../../components/ConfirmationDialog";
import { validateWalletName, validateAmount } from "../../utils/validation";

const RegisterWallet = () => {
  const handleRegisterWallet = useRegisterWallet();
  const [isProcessing, setIsProcessing] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [formData, setFormData] = useState({ walletName: "", fundAmount: "" });
  const [confirmError, setConfirmError] = useState("");

  const validators = {
    walletName: (value) => validateWalletName(value),
    fundAmount: (value) =>
      validateAmount(value, { min: 0.01, fieldName: "Fund amount" }),
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
    { walletName: "", fundAmount: "" },
    validators
  );

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newFormData = {
      walletName: e.target.walletName.value,
      fundAmount: e.target.fundAmount.value,
    };

    if (!validateAll(newFormData)) {
      return;
    }

    setFormData(newFormData);
    setConfirmError("");
    setShowConfirmation(true);
  };

  const handleConfirm = async () => {
    setIsProcessing(true);
    setConfirmError("");
    try {
      await handleRegisterWallet(formData.walletName, formData.fundAmount);
      clearAllErrors();
      setShowConfirmation(false);
      setFormData({ walletName: "", fundAmount: "" });
      // Reset form
      const form = document.querySelector("form");
      if (form) form.reset();
    } catch (error) {
      console.error("Error during wallet registration: ", error);
      setConfirmError(
        error.message || "Failed to register wallet. Please try again."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <div className="max-w-xl mx-auto mt-10 bg-[hsl(var(--card))] p-8 rounded-xl border border-[hsl(var(--border))] shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-[hsl(var(--foreground))] flex items-center gap-2">
          <IconWallet size={24} />
          Register Wallet
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <FormInput
            label="Wallet Name"
            name="walletName"
            type="text"
            placeholder="Enter wallet name (e.g., Family Fund)"
            onChange={(e) => handleFieldChange("walletName", e.target.value)}
            onBlur={() => handleFieldBlur("walletName")}
            error={getFieldError("walletName")}
            touched={touched.walletName}
            required
            maxLength={50}
            helperText="Give your wallet a descriptive name"
          />

          <FormInput
            label="Fund Amount"
            name="fundAmount"
            type="number"
            placeholder="Enter amount to fund"
            onChange={(e) => handleFieldChange("fundAmount", e.target.value)}
            onBlur={() => handleFieldBlur("fundAmount")}
            error={getFieldError("fundAmount")}
            touched={touched.fundAmount}
            required
            step="0.01"
            min="0"
            helperText="Minimum amount is 0.01 USDT"
          />

          <button
            type="submit"
            disabled={!isFormValid()}
            className="w-full border border-[hsl(var(--primary))] text-[hsl(var(--primary))] px-4 py-2 rounded-md hover:bg-[hsl(var(--primary)/0.05)] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium"
          >
            {isProcessing && <IconLoader size={18} className="animate-spin" />}
            {isProcessing ? "Processing..." : "Register Wallet"}
          </button>
        </form>
      </div>

      <ConfirmationDialog
        isOpen={showConfirmation}
        title="Confirm Wallet Registration"
        message="Please review the details before confirming this action."
        details={[
          { label: "Wallet Name", value: formData.walletName },
          {
            label: "Fund Amount",
            value: `${formData.fundAmount} USDT`,
            highlight: true,
          },
        ]}
        amount={formData.fundAmount}
        isLoading={isProcessing}
        error={confirmError}
        onConfirm={handleConfirm}
        onCancel={() => setShowConfirmation(false)}
        confirmText="Register"
      />
    </>
  );
};

export default RegisterWallet;
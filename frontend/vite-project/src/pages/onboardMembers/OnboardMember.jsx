import React, { useState } from "react";
import { IconUserPlus, IconLoader } from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";
import useOnboardMember from "../../hooks/useOnboardMember";
import useFormValidation from "../../hooks/useFormValidation";
import FormInput from "../../components/FormInput";
import ConfirmationDialog from "../../components/ConfirmationDialog";
import {
  validateWalletAddress,
  validateMemberName,
  validateAmount,
  validateMemberId,
} from "../../utils/validation";

const OnboardMembers = () => {
  const handleOnboardMember = useOnboardMember();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [formData, setFormData] = useState({
    walletAddress: "",
    memberName: "",
    fundAmount: "",
    memberId: "",
  });
  const [confirmError, setConfirmError] = useState("");

  const validators = {
    walletAddress: (value) => validateWalletAddress(value),
    memberName: (value) => validateMemberName(value),
    fundAmount: (value) =>
      validateAmount(value, { min: 0.01, fieldName: "Spend limit" }),
    memberId: (value) => validateMemberId(value),
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
    {
      walletAddress: "",
      memberName: "",
      fundAmount: "",
      memberId: "",
    },
    validators
  );

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newFormData = {
      walletAddress: e.target.walletAddress.value.trim(),
      memberName: e.target.memberName.value.trim(),
      fundAmount: e.target.fundAmount.value,
      memberId: e.target.memberId.value.trim(),
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
      await handleOnboardMember(
        formData.walletAddress,
        formData.memberName,
        formData.fundAmount,
        formData.memberId
      );
      clearAllErrors();
      setShowConfirmation(false);
      setFormData({
        walletAddress: "",
        memberName: "",
        fundAmount: "",
        memberId: "",
      });
      const form = document.querySelector("form");
      if (form) form.reset();
      navigate("/dashboard");
    } catch (error) {
      console.error("Error during onboarding: ", error);
      setConfirmError(error.message || "Failed to onboard member. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <div className="max-w-xl mx-auto mt-10 bg-[hsl(var(--card))] p-8 rounded-xl border border-[hsl(var(--border))] shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-[hsl(var(--foreground))] flex items-center gap-2">
          <IconUserPlus size={24} />
          Onboard Member
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <FormInput
            label="Member Wallet Address"
            name="walletAddress"
            type="text"
            placeholder="0x..."
            onChange={(e) => handleFieldChange("walletAddress", e.target.value)}
            onBlur={() => handleFieldBlur("walletAddress")}
            error={getFieldError("walletAddress")}
            touched={touched.walletAddress}
            required
            helperText="Must be a valid Ethereum address"
          />

          <FormInput
            label="Member Name"
            name="memberName"
            type="text"
            placeholder="John Doe"
            onChange={(e) => handleFieldChange("memberName", e.target.value)}
            onBlur={() => handleFieldBlur("memberName")}
            error={getFieldError("memberName")}
            touched={touched.memberName}
            required
            maxLength={50}
            helperText="2-50 characters"
          />

          <FormInput
            label="Spend Limit"
            name="fundAmount"
            type="number"
            placeholder="100"
            onChange={(e) => handleFieldChange("fundAmount", e.target.value)}
            onBlur={() => handleFieldBlur("fundAmount")}
            error={getFieldError("fundAmount")}
            touched={touched.fundAmount}
            required
            step="0.01"
            min="0"
            helperText="Minimum is 0.01 USDT"
          />

          <FormInput
            label="Unique Member Identifier"
            name="memberId"
            type="text"
            placeholder="e.g., employee123"
            onChange={(e) => handleFieldChange("memberId", e.target.value)}
            onBlur={() => handleFieldBlur("memberId")}
            error={getFieldError("memberId")}
            touched={touched.memberId}
            required
            maxLength={30}
            helperText="Alphanumeric, hyphens, and underscores only"
          />

          <button
            type="submit"
            disabled={!isFormValid()}
            className="w-full border border-[hsl(var(--primary))] text-[hsl(var(--primary))] px-4 py-2 rounded-md hover:bg-[hsl(var(--primary)/0.05)] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium"
          >
            {isProcessing && <IconLoader size={18} className="animate-spin" />}
            {isProcessing ? "Processing..." : "Onboard Member"}
          </button>
        </form>
      </div>

      <ConfirmationDialog
        isOpen={showConfirmation}
        title="Confirm Member Onboarding"
        message="Please review the member details before confirming."
        details={[
          { label: "Member Name", value: formData.memberName },
          {
            label: "Wallet Address",
            value: formData.walletAddress,
            isAddress: true,
          },
          {
            label: "Spend Limit",
            value: `${formData.fundAmount} USDT`,
            highlight: true,
          },
          { label: "Member ID", value: formData.memberId },
        ]}
        amount={formData.fundAmount}
        isLoading={isProcessing}
        error={confirmError}
        onConfirm={handleConfirm}
        onCancel={() => setShowConfirmation(false)}
        confirmText="Onboard"
      />
    </>
  );
};

export default OnboardMembers;
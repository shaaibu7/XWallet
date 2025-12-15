import React, { useState, useCallback, useEffect } from "react";
import { IconUserDollar, IconLoader } from "@tabler/icons-react";
import useContract from "../../hooks/useContract";
import useReimburseMember from "../../hooks/useReimburseMember";
import useFormValidation from "../../hooks/useFormValidation";
import FormSelect from "../../components/FormSelect";
import FormInput from "../../components/FormInput";
import ConfirmationDialog from "../../components/ConfirmationDialog";
import { validateAmount, validateRequiredField } from "../../utils/validation";

const ReimburseMember = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [members, setMembers] = useState([]);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [formData, setFormData] = useState({ selectedMember: "", amount: "" });
  const [confirmError, setConfirmError] = useState("");

  const readOnlyOnboardContract = useContract(true);
  const reimburseMember = useReimburseMember();

  const validators = {
    selectedMember: (value) => validateRequiredField(value, "Member"),
    amount: (value) =>
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
    { selectedMember: "", amount: "" },
    validators
  );

  const fetchMembers = useCallback(async () => {
    if (!readOnlyOnboardContract) return;

    try {
      const data = await readOnlyOnboardContract.getMembers();
      const result = await data.toArray();

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newFormData = {
      selectedMember: e.target.selectedMember.value,
      amount: e.target.amount.value,
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
      await reimburseMember(formData.selectedMember, formData.amount);
      clearAllErrors();
      setShowConfirmation(false);
      setFormData({ selectedMember: "", amount: "" });
      const form = document.querySelector("form");
      if (form) form.reset();
    } catch (error) {
      console.error("Error during reimbursement: ", error);
      setConfirmError(error.message || "Reimbursement failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const selectedMemberName = members.find(
    (m) => m.id === formData.selectedMember
  )?.name || "";

  const memberOptions = members.map((member) => ({
    value: member.id,
    label: `${member.name} (ID: ${member.id})`,
  }));

  return (
    <>
      <div className="max-w-xl mx-auto mt-10 bg-[hsl(var(--card))] p-8 rounded-xl border border-[hsl(var(--border))] shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-[hsl(var(--foreground))] flex items-center gap-2">
          <IconUserDollar size={24} />
          Reimburse Member
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <FormSelect
            label="Select Member"
            name="selectedMember"
            options={memberOptions}
            onChange={(e) => handleFieldChange("selectedMember", e.target.value)}
            onBlur={() => handleFieldBlur("selectedMember")}
            error={getFieldError("selectedMember")}
            touched={touched.selectedMember}
            required
            placeholder="-- Select a member --"
            helperText={members.length === 0 ? "No members available" : ""}
          />

          <FormInput
            label="Reimbursement Amount"
            name="amount"
            type="number"
            placeholder="Enter reimbursement amount"
            onChange={(e) => handleFieldChange("amount", e.target.value)}
            onBlur={() => handleFieldBlur("amount")}
            error={getFieldError("amount")}
            touched={touched.amount}
            required
            step="0.01"
            min="0"
            helperText="Minimum is 0.01 USDT"
          />

          <button
            type="submit"
            disabled={!isFormValid() || members.length === 0}
            className="w-full border border-[hsl(var(--primary))] text-[hsl(var(--primary))] px-4 py-2 rounded-md hover:bg-[hsl(var(--primary)/0.05)] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium"
          >
            {isProcessing && <IconLoader size={18} className="animate-spin" />}
            {isProcessing ? "Processing..." : "Reimburse"}
          </button>
        </form>
      </div>

      <ConfirmationDialog
        isOpen={showConfirmation}
        title="Confirm Member Reimbursement"
        message="Please review the reimbursement details before confirming."
        details={[
          { label: "Member Name", value: selectedMemberName },
          { label: "Member ID", value: formData.selectedMember },
          {
            label: "Reimbursement Amount",
            value: `${formData.amount} USDT`,
            highlight: true,
          },
        ]}
        amount={formData.amount}
        isLoading={isProcessing}
        error={confirmError}
        onConfirm={handleConfirm}
        onCancel={() => setShowConfirmation(false)}
        confirmText="Reimburse"
      />
    </>
  );
};

export default ReimburseMember;
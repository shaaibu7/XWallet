import React from "react";
import { IconAlertTriangle, IconCheck, IconX, IconLoader } from "@tabler/icons-react";
import CopyableAddress from "./CopyableAddress";

/**
 * Reusable confirmation dialog component for critical actions
 */
const ConfirmationDialog = ({
  isOpen,
  title,
  message,
  details = [],
  amount,
  isLoading = false,
  error,
  onConfirm,
  onCancel,
  confirmText = "Confirm",
  cancelText = "Cancel",
  isDangerous = false,
}) => {
  if (!isOpen) return null;

  // Determine if amount is high (>1000 USDT)
  const isHighValue = amount && Number(amount) > 1000;
  const showWarning = isDangerous || isHighValue;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onCancel();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      onCancel();
    }
  };

  React.useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [isOpen]);

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
      role="presentation"
    >
      <div
        className="bg-[hsl(var(--card))] rounded-xl border border-[hsl(var(--border))] shadow-lg max-w-md w-full animate-in fade-in zoom-in-95 duration-200"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        aria-describedby="dialog-description"
      >
        {/* Header */}
        <div
          className={`p-6 border-b border-[hsl(var(--border))] flex items-start gap-4 ${
            showWarning ? "bg-yellow-500/10" : ""
          }`}
        >
          {showWarning && (
            <div className="flex-shrink-0 mt-0.5">
              <IconAlertTriangle
                size={24}
                className="text-yellow-600 dark:text-yellow-500"
              />
            </div>
          )}
          <div className="flex-1">
            <h2
              id="dialog-title"
              className="text-lg font-semibold text-[hsl(var(--foreground))]"
            >
              {title}
            </h2>
            <p
              id="dialog-description"
              className="text-sm text-[hsl(var(--muted-text))] mt-1"
            >
              {message}
            </p>
          </div>
        </div>

        {/* Details */}
        {details.length > 0 && (
          <div className="p-6 border-b border-[hsl(var(--border))] space-y-3">
            {details.map((detail, idx) => (
              <div key={idx} className="flex justify-between items-start gap-4">
                <span className="text-sm text-[hsl(var(--muted-text))]">
                  {detail.label}
                </span>
                <div
                  className={`text-sm font-medium text-right ${
                    detail.highlight
                      ? "text-green-600 dark:text-green-500"
                      : "text-[hsl(var(--foreground))]"
                  }`}
                >
                  {detail.isAddress ? (
                    <CopyableAddress address={detail.value} chars={6} copyToast={false} />
                  ) : (
                    <span className="break-words">{detail.value}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="p-6 border-b border-[hsl(var(--border))] bg-red-500/10">
            <p className="text-sm text-red-600 dark:text-red-500 flex items-start gap-2">
              <IconX size={16} className="flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="p-6 flex gap-3 justify-end">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 rounded-md border border-[hsl(var(--border))] text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted)/0.5)] transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-4 py-2 rounded-md font-medium flex items-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed ${
              showWarning
                ? "bg-yellow-600 hover:bg-yellow-700 text-white"
                : "bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary)/0.9)] text-white"
            }`}
          >
            {isLoading && <IconLoader size={16} className="animate-spin" />}
            {isLoading ? "Processing..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationDialog;

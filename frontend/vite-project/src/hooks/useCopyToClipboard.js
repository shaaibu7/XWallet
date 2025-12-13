import { useState, useCallback } from "react";
import { toast } from "react-toastify";
import { copyToClipboard } from "../utils/addressUtils";

/**
 * Custom hook for managing copy-to-clipboard functionality
 * @returns {object} - Copy state and methods
 */
const useCopyToClipboard = () => {
  const [copied, setCopied] = useState(false);
  const [copiedText, setCopiedText] = useState("");

  const copy = useCallback(async (text, showToast = true) => {
    if (!text) return false;

    try {
      const success = await copyToClipboard(text);

      if (success) {
        setCopied(true);
        setCopiedText(text);

        if (showToast) {
          toast.success("Copied to clipboard!", {
            position: "bottom-right",
            autoClose: 2000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });
        }

        // Auto-clear after 2 seconds
        setTimeout(() => {
          setCopied(false);
          setCopiedText("");
        }, 2000);

        return true;
      } else {
        if (showToast) {
          toast.error("Failed to copy to clipboard", {
            position: "bottom-right",
            autoClose: 2000,
          });
        }
        return false;
      }
    } catch (error) {
      console.error("Copy to clipboard error:", error);
      if (showToast) {
        toast.error("Failed to copy to clipboard", {
          position: "bottom-right",
          autoClose: 2000,
        });
      }
      return false;
    }
  }, []);

  const reset = useCallback(() => {
    setCopied(false);
    setCopiedText("");
  }, []);

  return {
    copied,
    copiedText,
    copy,
    reset,
  };
};

export default useCopyToClipboard;

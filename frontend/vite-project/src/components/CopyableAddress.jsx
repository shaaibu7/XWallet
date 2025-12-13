import React, { useState } from "react";
import { IconCopy, IconCheck } from "@tabler/icons-react";
import useCopyToClipboard from "../hooks/useCopyToClipboard";
import { formatAddress } from "../utils/addressUtils";

/**
 * Reusable component for displaying copyable addresses
 */
const CopyableAddress = ({
  address,
  chars = 6,
  showFull = false,
  className = "",
  copyToast = true,
  displayFormat = "short",
}) => {
  const [isHovering, setIsHovering] = useState(false);
  const { copied, copy } = useCopyToClipboard();

  if (!address) {
    return <span className={`text-[hsl(var(--muted-text))] ${className}`}>N/A</span>;
  }

  const displayAddress =
    isHovering || showFull ? address : formatAddress(address, chars);

  const handleClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    await copy(address, copyToast);
  };

  return (
    <div
      className={`flex items-center gap-2 cursor-pointer group transition-colors ${className}`}
      onClick={handleClick}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      title={`Click to copy: ${address}`}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          handleClick(e);
        }
      }}
    >
      <span className="font-mono text-sm text-[hsl(var(--foreground))] group-hover:text-[hsl(var(--primary))] transition-colors break-all">
        {displayAddress}
      </span>

      <div className="flex-shrink-0 text-[hsl(var(--muted-text))] group-hover:text-[hsl(var(--primary))] transition-colors">
        {copied ? (
          <IconCheck size={16} className="text-green-500" />
        ) : (
          <IconCopy size={16} />
        )}
      </div>
    </div>
  );
};

export default CopyableAddress;

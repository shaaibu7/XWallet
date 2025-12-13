import React, { useState } from "react";
import { IconCopy, IconCheck } from "@tabler/icons-react";
import useCopyToClipboard from "../hooks/useCopyToClipboard";

/**
 * Generic reusable component for displaying copyable text
 */
const CopyableText = ({
  text,
  displayText,
  className = "",
  copyToast = true,
  truncate = false,
  maxLength = 50,
  showIcon = true,
  iconSize = 16,
}) => {
  const [isHovering, setIsHovering] = useState(false);
  const { copied, copy } = useCopyToClipboard();

  if (!text) {
    return <span className={`text-[hsl(var(--muted-text))] ${className}`}>N/A</span>;
  }

  let display = displayText || text;

  if (truncate && display.length > maxLength) {
    display = `${display.slice(0, maxLength)}...`;
  }

  const handleClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    await copy(text, copyToast);
  };

  return (
    <div
      className={`flex items-center gap-2 cursor-pointer group transition-colors ${className}`}
      onClick={handleClick}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      title={`Click to copy: ${text}`}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          handleClick(e);
        }
      }}
    >
      <span className="text-sm text-[hsl(var(--foreground))] group-hover:text-[hsl(var(--primary))] transition-colors break-all">
        {display}
      </span>

      {showIcon && (
        <div className="flex-shrink-0 text-[hsl(var(--muted-text))] group-hover:text-[hsl(var(--primary))] transition-colors">
          {copied ? (
            <IconCheck size={iconSize} className="text-green-500" />
          ) : (
            <IconCopy size={iconSize} />
          )}
        </div>
      )}
    </div>
  );
};

export default CopyableText;

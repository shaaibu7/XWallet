import React from "react";
import { IconAlertCircle, IconCheck } from "@tabler/icons-react";

/**
 * Reusable form select component with validation feedback
 */
const FormSelect = ({
  label,
  value,
  onChange,
  onBlur,
  options = [],
  error,
  touched,
  disabled = false,
  placeholder = "-- Select --",
  required = false,
  icon: Icon,
  helperText,
}) => {
  const hasError = touched && error;
  const isValid = touched && !error && value;

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-[hsl(var(--foreground))]">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-3 text-[hsl(var(--muted-text))] pointer-events-none">
            <Icon size={18} />
          </div>
        )}

        <select
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          disabled={disabled}
          className={`w-full ${Icon ? "pl-10" : "px-4"} py-2 rounded-md border transition-colors appearance-none
            bg-[hsl(var(--input))] text-[hsl(var(--foreground))]
            focus:outline-none focus:ring-2
            ${
              hasError
                ? "border-red-500 focus:ring-red-500/30"
                : isValid
                ? "border-green-500 focus:ring-green-500/30"
                : "border-[hsl(var(--border))] focus:ring-[hsl(var(--primary)/0.4)]"
            }
            ${disabled ? "opacity-50 cursor-not-allowed" : ""}
          `}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {/* Dropdown arrow */}
        <div className="absolute right-3 top-3 pointer-events-none text-[hsl(var(--muted-text))]">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </div>

        {isValid && (
          <div className="absolute right-10 top-3 text-green-500 pointer-events-none">
            <IconCheck size={18} />
          </div>
        )}

        {hasError && (
          <div className="absolute right-10 top-3 text-red-500 pointer-events-none">
            <IconAlertCircle size={18} />
          </div>
        )}
      </div>

      {hasError && (
        <p className="text-sm text-red-500 flex items-center gap-1">
          <IconAlertCircle size={14} />
          {error}
        </p>
      )}

      {helperText && !hasError && (
        <p className="text-sm text-[hsl(var(--muted-text))]">{helperText}</p>
      )}
    </div>
  );
};

export default FormSelect;

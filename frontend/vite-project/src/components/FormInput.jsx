import React from "react";
import { IconAlertCircle, IconCheck } from "@tabler/icons-react";

/**
 * Reusable form input component with validation feedback
 */
const FormInput = ({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  onBlur,
  error,
  touched,
  disabled = false,
  icon: Icon,
  helperText,
  required = false,
  maxLength,
  min,
  max,
  step,
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
          <div className="absolute left-3 top-3 text-[hsl(var(--muted-text))]">
            <Icon size={18} />
          </div>
        )}

        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          disabled={disabled}
          maxLength={maxLength}
          min={min}
          max={max}
          step={step}
          className={`w-full ${Icon ? "pl-10" : "px-4"} py-2 rounded-md border transition-colors
            bg-[hsl(var(--input))] text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-text))]
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
        />

        {isValid && (
          <div className="absolute right-3 top-3 text-green-500">
            <IconCheck size={18} />
          </div>
        )}

        {hasError && (
          <div className="absolute right-3 top-3 text-red-500">
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

      {maxLength && (
        <p className="text-xs text-[hsl(var(--muted-text))]">
          {value?.length || 0} / {maxLength}
        </p>
      )}
    </div>
  );
};

export default FormInput;

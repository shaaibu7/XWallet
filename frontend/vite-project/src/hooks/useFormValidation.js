import { useState, useCallback } from "react";

/**
 * Custom hook for managing form validation
 * @param {object} initialValues - Initial form values
 * @param {object} validators - Object with field names as keys and validator functions as values
 * @returns {object} - Form state and validation methods
 */
const useFormValidation = (initialValues = {}, validators = {}) => {
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  /**
   * Validate a single field
   */
  const validateField = useCallback(
    (fieldName, value) => {
      const validator = validators[fieldName];
      if (!validator) return null;

      const error = validator(value);
      return error;
    },
    [validators]
  );

  /**
   * Handle field change with validation
   */
  const handleFieldChange = useCallback(
    (fieldName, value) => {
      const error = validateField(fieldName, value);
      setErrors((prev) => ({
        ...prev,
        [fieldName]: error,
      }));
      setTouched((prev) => ({
        ...prev,
        [fieldName]: true,
      }));
      return error;
    },
    [validateField]
  );

  /**
   * Handle field blur
   */
  const handleFieldBlur = useCallback((fieldName) => {
    setTouched((prev) => ({
      ...prev,
      [fieldName]: true,
    }));
  }, []);

  /**
   * Validate all fields
   */
  const validateAll = useCallback(
    (formData) => {
      const newErrors = {};
      let isValid = true;

      Object.keys(validators).forEach((fieldName) => {
        const error = validateField(fieldName, formData[fieldName]);
        if (error) {
          newErrors[fieldName] = error;
          isValid = false;
        }
      });

      setErrors(newErrors);
      setTouched(
        Object.keys(validators).reduce((acc, key) => {
          acc[key] = true;
          return acc;
        }, {})
      );

      return isValid;
    },
    [validateField, validators]
  );

  /**
   * Clear error for a specific field
   */
  const clearError = useCallback((fieldName) => {
    setErrors((prev) => ({
      ...prev,
      [fieldName]: null,
    }));
  }, []);

  /**
   * Clear all errors
   */
  const clearAllErrors = useCallback(() => {
    setErrors({});
    setTouched({});
  }, []);

  /**
   * Get error for a field (only if touched)
   */
  const getFieldError = useCallback(
    (fieldName) => {
      return touched[fieldName] ? errors[fieldName] : null;
    },
    [errors, touched]
  );

  /**
   * Check if form is valid
   */
  const isFormValid = useCallback(() => {
    return Object.values(errors).every((error) => !error);
  }, [errors]);

  /**
   * Check if field has error
   */
  const hasFieldError = useCallback(
    (fieldName) => {
      return touched[fieldName] && !!errors[fieldName];
    },
    [errors, touched]
  );

  return {
    errors,
    touched,
    validateField,
    handleFieldChange,
    handleFieldBlur,
    validateAll,
    clearError,
    clearAllErrors,
    getFieldError,
    isFormValid,
    hasFieldError,
  };
};

export default useFormValidation;

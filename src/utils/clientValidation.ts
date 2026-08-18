/**
 * Client-side input validation and sanitization utilities
 */

export const sanitizeSearchInput = (input: string): string => {
  if (!input || typeof input !== "string") return "";
  let sanitized = input.slice(0, 200);
  sanitized = sanitized.replace(
    /(javascript:|data:|vbscript:|onload=|onerror=|<script|<\/script)/gi,
    ""
  );
  sanitized = sanitized.replace(/<[^>]*>/g, "");
  sanitized = sanitized.replace(/\s+/g, " ").trim();
  return sanitized;
};

export const validateNumericInput = (
  value: string,
  min: number = 0,
  max: number = Number.MAX_SAFE_INTEGER
): number => {
  const parsed = parseInt(value, 10);
  if (isNaN(parsed) || parsed < min || parsed > max) return min;
  return parsed;
};

export const validateDateInput = (dateString: string): boolean => {
  if (!dateString) return true;
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(dateString)) return false;
  const date = new Date(dateString);
  return !isNaN(date.getTime());
};

export const sanitizeFormData = (formData: FormData): FormData => {
  const sanitized = new FormData();
  for (const [key, value] of formData.entries()) {
    if (typeof value === "string") {
      switch (key) {
        case "searchQuery":
          sanitized.set(key, sanitizeSearchInput(value));
          break;
        case "minStars":
        case "maxStars":
        case "minForks": {
          const numValue = validateNumericInput(value, 0, 10000000);
          sanitized.set(key, numValue.toString());
          break;
        }
        case "dateFrom":
        case "dateTo":
          if (validateDateInput(value)) sanitized.set(key, value);
          break;
        case "language":
        case "category":
        case "framework": {
          const cleaned = value.replace(/[<>'"`;(){}[\]]/g, "").slice(0, 100);
          sanitized.set(key, cleaned);
          break;
        }
        default:
          sanitized.set(key, value);
      }
    } else {
      sanitized.set(key, value);
    }
  }
  return sanitized;
};

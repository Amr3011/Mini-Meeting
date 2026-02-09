import { z } from "zod";

// Admin create user schema (for admin panel only)
export const createUserSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

// Update user schema
export const updateUserSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
});

export const isValidMeetingCode = (code: string): boolean => {
  // Must contain at least one hyphen (meeting codes have hyphens)
  if (!code.includes('-')) {
    return false;
  }

  // Must only contain lowercase letters and hyphens
  if (!/^[a-z-]+$/.test(code)) {
    return false;
  }

  // Should be roughly the right length (8-15 chars to allow for typos)
  // Valid: xxx-xxxx-xxx = 12 chars
  // Allow: xx-xxxx-xxx = 11 chars, xxx-xxxx-xx = 11 chars, etc.
  if (code.length < 8 || code.length > 15) {
    return false;
  }

  // Should have 1-3 hyphens (valid has 2, but allow some variation)
  const hyphenCount = (code.match(/-/g) || []).length;
  if (hyphenCount < 1 || hyphenCount > 3) {
    return false;
  }

  // Should not start or end with a hyphen
  if (code.startsWith('-') || code.endsWith('-')) {
    return false;
  }

  // Should not have consecutive hyphens
  if (code.includes('--')) {
    return false;
  }

  // If it passes all these checks, it looks like a meeting code attempt
  // Let it through so the Meeting component can validate and show proper error
  return true;
};

// Types inferred from schemas
export type CreateUserFormData = z.infer<typeof createUserSchema>;
export type UpdateUserFormData = z.infer<typeof updateUserSchema>;

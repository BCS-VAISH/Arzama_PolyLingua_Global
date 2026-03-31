// Simple XSS prevention - remove HTML tags and dangerous characters
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') return '';
  
  // Remove HTML tags
  let sanitized = input.replace(/<[^>]*>/g, '');
  
  // Remove potentially dangerous characters
  sanitized = sanitized
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, '/');
  
  return sanitized.trim();
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePassword(password: string): { valid: boolean; error?: string } {
  if (password.length < 6) {
    return { valid: false, error: 'Password must be at least 6 characters' };
  }
  if (password.length > 100) {
    return { valid: false, error: 'Password must be less than 100 characters' };
  }
  return { valid: true };
}

export function validateRating(rating: number): boolean {
  return Number.isInteger(rating) && rating >= 1 && rating <= 5;
}

export function validateComment(comment: string): { valid: boolean; error?: string } {
  const trimmed = comment.trim();
  if (trimmed.length === 0) {
    return { valid: false, error: 'Comment cannot be empty' };
  }
  if (trimmed.length > 1000) {
    return { valid: false, error: 'Comment cannot exceed 1000 characters' };
  }
  return { valid: true };
}


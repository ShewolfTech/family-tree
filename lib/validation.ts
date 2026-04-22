export function validateEmail(email: string): boolean {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

export function validatePassword(password: string): { valid: boolean; message?: string } {
  if (password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters' };
  }
  return { valid: true };
}

export function sanitizeString(str: string): string {
  return str.trim().replace(/[<>]/g, '');
}

export function validateMember(data: Record<string, unknown>): { valid: boolean; message?: string } {
  if (!data.firstName || typeof data.firstName !== 'string' || !data.firstName.trim()) {
    return { valid: false, message: 'First name is required' };
  }
  if (!data.lastName || typeof data.lastName !== 'string' || !data.lastName.trim()) {
    return { valid: false, message: 'Last name is required' };
  }
  const validGenders = ['male', 'female', 'other', 'unknown'];
  if (data.gender && !validGenders.includes(data.gender as string)) {
    return { valid: false, message: 'Invalid gender value' };
  }
  return { valid: true };
}

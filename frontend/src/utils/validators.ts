export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

export function isValidStudentId(id: string): boolean {

  return id.trim().length >= 4;
}

export function isNonEmpty(val: string): boolean {
  return val.trim().length > 0;
}

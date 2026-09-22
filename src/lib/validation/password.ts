/**
 * Pure, isomorphic password rules shared by three different forms (self-servis
 * kayıt, admin'in "Yeni Acente Ekle" formu, acentenin "Şifre Değiştir" formu)
 * so the minimum-length rule can't drift between them. Each form composes
 * these two checks with its own other fields rather than owning a copy of
 * the length rule.
 */

export const PASSWORD_MIN_LENGTH = 8;

export function validateNewPassword(password: string): string | undefined {
  if (!password) return "Şifre zorunludur.";
  if (password.length < PASSWORD_MIN_LENGTH) {
    return `Şifre en az ${PASSWORD_MIN_LENGTH} karakter olmalıdır.`;
  }
  return undefined;
}

export function validatePasswordsMatch(
  password: string,
  confirmPassword: string,
): string | undefined {
  if (password !== confirmPassword) return "Şifreler eşleşmiyor.";
  return undefined;
}

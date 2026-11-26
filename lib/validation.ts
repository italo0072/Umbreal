export function validEmail(email: string) {
  return email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/u.test(email)
}
export function validName(name: string) {
  return name.trim().length >= 2 && name.trim().length <= 60
}
export function validPassword(password: string) {
  return password.length >= 12 && password.length <= 128
}
export function validCode(code: string) {
  return /^\d{6,10}$/.test(code)
}
export function sameOrigin(actual: string | null, expected: string) {
  return actual === expected
}

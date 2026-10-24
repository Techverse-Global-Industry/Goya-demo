const RECOVERY_KEY = 'goya-demo-recovery-v1';
/** Recovery proof is issued only after this browser authenticates the account. */
export function rememberRecovery(email: string, code: string) {
  if (!/^[a-f0-9]{64}$/.test(code)) return;
  try {
    const current = JSON.parse(localStorage.getItem(RECOVERY_KEY) ?? '{}');
    const values = current && typeof current === 'object' && !Array.isArray(current) ? current : {};
    localStorage.setItem(RECOVERY_KEY, JSON.stringify({ ...values, [email.trim().toLowerCase()]: code }));
  } catch { /* The account still works when optional browser storage is unavailable. */ }
}
export function savedRecovery(email: string): string | undefined {
  try {
    const value = JSON.parse(localStorage.getItem(RECOVERY_KEY) ?? '{}')?.[email.trim().toLowerCase()];
    return typeof value === 'string' && /^[a-f0-9]{64}$/.test(value) ? value : undefined;
  } catch { return undefined; }
}

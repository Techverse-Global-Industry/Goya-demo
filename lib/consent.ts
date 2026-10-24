export interface ConsentChoices { experience: boolean; newsletter: boolean; }

const CONSENT_KEY = 'goya-consent-v1';
const LEGACY_KEY = 'goya-privacy-v1';

export function readConsent(): ConsentChoices | null {
  if (typeof window === 'undefined') return null;
  try {
    const saved = localStorage.getItem(CONSENT_KEY);
    if (saved) {
      const parsed: unknown = JSON.parse(saved);
      if (parsed && typeof parsed === 'object' && 'experience' in parsed && 'newsletter' in parsed && typeof parsed.experience === 'boolean' && typeof parsed.newsletter === 'boolean') return { experience: parsed.experience, newsletter: parsed.newsletter };
    }
    const legacy = localStorage.getItem(LEGACY_KEY);
    if (legacy === 'accepted') return { experience: true, newsletter: true };
    if (legacy === 'essential') return { experience: false, newsletter: false };
  } catch { /* Optional preferences are disabled when storage is unavailable. */ }
  return null;
}

export function saveConsent(choices: ConsentChoices): void {
  if (typeof window === 'undefined') return;
  const value = { experience: choices.experience === true, newsletter: choices.newsletter === true };
  try {
    localStorage.setItem(CONSENT_KEY, JSON.stringify(value));
    localStorage.setItem(LEGACY_KEY, value.experience && value.newsletter ? 'accepted' : 'essential');
    if (!value.experience) localStorage.removeItem('goya-recent-searches-v1');
  } catch { /* The dialog still respects this choice for the current visit. */ }
  window.dispatchEvent(new CustomEvent<ConsentChoices>('goya:consent', { detail: value }));
}

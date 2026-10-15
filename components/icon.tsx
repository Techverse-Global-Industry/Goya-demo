import type { SVGProps, ReactNode } from 'react';

export type IconName = 'arrow-right' | 'arrow-up-right' | 'arrow-down' | 'search' | 'user' | 'bag' | 'menu' | 'close' | 'plus' | 'minus' | 'check' | 'pin' | 'truck' | 'shield' | 'spark' | 'calendar' | 'card' | 'phone' | 'store' | 'package' | 'logout' | 'download' | 'chevron' | 'globe';

const paths: Record<IconName, ReactNode> = {
  'arrow-right': <><path d="M4 12h15M13 5l7 7-7 7" /></>,
  'arrow-up-right': <><path d="M5 19 19 5M5 5h14v14" /></>,
  'arrow-down': <><path d="M12 4v16M5 13l7 7 7-7" /></>,
  search: <><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 5 5" /></>,
  user: <><circle cx="12" cy="7" r="3.5" /><path d="M4.5 21v-2a7.5 7.5 0 0 1 15 0v2" /></>,
  bag: <><path d="M5 7h14l1 14H4L5 7Z" /><path d="M8 8V6a4 4 0 0 1 8 0v2" /></>,
  menu: <><path d="M4 8h16M4 16h16" /></>,
  close: <><path d="m6 6 12 12M18 6 6 18" /></>,
  plus: <><path d="M12 5v14M5 12h14" /></>,
  minus: <><path d="M5 12h14" /></>,
  check: <><path d="m5 12 4 4L20 5" /></>,
  pin: <><path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z" /><circle cx="12" cy="10" r="2" /></>,
  truck: <><path d="M2 5h12v12H2V5ZM14 9h4l4 4v4h-8" /><circle cx="6" cy="18" r="2" /><circle cx="18" cy="18" r="2" /></>,
  shield: <><path d="m12 2 8 4v6c0 5-8 10-8 10S4 17 4 12V6l8-4Z" /><path d="m8 12 3 3 5-6" /></>,
  spark: <><path d="m12 2 2.5 7.5L22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5L12 2Z" /></>,
  calendar: <><rect x="3" y="5" width="18" height="16" rx="1" /><path d="M7 2v6M17 2v6M3 11h18M7 15h2M13 15h2" /></>,
  card: <><rect x="2" y="5" width="20" height="14" rx="2" /><path d="M2 10h20M6 15h4" /></>,
  phone: <><rect x="7" y="2" width="10" height="20" rx="2" /><path d="M10 5h4M11 18h2" /></>,
  store: <><path d="M3 10h18l-2-7H5l-2 7ZM5 10v11h14V10M9 21v-7h6v7" /></>,
  package: <><path d="m12 2 10 5v10l-10 5L2 17V7l10-5ZM2 7l10 5 10-5M12 12v10M7 4.5l10 5V14" /></>,
  logout: <><path d="M10 4H4v16h6M9 12h12M16 7l5 5-5 5" /></>,
  download: <><path d="M12 2v13M7 10l5 5 5-5M4 17v4h16v-4" /></>,
  chevron: <><path d="m7 10 5 5 5-5" /></>,
  globe: <><circle cx="12" cy="12" r="10" /><ellipse cx="12" cy="12" rx="4" ry="10" /><path d="M2 12h20" /></>,
};

export function Icon({ name, ...props }: SVGProps<SVGSVGElement> & { name: IconName }) {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false" {...props}>{paths[name]}</svg>;
}

import type { SVGProps, ReactNode } from 'react';

export type IconName = 'arrow-right' | 'arrow-left' | 'arrow-up-right' | 'arrow-down' | 'search' | 'search-spark' | 'heart' | 'filter' | 'zoom' | 'share' | 'mail' | 'refresh' | 'chevron-left' | 'chevron-right' | 'user' | 'bag' | 'menu' | 'close' | 'plus' | 'minus' | 'check' | 'pin' | 'truck' | 'shield' | 'spark' | 'calendar' | 'card' | 'phone' | 'store' | 'package' | 'logout' | 'download' | 'chevron' | 'globe' | 'instagram' | 'facebook';

const paths: Record<IconName, ReactNode> = {
  'arrow-right': <><path d="M4 12h15M13 5l7 7-7 7" /></>,
  'arrow-left': <path d="M20 12H5m6-7-7 7 7 7" />,
  heart: <path d="M20.35 4.921c1.853 1.895 2.521 4.579 0 8.079-2.52 3.5-8.35 8-8.35 8s-5.902-4.5-8.346-8-1.93-6.184-.077-8.079a4.67 4.67 0 0 1 6.71 0l1.677 1.716 1.677-1.716a4.67 4.67 0 0 1 6.71 0z" />,
  filter: <><path d="M3 7h18M3 17h18M8 4v6M16 14v6" /></>,
  zoom: <><circle cx="10" cy="10" r="6.5" /><path d="m15 15 6 6M10 7v6M7 10h6" /></>,
  share: <><path d="M12 16V2m-5 5 5-5 5 5M5 11H3v11h18V11h-2" /></>,
  mail: <><rect x="2" y="4" width="20" height="16" /><path d="m2 5 10 8L22 5" /></>,
  refresh: <><path d="M20 7A9 9 0 1 0 21 15M20 2v6h-6" /></>,
  'chevron-left': <path d="m15 4-8 8 8 8" />,
  'chevron-right': <path d="m9 4 8 8-8 8" />,
  'search-spark': <><path d="M17.43 13.37a7.5 7.5 0 1 1-9.8-9.8M21 21l-5-5" /><path d="M14.535 2.18a.5.5 0 0 1 .93 0l.87 2.204a.5.5 0 0 0 .281.281l2.205.87a.5.5 0 0 1 0 .93l-2.205.87a.5.5 0 0 0-.282.281l-.869 2.205a.5.5 0 0 1-.93 0l-.87-2.205a.5.5 0 0 0-.281-.281l-2.205-.87a.5.5 0 0 1 0-.93l2.205-.87a.5.5 0 0 0 .281-.281l.87-2.205z" fill="currentColor" stroke="none" /></>,
  'arrow-up-right': <><path d="M5 19 19 5M5 5h14v14" /></>,
  'arrow-down': <><path d="M12 4v16M5 13l7 7 7-7" /></>,
  search: <><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 5 5" /></>,
  user: <path d="M8 7a4 4 0 1 0 8 0 4 4 0 0 0-8 0zm12 14v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />,
  bag: <><path d="M4 4a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v14a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V4z" /><path d="M9 6v2a3 3 0 1 0 6 0V6" /></>,
  menu: <path d="M3 8h18M3 16h18" />,
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
  instagram: <><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.4" cy="6.7" r=".8" fill="currentColor" stroke="none" /></>,
  facebook: <path d="M14 22v-9h3l.5-4H14V6.5c0-1 .3-1.5 1.8-1.5H18V1.5A26 26 0 0 0 15 1c-3 0-5 1.8-5 5v3H7v4h3v9" />,
  globe: <><circle cx="12" cy="12" r="10" /><ellipse cx="12" cy="12" rx="4" ry="10" /><path d="M2 12h20" /></>,
};

export function Icon({ name, ...props }: SVGProps<SVGSVGElement> & { name: IconName }) {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false" {...props} data-icon={name}>{paths[name]}</svg>;
}

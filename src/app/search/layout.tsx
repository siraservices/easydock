import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Find Marina Slips in South Florida — EasyDock',
  description:
    'Search available boat slips across South Florida marinas. Filter by length, location, and price. Book online — no waitlist, no phone calls.',
  openGraph: {
    title: 'Find Marina Slips in South Florida — EasyDock',
    description:
      'Search available boat slips across South Florida. Filter by length, location, and price. Book online in minutes.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Find Marina Slips in South Florida — EasyDock',
    description:
      'Search available boat slips across South Florida. Filter by length, location, and price. Book online in minutes.',
  },
};

export default function SearchLayout({ children }: { children: React.ReactNode }) {
  return children;
}

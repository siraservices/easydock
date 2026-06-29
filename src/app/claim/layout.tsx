import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Claim Your Marina — EasyDock',
  description:
    'Already listed in our South Florida marina directory? Claim your listing for free and start accepting slip bookings with online payments.',
  openGraph: {
    title: 'Claim Your Marina — EasyDock',
    description:
      'Your marina may already be in our directory. Claim it for free and start accepting bookings.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Claim Your Marina — EasyDock',
    description:
      'Your marina may already be in our directory. Claim it for free and start accepting bookings.',
  },
};

export default function ClaimLayout({ children }: { children: React.ReactNode }) {
  return children;
}

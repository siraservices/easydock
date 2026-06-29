import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pricing - EasyDock',
  description:
    'Simple, transparent pricing for marina owners. Start with a 90-day free trial on any plan — no credit card required.',
  openGraph: {
    title: 'Pricing - EasyDock',
    description:
      'Simple, transparent pricing for marina owners. Start with a 90-day free trial on any plan — no credit card required.',
    type: 'website',
  },
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

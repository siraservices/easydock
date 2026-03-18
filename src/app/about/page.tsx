import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About - EasyDock',
  description: 'Learn about EasyDock, South Florida\'s marina booking marketplace.',
};

export default function AboutPage() {
  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-[720px] mx-auto px-6 pt-20 pb-16 text-center">
        <h1
          className="text-[32px] font-bold mb-4"
          style={{ color: '#1B3A6B' }}
        >
          About EasyDock
        </h1>
        <p className="text-gray-500 text-lg">
          We&apos;re building the easiest way to find and book marina slips across South Florida. More details coming soon.
        </p>
      </div>
    </div>
  );
}

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About - EasyDock',
  description: 'Learn about EasyDock, South Florida\'s marina booking marketplace.',
};

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div
        className="py-24 px-6 text-center"
        style={{
          background: 'linear-gradient(135deg, #0F2445 0%, #1B3A6B 60%, #2A4F8A 100%)',
        }}
      >
        <p className="text-teal-400 text-sm font-semibold tracking-widest uppercase mb-4">Our Story</p>
        <h1 className="text-4xl font-bold text-white mb-4">About EasyDock</h1>
        <p className="text-navy-200 text-lg max-w-xl mx-auto">
          We&apos;re building the easiest way to find and book marina slips across South Florida.
        </p>
      </div>

      {/* Content */}
      <div className="bg-white">
        <div className="max-w-[720px] mx-auto px-6 py-20 text-center">
          <p className="text-gray-500 text-lg leading-relaxed">
            More details coming soon. In the meantime, explore available slips or reach out to us at{' '}
            <a href="mailto:hello@easydock.co" className="text-teal-500 hover:text-teal-600 font-medium">
              hello@easydock.co
            </a>.
          </p>
        </div>
      </div>
    </div>
  );
}

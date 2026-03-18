import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blog - EasyDock',
  description: 'Tips, guides, and news from the EasyDock marina booking marketplace.',
};

export default function BlogPage() {
  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-[720px] mx-auto px-6 pt-20 pb-16 text-center">
        <h1
          className="text-[32px] font-bold mb-4"
          style={{ color: '#1B3A6B' }}
        >
          Blog
        </h1>
        <p className="text-gray-500 text-lg">
          Stories from the dock. Coming soon.
        </p>
      </div>
    </div>
  );
}

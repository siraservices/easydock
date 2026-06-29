import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllPosts } from '@/lib/blog/posts';

export const metadata: Metadata = {
  title: 'Blog - EasyDock',
  description:
    'Marina booking guides, South Florida boating tips, and news for marina owners and boat owners.',
  openGraph: {
    title: 'Blog - EasyDock',
    description:
      'Marina booking guides, South Florida boating tips, and news for marina owners and boat owners.',
    type: 'website',
  },
};

const CATEGORY_LABELS: Record<string, string> = {
  'marina-owners': 'Marina Owners',
  'boat-owners': 'Boat Owners',
  news: 'News',
};

const CATEGORY_COLORS: Record<string, string> = {
  'marina-owners': 'bg-teal-50 text-teal-700',
  'boat-owners': 'bg-blue-50 text-blue-700',
  news: 'bg-gray-100 text-gray-600',
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <div className="bg-white min-h-screen">
      {/* Header */}
      <div
        className="py-20 px-6 text-center"
        style={{
          background:
            'linear-gradient(135deg, #0F2445 0%, #1B3A6B 60%, #2A4F8A 100%)',
        }}
      >
        <p className="text-teal-400 text-sm font-semibold tracking-widest uppercase mb-3">
          From the dock
        </p>
        <h1 className="text-4xl font-bold text-white mb-4">EasyDock Blog</h1>
        <p className="text-white/70 text-lg max-w-lg mx-auto">
          Guides for marina owners, tips for boat owners, and updates from the
          South Florida marina marketplace.
        </p>
      </div>

      {/* Posts */}
      <div className="max-w-[800px] mx-auto px-6 py-16">
        <div className="space-y-8">
          {posts.map((post) => (
            <article
              key={post.slug}
              className="border border-gray-100 rounded-2xl p-8 hover:border-gray-200 hover:shadow-sm transition-all"
            >
              <div className="flex items-center gap-3 mb-4">
                <span
                  className={`text-xs font-semibold px-3 py-1 rounded-full ${
                    CATEGORY_COLORS[post.category] ?? 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {CATEGORY_LABELS[post.category] ?? post.category}
                </span>
                <time className="text-sm text-gray-400">
                  {formatDate(post.date)}
                </time>
                <span className="text-sm text-gray-400">
                  · {post.readingTime} min read
                </span>
              </div>

              <h2 className="text-xl font-bold text-navy-900 mb-3 leading-snug">
                <Link
                  href={`/blog/${post.slug}`}
                  className="hover:text-teal-600 transition-colors"
                  style={{ color: '#1B3A6B' }}
                >
                  {post.title}
                </Link>
              </h2>

              <p className="text-gray-500 leading-relaxed mb-5">
                {post.description}
              </p>

              <Link
                href={`/blog/${post.slug}`}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-teal-600 hover:text-teal-700 transition-colors"
              >
                Read article
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M2 7h10M8 3l4 4-4 4"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Link>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}

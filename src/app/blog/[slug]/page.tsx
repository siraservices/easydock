import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getAllPosts, getPost } from '@/lib/blog/posts';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};

  return {
    title: `${post.title} - EasyDock`,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      type: 'article',
      publishedTime: post.date,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description,
    },
  };
}

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

function renderMarkdown(content: string) {
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.startsWith('## ')) {
      elements.push(
        <h2
          key={i}
          className="text-2xl font-bold mt-10 mb-4"
          style={{ color: '#1B3A6B' }}
        >
          {line.slice(3)}
        </h2>
      );
    } else if (line.startsWith('### ')) {
      elements.push(
        <h3
          key={i}
          className="text-lg font-bold mt-6 mb-2"
          style={{ color: '#1B3A6B' }}
        >
          {line.slice(4)}
        </h3>
      );
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      const listItems: string[] = [];
      while (i < lines.length && (lines[i].startsWith('- ') || lines[i].startsWith('* '))) {
        listItems.push(lines[i].slice(2));
        i++;
      }
      elements.push(
        <ul key={`ul-${i}`} className="list-disc list-inside space-y-1 text-gray-600 my-4 ml-4">
          {listItems.map((item, j) => (
            <li key={j}>{renderInline(item)}</li>
          ))}
        </ul>
      );
      continue;
    } else if (line.startsWith('| ')) {
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].startsWith('|')) {
        tableLines.push(lines[i]);
        i++;
      }
      const [header, , ...rows] = tableLines;
      const headers = header.split('|').filter(Boolean).map((h) => h.trim());
      elements.push(
        <div key={`table-${i}`} className="overflow-x-auto my-6">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-50">
                {headers.map((h, j) => (
                  <th
                    key={j}
                    className="text-left px-4 py-2 font-semibold text-gray-700 border border-gray-200"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, ri) => {
                const cells = row.split('|').filter(Boolean).map((c) => c.trim());
                return (
                  <tr key={ri} className={ri % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    {cells.map((cell, ci) => (
                      <td key={ci} className="px-4 py-2 text-gray-600 border border-gray-200">
                        {cell}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      );
      continue;
    } else if (line === '') {
      // skip blank lines
    } else {
      elements.push(
        <p key={i} className="text-gray-600 leading-relaxed my-4">
          {renderInline(line)}
        </p>
      );
    }

    i++;
  }

  return elements;
}

function renderInline(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*|\[.+?\]\(.+?\))/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="font-semibold text-gray-800">{part.slice(2, -2)}</strong>;
    }
    const linkMatch = part.match(/^\[(.+?)\]\((.+?)\)$/);
    if (linkMatch) {
      return (
        <Link key={i} href={linkMatch[2]} className="text-teal-600 hover:underline">
          {linkMatch[1]}
        </Link>
      );
    }
    return part;
  });
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const allPosts = getAllPosts();
  const related = allPosts.filter((p) => p.slug !== slug).slice(0, 2);

  return (
    <div className="bg-white min-h-screen">
      {/* Header */}
      <div
        className="py-16 px-6"
        style={{
          background:
            'linear-gradient(135deg, #0F2445 0%, #1B3A6B 60%, #2A4F8A 100%)',
        }}
      >
        <div className="max-w-[720px] mx-auto">
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-sm text-teal-300 hover:text-teal-200 transition-colors mb-6"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path
                d="M12 7H2M6 3L2 7l4 4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            All posts
          </Link>

          <div className="flex items-center gap-3 mb-5">
            <span
              className={`text-xs font-semibold px-3 py-1 rounded-full ${
                CATEGORY_COLORS[post.category] ?? 'bg-gray-100 text-gray-600'
              }`}
            >
              {CATEGORY_LABELS[post.category] ?? post.category}
            </span>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-white leading-tight mb-4">
            {post.title}
          </h1>
          <p className="text-white/70 text-lg leading-relaxed mb-6">
            {post.description}
          </p>

          <div className="flex items-center gap-4 text-sm text-white/50">
            <time>{formatDate(post.date)}</time>
            <span>·</span>
            <span>{post.readingTime} min read</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[720px] mx-auto px-6 py-12">
        <div className="prose-style">
          {renderMarkdown(post.content)}
        </div>

        {/* CTA */}
        <div
          className="mt-16 rounded-2xl p-8 text-center"
          style={{
            background: 'linear-gradient(135deg, #0F2445 0%, #1B3A6B 100%)',
          }}
        >
          <h3 className="text-xl font-bold text-white mb-3">
            {post.category === 'marina-owners'
              ? 'List your marina on EasyDock'
              : 'Find your next slip on EasyDock'}
          </h3>
          <p className="text-white/70 mb-6">
            {post.category === 'marina-owners'
              ? '90-day free trial. No credit card required. Claim your marina in minutes.'
              : 'Search available slips across South Florida — no phone calls required.'}
          </p>
          <Link
            href={post.category === 'marina-owners' ? '/claim' : '/search'}
            className="inline-block rounded-xl bg-teal-500 hover:bg-teal-400 transition-colors px-8 py-3 text-sm font-semibold text-white"
          >
            {post.category === 'marina-owners'
              ? 'Claim your marina →'
              : 'Search slips →'}
          </Link>
        </div>

        {/* Related posts */}
        {related.length > 0 && (
          <div className="mt-16">
            <h3
              className="text-lg font-bold mb-6"
              style={{ color: '#1B3A6B' }}
            >
              More from the blog
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              {related.map((p) => (
                <Link
                  key={p.slug}
                  href={`/blog/${p.slug}`}
                  className="block border border-gray-100 rounded-xl p-5 hover:border-gray-200 hover:shadow-sm transition-all"
                >
                  <span
                    className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                      CATEGORY_COLORS[p.category] ?? 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {CATEGORY_LABELS[p.category] ?? p.category}
                  </span>
                  <h4
                    className="mt-3 font-semibold text-sm leading-snug"
                    style={{ color: '#1B3A6B' }}
                  >
                    {p.title}
                  </h4>
                  <p className="mt-1 text-xs text-gray-400">{formatDate(p.date)}</p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

import Link from 'next/link';
import Image from 'next/image';

const footerLinks = {
  boatOwners: [
    { label: 'Browse marinas', href: '/search' },
    { label: 'How it works', href: '/#how-it-works' },
    { label: 'Pricing', href: '/pricing' },
    { label: 'Get matched', href: '/#get-matched' },
  ],
  marinaOperators: [
    { label: 'List your marina', href: '/pricing' },
    { label: 'Partner pricing', href: '/pricing' },
    { label: 'Why EasyDock', href: '/#why-easydock' },
    { label: 'Contact us', href: 'mailto:hello@easydock.co' },
  ],
  company: [
    { label: 'About', href: '/about' },
    { label: 'Blog', href: '/blog' },
    { label: 'Support', href: 'mailto:support@easydock.co' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Privacy Policy', href: '/privacy' },
  ],
};

const socialLinks = [
  { icon: 'instagram', href: 'https://instagram.com/easydock' },
  { icon: 'x-twitter', href: 'https://x.com/easydock' },
  { icon: 'linkedin-in', href: 'https://linkedin.com/company/easydock' },
];

function FooterLinkColumn({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return (
    <div>
      <h3 className="text-[13px] font-semibold mb-3 text-white/85">
        {title}
      </h3>
      <ul className="space-y-2.5">
        {links.map((link) => (
          <li key={link.label}>
            <Link
              href={link.href}
              className="text-[13px] text-white/55 hover:text-white/85 transition-colors duration-200"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Footer() {
  return (
    <footer style={{ backgroundColor: '#0B2545' }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-16 pt-12 pb-8">
        {/* Top section — grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10">
          {/* Brand column */}
          <div className="lg:col-span-4">
            <Link href="/" className="flex items-center">
              <Image src="/logo.png" alt="EasyDock" width={120} height={22} className="brightness-0 invert" />
            </Link>
            <p className="mt-3 text-[13px] leading-[1.7] max-w-[280px] text-white/55">
              South Florida&apos;s marina booking marketplace. We connect boat owners
              with available dock slips across Fort Lauderdale, Miami, Palm Beach,
              and the Keys.
            </p>
            {/* Social icons */}
            <div className="flex gap-2.5 mt-4">
              {socialLinks.map((social) => (
                <a
                  key={social.icon}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group w-[30px] h-[30px] rounded-md border border-white/12 hover:border-white/25 flex items-center justify-center transition-colors duration-200"
                >
                  <i
                    className={`fab fa-${social.icon} text-sm text-white/50 group-hover:text-white/80 transition-colors duration-200`}
                  />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-8">
            <FooterLinkColumn title="Boat owners" links={footerLinks.boatOwners} />
            <FooterLinkColumn title="Marina operators" links={footerLinks.marinaOperators} />
            <FooterLinkColumn title="Company" links={footerLinks.company} />
          </div>
        </div>

        {/* Divider */}
        <div className="mt-10 pt-6 border-t border-white/8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-white/40">
              &copy; 2026 EasyDock LLC. All rights reserved.
            </p>
            <div className="flex gap-5">
              {[
                { label: 'Terms of Service', href: '/terms' },
                { label: 'Privacy Policy', href: '/privacy' },
                { label: 'Cookie Policy', href: '/privacy#cookies' },
              ].map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-xs text-white/35 hover:text-white/70 transition-colors duration-200"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

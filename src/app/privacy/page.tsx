import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy - EasyDock',
  description: 'EasyDock Privacy Policy — learn how we collect, use, and protect your personal information.',
};

const sections = [
  {
    id: undefined,
    title: '1. Information We Collect',
    body: 'We collect information you provide directly to us, including: name, email address, phone number (optional), boat specifications (length, type), and preferred marina locations when you create an account or submit an inquiry. For marina operators, we also collect business name, facility details, and payment information necessary to process transactions.\n\nWe automatically collect certain technical information when you visit the Platform, including your IP address, browser type, device type, pages visited, and the date and time of your visit. We use cookies and similar tracking technologies to collect this information.',
  },
  {
    id: undefined,
    title: '2. How We Use Your Information',
    body: 'We use the information we collect to: (a) provide, maintain, and improve the Platform; (b) match boat owners with available marina slips; (c) process transactions and send related information; (d) send you technical notices, updates, and support messages; (e) respond to your inquiries and requests; (f) monitor and analyze trends, usage, and activity on the Platform; and (g) detect, investigate, and prevent fraudulent or unauthorized activity.',
  },
  {
    id: undefined,
    title: '3. Information Sharing',
    body: 'We share your information in the following circumstances: (a) with marina operators when you express interest in or book a slip, so they can fulfill your reservation; (b) with boat owners when a marina operator receives an inquiry, so the parties can communicate; (c) with third-party service providers who perform services on our behalf, including payment processing and analytics; (d) in response to a legal request if we believe disclosure is required by law; and (e) in connection with a merger, acquisition, or sale of assets. We do not sell your personal information to third parties for their own marketing purposes.',
  },
  {
    id: undefined,
    title: '4. Data Security',
    body: 'We implement reasonable technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet or electronic storage is completely secure, and we cannot guarantee absolute security.',
  },
  {
    id: 'cookies',
    title: '5. Cookies and Tracking Technologies',
    body: 'We use cookies and similar tracking technologies to collect and store information about your interactions with the Platform. You can manage your cookie preferences through your browser settings. Disabling cookies may limit your ability to use certain features of the Platform. We use the following types of cookies: (a) essential cookies required for the Platform to function; (b) analytics cookies to understand how visitors use the Platform; and (c) preference cookies to remember your settings and choices.',
  },
  {
    id: undefined,
    title: '6. Your Rights',
    body: 'Depending on your location, you may have certain rights regarding your personal information, including the right to: access, correct, or delete your data; object to or restrict processing; and data portability. To exercise these rights, contact us at privacy@easydock.co. We will respond to your request within 30 days.',
  },
  {
    id: undefined,
    title: '7. Changes to This Policy',
    body: 'We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the updated policy on this page and updating the \'Last updated\' date. Your continued use of the Platform after changes are posted constitutes acceptance of the updated policy.',
  },
  {
    id: undefined,
    title: '8. Contact',
    body: 'If you have questions about this Privacy Policy, please contact us at privacy@easydock.co.',
  },
];

export default function PrivacyPage() {
  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-[720px] mx-auto px-6 pt-20 pb-16">
        <h1 className="text-[32px] font-bold mb-2 text-navy-800">
          Privacy Policy
        </h1>
        <p className="text-sm text-gray-500 mb-12">
          Last updated: March 17, 2026
        </p>

        {sections.map((section) => (
          <div key={section.title} className="mb-0">
            <h2
              id={section.id}
              className="text-xl font-semibold mt-10 mb-3 text-navy-800"
            >
              {section.title}
            </h2>
            {section.body.split('\n\n').map((paragraph, i) => (
              <p
                key={i}
                className="text-[15px] leading-[1.8] mt-3 first:mt-0 text-gray-600"
              >
                {paragraph}
              </p>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

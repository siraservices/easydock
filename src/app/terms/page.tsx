import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service - EasyDock',
  description: 'EasyDock Terms of Service — read the terms governing use of our marina booking marketplace.',
};

const sections = [
  {
    title: '1. Agreement to Terms',
    body: 'By accessing or using EasyDock (\'the Platform\'), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Platform. EasyDock reserves the right to modify these terms at any time. Continued use of the Platform after changes constitutes acceptance of the updated terms.',
  },
  {
    title: '2. Platform Description',
    body: 'EasyDock operates an online marketplace that connects boat owners seeking dock slips with marina operators offering available berths across South Florida. EasyDock does not own, operate, or manage any marina facility. The Platform facilitates connections and transactions between independent boat owners and independent marina operators. All bookings constitute agreements between the boat owner and the marina operator.',
  },
  {
    title: '3. User Accounts',
    body: 'To access certain features of the Platform, you may be required to create an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to provide accurate, current, and complete information during registration and to update such information to keep it accurate. EasyDock reserves the right to suspend or terminate accounts that violate these terms.',
  },
  {
    title: '4. Boat Owner Terms',
    body: 'As a boat owner using the Platform, you agree to: (a) provide accurate information about your vessel, including length, type, and draft; (b) comply with all marina rules, regulations, and policies at any facility booked through EasyDock; (c) maintain appropriate vessel insurance as required by the marina; and (d) vacate the slip by the agreed-upon date unless an extension is arranged.',
  },
  {
    title: '5. Marina Operator Terms',
    body: 'As a marina operator listing on the Platform, you agree to: (a) provide accurate and current information regarding slip availability, pricing, amenities, and facility rules; (b) honor confirmed bookings at the listed terms unless cancellation policies apply; (c) maintain all necessary licenses and permits for marina operation; and (d) comply with all applicable local, state, and federal regulations governing marina operations.',
  },
  {
    title: '6. Listing Information',
    body: 'Pricing, availability, and amenity information displayed on the Platform is provided by marina operators and may change without notice. While EasyDock works to ensure listings are current and accurate, we encourage users to confirm all details — including rates, slip dimensions, available dates, and facility rules — directly with the marina operator before finalizing any booking.',
  },
  {
    title: '7. Payments and Fees',
    body: 'EasyDock facilitates payments between boat owners and marina operators through our third-party payment processor. Boat owners may be charged a service fee at the time of booking. Marina operators are subject to subscription fees and/or commission rates as outlined in their selected plan. All fees are disclosed prior to completing a transaction. Refund policies are determined by the individual marina operator\'s cancellation terms as displayed on their listing.',
  },
  {
    title: '8. Limitation of Liability',
    body: 'To the maximum extent permitted by applicable law, EasyDock, its affiliates, officers, directors, employees, and agents shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of profits, data, or goodwill, arising from or related to: (a) your use of or inability to use the Platform; (b) any transaction or relationship between boat owners and marina operators; (c) any content or information provided by third parties on the Platform; or (d) unauthorized access to or alteration of your transmissions or data. EasyDock\'s aggregate liability for any claim arising from these terms or your use of the Platform shall not exceed the total fees paid by you to EasyDock during the twelve (12) months preceding the event giving rise to the claim, or one hundred U.S. dollars ($100), whichever is greater.',
  },
  {
    title: '9. Disclaimer of Warranties',
    body: 'The Platform is provided on an \'as is\' and \'as available\' basis without warranties of any kind, whether express or implied. EasyDock disclaims all warranties, including implied warranties of merchantability, fitness for a particular purpose, and non-infringement. EasyDock does not warrant that: (a) the Platform will meet your requirements; (b) the Platform will be uninterrupted, timely, secure, or error-free; (c) any information provided through the Platform is accurate, reliable, or complete; or (d) any defects in the Platform will be corrected.',
  },
  {
    title: '10. Indemnification',
    body: 'You agree to indemnify, defend, and hold harmless EasyDock and its affiliates, officers, directors, employees, and agents from any claims, liabilities, damages, losses, and expenses (including reasonable attorney\'s fees) arising from: (a) your use of the Platform; (b) your violation of these Terms; (c) your violation of any rights of a third party; or (d) any content you submit or transmit through the Platform.',
  },
  {
    title: '11. Governing Law',
    body: 'These Terms shall be governed by and construed in accordance with the laws of the State of Florida, without regard to its conflict of law provisions. Any disputes arising from these terms or your use of the Platform shall be resolved in the state or federal courts located in Broward County, Florida.',
  },
  {
    title: '12. Contact',
    body: 'If you have questions about these Terms of Service, please contact us at legal@easydock.co.',
  },
];

export default function TermsPage() {
  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-[720px] mx-auto px-6 pt-20 pb-16">
        <h1 className="text-[32px] font-bold mb-2 text-navy-800">
          Terms of Service
        </h1>
        <p className="text-sm text-gray-500 mb-12">
          Last updated: March 17, 2026
        </p>

        {sections.map((section) => (
          <div key={section.title} className="mb-0">
            <h2 className="text-xl font-semibold mt-10 mb-3 text-navy-800">
              {section.title}
            </h2>
            <p className="text-[15px] leading-[1.8] text-gray-600">
              {section.body}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Features() {
  const features = [
    {
      icon: '⏰',
      title: 'Real-Time Availability',
      description:
        'Live updates on marina availability ensure you always have access to the most current docking options and competitive pricing.',
    },
    {
      icon: '⚡',
      title: 'Instant Booking',
      description:
        'Secure your marina space immediately with instant confirmation. Professional service with no delays or uncertainty.',
    },
    {
      icon: '💰',
      title: 'Competitive Pricing',
      description:
        'Our pricing model ensures you get the best rates by optimizing marina pricing across our entire network.',
    },
    {
      icon: '🎧',
      title: '24/7 Support',
      description:
        'Professional customer support available around the clock to assist with bookings, changes, and any questions.',
    },
    {
      icon: '🔒',
      title: 'Secure Transactions',
      description:
        'Enterprise-grade security for all payments and personal information. Your data and transactions are fully protected.',
    },
    {
      icon: '📱',
      title: 'Mobile Optimized',
      description:
        'Access our platform from anywhere with a fully responsive mobile experience designed for on-the-go booking.',
    },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Premium Platform Features</h2>
          <p className="text-lg text-gray-600">
            Experience the most advanced marina booking platform designed for serious yacht owners
            and marina operators.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-6 hover:shadow-lg transition-shadow">
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

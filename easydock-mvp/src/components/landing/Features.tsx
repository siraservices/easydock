export const Features = () => {
  const features = [
    {
      icon: 'fa-clock',
      title: 'Real-Time Availability',
      description:
        'Live updates on marina availability ensure you always have access to the most current docking options and competitive pricing.',
    },
    {
      icon: 'fa-bolt',
      title: 'Instant Booking',
      description:
        'Secure your marina space immediately with instant confirmation. Professional service with no delays or uncertainty.',
    },
    {
      icon: 'fa-dollar-sign',
      title: 'Competitive Pricing',
      description:
        'Our pricing model ensures you get the best rates by optimizing marina pricing across our entire network.',
    },
    {
      icon: 'fa-headset',
      title: '24/7 Support',
      description:
        'Professional customer support available around the clock to assist with bookings, changes, and any questions.',
    },
    {
      icon: 'fa-shield-alt',
      title: 'Secure Transactions',
      description:
        'Enterprise-grade security for all payments and personal information. Your data and transactions are fully protected.',
    },
    {
      icon: 'fa-mobile-alt',
      title: 'Mobile Optimized',
      description:
        'Access our platform from anywhere with a fully responsive mobile experience designed for on-the-go booking.',
    },
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-secondary font-bold text-primary-navy mb-4">
            Premium Platform Features
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Experience the most advanced marina booking platform designed for serious yacht owners
            and marina operators.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-secondary-teal to-primary-navy rounded-lg flex items-center justify-center mb-4">
                <i className={`fas ${feature.icon} text-white text-2xl`}></i>
              </div>
              <h3 className="text-xl font-semibold text-primary-navy mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

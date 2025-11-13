import { Link } from 'react-router-dom';

interface HeroProps {
  onGetStarted: () => void;
}

export default function Hero({ onGetStarted }: HeroProps) {
  return (
    <section className="bg-gradient-to-br from-primary-navy to-secondary-teal text-white py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Find the Perfect Marina Space at the Best Price
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-gray-100">
            Connect with premium marina networks nationwide through our professional platform.
            Real-time availability, competitive pricing, instant booking.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link
              to="/search"
              className="px-8 py-3 bg-white text-primary-navy rounded-md font-semibold hover:bg-gray-100 transition-colors"
            >
              Find Marina Space
            </Link>
            <button
              onClick={onGetStarted}
              className="px-8 py-3 bg-accent-gold text-white rounded-md font-semibold hover:bg-yellow-600 transition-colors"
            >
              List Your Marina
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">500+</div>
              <div className="text-gray-200">Partner Marinas</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">10,000+</div>
              <div className="text-gray-200">Yacht Owners</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">98%</div>
              <div className="text-gray-200">Satisfaction Rate</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

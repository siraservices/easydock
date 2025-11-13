import { Link } from 'react-router-dom';

export const Hero = () => {
  return (
    <section className="relative bg-gradient-to-br from-primary-navy to-secondary-teal text-white min-h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80')] bg-cover bg-center opacity-20"></div>
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-4xl md:text-6xl font-secondary font-bold mb-6">
          Find the Perfect Marina Space at the Best Price
        </h1>
        <p className="text-xl md:text-2xl mb-8 opacity-95">
          Connect with premium marina networks nationwide through our professional platform.
          Real-time availability, competitive pricing, instant booking.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Link
            to="/search"
            className="px-8 py-3 bg-white text-primary-navy rounded-full font-semibold hover:bg-opacity-90 transition"
          >
            Find Marina Space
          </Link>
          <Link
            to="/register"
            className="px-8 py-3 bg-transparent border-2 border-white text-white rounded-full font-semibold hover:bg-white hover:text-primary-navy transition"
          >
            List Your Marina
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
          <div className="text-center">
            <span className="text-4xl font-bold text-accent-gold block mb-2">500+</span>
            <span className="text-lg opacity-90">Partner Marinas</span>
          </div>
          <div className="text-center">
            <span className="text-4xl font-bold text-accent-gold block mb-2">10,000+</span>
            <span className="text-lg opacity-90">Yacht Owners</span>
          </div>
          <div className="text-center">
            <span className="text-4xl font-bold text-accent-gold block mb-2">98%</span>
            <span className="text-lg opacity-90">Satisfaction Rate</span>
          </div>
        </div>
      </div>
    </section>
  );
};

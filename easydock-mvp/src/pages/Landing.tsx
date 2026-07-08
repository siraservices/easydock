import { useState } from 'react';
import { Layout } from '../components/common/Layout';
import { Hero } from '../components/landing/Hero';
import { Features } from '../components/landing/Features';
import { LeadCapture } from '../components/landing/LeadCapture';

export const Landing = () => {
  const [showModal, setShowModal] = useState(false);

  return (
    <Layout>
      <Hero />
      <Features />
      
      {/* How It Works Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-secondary font-bold text-primary-navy mb-4">
              How EasyDock Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our professional booking platform streamlines the marina reservation process for both
              yacht owners and marina operators.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-secondary-teal to-primary-navy rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-search text-white text-2xl"></i>
              </div>
              <h3 className="text-xl font-semibold text-primary-navy mb-2">Search & Compare</h3>
              <p className="text-gray-600">
                Browse available marina spaces with real-time pricing and availability. Our platform
                ensures you get the best rates.
              </p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-secondary-teal to-primary-navy rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-calendar-check text-white text-2xl"></i>
              </div>
              <h3 className="text-xl font-semibold text-primary-navy mb-2">Book Instantly</h3>
              <p className="text-gray-600">
                Secure your preferred marina space with instant confirmation. No waiting, no
                uncertainty - just professional service.
              </p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-secondary-teal to-primary-navy rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-ship text-white text-2xl"></i>
              </div>
              <h3 className="text-xl font-semibold text-primary-navy mb-2">
                Dock with Confidence
              </h3>
              <p className="text-gray-600">
                Arrive at your reserved slip with all details confirmed. Enjoy premium marina
                services at competitive rates.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary-navy to-secondary-teal text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-secondary font-bold mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl mb-8 opacity-95">
            Join thousands of yacht owners and marina operators using EasyDock
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="px-8 py-3 bg-white text-primary-navy rounded-full font-semibold hover:bg-opacity-90 transition"
          >
            Get Started Today
          </button>
        </div>
      </section>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute -top-4 -right-4 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-gray-100"
            >
              <i className="fas fa-times text-gray-600"></i>
            </button>
            <LeadCapture onClose={() => setShowModal(false)} />
          </div>
        </div>
      )}
    </Layout>
  );
};

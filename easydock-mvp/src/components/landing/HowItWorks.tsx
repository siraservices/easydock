export default function HowItWorks() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">How EasyDock Works</h2>
          <p className="text-lg text-gray-600">
            Our professional booking platform streamlines the marina reservation process for both
            yacht owners and marina operators.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-6">For Yacht Owners</h3>
            <div className="space-y-6">
              <div className="flex items-start">
                <div className="flex-shrink-0 w-12 h-12 bg-primary-navy rounded-full flex items-center justify-center text-white font-bold text-xl mr-4">
                  1
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Search & Compare</h4>
                  <p className="text-gray-600">
                    Browse available marina spaces with real-time pricing and availability. Our
                    platform ensures you get the best rates.
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 w-12 h-12 bg-primary-navy rounded-full flex items-center justify-center text-white font-bold text-xl mr-4">
                  2
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Book Instantly</h4>
                  <p className="text-gray-600">
                    Secure your preferred marina space with instant confirmation. No waiting, no
                    uncertainty - just professional service.
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 w-12 h-12 bg-primary-navy rounded-full flex items-center justify-center text-white font-bold text-xl mr-4">
                  3
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Dock with Confidence</h4>
                  <p className="text-gray-600">
                    Arrive at your reserved slip with all details confirmed. Enjoy premium marina
                    services at competitive rates.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-6">For Marina Owners</h3>
            <div className="space-y-6">
              <div className="flex items-start">
                <div className="flex-shrink-0 w-12 h-12 bg-secondary-teal rounded-full flex items-center justify-center text-white font-bold text-xl mr-4">
                  1
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">List Your Marina</h4>
                  <p className="text-gray-600">
                    Add your marina to our professional network. Set availability, pricing, and
                    showcase your amenities to qualified yacht owners.
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 w-12 h-12 bg-secondary-teal rounded-full flex items-center justify-center text-white font-bold text-xl mr-4">
                  2
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Connect with Customers</h4>
                  <p className="text-gray-600">
                    Reach a broader audience of yacht owners through our booking platform. Maximize
                    occupancy and revenue potential.
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 w-12 h-12 bg-secondary-teal rounded-full flex items-center justify-center text-white font-bold text-xl mr-4">
                  3
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Grow Your Business</h4>
                  <p className="text-gray-600">
                    Increase bookings and revenue with our professional marketing and customer
                    acquisition services.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

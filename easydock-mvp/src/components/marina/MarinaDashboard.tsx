import { useState } from 'react';
import type { Marina } from '../../types';
import SlipManagement from './SlipManagement';
import AvailabilityCalendar from './AvailabilityCalendar';
import BookingApproval from './BookingApproval';
import MarinaAnalytics from './MarinaAnalytics';

interface MarinaDashboardProps {
  marina: Marina;
}

type Tab = 'slips' | 'availability' | 'bookings' | 'analytics';

export default function MarinaDashboard({ marina }: MarinaDashboardProps) {
  const [activeTab, setActiveTab] = useState<Tab>('slips');

  const tabs = [
    { id: 'slips' as Tab, name: 'Slip Management', icon: '⚓' },
    { id: 'availability' as Tab, name: 'Availability', icon: '📅' },
    { id: 'bookings' as Tab, name: 'Bookings', icon: '📋' },
    { id: 'analytics' as Tab, name: 'Analytics', icon: '📊' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{marina.name}</h1>
        <p className="mt-2 text-gray-600">
          {marina.address}, {marina.city}, {marina.state} {marina.zip_code}
        </p>
      </div>

      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                ${
                  activeTab === tab.id
                    ? 'border-primary-navy text-primary-navy'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      <div className="mt-8">
        {activeTab === 'slips' && <SlipManagement marinaId={marina.id} />}
        {activeTab === 'availability' && <AvailabilityCalendar marinaId={marina.id} />}
        {activeTab === 'bookings' && <BookingApproval marinaId={marina.id} />}
        {activeTab === 'analytics' && <MarinaAnalytics marinaId={marina.id} />}
      </div>
    </div>
  );
}

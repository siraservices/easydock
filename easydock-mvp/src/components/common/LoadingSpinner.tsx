import { memo } from 'react';

export const LoadingSpinner = memo(() => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-navy"></div>
  </div>
));

LoadingSpinner.displayName = 'LoadingSpinner';

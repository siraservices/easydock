import { Layout } from '../components/common/Layout';
import { SlipSearch } from '../components/yacht-owner/SlipSearch';

export const SearchResults = () => {
  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <SlipSearch />
        </div>
      </div>
    </Layout>
  );
};

export interface Region {
  slug: string;
  name: string;
  marinaCount: string;
  priceRange: string;
  slipSizes: string[];
  badge?: {
    text: string;
    variant: 'active' | 'coming_soon';
  };
}

export const REGIONS: Region[] = [
  {
    slug: 'fort-lauderdale',
    name: 'Fort Lauderdale',
    marinaCount: '15+',
    priceRange: '$28–52',
    slipSizes: ['20–40 ft', '40–60 ft', '60–100 ft'],
    badge: { text: 'Most active', variant: 'active' },
  },
  {
    slug: 'miami',
    name: 'Miami / Key Biscayne',
    marinaCount: '12+',
    priceRange: '$32–58',
    slipSizes: ['25–40 ft', '40–80 ft'],
  },
  {
    slug: 'palm-beach',
    name: 'Palm Beach',
    marinaCount: '8+',
    priceRange: '$30–48',
    slipSizes: ['30–60 ft', '60–120 ft'],
  },
  {
    slug: 'the-keys',
    name: 'The Keys',
    marinaCount: '5+',
    priceRange: '$25–45',
    slipSizes: ['20–40 ft', '40–60 ft'],
    badge: { text: 'Coming soon', variant: 'coming_soon' },
  },
];

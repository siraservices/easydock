export type UserRole = 'marina_owner' | 'yacht_owner' | 'admin';

export interface Profile {
  id: string;
  user_id: string;
  role: UserRole;
  full_name: string | null;
  phone: string | null;
  created_at: string;
  updated_at: string;
}

export interface Marina {
  id: string;
  owner_id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
  phone: string | null;
  email: string | null;
  website: string | null;
  description: string | null;
  amenities: string[] | null;
  photos: string[] | null;
  latitude: number | null;
  longitude: number | null;
  created_at: string;
  updated_at: string;
}

export interface Slip {
  id: string;
  marina_id: string;
  slip_number: string;
  length: number;
  width: number;
  draft: number | null;
  power_available: boolean;
  power_voltage: number | null;
  water_available: boolean;
  daily_rate: number;
  weekly_rate: number | null;
  monthly_rate: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Availability {
  id: string;
  slip_id: string;
  date: string;
  is_available: boolean;
  reason: string | null;
  created_at: string;
  updated_at: string;
}

export interface Booking {
  id: string;
  slip_id: string;
  yacht_owner_id: string;
  marina_id: string;
  start_date: string;
  end_date: string;
  total_price: number;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled' | 'completed';
  payment_status: 'pending' | 'paid' | 'refunded';
  vessel_name: string | null;
  vessel_length: number | null;
  vessel_width: number | null;
  special_requests: string | null;
  created_at: string;
  updated_at: string;
}

export interface Lead {
  id: string;
  email: string;
  user_type: 'yacht_owner' | 'marina_owner' | null;
  message: string | null;
  launch_notify: boolean;
  created_at: string;
}

export interface SearchFilters {
  location?: string;
  start_date?: string;
  end_date?: string;
  min_length?: number;
  max_length?: number;
  min_width?: number;
  max_width?: number;
  min_draft?: number;
  max_draft?: number;
  power_required?: boolean;
  water_required?: boolean;
  min_price?: number;
  max_price?: number;
  amenities?: string[];
}

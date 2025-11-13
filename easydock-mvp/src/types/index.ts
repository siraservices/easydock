export type UserRole = 'marina_owner' | 'yacht_owner' | 'admin';

export interface Profile {
  id: string;
  user_id: string;
  role: UserRole;
  full_name?: string;
  phone?: string;
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
  phone?: string;
  email?: string;
  website?: string;
  description?: string;
  amenities?: string[];
  photos?: string[];
  latitude?: number;
  longitude?: number;
  created_at: string;
  updated_at: string;
}

export interface Slip {
  id: string;
  marina_id: string;
  slip_number?: string;
  length: number;
  width: number;
  draft?: number;
  power_available?: boolean;
  power_voltage?: number;
  water_available?: boolean;
  daily_rate: number;
  weekly_rate?: number;
  monthly_rate?: number;
  description?: string;
  photos?: string[];
  created_at: string;
  updated_at: string;
}

export interface Availability {
  id: string;
  slip_id: string;
  date: string;
  available: boolean;
  blocked_reason?: string;
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
  vessel_name?: string;
  vessel_length?: number;
  vessel_width?: number;
  special_requests?: string;
  created_at: string;
  updated_at: string;
}

export interface Lead {
  id: string;
  email: string;
  user_type?: 'yacht_owner' | 'marina_owner';
  launch_notify?: boolean;
  message?: string;
  created_at: string;
}

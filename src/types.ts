export type Language = 'en' | 'hi' | 'mr';

export type LandUnit = 'Acre' | 'Hectare' | 'Guntha';
export type CropType = 'Paddy' | 'Wheat' | 'Soyabean' | 'Cotton' | 'Maize' | 'Gram (Chana)' | 'Sugarcane';
export type HarvestStatus = 'Ready for Procurement' | 'Harvested & Stored' | 'Harvesting in Progress';
export type AppointmentStatus = 'Confirmed' | 'Checked-In' | 'Completed' | 'Cancelled' | 'Rescheduled' | 'Late';

export interface FarmerProfile {
  farmer_id: string;
  name: string;
  phone: string;
  village: string;
  district: string;
  taluka?: string;
  state?: string;
  latitude: number;
  longitude: number;
  land_area: number;
  land_unit: LandUnit;
  main_crop: CropType;
  other_crops: CropType[];
  active_crop?: CropType;
  photo_url?: string;
  is_verified?: boolean;
  aadhaar_number?: string;
  land_record_712?: string;
  bank_name?: string;
  bank_account?: string;
  bank_ifsc?: string;
}

export interface CenterSlot {
  id: string;
  time_range: string; // e.g. "09:00 AM – 10:00 AM"
  total_slots: number;
  available_slots: number;
}

export interface ProcurementCenter {
  center_id: string;
  name: string;
  address: string;
  district: string;
  latitude: number;
  longitude: number;
  contact: string;
  operating_hours: string;
  capacity: number; // e.g. 100 farmers/day
  available_slots: number;
  current_queue: number;
  completed_today: number;
  status: 'Open' | 'Closed' | 'Accepting Farmers' | 'Lunch Break';
  rating: number;
  accepted_crops: CropType[];
  distance_km?: number;
  active_counters: number;
  avg_processing_mins: number;
}

export interface CropRecord {
  crop_id: string; // e.g. "CR-2026-1027"
  farmer_id: string;
  crop_type: CropType;
  quantity: number;
  unit: 'kg' | 'Quintal' | 'Tons';
  harvest_status: HarvestStatus;
  registration_date: string;
  preferred_center_id?: string;
}

export interface Appointment {
  appointment_id: string;
  farmer_id: string;
  crop_id: string;
  crop_type: CropType;
  quantity: number;
  unit: string;
  center_id: string;
  center_name: string;
  center_address: string;
  center_lat: number;
  center_lng: number;
  date: string; // "10 September 2026"
  time_slot: string; // "10:00 AM – 11:00 AM"
  token_id: string; // "P-105"
  status: AppointmentStatus;
  created_at: string;
  is_late?: boolean;
  vehicle_number?: string;
  gate_bay?: string;
  checked_in_at?: string;
}

export interface QueueItem {
  token_id: string;
  center_id: string;
  farmer_name?: string;
  crop_type?: string;
  status: 'Serving' | 'Waiting' | 'Completed' | 'Late' | 'Skipped';
  position: number;
  is_current_farmer?: boolean;
  time_slot?: string;
}

export interface QueueStatusResponse {
  center_id: string;
  center_name: string;
  current_token: string; // e.g. "P-101"
  user_token: string; // e.g. "P-105"
  farmers_ahead: number;
  estimated_waiting_mins: number;
  ai_predicted_waiting_mins: number;
  recommended_arrival_time: string;
  queue_status_label: 'Moving Normally' | 'Slow Movement' | 'Your Turn Now' | 'Counter Paused';
  queue_list: QueueItem[];
  active_counters: number;
  avg_time_per_farmer: number;
  scheduled_slot: string;
  is_late: boolean;
  grace_period_mins: number;
}

export interface NotificationItem {
  notification_id: string;
  farmer_id: string;
  title: string;
  message: string;
  type: 'appointment' | 'queue' | 'turn' | 'schedule' | 'status';
  read_status: boolean;
  created_at: string;
}

export type ProcurementStage =
  | 'registered'
  | 'scheduled'
  | 'token_generated'
  | 'farmer_arrived'
  | 'weighing'
  | 'quality_verification'
  | 'procurement_completed'
  | 'payment_processing'
  | 'payment_completed';

export interface ProcurementStageInfo {
  stage: ProcurementStage;
  label: string;
  description: string;
  timestamp?: string;
  status: 'completed' | 'current' | 'pending';
}

export interface FarmerDashboardData {
  farmer: FarmerProfile;
  nearest_center: ProcurementCenter;
  active_appointment: Appointment | null;
  queue_summary: {
    current_token: string;
    user_token: string;
    farmers_ahead: number;
    estimated_wait_mins: number;
    recommended_arrival_time: string;
    status: string;
  };
  recent_notifications: NotificationItem[];
}

export interface AdminWeighmentRecord {
  weighment_id: string;
  token_id: string;
  farmer_id: string;
  farmer_name: string;
  farmer_phone?: string;
  center_id: string;
  crop_type: CropType;
  vehicle_number: string;
  gross_weight_kg: number;
  tare_weight_kg: number;
  net_weight_kg: number;
  moisture_pct: number;
  foreign_matter_pct: number;
  quality_grade: 'FAQ Grade A' | 'FAQ Standard' | 'Sub-Standard (Deducted)' | 'Rejected';
  msp_rate_per_quintal: number;
  base_amount_inr: number;
  quality_deduction_inr: number;
  net_payable_inr: number;
  receipt_number: string;
  payment_status: 'Pending DBT Transfer' | 'Approved' | 'Disbursed to Bank';
  bank_account_last4?: string;
  created_at: string;
  officer_name: string;
}

export interface AdminOfficerProfile {
  officer_id: string;
  name: string;
  designation: string;
  center_id: string;
  center_name: string;
  jurisdiction: string;
  badge_number: string;
}

export interface AdminStats {
  total_procured_kg_today: number;
  total_payout_inr_today: number;
  farmers_served_today: number;
  active_in_queue: number;
  average_processing_mins: number;
  pending_inspections: number;
  counters_active: number;
}


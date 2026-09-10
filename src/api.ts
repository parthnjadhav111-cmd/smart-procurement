import {
  FarmerProfile,
  ProcurementCenter,
  CropRecord,
  Appointment,
  NotificationItem,
  QueueStatusResponse,
  QueueItem,
  AdminWeighmentRecord,
  AdminOfficerProfile,
  AdminStats,
} from './types';
import {
  INITIAL_FARMER,
  INITIAL_CENTERS,
  INITIAL_CROPS,
  INITIAL_APPOINTMENTS,
  INITIAL_QUEUE_LIST,
  INITIAL_NOTIFICATIONS,
  DEFAULT_OFFICER,
  INITIAL_ADMIN_WEIGHMENTS,
  MSP_RATES,
  calculateDistanceKm,
} from './data/mockData';

// Fallback in-memory state in case server is starting up or in purely client-side environment
let localFarmer: FarmerProfile = { ...INITIAL_FARMER };
let localCenters: ProcurementCenter[] = [...INITIAL_CENTERS];
let localCrops: CropRecord[] = [...INITIAL_CROPS];
let localAppointments: Appointment[] = [...INITIAL_APPOINTMENTS];
let localQueue = [...INITIAL_QUEUE_LIST];
let localServingIdx = 0;
let localNotifications: NotificationItem[] = [...INITIAL_NOTIFICATIONS];
let localOfficer: AdminOfficerProfile = { ...DEFAULT_OFFICER };
let localWeighments: AdminWeighmentRecord[] = [...INITIAL_ADMIN_WEIGHMENTS];

export const api = {
  // --- Farmer Profile ---
  async getProfile(): Promise<FarmerProfile> {
    try {
      const res = await fetch('/api/farmer/profile');
      if (res.ok) return await res.json();
    } catch (_) {}
    return localFarmer;
  },

  async updateProfile(profile: Partial<FarmerProfile>): Promise<FarmerProfile> {
    try {
      const res = await fetch('/api/farmer/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.farmer) return data.farmer;
      }
    } catch (_) {}
    localFarmer = { ...localFarmer, ...profile };
    return localFarmer;
  },

  async updateLocation(latitude: number, longitude: number): Promise<{ latitude: number; longitude: number }> {
    try {
      const res = await fetch('/api/farmer/location', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ latitude, longitude }),
      });
      if (res.ok) return await res.json();
    } catch (_) {}
    localFarmer.latitude = latitude;
    localFarmer.longitude = longitude;
    return { latitude, longitude };
  },

  // --- Centers ---
  async getCenters(district?: string, crop?: string): Promise<ProcurementCenter[]> {
    try {
      const params = new URLSearchParams();
      if (district && district !== 'All') params.append('district', district);
      if (crop && crop !== 'All') params.append('crop', crop);
      const res = await fetch(`/api/centers?${params.toString()}`);
      if (res.ok) return await res.json();
    } catch (_) {}

    let list = localCenters.map((c) => ({
      ...c,
      distance_km: calculateDistanceKm(localFarmer.latitude, localFarmer.longitude, c.latitude, c.longitude),
    }));
    if (district && district !== 'All') {
      list = list.filter((c) => c.district.toLowerCase() === district.toLowerCase());
    }
    if (crop && crop !== 'All') {
      list = list.filter((c) => c.accepted_crops.includes(crop as any));
    }
    return list;
  },

  async getNearbyCenters(): Promise<{ nearest: ProcurementCenter; all_nearby: ProcurementCenter[] }> {
    try {
      const res = await fetch('/api/centers/nearby');
      if (res.ok) return await res.json();
    } catch (_) {}

    const withDist = localCenters.map((c) => ({
      ...c,
      distance_km: calculateDistanceKm(localFarmer.latitude, localFarmer.longitude, c.latitude, c.longitude),
    }));
    withDist.sort((a, b) => (a.distance_km || 0) - (b.distance_km || 0));
    return {
      nearest: withDist[0],
      all_nearby: withDist,
    };
  },

  async getCenterDetails(centerId: string): Promise<ProcurementCenter | null> {
    try {
      const res = await fetch(`/api/centers/${centerId}`);
      if (res.ok) return await res.json();
    } catch (_) {}
    const c = localCenters.find((item) => item.center_id === centerId) || localCenters[0];
    return {
      ...c,
      distance_km: calculateDistanceKm(localFarmer.latitude, localFarmer.longitude, c.latitude, c.longitude),
    };
  },

  // --- Crops ---
  async getCrops(): Promise<CropRecord[]> {
    try {
      const res = await fetch('/api/farmer/crops');
      if (res.ok) return await res.json();
    } catch (_) {}
    return localCrops;
  },

  async registerCrop(data: Partial<CropRecord>): Promise<CropRecord> {
    try {
      const res = await fetch('/api/crops', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) return await res.json();
    } catch (_) {}

    const newCrop: CropRecord = {
      crop_id: `CR-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      farmer_id: localFarmer.farmer_id,
      crop_type: data.crop_type || 'Paddy',
      quantity: Number(data.quantity) || 800,
      unit: data.unit || 'kg',
      harvest_status: data.harvest_status || 'Ready for Procurement',
      registration_date: '10 September 2026',
      preferred_center_id: data.preferred_center_id || 'PC-101',
    };
    localCrops.unshift(newCrop);
    return newCrop;
  },

  // --- Appointments / Scheduling ---
  async getAppointments(): Promise<Appointment[]> {
    try {
      const res = await fetch('/api/farmer/appointments');
      if (res.ok) return await res.json();
    } catch (_) {}
    return localAppointments;
  },

  async bookSlot(data: {
    crop_id: string;
    center_id: string;
    date: string;
    time_slot: string;
  }): Promise<Appointment> {
    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) return await res.json();
    } catch (_) {}

    const center = localCenters.find((c) => c.center_id === data.center_id) || localCenters[0];
    const crop = localCrops.find((c) => c.crop_id === data.crop_id) || localCrops[0];
    const tokenId = `P-${100 + localQueue.length + 1}`;

    const newApt: Appointment = {
      appointment_id: `APT-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      farmer_id: localFarmer.farmer_id,
      crop_id: crop ? crop.crop_id : 'CR-2026-1027',
      crop_type: crop ? crop.crop_type : 'Paddy',
      quantity: crop ? crop.quantity : 800,
      unit: crop ? crop.unit : 'kg',
      center_id: center.center_id,
      center_name: center.name,
      center_address: center.address,
      center_lat: center.latitude,
      center_lng: center.longitude,
      date: data.date,
      time_slot: data.time_slot,
      token_id: tokenId,
      status: 'Confirmed',
      created_at: new Date().toISOString(),
    };
    localAppointments.unshift(newApt);

    localQueue.push({
      token_id: tokenId,
      center_id: center.center_id,
      farmer_name: `${localFarmer.name} (You)`,
      crop_type: `${newApt.crop_type} (${newApt.quantity} ${newApt.unit})`,
      status: 'Waiting',
      position: localQueue.length + 1,
      is_current_farmer: true,
      time_slot: newApt.time_slot,
    });

    return newApt;
  },

  async updateAppointment(id: string, updates: Partial<Appointment>): Promise<Appointment | null> {
    try {
      const res = await fetch(`/api/appointments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        const data = await res.json();
        return data.appointment;
      }
    } catch (_) {}

    const apt = localAppointments.find((a) => a.appointment_id === id);
    if (apt) {
      Object.assign(apt, updates);
      return apt;
    }
    return null;
  },

  async confirmFarmerArrival(tokenId?: string): Promise<{ success: boolean; stage: number; message: string }> {
    try {
      const res = await fetch('/api/farmer/arrived', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token_id: tokenId }),
      });
      if (res.ok) return await res.json();
    } catch (_) {}

    localNotifications.unshift({
      notification_id: `NOTIF-ARR-${Date.now()}`,
      farmer_id: localFarmer.farmer_id,
      title: 'Gate Arrival Verified (Stage 4 Complete)',
      message: `Vehicle entry verified for Token ${tokenId || 'P-105'}. Proceed to Weighbridge Bay A.`,
      type: 'queue',
      read_status: false,
      created_at: new Date().toISOString(),
    });

    return {
      success: true,
      stage: 5,
      message: 'Gate entry verified! Stage 4 (Farmer Arrived) marked as completed.',
    };
  },

  // --- Queue Tracking ---
  async getQueueList(): Promise<QueueItem[]> {
    try {
      const res = await fetch('/api/queue');
      if (res.ok) return await res.json();
    } catch (_) {}
    return localQueue;
  },

  async getQueueStatus(tokenId: string): Promise<QueueStatusResponse> {
    try {
      const res = await fetch(`/api/queue/${tokenId}`);
      if (res.ok) return await res.json();
    } catch (_) {}

    const currentItem = localQueue[localServingIdx] || localQueue[0];
    const currentToken = currentItem ? currentItem.token_id : 'P-101';
    const userIndex = localQueue.findIndex((q) => q.token_id === tokenId);
    const farmersAhead = userIndex >= 0 ? Math.max(0, userIndex - localServingIdx) : 4;
    const estimatedWaitingMins = Math.round((farmersAhead * 7) / 2);

    return {
      center_id: 'PC-101',
      center_name: 'Pune District Procurement Center',
      current_token: currentToken,
      user_token: tokenId || 'P-105',
      farmers_ahead: farmersAhead,
      estimated_waiting_mins: estimatedWaitingMins,
      ai_predicted_waiting_mins: Math.max(0, Math.round(estimatedWaitingMins * 0.92)),
      recommended_arrival_time: '10:35 AM',
      queue_status_label: farmersAhead === 0 ? 'Your Turn Now' : 'Moving Normally',
      queue_list: localQueue,
      active_counters: 2,
      avg_time_per_farmer: 7,
      scheduled_slot: '10:00 AM – 11:00 AM',
      is_late: false,
      grace_period_mins: 15,
    };
  },

  async stepQueue(): Promise<{ success: boolean; current_token: string }> {
    try {
      const res = await fetch('/api/queue/step', { method: 'POST' });
      if (res.ok) return await res.json();
    } catch (_) {}

    if (localServingIdx < localQueue.length - 1) {
      localQueue[localServingIdx].status = 'Completed';
      localServingIdx += 1;
      localQueue[localServingIdx].status = 'Serving';
    }
    return {
      success: true,
      current_token: localQueue[localServingIdx].token_id,
    };
  },

  async joinLateQueue(tokenId: string): Promise<boolean> {
    try {
      const res = await fetch('/api/queue/join-late', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token_id: tokenId }),
      });
      if (res.ok) return true;
    } catch (_) {}

    const idx = localQueue.findIndex((q) => q.token_id === tokenId);
    if (idx >= 0) {
      const item = localQueue.splice(idx, 1)[0];
      item.status = 'Late';
      localQueue.push(item);
    }
    return true;
  },

  async resetQueue(): Promise<boolean> {
    try {
      await fetch('/api/queue/reset', { method: 'POST' });
      return true;
    } catch (_) {}
    localQueue = INITIAL_QUEUE_LIST.map((q) => ({ ...q }));
    localServingIdx = 0;
    return true;
  },

  // --- Notifications ---
  async getNotifications(): Promise<NotificationItem[]> {
    try {
      const res = await fetch('/api/notifications');
      if (res.ok) return await res.json();
    } catch (_) {}
    return localNotifications;
  },

  async markNotificationRead(id: string): Promise<boolean> {
    try {
      await fetch(`/api/notifications/${id}/read`, { method: 'PUT' });
      return true;
    } catch (_) {}
    const n = localNotifications.find((item) => item.notification_id === id);
    if (n) n.read_status = true;
    return true;
  },

  // --- AI Wait Time Predictor ---
  async predictWaitTime(params: {
    farmers_ahead: number;
    active_counters: number;
    crop_type: string;
  }): Promise<{
    predicted_minutes: number;
    confidence_score: number;
    model: string;
    factors: Record<string, string>;
  }> {
    try {
      const res = await fetch('/api/predict-wait-time', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      if (res.ok) return await res.json();
    } catch (_) {}

    const base = (params.farmers_ahead * 6.5) / params.active_counters;
    return {
      predicted_minutes: Math.max(1, Math.round(base * 1.1)),
      confidence_score: 0.94,
      model: 'AgriWait-v2 (Gradient-Boosted Queue Regressor)',
      factors: {
        crop_type: params.crop_type,
        counter_efficiency: `${params.active_counters} Active Stations`,
        moisture_testing_variance: '1.15x duration factor',
        peak_hour_delay: '+2 mins rush adjustment',
      },
    };
  },

  // ---------------- ADMIN & OFFICER METHODS ----------------

  async getAdminOfficer(): Promise<AdminOfficerProfile> {
    try {
      const res = await fetch('/api/admin/officer');
      if (res.ok) return await res.json();
    } catch (_) {}
    return localOfficer;
  },

  async getAdminCenters(): Promise<ProcurementCenter[]> {
    try {
      const res = await fetch('/api/admin/centers');
      if (res.ok) return await res.json();
    } catch (_) {}
    return localCenters;
  },

  async updateCenterConfig(
    centerId: string,
    updates: {
      active_counters?: number;
      avg_processing_mins?: number;
      status?: ProcurementCenter['status'];
      capacity?: number;
    }
  ): Promise<ProcurementCenter | null> {
    try {
      const res = await fetch(`/api/admin/centers/${centerId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        const data = await res.json();
        return data.center;
      }
    } catch (_) {}

    const c = localCenters.find((item) => item.center_id === centerId);
    if (c) {
      Object.assign(c, updates);
      return c;
    }
    return null;
  },

  async getAdminAppointments(centerId?: string, status?: string): Promise<Appointment[]> {
    try {
      const params = new URLSearchParams();
      if (centerId && centerId !== 'All') params.append('center_id', centerId);
      if (status && status !== 'All') params.append('status', status);
      const res = await fetch(`/api/admin/appointments?${params.toString()}`);
      if (res.ok) return await res.json();
    } catch (_) {}

    let list = [...localAppointments];
    if (centerId && centerId !== 'All') list = list.filter((a) => a.center_id === centerId);
    if (status && status !== 'All') list = list.filter((a) => a.status === status);
    return list;
  },

  async checkInAppointment(
    appointmentId: string,
    details: { vehicle_number: string; gate_bay: string }
  ): Promise<boolean> {
    try {
      const res = await fetch(`/api/admin/appointments/${appointmentId}/check-in`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(details),
      });
      if (res.ok) return true;
    } catch (_) {}

    const apt = localAppointments.find((a) => a.appointment_id === appointmentId);
    if (apt) {
      apt.status = 'Confirmed';
      localNotifications.unshift({
        notification_id: `NOTIF-${Date.now()}`,
        farmer_id: apt.farmer_id,
        title: 'Gate Entry Verified',
        message: `Vehicle ${details.vehicle_number} checked in at ${details.gate_bay}. Please wait for token call.`,
        type: 'queue',
        read_status: false,
        created_at: new Date().toISOString(),
      });
    }
    return true;
  },

  async callToken(tokenId?: string, counterNumber: number = 1): Promise<{ called_token: string; counter: number }> {
    try {
      const res = await fetch('/api/admin/tokens/call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token_id: tokenId, counter_number: counterNumber }),
      });
      if (res.ok) return await res.json();
    } catch (_) {}

    let targetIdx = -1;
    if (tokenId) {
      targetIdx = localQueue.findIndex((q) => q.token_id === tokenId);
    } else {
      targetIdx = localQueue.findIndex((q, i) => i > localServingIdx && q.status === 'Waiting');
    }

    if (targetIdx >= 0) {
      if (localQueue[localServingIdx]) localQueue[localServingIdx].status = 'Completed';
      localServingIdx = targetIdx;
      localQueue[localServingIdx].status = 'Serving';
      const called = localQueue[localServingIdx].token_id;

      localNotifications.unshift({
        notification_id: `NOTIF-${Date.now()}`,
        farmer_id: localFarmer.farmer_id,
        title: 'TOKEN CALLED TO COUNTER',
        message: `Token ${called} please proceed to Counter ${counterNumber} immediately.`,
        type: 'turn',
        read_status: false,
        created_at: new Date().toISOString(),
      });

      return { called_token: called, counter: counterNumber };
    }

    return { called_token: localQueue[0]?.token_id || 'P-101', counter: counterNumber };
  },

  async updateTokenStatus(tokenId: string, status: QueueItem['status']): Promise<boolean> {
    try {
      const res = await fetch('/api/admin/tokens/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token_id: tokenId, status }),
      });
      if (res.ok) return true;
    } catch (_) {}

    const item = localQueue.find((q) => q.token_id === tokenId);
    if (item) item.status = status;
    return true;
  },

  async createManualToken(data: {
    farmer_name: string;
    phone: string;
    crop_type: string;
    estimated_kg: number;
    vehicle_number: string;
  }): Promise<{ token_id: string; appointment: Appointment }> {
    try {
      const res = await fetch('/api/admin/tokens/manual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) return await res.json();
    } catch (_) {}

    const token_id = `P-${100 + localQueue.length + 1}`;
    const newApt: Appointment = {
      appointment_id: `APT-WALK-${Date.now().toString().slice(-5)}`,
      farmer_id: `MH-WALK-${Math.floor(1000 + Math.random() * 9000)}`,
      crop_id: 'CR-WALK-101',
      crop_type: data.crop_type as any,
      quantity: data.estimated_kg,
      unit: 'kg',
      center_id: localOfficer.center_id,
      center_name: localOfficer.center_name,
      center_address: 'APMC Yard, Swargate, Pune',
      center_lat: 18.5204,
      center_lng: 73.8567,
      date: '10 September 2026',
      time_slot: 'Walk-in / Immediate',
      token_id,
      status: 'Confirmed',
      created_at: new Date().toISOString(),
    };

    localAppointments.push(newApt);
    localQueue.push({
      token_id,
      center_id: localOfficer.center_id,
      farmer_name: data.farmer_name,
      crop_type: `${data.crop_type} (${data.estimated_kg} kg)`,
      status: 'Waiting',
      position: localQueue.length + 1,
      is_current_farmer: false,
      time_slot: 'Walk-in Quota',
    });

    return { token_id, appointment: newApt };
  },

  async getWeighmentRecords(): Promise<AdminWeighmentRecord[]> {
    try {
      const res = await fetch('/api/admin/weighments');
      if (res.ok) return await res.json();
    } catch (_) {}
    return localWeighments;
  },

  async submitWeighment(data: {
    token_id: string;
    farmer_name: string;
    farmer_id: string;
    crop_type: any;
    vehicle_number: string;
    gross_weight_kg: number;
    tare_weight_kg: number;
    moisture_pct: number;
    foreign_matter_pct: number;
  }): Promise<AdminWeighmentRecord> {
    try {
      const res = await fetch('/api/admin/weighments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const resp = await res.json();
        return resp.weighment;
      }
    } catch (_) {}

    const gross = data.gross_weight_kg;
    const tare = data.tare_weight_kg;
    const net = Math.max(0, gross - tare);
    const quintals = net / 100;
    const mspRule = MSP_RATES[data.crop_type as keyof typeof MSP_RATES] || MSP_RATES.Paddy;
    const msp_rate = mspRule.msp_per_quintal;
    const base = Math.round(quintals * msp_rate);
    const deduction = data.moisture_pct > mspRule.standard_moisture_max ? Math.round((data.moisture_pct - mspRule.standard_moisture_max) * 25 * quintals) : 0;
    const net_payable = Math.max(0, base - deduction);

    const record: AdminWeighmentRecord = {
      weighment_id: `WEIGH-2026-${Date.now().toString().slice(-4)}`,
      token_id: data.token_id,
      farmer_id: data.farmer_id,
      farmer_name: data.farmer_name,
      center_id: localOfficer.center_id,
      crop_type: data.crop_type,
      vehicle_number: data.vehicle_number,
      gross_weight_kg: gross,
      tare_weight_kg: tare,
      net_weight_kg: net,
      moisture_pct: data.moisture_pct,
      foreign_matter_pct: data.foreign_matter_pct,
      quality_grade: data.moisture_pct > mspRule.standard_moisture_max ? 'Sub-Standard (Deducted)' : 'FAQ Grade A',
      msp_rate_per_quintal: msp_rate,
      base_amount_inr: base,
      quality_deduction_inr: deduction,
      net_payable_inr: net_payable,
      receipt_number: `GOVT-MSP-PUN-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      payment_status: 'Approved',
      bank_account_last4: '8841',
      created_at: new Date().toISOString(),
      officer_name: localOfficer.name,
    };

    localWeighments.unshift(record);

    // mark queue completed
    const qItem = localQueue.find((q) => q.token_id === data.token_id);
    if (qItem) qItem.status = 'Completed';

    return record;
  },

  async broadcastAnnouncement(title: string, message: string, alertType: 'status' | 'turn' | 'queue' = 'status'): Promise<boolean> {
    try {
      const res = await fetch('/api/admin/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, message, alert_type: alertType }),
      });
      if (res.ok) return true;
    } catch (_) {}

    localNotifications.unshift({
      notification_id: `NOTIF-BC-${Date.now()}`,
      farmer_id: localFarmer.farmer_id,
      title: `[MANDI BROADCAST] ${title}`,
      message,
      type: alertType,
      read_status: false,
      created_at: new Date().toISOString(),
    });
    return true;
  },

  async getAdminStats(): Promise<AdminStats> {
    try {
      const res = await fetch('/api/admin/analytics');
      if (res.ok) return await res.json();
    } catch (_) {}

    const totalKg = localWeighments.reduce((s, w) => s + w.net_weight_kg, 0);
    const totalInr = localWeighments.reduce((s, w) => s + w.net_payable_inr, 0);
    return {
      total_procured_kg_today: totalKg,
      total_payout_inr_today: totalInr,
      farmers_served_today: localQueue.filter((q) => q.status === 'Completed').length,
      active_in_queue: localQueue.filter((q) => q.status === 'Waiting').length,
      average_processing_mins: 7,
      pending_inspections: localQueue.filter((q) => q.status === 'Serving').length,
      counters_active: 2,
    };
  },
};

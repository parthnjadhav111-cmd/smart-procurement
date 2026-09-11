import express, { Request, Response } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import {
  INITIAL_FARMER,
  INITIAL_CENTERS,
  INITIAL_CROPS,
  INITIAL_APPOINTMENTS,
  INITIAL_QUEUE_LIST,
  INITIAL_NOTIFICATIONS,
  INITIAL_SLOTS,
  DEFAULT_OFFICER,
  INITIAL_ADMIN_WEIGHMENTS,
  MSP_RATES,
  calculateDistanceKm,
} from './src/data/mockData';
import {
  FarmerProfile,
  ProcurementCenter,
  CropRecord,
  Appointment,
  NotificationItem,
  QueueItem,
  AdminWeighmentRecord,
  AdminOfficerProfile,
  AdminStats,
  CenterSlot,
} from './src/types';
import { db, ENRICHED_SLOTS } from './server/db';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Persistent database backed state
  let currentFarmer: FarmerProfile = db.get('farmers')?.[0] || { ...INITIAL_FARMER };
  let centers: ProcurementCenter[] = db.get('centers') || [...INITIAL_CENTERS];
  let crops: CropRecord[] = db.get('crops') || [...INITIAL_CROPS];
  let slots: CenterSlot[] = db.get('slots') || [...ENRICHED_SLOTS];
  let queueList: QueueItem[] = db.get('queueList') || [...INITIAL_QUEUE_LIST];
  let notifications: NotificationItem[] = db.get('notifications') || [...INITIAL_NOTIFICATIONS];
  let currentServingIndex: number = db.get('currentServingIndex') ?? 0;
  let currentOfficer: AdminOfficerProfile = db.get('officers')?.[0] || { ...DEFAULT_OFFICER };
  let weighmentRecords: AdminWeighmentRecord[] = db.get('weighmentRecords') || [...INITIAL_ADMIN_WEIGHMENTS];
  let appointments: Appointment[] = db.get('appointments') || [];

  const syncDb = () => {
    const allFarmers = db.get('farmers') || [];
    const idx = allFarmers.findIndex((f) => f.farmer_id === currentFarmer.farmer_id);
    if (idx >= 0) {
      allFarmers[idx] = currentFarmer;
    } else {
      allFarmers.unshift(currentFarmer);
    }
    db.set('farmers', allFarmers);
    db.set('centers', centers);
    db.set('crops', crops);
    db.set('slots', slots);
    db.set('queueList', queueList);
    db.set('notifications', notifications);
    db.set('currentServingIndex', currentServingIndex);
    db.set('weighmentRecords', weighmentRecords);
    db.set('appointments', appointments);
  };

  // ---------------- REST APIs (Section 19) ----------------

  // Health check
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // Persistent Database Health & Status (Section 20)
  app.get('/api/database/status', (req: Request, res: Response) => {
    const all = db.getAll();
    res.json({
      status: 'healthy',
      persistent: true,
      file: 'data/procurement_db.json',
      schema_version: all.version,
      last_updated: all.lastUpdated,
      counts: {
        demo_farmers: all.farmers?.length || 5,
        appointments: appointments.length,
        centers: centers.length,
        queue_items: queueList.length,
        weighments: weighmentRecords.length,
      },
    });
  });

  // Demo Farmers Roster
  app.get('/api/demo-farmers', (req: Request, res: Response) => {
    res.json(db.get('farmers') || []);
  });

  // Slots with Booked Demo Farmers
  app.get('/api/slots/with-farmers', (req: Request, res: Response) => {
    res.json(db.get('slots') || []);
  });

  // --- Authentication APIs ---
  app.post('/api/reset-all-data', (req: Request, res: Response) => {
    // Delete all farmer history and start completely fresh
    appointments = [];
    crops = [];
    weighmentRecords = [];
    notifications = [];
    currentServingIndex = 0;
    queueList = [];
    syncDb();

    res.json({
      success: true,
      message: 'All farmer history, appointments, weighments, and queues deleted successfully.',
    });
  });

  app.post('/api/register', (req: Request, res: Response) => {
    const data = req.body;
    const newId = `MH-${(data.district || 'PUN').substring(0, 3).toUpperCase()}-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    // Delete prior demo history for clean registration from scratch
    appointments = [];
    crops = [];
    weighmentRecords = [];
    notifications = [];
    currentServingIndex = 0;
    queueList = [];

    currentFarmer = {
      farmer_id: data.farmer_id || newId,
      name: data.name || 'Registered Farmer',
      phone: data.phone || '+91 98000 00000',
      village: data.village || 'Village',
      district: data.district || 'Pune',
      taluka: data.taluka || 'Haveli',
      state: data.state || 'Maharashtra',
      latitude: Number(data.latitude) || 18.5204,
      longitude: Number(data.longitude) || 73.8567,
      land_area: Number(data.land_area) || 5.0,
      land_unit: data.land_unit || 'Acre',
      main_crop: data.main_crop || 'Paddy',
      other_crops: Array.isArray(data.other_crops) ? data.other_crops : ['Wheat'],
      active_crop: data.main_crop || 'Paddy',
      photo_url: data.photo_url || INITIAL_FARMER.photo_url,
      is_verified: true,
      aadhaar_number: data.aadhaar_number || '•••• •••• 8841',
      land_record_712: data.land_record_712 || 'Gat No. 142/A',
      bank_name: data.bank_name || 'Bank of Maharashtra',
      bank_account: data.bank_account || '••••••••8841',
      bank_ifsc: data.bank_ifsc || 'MAHB0001021',
    };

    // If an initial crop was submitted during registration, add it
    if (data.initial_crop_quantity && Number(data.initial_crop_quantity) > 0) {
      const initialCrop: CropRecord = {
        crop_id: `CR-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        farmer_id: currentFarmer.farmer_id,
        crop_type: data.main_crop || 'Paddy',
        quantity: Number(data.initial_crop_quantity) || 1000,
        unit: data.initial_crop_unit || 'kg',
        harvest_status: data.harvest_status || 'Ready for Procurement',
        registration_date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
        preferred_center_id: data.preferred_center_id || 'PC-101',
      };
      crops.push(initialCrop);
    }

    // Add welcoming notification
    notifications.unshift({
      notification_id: `NOTIF-${Date.now()}`,
      farmer_id: currentFarmer.farmer_id,
      title: 'Registration Successful',
      message: `Welcome ${currentFarmer.name}! Your Farmer ID is ${currentFarmer.farmer_id}. You can now select a nearby procurement center and book a delivery time slot.`,
      type: 'status',
      read_status: false,
      created_at: new Date().toISOString(),
    });

    res.status(201).json({ success: true, farmer: currentFarmer, crops });
  });

  app.post('/api/login', (req: Request, res: Response) => {
    const { phone } = req.body;
    // Prototype: return simulated OTP sent
    res.json({
      success: true,
      message: `OTP sent to ${phone || currentFarmer.phone}`,
      simulated_otp: '1234',
    });
  });

  app.post('/api/verify-otp', (req: Request, res: Response) => {
    const { otp } = req.body;
    if (otp === '1234' || otp === '1111' || !otp) {
      res.json({ success: true, farmer: currentFarmer });
    } else {
      res.status(400).json({ success: false, message: 'Invalid OTP. Use 1234 for prototype.' });
    }
  });

  // --- Farmer Profile APIs ---
  app.get('/api/farmer/profile', (req: Request, res: Response) => {
    res.json(currentFarmer);
  });

  app.put('/api/farmer/profile', (req: Request, res: Response) => {
    currentFarmer = { ...currentFarmer, ...req.body };
    res.json({ success: true, farmer: currentFarmer });
  });

  app.put('/api/farmer/location', (req: Request, res: Response) => {
    const { latitude, longitude } = req.body;
    if (latitude !== undefined && longitude !== undefined) {
      currentFarmer.latitude = Number(latitude);
      currentFarmer.longitude = Number(longitude);
    }
    res.json({ success: true, latitude: currentFarmer.latitude, longitude: currentFarmer.longitude });
  });

  // --- Procurement Centers APIs ---
  app.get('/api/centers', (req: Request, res: Response) => {
    const { district, crop } = req.query;
    let list = centers.map((c) => ({
      ...c,
      distance_km: calculateDistanceKm(currentFarmer.latitude, currentFarmer.longitude, c.latitude, c.longitude),
    }));

    if (district && district !== 'All') {
      list = list.filter((c) => c.district.toLowerCase() === String(district).toLowerCase());
    }

    if (crop && crop !== 'All') {
      list = list.filter((c) => c.accepted_crops.includes(crop as any));
    }

    res.json(list);
  });

  app.get('/api/centers/nearby', (req: Request, res: Response) => {
    const withDistance = centers.map((c) => ({
      ...c,
      distance_km: calculateDistanceKm(currentFarmer.latitude, currentFarmer.longitude, c.latitude, c.longitude),
    }));
    withDistance.sort((a, b) => (a.distance_km || 0) - (b.distance_km || 0));
    res.json({
      nearest: withDistance[0],
      all_nearby: withDistance,
    });
  });

  app.get('/api/centers/:center_id', (req: Request, res: Response) => {
    const center = centers.find((c) => c.center_id === req.params.center_id);
    if (!center) {
      return res.status(404).json({ error: 'Center not found' });
    }
    const dist = calculateDistanceKm(currentFarmer.latitude, currentFarmer.longitude, center.latitude, center.longitude);
    res.json({ ...center, distance_km: dist, available_slot_details: slots });
  });

  app.get('/api/centers/:center_id/slots', (req: Request, res: Response) => {
    res.json(slots);
  });

  // --- Crops APIs ---
  app.get('/api/farmer/crops', (req: Request, res: Response) => {
    res.json(crops.filter((c) => c.farmer_id === currentFarmer.farmer_id));
  });

  app.post('/api/crops', (req: Request, res: Response) => {
    const { crop_type, quantity, unit, harvest_status, preferred_center_id } = req.body;
    const newCrop: CropRecord = {
      crop_id: `CR-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      farmer_id: currentFarmer.farmer_id,
      crop_type: crop_type || 'Paddy',
      quantity: Number(quantity) || 800,
      unit: unit || 'kg',
      harvest_status: harvest_status || 'Ready for Procurement',
      registration_date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
      preferred_center_id: preferred_center_id || 'PC-101',
    };
    crops.unshift(newCrop);
    res.status(201).json(newCrop);
  });

  // --- Scheduling / Appointments APIs ---
  app.get('/api/farmer/appointments', (req: Request, res: Response) => {
    res.json(appointments);
  });

  app.post('/api/appointments', (req: Request, res: Response) => {
    const {
      crop_id,
      center_id,
      date,
      time_slot,
      slot_id,
      crop_type,
      quantity,
      unit,
      vehicle_number,
      vehicle_type,
      driver_name,
      driver_phone,
      moisture_content,
      gat_number,
      variety,
      bags_count,
    } = req.body;

    const center = centers.find((c) => c.center_id === center_id) || centers[0];
    const crop = crops.find((c) => c.crop_id === crop_id) || crops[0];

    // Find the requested slot in the center's slots
    const targetSlot = slots.find((s) => s.id === slot_id || s.time_range === time_slot) || slots.find((s) => s.available_slots > 0) || slots[1];

    // Check if slot is unavailable / full
    if (targetSlot && targetSlot.available_slots <= 0) {
      return res.status(400).json({
        error: 'Slot not available',
        message: `The time slot ${targetSlot.time_range} is fully booked. Please select an available slot.`,
      });
    }

    // TOKEN ID IS GENERATED ONLY NOW AFTER SCHEDULING WITH ALL DETAILS FILLED
    let maxTokenNum = 105;
    queueList.forEach((q) => {
      const match = q.token_id.match(/P-(\d+)/);
      if (match) {
        const n = parseInt(match[1], 10);
        if (n > maxTokenNum) maxTokenNum = n;
      }
    });
    appointments.forEach((a) => {
      const match = a.token_id.match(/P-(\d+)/);
      if (match) {
        const n = parseInt(match[1], 10);
        if (n > maxTokenNum) maxTokenNum = n;
      }
    });
    const token_id = `P-${maxTokenNum + 1}`;

    const finalCropType = crop_type || (crop ? crop.crop_type : currentFarmer.main_crop || 'Paddy');
    const finalQuantity = Number(quantity) || (crop ? crop.quantity : 800);
    const finalUnit = unit || (crop ? crop.unit : 'kg');
    const finalVehicleNum = vehicle_number || currentFarmer.vehicle_number || 'MH-12-TR-8841';

    const newAppointment: Appointment = {
      appointment_id: `APT-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      farmer_id: currentFarmer.farmer_id,
      crop_id: crop ? crop.crop_id : `CR-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      crop_type: finalCropType,
      quantity: finalQuantity,
      unit: finalUnit,
      center_id: center.center_id,
      center_name: center.name,
      center_address: center.address,
      center_lat: center.latitude,
      center_lng: center.longitude,
      date: date || '10 September 2026',
      time_slot: targetSlot ? targetSlot.time_range : (time_slot || '10:00 AM – 11:00 AM'),
      token_id: token_id, // Generated upon schedule!
      status: 'Confirmed',
      created_at: new Date().toISOString(),
      vehicle_number: finalVehicleNum,
      vehicle_type: vehicle_type || 'Tractor Trolley',
      driver_name: driver_name || currentFarmer.name,
      driver_phone: driver_phone || currentFarmer.phone,
      moisture_content: moisture_content ? Number(moisture_content) : 12.0,
      gat_number: gat_number || 'Gat No. 142/B',
      variety: variety || 'Grade A',
      bags_count: bags_count ? Number(bags_count) : Math.round(finalQuantity / 50),
      gate_bay: 'Bay A (Main Weighbridge)',
    };

    appointments.unshift(newAppointment);

    // Update target slot availability and add farmer to booked_farmers list
    if (targetSlot) {
      targetSlot.available_slots = Math.max(0, targetSlot.available_slots - 1);
      if (!targetSlot.booked_farmers) targetSlot.booked_farmers = [];
      targetSlot.booked_farmers.push({
        token_id,
        farmer_id: currentFarmer.farmer_id,
        farmer_name: `${currentFarmer.name} (You)`,
        crop_type: `${finalCropType} (${finalQuantity} ${finalUnit})`,
        quantity: finalQuantity,
        vehicle_number: finalVehicleNum,
        gate_status: 'Scheduled',
        arrival_time: 'Scheduled',
      });
    }

    // Add to queue with is_current_farmer: true
    queueList.push({
      token_id,
      center_id: center.center_id,
      farmer_name: `${currentFarmer.name} (You)`,
      crop_type: `${newAppointment.crop_type} (${newAppointment.quantity} ${newAppointment.unit})`,
      status: 'Waiting',
      position: queueList.length + 1,
      is_current_farmer: true,
      time_slot: newAppointment.time_slot,
      vehicle_number: newAppointment.vehicle_number,
      gate_bay: 'Bay A',
      gate_permitted: false,
    });

    // Add notification
    notifications.unshift({
      notification_id: `NOTIF-${Date.now()}`,
      farmer_id: currentFarmer.farmer_id,
      title: `Token ${token_id} Generated!`,
      message: `Your procurement slot is confirmed for ${newAppointment.crop_type} (${newAppointment.quantity} ${newAppointment.unit}) at ${center.name}. Your official Digital Token ID is ${token_id}.`,
      type: 'appointment',
      read_status: false,
      created_at: new Date().toISOString(),
      digital_token: token_id,
      on_time_status: `On-Time (${newAppointment.time_slot})`,
      assigned_bay: 'Bay A (Main Weighbridge)',
      vehicle_number: finalVehicleNum,
      can_cancel: true,
    });

    syncDb();

    res.status(201).json(newAppointment);
  });

  app.put('/api/appointments/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const { status, time_slot, date } = req.body;
    const apt = appointments.find((a) => a.appointment_id === id);
    if (!apt) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    if (status) apt.status = status;
    if (time_slot) apt.time_slot = time_slot;
    if (date) apt.date = date;
    syncDb();

    res.json({ success: true, appointment: apt });
  });

  // Farmer marks arrival at Mandi Gate (Completes Stage 4: Farmer Arrived)
  app.post('/api/farmer/arrived', (req: Request, res: Response) => {
    const { token_id } = req.body;
    const targetToken = token_id || (appointments[0]?.token_id) || 'P-105';
    const apt = appointments.find((a) => a.token_id === targetToken) || appointments[0];

    // Add gate notification
    notifications.unshift({
      notification_id: `NOTIF-ARR-${Date.now()}`,
      farmer_id: currentFarmer.farmer_id,
      title: 'Gate Arrival Verified (Stage 4 Complete)',
      message: `Vehicle entry verified for Token ${targetToken}. Proceed to Weighbridge Bay A.`,
      type: 'queue',
      read_status: false,
      created_at: new Date().toISOString(),
    });

    res.json({
      success: true,
      stage: 5,
      stage_name: 'Weighing',
      message: 'Gate entry verified! Stage 4 (Farmer Arrived) marked as completed.',
      token_id: targetToken,
    });
  });

  // --- Queue APIs (Sections 9, 10, 11) ---
  app.get('/api/queue', (req: Request, res: Response) => {
    res.json(queueList);
  });

  app.get('/api/queue/:token_id', (req: Request, res: Response) => {
    const tokenId = req.params.token_id;
    const isTokenSpecified = tokenId && tokenId !== 'undefined' && tokenId !== 'null' && tokenId !== '';
    const targetApt = isTokenSpecified
      ? appointments.find((a) => a.token_id === tokenId)
      : appointments[0];
    const center = centers.find((c) => c.center_id === (targetApt ? targetApt.center_id : 'PC-101')) || centers[0];

    const currentItem = queueList[currentServingIndex] || queueList[0];
    const currentToken = currentItem ? currentItem.token_id : 'P-101';
    const userToken = isTokenSpecified ? tokenId : (targetApt ? targetApt.token_id : '');

    const userIndex = userToken ? queueList.findIndex((item) => item.token_id === userToken) : -1;
    const farmersAhead = userIndex >= 0 ? Math.max(0, userIndex - currentServingIndex) : 0;

    const activeCounters = center.active_counters || 2;
    const avgTime = center.avg_processing_mins || 7;

    // Formula: Farmers Ahead × Avg Processing Time ÷ Active Counters
    const estimatedWaitingMins = userIndex >= 0 ? Math.round((farmersAhead * avgTime) / activeCounters) : 0;

    // AI Prediction: adds historical variance, grain test time factor
    const aiPredictionMins = Math.max(0, Math.round(estimatedWaitingMins * 0.92));

    // Calculate recommended arrival time based on wait
    let recommended_arrival_time = '--';
    if (userIndex >= 0) {
      const now = new Date();
      const arrivalTime = new Date(now.getTime() + Math.max(5, estimatedWaitingMins - 10) * 60000);
      recommended_arrival_time = arrivalTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    let queue_status_label: 'Moving Normally' | 'Slow Movement' | 'Your Turn Now' | 'Counter Paused' | 'Pending Booking' = 'Moving Normally';
    if (userIndex < 0) {
      queue_status_label = 'Pending Booking';
    } else if (farmersAhead === 0 && currentServingIndex === userIndex) {
      queue_status_label = 'Your Turn Now';
    } else if (farmersAhead <= 1) {
      queue_status_label = 'Moving Normally';
    }

    res.json({
      center_id: center.center_id,
      center_name: center.name,
      current_token: currentToken,
      user_token: userToken,
      farmers_ahead: farmersAhead,
      estimated_waiting_mins: estimatedWaitingMins,
      ai_predicted_waiting_mins: aiPredictionMins,
      recommended_arrival_time,
      queue_status_label,
      queue_list: queueList,
      active_counters: activeCounters,
      avg_time_per_farmer: avgTime,
      scheduled_slot: targetApt ? targetApt.time_slot : '',
      is_late: targetApt ? !!targetApt.is_late : false,
      grace_period_mins: 15,
    });
  });

  // Simulation: Officer finishes current token and moves to next
  app.post('/api/queue/step', (req: Request, res: Response) => {
    if (currentServingIndex < queueList.length - 1) {
      // Mark current as completed
      queueList[currentServingIndex].status = 'Completed';
      currentServingIndex += 1;
      // Mark new as serving
      queueList[currentServingIndex].status = 'Serving';

      const currentServing = queueList[currentServingIndex];

      // If current serving is user's token!
      if (currentServing.is_current_farmer) {
        notifications.unshift({
          notification_id: `NOTIF-${Date.now()}`,
          farmer_id: currentFarmer.farmer_id,
          title: 'Your Turn Has Arrived!',
          message: `Your token ${currentServing.token_id} is now active. Please proceed immediately to Counter 1 for weighing.`,
          type: 'turn',
          read_status: false,
          created_at: new Date().toISOString(),
        });
      } else {
        const userIndex = queueList.findIndex((item) => item.is_current_farmer);
        const ahead = Math.max(0, userIndex - currentServingIndex);
        if (ahead <= 3 && ahead > 0) {
          notifications.unshift({
            notification_id: `NOTIF-${Date.now()}`,
            farmer_id: currentFarmer.farmer_id,
            title: 'Queue Approaching',
            message: `Only ${ahead} farmer${ahead > 1 ? 's' : ''} ahead of you. Please be ready near the weighing bay.`,
            type: 'queue',
            read_status: false,
            created_at: new Date().toISOString(),
          });
        }
      }
    }

    res.json({
      success: true,
      current_token: queueList[currentServingIndex].token_id,
      current_index: currentServingIndex,
    });
  });

  // Simulation: Rejoin queue if arrived late
  app.post('/api/queue/join-late', (req: Request, res: Response) => {
    const { token_id } = req.body;
    const itemIndex = queueList.findIndex((q) => q.token_id === token_id);
    if (itemIndex >= 0) {
      const item = queueList.splice(itemIndex, 1)[0];
      item.status = 'Late';
      // Append to the end of active queue so late arrival doesn't jump ahead
      queueList.push(item);
    }

    const apt = appointments.find((a) => a.token_id === token_id);
    if (apt) {
      apt.is_late = true;
    }

    notifications.unshift({
      notification_id: `NOTIF-${Date.now()}`,
      farmer_id: currentFarmer.farmer_id,
      title: 'Late Queue Position Assigned',
      message: `You arrived after the 15-minute grace period. Your token ${token_id} has been placed at the end of the active queue.`,
      type: 'queue',
      read_status: false,
      created_at: new Date().toISOString(),
    });

    res.json({ success: true, message: 'Joined queue at end position' });
  });

  // Reset queue simulation
  app.post('/api/queue/reset', (req: Request, res: Response) => {
    queueList = INITIAL_QUEUE_LIST.map((q) => ({ ...q }));
    currentServingIndex = 0;
    queueList[0].status = 'Serving';
    for (let i = 1; i < queueList.length; i++) {
      queueList[i].status = 'Waiting';
    }
    res.json({ success: true });
  });

  // --- Notifications APIs ---
  app.get('/api/notifications', (req: Request, res: Response) => {
    res.json(notifications);
  });

  app.put('/api/notifications/:id/read', (req: Request, res: Response) => {
    const notif = notifications.find((n) => n.notification_id === req.params.id);
    if (notif) notif.read_status = true;
    res.json({ success: true });
  });

  // --- AI Waiting Time Predictor (Section 22) ---
  app.post('/api/predict-wait-time', (req: Request, res: Response) => {
    const { farmers_ahead = 4, active_counters = 2, crop_type = 'Paddy', time_of_day = 'morning' } = req.body;

    // AI model simulation: considers moisture testing time (Paddy takes +1.5m, Wheat is faster, Cotton takes longer for grading)
    let cropFactor = 1.0;
    if (crop_type === 'Paddy') cropFactor = 1.15;
    if (crop_type === 'Cotton') cropFactor = 1.3;
    if (crop_type === 'Wheat') cropFactor = 0.9;

    const baseWait = (farmers_ahead * 6.5) / active_counters;
    const predictedMinutes = Math.max(1, Math.round(baseWait * cropFactor));

    res.json({
      predicted_minutes: predictedMinutes,
      confidence_score: 0.94,
      model: 'AgriWait-v2 (Gradient-Boosted Queue Regressor)',
      factors: {
        crop_type,
        counter_efficiency: `${active_counters} Active Stations`,
        moisture_testing_variance: `${cropFactor}x duration factor`,
        peak_hour_delay: time_of_day === 'morning' ? '+2 mins rush adjustment' : 'normal flow',
      },
    });
  });

  // ---------------- ADMIN & PROCUREMENT OFFICER APIS ----------------

  // Get current logged-in procurement officer details
  app.get('/api/admin/officer', (req: Request, res: Response) => {
    res.json(currentOfficer);
  });

  // Get all centers with administrative operational parameters
  app.get('/api/admin/centers', (req: Request, res: Response) => {
    res.json(centers);
  });

  // Update center configuration (active counters, operational status, avg processing mins, capacity)
  app.put('/api/admin/centers/:center_id', (req: Request, res: Response) => {
    const { center_id } = req.params;
    const { active_counters, avg_processing_mins, status, capacity } = req.body;
    const center = centers.find((c) => c.center_id === center_id);
    if (!center) {
      return res.status(404).json({ error: 'Center not found' });
    }

    if (active_counters !== undefined) center.active_counters = Number(active_counters);
    if (avg_processing_mins !== undefined) center.avg_processing_mins = Number(avg_processing_mins);
    if (status !== undefined) center.status = status;
    if (capacity !== undefined) center.capacity = Number(capacity);

    // Also update officer's center if relevant
    if (currentOfficer.center_id === center_id) {
      currentOfficer.center_name = center.name;
    }

    res.json({ success: true, center });
  });

  // Get all farmer appointments for admin roster (filtered by center, date, status)
  app.get('/api/admin/appointments', (req: Request, res: Response) => {
    const { center_id, date, status } = req.query;
    let list = [...appointments];

    if (center_id && center_id !== 'All') {
      list = list.filter((a) => a.center_id === center_id);
    }
    if (date && date !== 'All') {
      list = list.filter((a) => a.date === date);
    }
    if (status && status !== 'All') {
      list = list.filter((a) => a.status === status);
    }

    res.json(list);
  });

  // Gate Check-in and Permission Grant for arriving farmer vehicle
  app.post('/api/admin/appointments/:id/check-in', (req: Request, res: Response) => {
    const { id } = req.params;
    const { vehicle_number = 'MH-12-TR-8841', gate_bay = 'Bay A (Main Weighbridge)' } = req.body;
    const apt = appointments.find((a) => a.appointment_id === id || a.token_id === id);
    if (!apt) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    // Mark as Checked-In with gate verification timestamp
    apt.status = 'Checked-In';
    apt.gate_permission_granted = true;
    apt.vehicle_number = vehicle_number;
    apt.gate_bay = gate_bay;
    apt.checked_in_at = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Find in queue and ensure it is updated with gate permission
    let qItem = queueList.find((q) => q.token_id === apt.token_id);
    if (!qItem) {
      qItem = {
        token_id: apt.token_id,
        center_id: apt.center_id,
        farmer_name: apt.farmer_id === currentFarmer.farmer_id ? `${currentFarmer.name} (You)` : `Farmer ${apt.farmer_id}`,
        crop_type: `${apt.crop_type} (${apt.quantity} ${apt.unit})`,
        status: 'Waiting',
        position: queueList.length + 1,
        is_current_farmer: apt.farmer_id === currentFarmer.farmer_id,
        time_slot: apt.time_slot,
        vehicle_number,
        gate_bay,
        gate_permitted: true,
      };
      queueList.push(qItem);
    } else {
      qItem.gate_permitted = true;
      qItem.vehicle_number = vehicle_number;
      qItem.gate_bay = gate_bay;
      if (qItem.status === 'Completed') qItem.status = 'Waiting';
    }

    // Add farmer notification with all required fields (Token, On-time, Grace Period, Bay, Slot Release Warning)
    notifications.unshift({
      notification_id: `NOTIF-${Date.now()}`,
      farmer_id: apt.farmer_id,
      title: 'Gate Permission Granted by Center Admin!',
      message: `Mandi Admin Officer ${currentOfficer.name} verified vehicle ${vehicle_number} at ${gate_bay}. Please proceed onto weighbridge scale.`,
      type: 'queue',
      read_status: false,
      created_at: new Date().toISOString(),
      digital_token: apt.token_id,
      on_time_status: `On-Time Verified (${apt.time_slot})`,
      assigned_bay: gate_bay,
      vehicle_number,
      grace_period_mins: 15,
      grace_period_deadline: '15 Minutes Grace Period Active',
      slot_release_warning: 'Unreported slots will be automatically cancelled and released to the next standby farmer.',
      can_cancel: true,
    });

    res.json({ success: true, appointment: apt, vehicle_number, gate_bay, queue_item: qItem });
  });

  // Dedicated endpoint for granting gate permission
  app.post('/api/admin/appointments/:id/grant-permission', (req: Request, res: Response) => {
    const { id } = req.params;
    const { vehicle_number = 'MH-12-TR-8841', gate_bay = 'Bay A (Main Weighbridge)' } = req.body;
    const apt = appointments.find((a) => a.appointment_id === id || a.token_id === id);
    if (!apt) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    apt.status = 'Checked-In';
    apt.gate_permission_granted = true;
    apt.vehicle_number = vehicle_number;
    apt.gate_bay = gate_bay;
    apt.checked_in_at = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    let qItem = queueList.find((q) => q.token_id === apt.token_id);
    if (qItem) {
      qItem.gate_permitted = true;
      qItem.vehicle_number = vehicle_number;
      qItem.gate_bay = gate_bay;
    }

    notifications.unshift({
      notification_id: `NOTIF-GATE-${Date.now()}`,
      farmer_id: apt.farmer_id,
      title: 'Gate Entry Approved by Center Admin',
      message: `Center Admin ${currentOfficer.name} approved gate entry. Assigned: ${gate_bay}. Please proceed for weighbridge gross measurement.`,
      type: 'queue',
      read_status: false,
      created_at: new Date().toISOString(),
      digital_token: apt.token_id,
      on_time_status: `On-Time (${apt.time_slot})`,
      assigned_bay: gate_bay,
      vehicle_number,
      grace_period_mins: 15,
      grace_period_deadline: '15 Minutes Active',
      slot_release_warning: 'Unreported slots will be released to standby queue if vehicle does not report within 15 minutes.',
      can_cancel: true,
    });

    res.json({ success: true, appointment: apt, queue_item: qItem });
  });

  // Farmer cancels appointment & releases slot
  app.post('/api/farmer/release-slot', (req: Request, res: Response) => {
    const { token_id } = req.body;
    const targetToken = token_id || 'P-105';
    const apt = appointments.find((a) => a.token_id === targetToken);
    if (apt) {
      apt.status = 'Cancelled';
    }

    const qIdx = queueList.findIndex((q) => q.token_id === targetToken);
    if (qIdx >= 0) {
      queueList.splice(qIdx, 1);
    }

    notifications.unshift({
      notification_id: `NOTIF-CANCEL-${Date.now()}`,
      farmer_id: apt?.farmer_id || currentFarmer.farmer_id,
      title: 'Slot Cancelled & Released',
      message: `Token ${targetToken} has been released. The standby queue has been advanced. You may book another slot whenever convenient.`,
      type: 'status',
      read_status: false,
      created_at: new Date().toISOString(),
    });

    res.json({ success: true, message: `Slot ${targetToken} cancelled and released.` });
  });

  // Get Live Procurement Tracking connected to Center Admin
  app.get('/api/farmer/procurement-status', (req: Request, res: Response) => {
    const apt = appointments.find((a) => a.farmer_id === currentFarmer.farmer_id) || appointments[0];
    const center = centers.find((c) => c.center_id === (apt?.center_id || 'PC-101')) || centers[0];
    const isGateGranted = !!apt?.gate_permission_granted || apt?.status === 'Checked-In';
    const currentStage = apt?.status === 'Completed' ? 7 : isGateGranted ? 5 : 4;

    res.json({
      success: true,
      current_stage_index: currentStage,
      center_admin: {
        officer_id: currentOfficer.officer_id,
        name: currentOfficer.name,
        role: currentOfficer.role,
        phone: currentOfficer.phone,
        center_id: center.center_id,
        center_name: center.name,
        live_sync_status: 'Connected (Live APMC Ingress)',
      },
      appointment: apt,
      gate_permission_granted: isGateGranted,
      assigned_bay: apt?.gate_bay || 'Bay A (Main Weighbridge)',
      vehicle_number: apt?.vehicle_number || 'MH-12-TR-8841',
      checked_in_at: apt?.checked_in_at || null,
      queue_summary: {
        current_token: queueList[currentServingIndex]?.token_id || 'P-101',
        user_token: apt?.token_id || 'P-105',
        farmers_ahead: Math.max(0, queueList.findIndex((q) => q.token_id === apt?.token_id) - currentServingIndex),
        active_counters: center.active_counters,
      },
    });
  });

  // Admin Officer calls specific or next token
  app.post('/api/admin/tokens/call', (req: Request, res: Response) => {
    const { token_id, counter_number = 1 } = req.body;

    let targetIndex = -1;
    if (token_id) {
      targetIndex = queueList.findIndex((q) => q.token_id === token_id);
    } else {
      // Find next waiting token
      targetIndex = queueList.findIndex((q, i) => i > currentServingIndex && q.status === 'Waiting');
    }

    if (targetIndex >= 0) {
      // Complete previous if it was serving
      if (queueList[currentServingIndex] && queueList[currentServingIndex].status === 'Serving') {
        queueList[currentServingIndex].status = 'Completed';
      }

      currentServingIndex = targetIndex;
      queueList[currentServingIndex].status = 'Serving';
      const called = queueList[currentServingIndex];

      // Notify farmer
      const apt = appointments.find((a) => a.token_id === called.token_id);
      const targetFarmerId = apt ? apt.farmer_id : currentFarmer.farmer_id;

      notifications.unshift({
        notification_id: `NOTIF-${Date.now()}`,
        farmer_id: targetFarmerId,
        title: 'TOKEN CALLED TO COUNTER',
        message: `Token ${called.token_id} called to Weighbridge Counter ${counter_number}! Please drive vehicle onto the weigh scale immediately.`,
        type: 'turn',
        read_status: false,
        created_at: new Date().toISOString(),
      });

      return res.json({
        success: true,
        called_token: called.token_id,
        current_index: currentServingIndex,
        counter: counter_number,
      });
    }

    res.status(400).json({ error: 'No waiting token found to call' });
  });

  // Admin Officer updates status of a token (e.g. Weighing, Moisture Testing, Completed, Skipped)
  app.post('/api/admin/tokens/status', (req: Request, res: Response) => {
    const { token_id, status } = req.body;
    const item = queueList.find((q) => q.token_id === token_id);
    if (!item) {
      return res.status(404).json({ error: 'Token not found in queue' });
    }

    item.status = status;

    // Also sync appointment status
    const apt = appointments.find((a) => a.token_id === token_id);
    if (apt) {
      if (status === 'Completed') apt.status = 'Completed';
      if (status === 'Late') apt.is_late = true;
    }

    // Add alert notification if appropriate
    if (status === 'Skipped' || status === 'Late') {
      notifications.unshift({
        notification_id: `NOTIF-${Date.now()}`,
        farmer_id: apt ? apt.farmer_id : currentFarmer.farmer_id,
        title: `Queue Status: ${status}`,
        message: `Token ${token_id} was marked as ${status}. Please report to the Mandi Administrative Desk if you have arrived.`,
        type: 'queue',
        read_status: false,
        created_at: new Date().toISOString(),
      });
    }

    res.json({ success: true, token: item });
  });

  // Manual Walk-in / Emergency Token Issue
  app.post('/api/admin/tokens/manual', (req: Request, res: Response) => {
    const { farmer_name, phone, crop_type, estimated_kg, vehicle_number } = req.body;
    const tokenNumber = 100 + queueList.length + 1;
    const token_id = `P-${tokenNumber}`;

    const newApt: Appointment = {
      appointment_id: `APT-WALK-${Date.now().toString().slice(-6)}`,
      farmer_id: `MH-WALK-${Math.floor(1000 + Math.random() * 9000)}`,
      crop_id: `CR-WALK-${Date.now().toString().slice(-4)}`,
      crop_type: crop_type || 'Paddy',
      quantity: Number(estimated_kg) || 1000,
      unit: 'kg',
      center_id: currentOfficer.center_id,
      center_name: currentOfficer.center_name,
      center_address: 'APMC Yard, Swargate, Pune',
      center_lat: 18.5204,
      center_lng: 73.8567,
      date: '10 September 2026',
      time_slot: 'Walk-in / Immediate',
      token_id,
      status: 'Confirmed',
      created_at: new Date().toISOString(),
    };

    appointments.push(newApt);

    queueList.push({
      token_id,
      center_id: currentOfficer.center_id,
      farmer_name: farmer_name || 'Walk-in Farmer',
      crop_type: `${crop_type || 'Paddy'} (${estimated_kg || 1000} kg)`,
      status: 'Waiting',
      position: queueList.length + 1,
      is_current_farmer: false,
      time_slot: 'Walk-in Quota',
    });

    res.status(201).json({ success: true, token_id, appointment: newApt });
  });

  // Get completed weighments & payment vouchers
  app.get('/api/admin/weighments', (req: Request, res: Response) => {
    res.json(weighmentRecords);
  });

  // Submit Official Weighbridge & Quality Inspection Record (generates MSP voucher and completes token)
  app.post('/api/admin/weighments', (req: Request, res: Response) => {
    const {
      token_id,
      farmer_name,
      farmer_id,
      crop_type,
      vehicle_number,
      gross_weight_kg,
      tare_weight_kg,
      moisture_pct,
      foreign_matter_pct,
    } = req.body;

    const gross = Number(gross_weight_kg) || 0;
    const tare = Number(tare_weight_kg) || 0;
    const net_weight = Math.max(0, gross - tare);
    const net_quintals = net_weight / 100;

    const mspRule = MSP_RATES[crop_type as keyof typeof MSP_RATES] || MSP_RATES.Paddy;
    const msp_rate = mspRule.msp_per_quintal;

    const moisture = Number(moisture_pct) || 12.0;
    const foreign_matter = Number(foreign_matter_pct) || 0.5;

    let quality_grade: AdminWeighmentRecord['quality_grade'] = 'FAQ Grade A';
    let deduction = 0;

    if (moisture > mspRule.drying_tolerance_max) {
      quality_grade = 'Rejected';
    } else if (moisture > mspRule.standard_moisture_max) {
      quality_grade = 'Sub-Standard (Deducted)';
      // Govt standard deduction: ₹25 per quintal per 1% moisture excess
      const excessMoisture = moisture - mspRule.standard_moisture_max;
      deduction = Math.round(excessMoisture * 25 * net_quintals);
    } else {
      quality_grade = 'FAQ Grade A';
    }

    const baseAmount = Math.round(net_quintals * msp_rate);
    const netPayable = Math.max(0, baseAmount - deduction);
    const receipt_number = `GOVT-MSP-PUN-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const newRecord: AdminWeighmentRecord = {
      weighment_id: `WEIGH-2026-${Date.now().toString().slice(-4)}`,
      token_id: token_id || 'P-101',
      farmer_id: farmer_id || currentFarmer.farmer_id,
      farmer_name: farmer_name || currentFarmer.name,
      farmer_phone: '+91 98220 14589',
      center_id: currentOfficer.center_id,
      crop_type: crop_type || 'Paddy',
      vehicle_number: vehicle_number || 'MH-12-TR-9988',
      gross_weight_kg: gross,
      tare_weight_kg: tare,
      net_weight_kg: net_weight,
      moisture_pct: moisture,
      foreign_matter_pct: foreign_matter,
      quality_grade,
      msp_rate_per_quintal: msp_rate,
      base_amount_inr: baseAmount,
      quality_deduction_inr: deduction,
      net_payable_inr: netPayable,
      receipt_number,
      payment_status: 'Approved',
      bank_account_last4: '8841',
      created_at: new Date().toISOString(),
      officer_name: currentOfficer.name,
    };

    weighmentRecords.unshift(newRecord);

    // Update appointment & queue status to Completed
    const apt = appointments.find((a) => a.token_id === token_id);
    if (apt) apt.status = 'Completed';

    const qItem = queueList.find((q) => q.token_id === token_id);
    if (qItem) qItem.status = 'Completed';

    // Send payment & completion notification
    notifications.unshift({
      notification_id: `NOTIF-${Date.now()}`,
      farmer_id: newRecord.farmer_id,
      title: 'Procurement & Weighment Completed',
      message: `Crop weight verified: ${net_weight} kg net (${net_quintals.toFixed(2)} Quintals). MSP Payment of ₹${netPayable.toLocaleString('en-IN')} approved under receipt ${receipt_number}.`,
      type: 'status',
      read_status: false,
      created_at: new Date().toISOString(),
    });

    res.status(201).json({ success: true, weighment: newRecord });
  });

  // Admin Broadcast Announcement to Queued Farmers
  app.post('/api/admin/broadcast', (req: Request, res: Response) => {
    const { title, message, alert_type = 'status' } = req.body;
    if (!title || !message) {
      return res.status(400).json({ error: 'Title and message are required' });
    }

    const newNotif: NotificationItem = {
      notification_id: `NOTIF-BC-${Date.now()}`,
      farmer_id: currentFarmer.farmer_id,
      title: `[MANDI BROADCAST] ${title}`,
      message,
      type: alert_type,
      read_status: false,
      created_at: new Date().toISOString(),
    };

    notifications.unshift(newNotif);
    res.status(201).json({ success: true, broadcast: newNotif });
  });

  // Admin Analytics & Daily Summary
  app.get('/api/admin/analytics', (req: Request, res: Response) => {
    const totalProcuredKg = weighmentRecords.reduce((sum, w) => sum + w.net_weight_kg, 0);
    const totalPayout = weighmentRecords.reduce((sum, w) => sum + w.net_payable_inr, 0);
    const waitingInQueue = queueList.filter((q) => q.status === 'Waiting').length;
    const completedToday = queueList.filter((q) => q.status === 'Completed').length;

    const center = centers.find((c) => c.center_id === currentOfficer.center_id) || centers[0];

    const stats: AdminStats = {
      total_procured_kg_today: totalProcuredKg,
      total_payout_inr_today: totalPayout,
      farmers_served_today: completedToday,
      active_in_queue: waitingInQueue,
      average_processing_mins: center.avg_processing_mins || 7,
      pending_inspections: queueList.filter((q) => q.status === 'Serving').length,
      counters_active: center.active_counters || 2,
    };

    res.json(stats);
  });

  // ---------------- Vite Middleware (Development vs Production) ----------------
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Smart Procurement Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start Smart Procurement server:', err);
});

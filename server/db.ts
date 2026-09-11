import fs from 'fs';
import path from 'path';
import {
  FarmerProfile,
  ProcurementCenter,
  CropRecord,
  Appointment,
  NotificationItem,
  QueueItem,
  AdminWeighmentRecord,
  AdminOfficerProfile,
  CenterSlot,
} from '../src/types';
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
} from '../src/data/mockData';

export interface DatabaseSchema {
  version: number;
  lastUpdated: string;
  farmers: FarmerProfile[];
  centers: ProcurementCenter[];
  crops: CropRecord[];
  appointments: Appointment[];
  slots: CenterSlot[];
  queueList: QueueItem[];
  notifications: NotificationItem[];
  weighmentRecords: AdminWeighmentRecord[];
  officers: AdminOfficerProfile[];
  currentServingIndex: number;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'procurement_db.json');

// Extended demo farmers pre-booked into slots
export const DEMO_FARMERS_ROSTER: FarmerProfile[] = [
  { ...INITIAL_FARMER },
  {
    farmer_id: 'MH-PUN-2026-1405',
    name: 'Sunita Bai Deshmukh',
    phone: '+91 98220 19941',
    village: 'Saswad, Purandar',
    district: 'Pune',
    state: 'Maharashtra',
    land_area: 5.5,
    land_unit: 'Acre',
    main_crop: 'Wheat',
    other_crops: ['Wheat', 'Soyabean'],
    active_crop: 'Wheat',
    is_verified: true,
    aadhaar_number: 'XXXX-XXXX-4091',
    bank_name: 'Bank of Maharashtra',
    bank_account: '991048291042',
    bank_ifsc: 'MAHB0000142',
    latitude: 18.3444,
    longitude: 74.0305,
    vehicle_number: 'MH-12-BQ-9042',
  },
  {
    farmer_id: 'MH-PUN-2026-1899',
    name: 'Balram Singh Rajput',
    phone: '+91 94230 88190',
    village: 'Shirur Rural',
    district: 'Pune',
    state: 'Maharashtra',
    land_area: 8.0,
    land_unit: 'Acre',
    main_crop: 'Cotton',
    other_crops: ['Cotton', 'Soyabean'],
    active_crop: 'Cotton',
    is_verified: true,
    aadhaar_number: 'XXXX-XXXX-7182',
    bank_name: 'State Bank of India',
    bank_account: '204918294012',
    bank_ifsc: 'SBIN0003910',
    latitude: 18.8256,
    longitude: 74.3789,
    vehicle_number: 'MH-20-DE-1190',
  },
  {
    farmer_id: 'MH-PUN-2026-2391',
    name: 'Anita Devi Choudhary',
    phone: '+91 98901 23984',
    village: 'Indapur Sub-Yard',
    district: 'Pune',
    state: 'Maharashtra',
    land_area: 3.8,
    land_unit: 'Acre',
    main_crop: 'Gram (Chana)',
    other_crops: ['Gram (Chana)', 'Maize'],
    active_crop: 'Gram (Chana)',
    is_verified: true,
    aadhaar_number: 'XXXX-XXXX-9124',
    bank_name: 'HDFC Bank',
    bank_account: '501004829104',
    bank_ifsc: 'HDFC0001923',
    latitude: 18.1147,
    longitude: 75.0315,
    vehicle_number: 'MH-12-NM-7821',
  },
  {
    farmer_id: 'MH-PUN-2026-3104',
    name: 'Vikram Bhausaheb Shinde',
    phone: '+91 94050 11923',
    village: 'Talegaon Dabhade',
    district: 'Pune',
    state: 'Maharashtra',
    land_area: 6.2,
    land_unit: 'Acre',
    main_crop: 'Paddy',
    other_crops: ['Paddy', 'Sugarcane'],
    active_crop: 'Paddy',
    is_verified: true,
    aadhaar_number: 'XXXX-XXXX-6619',
    bank_name: 'Central Bank of India',
    bank_account: '319204819201',
    bank_ifsc: 'CBIN0281920',
    latitude: 18.7287,
    longitude: 73.6821,
    vehicle_number: 'MH-14-ZZ-9910',
  },
];

// Rich slots with demo farmers assigned to them
export const ENRICHED_SLOTS: CenterSlot[] = [
  {
    id: 'slot-1',
    time_range: '08:30 AM – 09:30 AM',
    total_slots: 15,
    available_slots: 0, // Fully booked to showcase Not Available / Booked state
    booked_farmers: [
      {
        token_id: 'P-098',
        farmer_id: 'MH-PUN-2026-3104',
        farmer_name: 'Pandurang Kadam',
        crop_type: 'Paddy',
        quantity: 1500,
        vehicle_number: 'MH-12-BG-4421',
        gate_status: 'Completed',
        arrival_time: '08:20 AM',
      },
      {
        token_id: 'P-099',
        farmer_id: 'MH-PUN-2026-4491',
        farmer_name: 'Tukaram Jadhav',
        crop_type: 'Wheat',
        quantity: 2200,
        vehicle_number: 'MH-12-CZ-9910',
        gate_status: 'Completed',
        arrival_time: '08:45 AM',
      },
      {
        token_id: 'P-100',
        farmer_id: 'MH-PUN-2026-5512',
        farmer_name: 'Eknath Shinde',
        crop_type: 'Soyabean',
        quantity: 1100,
        vehicle_number: 'MH-12-GH-8812',
        gate_status: 'Completed',
        arrival_time: '09:05 AM',
      },
    ],
  },
  {
    id: 'slot-2',
    time_range: '09:30 AM – 10:30 AM',
    total_slots: 15,
    available_slots: 6,
    booked_farmers: [
      {
        token_id: 'P-101',
        farmer_id: 'MH-PUN-2026-0911',
        farmer_name: 'Suresh Deshmukh',
        crop_type: 'Paddy',
        quantity: 1200,
        vehicle_number: 'MH-12-TR-4512',
        gate_status: 'Weighbridge',
        arrival_time: '09:25 AM',
      },
      {
        token_id: 'P-102',
        farmer_id: 'MH-PUN-2026-1405',
        farmer_name: 'Balasaheb Shinde',
        crop_type: 'Wheat',
        quantity: 1500,
        vehicle_number: 'MH-12-AB-9821',
        gate_status: 'Entered',
        arrival_time: '09:40 AM',
      },
    ],
  },
  {
    id: 'slot-3',
    time_range: '10:00 AM – 11:00 AM',
    total_slots: 15,
    available_slots: 8,
    booked_farmers: [
      {
        token_id: 'P-103',
        farmer_id: 'MH-PUN-2026-1899',
        farmer_name: 'Ananda Gaikwad',
        crop_type: 'Soyabean',
        quantity: 950,
        vehicle_number: 'MH-14-GH-3310',
        gate_status: 'Waiting Gate',
        arrival_time: '09:55 AM',
      },
      {
        token_id: 'P-104',
        farmer_id: 'MH-PUN-2026-2101',
        farmer_name: 'Kisan More',
        crop_type: 'Wheat',
        quantity: 1100,
        vehicle_number: 'MH-12-PQ-7721',
        gate_status: 'Waiting Gate',
        arrival_time: '10:05 AM',
      },
      {
        token_id: 'P-105',
        farmer_id: 'MH-PUN-2026-4419',
        farmer_name: 'Narayan Rao Jadhav',
        crop_type: 'Paddy',
        quantity: 800,
        vehicle_number: 'MH-12-TR-8841',
        gate_status: 'Waiting Gate',
        arrival_time: '10:15 AM',
      },
    ],
  },
  {
    id: 'slot-4',
    time_range: '11:00 AM – 12:00 PM',
    total_slots: 15,
    available_slots: 4,
    booked_farmers: [
      {
        token_id: 'P-106',
        farmer_id: 'MH-PUN-2026-2391',
        farmer_name: 'Santosh Pawar',
        crop_type: 'Paddy',
        quantity: 1400,
        vehicle_number: 'MH-12-KZ-1190',
        gate_status: 'Waiting Gate',
        arrival_time: '11:10 AM',
      },
      {
        token_id: 'P-107',
        farmer_id: 'MH-PUN-2026-2580',
        farmer_name: 'Dnyaneshwar Jagtap',
        crop_type: 'Gram (Chana)',
        quantity: 850,
        vehicle_number: 'MH-12-MN-6644',
        gate_status: 'Waiting Gate',
        arrival_time: '11:20 AM',
      },
    ],
  },
  {
    id: 'slot-5',
    time_range: '01:00 PM – 02:00 PM',
    total_slots: 15,
    available_slots: 12,
    booked_farmers: [
      {
        token_id: 'P-108',
        farmer_id: 'MH-PUN-2026-3104',
        farmer_name: 'Balram Singh Rajput',
        crop_type: 'Cotton',
        quantity: 1800,
        vehicle_number: 'MH-20-DE-1190',
        gate_status: 'Waiting Gate',
        arrival_time: '01:05 PM',
      },
      {
        token_id: 'P-109',
        farmer_id: 'MH-PUN-2026-3401',
        farmer_name: 'Anita Devi Choudhary',
        crop_type: 'Mustard',
        quantity: 700,
        vehicle_number: 'MH-12-NM-7821',
        gate_status: 'Waiting Gate',
        arrival_time: '01:25 PM',
      },
    ],
  },
  {
    id: 'slot-6',
    time_range: '02:00 PM – 03:00 PM',
    total_slots: 15,
    available_slots: 10,
    booked_farmers: [
      {
        token_id: 'P-110',
        farmer_id: 'MH-PUN-2026-4011',
        farmer_name: 'Vikram Bhausaheb Shinde',
        crop_type: 'Paddy',
        quantity: 1350,
        vehicle_number: 'MH-14-ZZ-9910',
        gate_status: 'Waiting Gate',
        arrival_time: '02:15 PM',
      },
    ],
  },
  {
    id: 'slot-7',
    time_range: '03:00 PM – 04:00 PM',
    total_slots: 15,
    available_slots: 14,
    booked_farmers: [],
  },
];

class DatabaseManager {
  private data: DatabaseSchema;
  private isInitialized = false;

  constructor() {
    this.data = this.getDefaultData();
    this.init();
  }

  private getDefaultData(): DatabaseSchema {
    return {
      version: 1,
      lastUpdated: new Date().toISOString(),
      farmers: [...DEMO_FARMERS_ROSTER],
      centers: [...INITIAL_CENTERS],
      crops: [...INITIAL_CROPS],
      appointments: [...INITIAL_APPOINTMENTS],
      slots: [...ENRICHED_SLOTS],
      queueList: [...INITIAL_QUEUE_LIST],
      notifications: [...INITIAL_NOTIFICATIONS],
      weighmentRecords: [...INITIAL_ADMIN_WEIGHMENTS],
      officers: [
        { ...DEFAULT_OFFICER },
        {
          officer_id: 'OFF-NAS-019',
          name: 'Smt. Meenakshi Rao',
          designation: 'Mandi Quality & Procurement Officer',
          center_id: 'PC-201',
          center_name: 'Nashik Krishak Grain Terminal',
          jurisdiction: 'Nashik District APMC',
          badge_number: 'MAH-APMC-7712',
          role: 'Quality & Weighbridge Officer',
          phone: '+91 94222 19482',
        },
      ],
      currentServingIndex: 0,
    };
  }

  private init() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        const fileContent = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(fileContent) as DatabaseSchema;
        if (parsed && Array.isArray(parsed.farmers) && Array.isArray(parsed.appointments)) {
          this.data = parsed;
          this.isInitialized = true;
          console.log(`[Database] Loaded persistent data from ${DB_FILE}`);
          return;
        }
      }

      // If no file exists or invalid, persist default seed data
      this.persist();
      this.isInitialized = true;
      console.log(`[Database] Initialized new persistent database at ${DB_FILE}`);
    } catch (err) {
      console.error('[Database] Failed to load disk database, using in-memory state:', err);
      this.isInitialized = true;
    }
  }

  public persist(): void {
    try {
      this.data.lastUpdated = new Date().toISOString();
      const tmpFile = `${DB_FILE}.tmp`;
      fs.writeFileSync(tmpFile, JSON.stringify(this.data, null, 2), 'utf-8');
      fs.renameSync(tmpFile, DB_FILE);
    } catch (err) {
      console.error('[Database] Error saving to disk:', err);
    }
  }

  public get<K extends keyof DatabaseSchema>(key: K): DatabaseSchema[K] {
    return this.data[key];
  }

  public set<K extends keyof DatabaseSchema>(key: K, val: DatabaseSchema[K]): void {
    this.data[key] = val;
    this.persist();
  }

  public getAll(): DatabaseSchema {
    return this.data;
  }

  public resetToDefault(): DatabaseSchema {
    this.data = this.getDefaultData();
    this.persist();
    return this.data;
  }

  public getStats() {
    let fileSize = 0;
    try {
      if (fs.existsSync(DB_FILE)) {
        fileSize = fs.statSync(DB_FILE).size;
      }
    } catch (_) {}

    return {
      status: 'healthy',
      filePath: DB_FILE,
      fileSizeBytes: fileSize,
      lastUpdated: this.data.lastUpdated,
      counts: {
        farmers: this.data.farmers.length,
        appointments: this.data.appointments.length,
        centers: this.data.centers.length,
        slots: this.data.slots.length,
        queueItems: this.data.queueList.length,
        weighments: this.data.weighmentRecords.length,
        notifications: this.data.notifications.length,
      },
    };
  }
}

export const db = new DatabaseManager();

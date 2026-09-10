import React, { useState, useEffect } from 'react';
import {
  Building2,
  Scale,
  Users,
  Calendar,
  Sliders,
  TrendingUp,
  RefreshCw,
  ArrowLeft,
  Bell,
  CheckCircle2,
  ShieldCheck,
  Award,
} from 'lucide-react';
import {
  AdminOfficerProfile,
  AdminWeighmentRecord,
  AdminStats,
  ProcurementCenter,
  QueueItem,
  Appointment,
  Language,
} from '../../types';
import { api } from '../../api';
import { AdminQueueDispatch } from './AdminQueueDispatch';
import { AdminWeighbridgeStation } from './AdminWeighbridgeStation';
import { AdminAppointmentsManifest } from './AdminAppointmentsManifest';
import { AdminCapacityConfig } from './AdminCapacityConfig';
import { AdminAnalyticsView } from './AdminAnalyticsView';

interface AdminDashboardProps {
  onBackToFarmerPortal: () => void;
  lang: Language;
}

type AdminTab = 'queue' | 'weighbridge' | 'manifest' | 'capacity' | 'analytics';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onBackToFarmerPortal,
  lang,
}) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('queue');
  const [officer, setOfficer] = useState<AdminOfficerProfile | null>(null);
  const [centers, setCenters] = useState<ProcurementCenter[]>([]);
  const [selectedCenterId, setSelectedCenterId] = useState<string>('PC-101');
  const [queueList, setQueueList] = useState<QueueItem[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [weighments, setWeighments] = useState<AdminWeighmentRecord[]>([]);
  const [stats, setStats] = useState<AdminStats>({
    total_procured_kg_today: 4800,
    total_payout_inr_today: 109350,
    farmers_served_today: 3,
    active_in_queue: 6,
    average_processing_mins: 7,
    pending_inspections: 1,
    counters_active: 2,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Load Admin Data
  useEffect(() => {
    let mounted = true;
    async function loadData() {
      setIsLoading(true);
      try {
        const [off, centList, qList, aptList, wList, st] = await Promise.all([
          api.getAdminOfficer(),
          api.getAdminCenters(),
          api.getQueueList(),
          api.getAdminAppointments(),
          api.getWeighmentRecords(),
          api.getAdminStats(),
        ]);

        if (mounted) {
          setOfficer(off);
          setCenters(centList);
          if (off?.center_id) setSelectedCenterId(off.center_id);
          setQueueList(qList);
          setAppointments(aptList);
          setWeighments(wList);
          setStats(st);
        }
      } catch (err) {
        console.error('Failed to load admin data:', err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    }
    loadData();
    return () => {
      mounted = false;
    };
  }, [refreshTrigger]);

  const currentCenter =
    centers.find((c) => c.center_id === selectedCenterId) ||
    centers[0] || {
      center_id: 'PC-101',
      name: 'Pune District Procurement Center',
      district: 'Pune',
      active_counters: 2,
      avg_processing_mins: 7,
      capacity: 150,
      status: 'Accepting Farmers',
      accepted_crops: ['Paddy', 'Wheat', 'Soyabean'],
      distance_km: 4.2,
      address: 'APMC Yard, Swargate Link Road, Pune',
      operating_hours: '08:30 AM – 05:30 PM',
      latitude: 18.5204,
      longitude: 73.8567,
    };

  // Handlers
  const handleCallToken = async (tokenId?: string, counterNumber?: number) => {
    const res = await api.callToken(tokenId, counterNumber);
    // Refresh queue & appointments
    const [updatedQ, updatedApts, updatedStats] = await Promise.all([
      api.getQueueList(),
      api.getAdminAppointments(),
      api.getAdminStats(),
    ]);
    setQueueList(updatedQ);
    setAppointments(updatedApts);
    setStats(updatedStats);
    return res;
  };

  const handleUpdateTokenStatus = async (tokenId: string, status: QueueItem['status']) => {
    const success = await api.updateTokenStatus(tokenId, status);
    if (success) {
      const [updatedQ, updatedApts, updatedStats] = await Promise.all([
        api.getQueueList(),
        api.getAdminAppointments(),
        api.getAdminStats(),
      ]);
      setQueueList(updatedQ);
      setAppointments(updatedApts);
      setStats(updatedStats);
    }
    return success;
  };

  const handleUpdateCenterConfig = async (updates: {
    active_counters?: number;
    status?: ProcurementCenter['status'];
    capacity?: number;
    avg_processing_mins?: number;
  }) => {
    const updated = await api.updateCenterConfig(currentCenter.center_id, updates);
    if (updated) {
      setCenters((prev) => prev.map((c) => (c.center_id === updated.center_id ? updated : c)));
      const updatedStats = await api.getAdminStats();
      setStats(updatedStats);
    }
    return updated;
  };

  const handleCreateManualToken = async (data: any) => {
    const res = await api.createManualToken(data);
    const [updatedQ, updatedApts, updatedStats] = await Promise.all([
      api.getQueueList(),
      api.getAdminAppointments(),
      api.getAdminStats(),
    ]);
    setQueueList(updatedQ);
    setAppointments(updatedApts);
    setStats(updatedStats);
    return res;
  };

  const handleSubmitWeighment = async (data: any) => {
    const record = await api.submitWeighment(data);
    const [updatedW, updatedQ, updatedApts, updatedStats] = await Promise.all([
      api.getWeighmentRecords(),
      api.getQueueList(),
      api.getAdminAppointments(),
      api.getAdminStats(),
    ]);
    setWeighments(updatedW);
    setQueueList(updatedQ);
    setAppointments(updatedApts);
    setStats(updatedStats);
    return record;
  };

  const handleCheckIn = async (appointmentId: string, details: { vehicle_number: string; gate_bay: string }) => {
    const success = await api.checkInAppointment(appointmentId, details);
    if (success) {
      const [updatedApts, updatedQ] = await Promise.all([
        api.getAdminAppointments(),
        api.getQueueList(),
      ]);
      setAppointments(updatedApts);
      setQueueList(updatedQ);
    }
    return success;
  };

  const handleBroadcast = async (title: string, message: string, alertType: 'status' | 'turn' | 'queue' = 'status') => {
    return await api.broadcastAnnouncement(title, message, alertType);
  };

  return (
    <div className="space-y-6">
      {/* Top Administrative Header */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs p-5 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Officer Credentials & Badge */}
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-800 to-stone-900 text-white flex items-center justify-center shadow-sm shrink-0 border border-emerald-700/50">
              <Award className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-black tracking-tight text-stone-900">
                  {officer?.name || 'Shri V. S. Deshmukh'}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1 font-mono">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
                  {officer?.badge_number || 'MAH-APMC-9418'}
                </span>
              </div>
              <p className="text-xs text-stone-600 font-medium">
                {officer?.designation || 'Senior Agricultural Procurement Inspector'} •{' '}
                <span className="text-stone-400">{officer?.jurisdiction || 'Haveli & Pune Central Sub-Division'}</span>
              </p>
            </div>
          </div>

          {/* Action Buttons: Center Selector & Return to Farmer Portal */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="flex items-center gap-1.5 text-xs bg-stone-50 border border-stone-200 rounded-xl px-3 py-1.5">
              <Building2 className="w-4 h-4 text-emerald-700 shrink-0" />
              <select
                value={selectedCenterId}
                onChange={(e) => setSelectedCenterId(e.target.value)}
                className="bg-transparent font-bold text-stone-900 focus:outline-none cursor-pointer"
              >
                {centers.map((c) => (
                  <option key={c.center_id} value={c.center_id}>
                    {c.name} ({c.district})
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => setRefreshTrigger((prev) => prev + 1)}
              title="Refresh Center Data"
              className="p-2 border border-stone-200 hover:bg-stone-100 rounded-xl text-stone-600 transition-all"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={onBackToFarmerPortal}
              className="px-3.5 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl font-bold text-xs shadow-xs transition-all flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Farmer Portal</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1.5 overflow-x-auto border-t border-stone-100 pt-3 text-xs">
          <button
            onClick={() => setActiveTab('queue')}
            className={`px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'queue'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Token Calling & Dispatch</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-900/40 text-emerald-100 font-mono">
              {queueList.filter((q) => q.status === 'Waiting').length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('weighbridge')}
            className={`px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'weighbridge'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            <Scale className="w-4 h-4" />
            <span>Weighbridge & Moisture Desk</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-900/40 text-emerald-100 font-mono">
              {weighments.length} Slips
            </span>
          </button>

          <button
            onClick={() => setActiveTab('manifest')}
            className={`px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'manifest'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Appointments & Gate Manifest</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-900/40 text-emerald-100 font-mono">
              {appointments.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('capacity')}
            className={`px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'capacity'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Yard Broadcast & Quota</span>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'analytics'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Procurement Analytics</span>
          </button>
        </div>
      </div>

      {/* Main Tab Views */}
      {activeTab === 'queue' && (
        <AdminQueueDispatch
          queueList={queueList}
          center={currentCenter}
          onCallToken={handleCallToken}
          onUpdateTokenStatus={handleUpdateTokenStatus}
          onUpdateCenterConfig={handleUpdateCenterConfig}
          onCreateManualToken={handleCreateManualToken}
          lang={lang}
        />
      )}

      {activeTab === 'weighbridge' && (
        <AdminWeighbridgeStation
          records={weighments}
          queueList={queueList}
          appointments={appointments}
          onSubmitWeighment={handleSubmitWeighment}
          lang={lang}
        />
      )}

      {activeTab === 'manifest' && (
        <AdminAppointmentsManifest
          appointments={appointments}
          onCheckIn={handleCheckIn}
          lang={lang}
        />
      )}

      {activeTab === 'capacity' && (
        <AdminCapacityConfig
          center={currentCenter}
          onUpdateCenter={handleUpdateCenterConfig}
          onBroadcast={handleBroadcast}
          lang={lang}
        />
      )}

      {activeTab === 'analytics' && (
        <AdminAnalyticsView
          stats={stats}
          records={weighments}
          lang={lang}
        />
      )}
    </div>
  );
};

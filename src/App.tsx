import React, { useState, useEffect, useCallback } from 'react';
import {
  FarmerProfile,
  ProcurementCenter,
  Appointment,
  NotificationItem,
  QueueStatusResponse,
  FarmerDashboardData,
  Language,
  CropRecord,
  CenterSlot,
} from './types';
import { api } from './api';
import { translations } from './translations/translations';
import { INITIAL_FARMER, INITIAL_DASHBOARD_DATA, INITIAL_QUEUE_RESPONSE, calculateDistanceKm } from './data/mockData';

import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { DashboardView } from './components/DashboardView';
import { CentersView } from './components/CentersView';
import { ScheduleView } from './components/ScheduleView';
import { QueueTrackerView } from './components/QueueTrackerView';
import { ProfileView } from './components/ProfileView';
import { AdminDashboard } from './components/AdminPanel/AdminDashboard';

import { CenterDetailsModal } from './components/CenterDetailsModal';
import { CropRegistrationModal } from './components/CropRegistrationModal';
import { ProcurementStatusModal } from './components/ProcurementStatusModal';
import { NotificationsDrawer } from './components/NotificationsDrawer';
import { AuthModal } from './components/AuthModal';

export default function App() {
  // Navigation & Language State
  const [activeTab, setActiveTab] = useState<
    'home' | 'centers' | 'schedule' | 'queue' | 'profile' | 'admin'
  >('home');
  const [lang, setLang] = useState<Language>('en');

  // Core Data State
  const [farmer, setFarmer] = useState<FarmerProfile>(INITIAL_FARMER);
  const [centers, setCenters] = useState<ProcurementCenter[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [queueData, setQueueData] = useState<QueueStatusResponse>(INITIAL_QUEUE_RESPONSE);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [dashboardData, setDashboardData] = useState<FarmerDashboardData>(INITIAL_DASHBOARD_DATA);

  // Modals & Drawers State
  const [selectedCenterForDetails, setSelectedCenterForDetails] = useState<ProcurementCenter | null>(null);
  const [isCropRegistrationOpen, setIsCropRegistrationOpen] = useState(false);
  const [isProcurementStatusOpen, setIsProcurementStatusOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [currentStageIndex, setCurrentStageIndex] = useState<number>(4); // Stage 4: Farmer Arrived

  // Accessibility: Audio Announcements for rural farmers
  const [speechEnabled, setSpeechEnabled] = useState(false);

  // Feedback Toast Banner
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // Text-to-speech announcement helper
  const handleAnnounce = useCallback((text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      window.speechSynthesis.speak(utterance);
    }
  }, []);

  // Initial Data Fetch
  const loadAllData = useCallback(async () => {
    try {
      const [fetchedProfile, fetchedCenters, fetchedAppts, fetchedNotifs] = await Promise.all([
        api.getProfile(),
        api.getCenters(),
        api.getAppointments(),
        api.getNotifications(),
      ]);

      if (fetchedProfile) setFarmer(fetchedProfile);
      if (fetchedCenters) setCenters(fetchedCenters);
      if (fetchedAppts) setAppointments(fetchedAppts);
      if (fetchedNotifs) setNotifications(fetchedNotifs);

      // Determine user token
      const primaryAppt = fetchedAppts[0];
      const userToken = primaryAppt ? primaryAppt.token_id : 'P-105';
      const qStatus = await api.getQueueStatus(userToken);
      if (qStatus) setQueueData(qStatus);

      // Prepare dashboard data
      if (fetchedCenters.length > 0) {
        const sorted = [...fetchedCenters].sort(
          (a, b) => (a.distance_km || 99) - (b.distance_km || 99)
        );
        const nearest = sorted[0];

        setDashboardData({
          farmer: fetchedProfile,
          nearest_center: nearest,
          active_appointment: primaryAppt || null,
          queue_summary: {
            current_token: qStatus ? qStatus.current_token : 'P-101',
            user_token: qStatus ? qStatus.user_token : 'P-105',
            farmers_ahead: qStatus ? qStatus.farmers_ahead : 4,
            estimated_wait_mins: qStatus ? qStatus.estimated_waiting_mins : 35,
            recommended_arrival_time: qStatus ? qStatus.recommended_arrival_time : '10:35 AM',
            status: qStatus ? qStatus.queue_status_label : 'Moving Normally',
          },
          recent_notifications: fetchedNotifs || [],
        });
      }
    } catch (err) {
      console.error('Error fetching initial data:', err);
    }
  }, []);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // Handle Profile Update
  const handleUpdateProfile = async (updates: Partial<FarmerProfile>) => {
    const updated = await api.updateProfile(updates);
    setFarmer(updated);
    showToast('Profile details updated successfully.');
  };

  // Handle Location Update (Section 2)
  const handleUpdateLocation = async (lat: number, lng: number) => {
    await api.updateLocation(lat, lng);
    const updatedFarmer = { ...farmer, latitude: lat, longitude: lng };
    setFarmer(updatedFarmer);

    // Recalculate centers distances
    const updatedCenters = centers.map((c) => ({
      ...c,
      distance_km: calculateDistanceKm(lat, lng, c.latitude, c.longitude),
    }));
    setCenters(updatedCenters);
    showToast(`GPS Location updated to: ${lat.toFixed(4)}, ${lng.toFixed(4)}`);
  };

  // Handle Crop Registration & Direct Schedule (Section 6)
  const handleSaveCropAndSchedule = async (cropData: {
    crop_type: any;
    quantity: number;
    unit: any;
    harvest_status: any;
    preferred_center_id: string;
  }) => {
    const registeredCrop = await api.registerCrop(cropData);
    setIsCropRegistrationOpen(false);
    showToast(`Crop Registered: ${registeredCrop.crop_id} (${registeredCrop.crop_type})`);

    // Find the preferred center to open slot booking
    const center =
      centers.find((c) => c.center_id === cropData.preferred_center_id) || centers[0];
    if (center) {
      setSelectedCenterForDetails(center);
    }
  };

  // Handle Slot Booking (Section 5 & 8)
  const handleBookSlot = async (
    center: ProcurementCenter,
    slot: CenterSlot,
    dateStr: string
  ) => {
    const newAppointment = await api.bookSlot({
      crop_id: 'CR-2026-1027',
      center_id: center.center_id,
      date: dateStr,
      time_slot: slot.time_range,
    });

    setAppointments((prev) => [newAppointment, ...prev]);
    setSelectedCenterForDetails(null);

    // Refresh Queue status
    const qStatus = await api.getQueueStatus(newAppointment.token_id);
    setQueueData(qStatus);

    showToast(
      `Slot Confirmed! Official Token: ${newAppointment.token_id} at ${center.name}`
    );

    if (speechEnabled) {
      handleAnnounce(`Appointment confirmed at ${center.name}. Your token is ${newAppointment.token_id}.`);
    }

    // Switch to Schedule or Queue
    setActiveTab('queue');
  };

  // Step Queue Simulation (Section 10)
  const handleStepQueue = async () => {
    await api.stepQueue();
    const primaryAppt = appointments[0];
    const userToken = primaryAppt ? primaryAppt.token_id : 'P-105';
    const updated = await api.getQueueStatus(userToken);
    setQueueData(updated);

    // If turn reached
    if (updated.current_token === updated.user_token && updated.farmers_ahead === 0) {
      showToast(`🔔 TOKEN ${updated.user_token}: Your turn has arrived! Proceed to Counter 1.`);
      if (speechEnabled) {
        handleAnnounce(`Token ${updated.user_token}, your turn has arrived! Please proceed to Counter 1.`);
      }
    }
  };

  // Reset Queue Simulation
  const handleResetQueue = async () => {
    await api.resetQueue();
    const primaryAppt = appointments[0];
    const userToken = primaryAppt ? primaryAppt.token_id : 'P-105';
    const updated = await api.getQueueStatus(userToken);
    setQueueData(updated);
    showToast('Demo Queue reset to Token P-101.');
  };

  // Handle Late Arrival Join (Section 12)
  const handleJoinLateQueue = async () => {
    await api.joinLateQueue(queueData.user_token);
    const updated = await api.getQueueStatus(queueData.user_token);
    setQueueData(updated);
    showToast(`You have joined the current queue as a late arrival.`);
  };

  // Reschedule trigger
  const handleReschedule = (appointmentId: string) => {
    const center = centers.find((c) => c.center_id === 'PC-101') || centers[0];
    setSelectedCenterForDetails(center);
  };

  // Simulate Late Arrival (Section 12 flow)
  const handleSimulateLateArrival = async (appointmentId: string) => {
    setQueueData((prev) => ({
      ...prev,
      is_late: true,
      queue_status_label: 'Late Arrival (Slot Expired)',
    }));
    setActiveTab('queue');
    showToast('Simulated Late Arrival: Scheduled slot expired. Choose an action.');
  };

  // Cancel Appointment
  const handleCancelAppointment = async (id: string) => {
    await api.updateAppointment(id, { status: 'Cancelled' });
    setAppointments((prev) =>
      prev.map((a) => (a.appointment_id === id ? { ...a, status: 'Cancelled' } : a))
    );
    showToast('Appointment cancelled.');
  };

  // Notifications read
  const handleMarkNotificationRead = async (id: string) => {
    await api.markNotificationRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.notification_id === id ? { ...n, read_status: true } : n))
    );
  };

  const handleClearAllNotifications = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read_status: true })));
    showToast('All notifications marked as read.');
  };

  // Handle Stage 4 Arrival Confirmation (Farmer Arrived at Gate)
  const handleConfirmArrival = async () => {
    try {
      await api.confirmFarmerArrival(userToken);
    } catch (_) {}
    setCurrentStageIndex(5);
    showToast('✓ Gate entry verified! Stage 4 (Farmer Arrived) marked as completed. Proceed to Weighbridge Bay A.');
    if (speechEnabled) {
      handleAnnounce('Gate entry verified! Stage 4 completed. Proceed to Weighbridge Bay A.');
    }
    const notifs = await api.getNotifications();
    setNotifications(notifs);
  };

  const unreadNotifsCount = notifications.filter((n) => !n.read_status).length;
  const primaryAppt = appointments[0];
  const userToken = primaryAppt ? primaryAppt.token_id : queueData.user_token || 'P-105';

  return (
    <div className="min-h-screen bg-stone-100/90 text-stone-900 font-sans flex flex-col selection:bg-emerald-200">
      {/* Top Navigation Bar */}
      <Navbar
        lang={lang}
        onLanguageChange={setLang}
        farmerName={farmer.name}
        farmerId={farmer.farmer_id}
        unreadCount={unreadNotifsCount}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onOpenProfile={() => setActiveTab('profile')}
        speechEnabled={speechEnabled}
        onToggleSpeech={() => {
          const next = !speechEnabled;
          setSpeechEnabled(next);
          if (next) {
            handleAnnounce('Voice assistance enabled for procurement tracking.');
          }
        }}
        isAdminView={activeTab === 'admin'}
        onOpenAdmin={() => setActiveTab('admin')}
        onBackToFarmerPortal={() => setActiveTab('home')}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-6xl mx-auto">
        {/* Toast Alert Banner */}
        {toastMessage && (
          <div className="fixed top-18 left-1/2 -translate-x-1/2 z-50 bg-stone-900/95 text-white px-5 py-3 rounded-2xl shadow-xl border border-emerald-500/40 text-xs sm:text-sm font-bold flex items-center gap-2 max-w-md w-[90%] animate-in fade-in slide-in-from-top-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
            <span className="flex-1">{toastMessage}</span>
          </div>
        )}

        {/* Tab 1: Home Dashboard */}
        {activeTab === 'home' && (
          <DashboardView
            data={{
              farmer,
              nearest_center: centers[0] || dashboardData.nearest_center,
              active_appointment: appointments[0] || null,
              queue_summary: {
                current_token: queueData.current_token,
                user_token: queueData.user_token,
                farmers_ahead: queueData.farmers_ahead,
                estimated_wait_mins: queueData.estimated_waiting_mins,
                recommended_arrival_time: queueData.recommended_arrival_time,
                status: queueData.queue_status_label,
              },
              recent_notifications: notifications.slice(0, 3),
            }}
            lang={lang}
            currentStageIndex={currentStageIndex}
            onConfirmArrival={handleConfirmArrival}
            onNavigate={(tab) => setActiveTab(tab)}
            onSelectCenter={(c) => setSelectedCenterForDetails(c)}
            onOpenCropRegistration={() => setIsCropRegistrationOpen(true)}
            onOpenProcurementStatus={() => setIsProcurementStatusOpen(true)}
          />
        )}

        {/* Tab 2: Procurement Center Directory & Map */}
        {activeTab === 'centers' && (
          <CentersView
            centers={centers}
            farmerLocation={{ latitude: farmer.latitude, longitude: farmer.longitude }}
            lang={lang}
            onSelectCenter={(center) => setSelectedCenterForDetails(center)}
          />
        )}

        {/* Tab 3: Appointments & Schedule */}
        {activeTab === 'schedule' && (
          <ScheduleView
            appointments={appointments}
            lang={lang}
            onNavigateToQueue={() => setActiveTab('queue')}
            onOpenCropRegistration={() => setIsCropRegistrationOpen(true)}
            onCancelAppointment={handleCancelAppointment}
            onRescheduleAppointment={handleReschedule}
            onSimulateLateArrival={handleSimulateLateArrival}
            farmerLocation={{ latitude: farmer.latitude, longitude: farmer.longitude }}
          />
        )}

        {/* Tab 4: Live Queue Tracking (Most Important) */}
        {activeTab === 'queue' && (
          <QueueTrackerView
            queueData={queueData}
            lang={lang}
            currentStageIndex={currentStageIndex}
            onConfirmArrival={handleConfirmArrival}
            onStepQueue={handleStepQueue}
            onResetQueue={handleResetQueue}
            onJoinLateQueue={handleJoinLateQueue}
            onReschedule={() => {
              const center = centers.find((c) => c.center_id === queueData.center_id) || centers[0];
              setSelectedCenterForDetails(center);
            }}
            speechEnabled={speechEnabled}
            onAnnounceTurn={handleAnnounce}
          />
        )}

        {/* Tab 5: Farmer Profile */}
        {activeTab === 'profile' && (
          <ProfileView
            farmer={farmer}
            lang={lang}
            onUpdateProfile={handleUpdateProfile}
            onUpdateLocation={handleUpdateLocation}
            onOpenAuthModal={() => setIsAuthModalOpen(true)}
          />
        )}

        {/* Tab 6: APMC Mandi Admin & Procurement Officer Panel */}
        {activeTab === 'admin' && (
          <div className="p-3 sm:p-6 pb-12">
            <AdminDashboard
              onBackToFarmerPortal={() => setActiveTab('home')}
              lang={lang}
            />
          </div>
        )}
      </main>

      {/* Bottom Sticky Mobile-First Navigation (Visible only in Farmer View) */}
      {activeTab !== 'admin' && (
        <BottomNav
          activeTab={activeTab}
          onChangeTab={(tab) => setActiveTab(tab)}
          lang={lang}
        />
      )}

      {/* MODALS */}

      {/* Center Details & Slot Booking Modal (Section 5) */}
      <CenterDetailsModal
        center={selectedCenterForDetails}
        onClose={() => setSelectedCenterForDetails(null)}
        onBookSlot={handleBookSlot}
        lang={lang}
        farmerLocation={{ latitude: farmer.latitude, longitude: farmer.longitude }}
      />

      {/* Crop Registration Modal (Section 6) */}
      {isCropRegistrationOpen && (
        <CropRegistrationModal
          onClose={() => setIsCropRegistrationOpen(false)}
          onSaveAndContinue={handleSaveCropAndSchedule}
          centers={centers}
          lang={lang}
          defaultCenterId={centers[0]?.center_id}
        />
      )}

      {/* 9-Stage Overall Procurement Status Tracker (Section 15) */}
      {isProcurementStatusOpen && (
        <ProcurementStatusModal
          onClose={() => setIsProcurementStatusOpen(false)}
          lang={lang}
          userToken={userToken}
          currentStageIndex={currentStageIndex}
          onConfirmArrival={handleConfirmArrival}
          onSetStageIndex={setCurrentStageIndex}
        />
      )}

      {/* Notifications Drawer (Section 13) */}
      <NotificationsDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notifications={notifications}
        onMarkRead={handleMarkNotificationRead}
        onClearAll={handleClearAllNotifications}
        lang={lang}
      />

      {/* Farmer Authentication & Switch User Modal (Section 1) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={(loggedFarmer) => {
          setFarmer(loggedFarmer);
          showToast(`Logged in as ${loggedFarmer.name} (${loggedFarmer.farmer_id})`);
        }}
      />
    </div>
  );
}

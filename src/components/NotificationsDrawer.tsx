import React from 'react';
import { X, Bell, Check, Clock, AlertCircle, Ticket, Calendar, ShieldCheck } from 'lucide-react';
import { NotificationItem, Language } from '../types';
import { translations } from '../translations/translations';

interface NotificationsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  onMarkRead: (id: string) => void;
  onClearAll: () => void;
  onReleaseSlot?: (tokenId: string) => Promise<void> | void;
  lang: Language;
}

export const NotificationsDrawer: React.FC<NotificationsDrawerProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkRead,
  onClearAll,
  onReleaseSlot,
  lang,
}) => {
  if (!isOpen) return null;
  const t = translations[lang];

  const handleCancelAndRelease = async (e: React.MouseEvent, tokenId: string) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to cancel appointment for Token ${tokenId} and release the slot to the next standby farmer?`)) {
      if (onReleaseSlot) {
        await onReleaseSlot(tokenId);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-stone-900/40 backdrop-blur-xs">
      <div
        id="notifications-drawer"
        className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between border-l border-stone-200 animate-in slide-in-from-right duration-200"
      >
        {/* Header */}
        <div className="p-4 bg-emerald-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-amber-300" />
            <div>
              <h3 className="font-extrabold text-base">{t.notifications}</h3>
              <p className="text-xs text-emerald-200">
                Official APMC Gate & Queue Dispatch Alerts
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notifications List */}
        <div className="p-4 overflow-y-auto flex-1 space-y-3">
          {notifications.length === 0 ? (
            <div className="py-16 text-center space-y-2">
              <Bell className="w-10 h-10 text-stone-300 mx-auto" />
              <p className="text-sm font-bold text-stone-700">No new notifications</p>
              <p className="text-xs text-stone-400">
                You will receive alerts when your queue moves or appointment arrives.
              </p>
            </div>
          ) : (
            notifications.map((n) => {
              const isTurn = n.type === 'turn';
              const isQueue = n.type === 'queue';
              const isAppt = n.type === 'appointment';
              const token = n.digital_token || (n.title.includes('P-') ? n.title.match(/P-\d+/)?.[0] : undefined);

              return (
                <div
                  key={n.notification_id}
                  onClick={() => onMarkRead(n.notification_id)}
                  className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer space-y-2.5 ${
                    !n.read_status
                      ? isTurn
                        ? 'border-emerald-500 bg-emerald-50/80 shadow-xs'
                        : 'border-amber-300 bg-amber-50/50 shadow-xs'
                      : 'border-stone-200 bg-white hover:bg-stone-50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold ${
                          isTurn
                            ? 'bg-emerald-600 text-white'
                            : isQueue
                            ? 'bg-blue-600 text-white'
                            : 'bg-amber-600 text-white'
                        }`}
                      >
                        {isTurn ? '🔔' : isQueue ? '🎫' : '📅'}
                      </div>
                      <h4 className="font-extrabold text-stone-900 text-xs sm:text-sm">
                        {n.title}
                      </h4>
                    </div>

                    {!n.read_status && (
                      <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0 mt-1" />
                    )}
                  </div>

                  {/* Metadata Chips: Token, On-Time, Bay */}
                  <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-bold">
                    {token && (
                      <span className="px-2 py-0.5 rounded-md bg-stone-900 text-amber-300 font-mono flex items-center gap-1">
                        <Ticket className="w-3 h-3" />
                        <span>Token: {token}</span>
                      </span>
                    )}

                    {n.on_time_status && (
                      <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-900 border border-emerald-300 flex items-center gap-1">
                        <span>🟢</span>
                        <span>{n.on_time_status}</span>
                      </span>
                    )}

                    {n.assigned_bay && (
                      <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-900 border border-blue-200">
                        📍 {n.assigned_bay}
                      </span>
                    )}

                    {(n.grace_period_deadline || n.grace_period_mins) && (
                      <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>Grace: {n.grace_period_mins || 15} Mins</span>
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-stone-600 leading-relaxed">
                    {n.message}
                  </p>

                  {/* Slot Release Warning Box */}
                  {n.slot_release_warning && (
                    <div className="p-2 rounded-xl bg-red-50 border border-red-200 text-[11px] text-red-800 space-y-1">
                      <div className="flex items-center gap-1 font-bold text-red-900">
                        <AlertCircle className="w-3.5 h-3.5 text-red-600 shrink-0" />
                        <span>Slot Release Rule:</span>
                      </div>
                      <p className="text-[10px] leading-snug">
                        {n.slot_release_warning}
                      </p>
                    </div>
                  )}

                  {/* Action Button: Cancel & Release Slot */}
                  {(n.can_cancel || token) && onReleaseSlot && (
                    <div className="pt-1 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={(e) => handleCancelAndRelease(e, token || 'P-105')}
                        className="px-2.5 py-1.5 bg-red-100 hover:bg-red-200 text-red-800 border border-red-300 rounded-lg text-[10px] font-extrabold transition-colors flex items-center gap-1"
                      >
                        <X className="w-3 h-3" />
                        <span>Cancel & Release Slot</span>
                      </button>

                      <span className="text-[10px] text-stone-400">
                        Releases to standby queue
                      </span>
                    </div>
                  )}

                  <div className="pt-1.5 border-t border-stone-100 flex items-center justify-between text-[10px] text-stone-400 font-mono">
                    <span>
                      {new Date(n.created_at).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    {!n.read_status && (
                      <span className="text-emerald-700 font-sans font-bold flex items-center gap-0.5">
                        <Check className="w-3 h-3" />
                        Click to mark read
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-stone-50 border-t border-stone-200 flex items-center justify-between text-xs">
          <button
            onClick={onClearAll}
            className="text-stone-500 hover:text-stone-800 font-semibold"
          >
            Mark all as read
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-emerald-700 text-white font-bold rounded-xl"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

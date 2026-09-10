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
  lang: Language;
}

export const NotificationsDrawer: React.FC<NotificationsDrawerProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkRead,
  onClearAll,
  lang,
}) => {
  if (!isOpen) return null;
  const t = translations[lang];

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
                Official APMC & Queue SMS Alerts
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

              return (
                <div
                  key={n.notification_id}
                  onClick={() => onMarkRead(n.notification_id)}
                  className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer ${
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

                  <p className="text-xs text-stone-600 mt-2 leading-relaxed">
                    {n.message}
                  </p>

                  <div className="mt-2.5 pt-2 border-t border-stone-100 flex items-center justify-between text-[10px] text-stone-400 font-mono">
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

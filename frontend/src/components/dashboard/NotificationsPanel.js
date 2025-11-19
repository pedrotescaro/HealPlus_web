import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';

const NotificationsPanel = () => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications] = useState([
    {
      id: 1,
      title: t('dashboard.notification.newReport', 'Novo relatório de paciente'),
      description: t('dashboard.notification.reportUpdated', 'O relatório foi atualizado.'),
      time: t('dashboard.notification.timeAgo', '2 minutos atrás'),
      read: false,
    },
    {
      id: 2,
      title: t('dashboard.notification.appointmentSoon', 'Consulta em breve'),
      description: t('dashboard.notification.appointmentDescription', 'Sua consulta começa em breve.'),
      time: t('dashboard.notification.timeAgo2', '15 minutos atrás'),
      read: false,
    },
    {
      id: 3,
      title: t('dashboard.notification.analysisComplete', 'Análise de IA concluída'),
      description: t('dashboard.notification.analysisDescription', 'A análise da imagem está pronta.'),
      time: t('dashboard.notification.timeAgo3', '1 hora atrás'),
      read: true,
    },
  ]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 block h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-bold">
            {unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50 max-h-96 overflow-hidden"
            >
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {t('dashboard.notifications', 'Notificações')}
                  </h3>
                  {unreadCount > 0 && (
                    <button
                      onClick={() => {
                        // Marcar todas como lidas
                      }}
                      className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
                    >
                      {t('dashboard.markAllRead', 'Marcar todas como lidas')}
                    </button>
                  )}
                </div>
              </div>

              <div className="overflow-y-auto max-h-80">
                {notifications.length > 0 ? (
                  <div className="divide-y divide-gray-200 dark:divide-gray-700">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer ${
                          !notification.read ? 'bg-primary-50 dark:bg-primary-900/20' : ''
                        }`}
                      >
                        <p className="font-semibold text-gray-900 dark:text-white text-sm">
                          {notification.title}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {notification.description}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                          {notification.time}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center">
                    <p className="text-gray-500 dark:text-gray-400">
                      {t('dashboard.noNotifications', 'Nenhuma notificação')}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationsPanel;


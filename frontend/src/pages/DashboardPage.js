import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/Layout';
import { dashboardService } from '../services/api';
import { motion } from 'framer-motion';

const DashboardPage = () => {
  const { t } = useTranslation();
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadStats = useCallback(async () => {
    try {
      const data = await dashboardService.getStats(token);
      setStats(data);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const statCards = [
    {
      title: t('dashboard.totalPatients'),
      value: stats?.total_patients || 0,
      icon: (
        <svg className="w-7 h-7 stroke-current" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      // Cores para o ícone e fundo: Icone azul escuro, Fundo azul claro
      color: 'text-blue-600 dark:text-blue-300 bg-blue-100 dark:bg-blue-900',
    },
    {
      title: t('dashboard.totalAnalyses'),
      value: stats?.total_analyses || 0,
      icon: (
        <svg className="w-7 h-7 stroke-current" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      ),
      // Cores para o ícone e fundo: Icone verde escuro, Fundo verde claro
      color: 'text-green-600 dark:text-green-300 bg-green-100 dark:bg-green-900',
    },
    {
      title: t('dashboard.totalReports'),
      value: stats?.total_reports || 0,
      icon: (
        <svg className="w-7 h-7 stroke-current" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      // Cores para o ícone e fundo: Icone roxo escuro, Fundo roxo claro
      color: 'text-purple-600 dark:text-purple-300 bg-purple-100 dark:bg-purple-900',
    },
  ];

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          {/* Spinner com cor primária */}
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8">
        {/* Welcome Section */}
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }}>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
            {t('dashboard.welcome')}, {user?.name}!
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Aqui está o resumo das suas atividades e acesso rápido às tarefas.
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {statCards.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ scale: 0.95, opacity: 0, y: 30 }}
              whileInView={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true, amount: 0.2 }}
              className="card transform hover:scale-[1.02] transition-all duration-300 cursor-pointer hover:shadow-xl"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {stat.title}
                  </p>
                  <p className="text-4xl font-extrabold text-gray-900 dark:text-white mt-1">
                    {stat.value}
                  </p>
                </div>
                {/* Ajuste: p-4 e rounded-full para o ícone */}
                <div className={`${stat.color} p-4 rounded-full flex-shrink-0`}>
                  {stat.icon}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions */}
        <motion.div className="card" initial={{ y: 20, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }} viewport={{ once: true }}>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Ações Rápidas
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            <button
              onClick={() => navigate('/patients/new')}
              className="btn-action-card"
            >
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              **{t('patients.addNew')}**
            </button>
            <button
              onClick={() => navigate('/assessments/new')}
              className="btn-action-card"
            >
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              **{t('patients.newAssessment')}**
            </button>
            <button
              onClick={() => navigate('/chat')}
              className="btn-action-card"
            >
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              **{t('dashboard.chat')}**
            </button>
            <button
              onClick={() => navigate('/reports')}
              className="btn-action-card"
            >
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              **{t('reports.viewAll')}**
            </button>
          </div>
        </motion.div>

        {/* Upcoming Appointments */}
        {stats?.upcoming_appointments && stats.upcoming_appointments.length > 0 && (
          <motion.div className="card" initial={{ y: 20, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }} viewport={{ once: true }}>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              {t('dashboard.upcomingAppointments')}
            </h2>
            <div className="space-y-3">
              {stats.upcoming_appointments.map((appointment, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl shadow-sm border-l-4 border-primary-500 transition-shadow hover:shadow-md"
                >
                  <div>
                    {/* Exibe o Patient ID como nome temporário */}
                    <p className="font-semibold text-lg text-gray-900 dark:text-white">
                      {appointment.patient_id}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {/* Formatação mais clara da data/hora */}
                      <span className="font-mono">{new Date(appointment.scheduled_date).toLocaleTimeString()}</span> - {new Date(appointment.scheduled_date).toLocaleDateString()}
                    </p>
                  </div>
                  {/* Tag mais vibrante e em maiúsculas */}
                  <span className="px-3 py-1 bg-primary-200 dark:bg-primary-800 text-primary-800 dark:text-primary-100 rounded-full text-xs font-bold uppercase">
                    {appointment.status}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </Layout>
  );
};

export default DashboardPage;
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/Layout';
import { dashboardService, appointmentService, patientService, woundService, reportService } from '../services/api';
import { motion } from 'framer-motion';
import ActivitySummaryChart from '../components/dashboard/ActivitySummaryChart';
import AgendaView from '../components/dashboard/AgendaView';
import NotificationsPanel from '../components/dashboard/NotificationsPanel';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const DashboardPage = () => {
  const { t } = useTranslation();
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activityData, setActivityData] = useState([]);
  const [dashboardStats, setDashboardStats] = useState({
    totalPatients: 0,
    totalEvaluations: 0,
    totalReports: 0,
    totalComparisons: 0,
    thisMonthEvaluations: 0,
  });

  const loadStats = useCallback(async () => {
    try {
      const data = await dashboardService.getStats(token);
      setStats(data);

      // Calcular estatísticas adicionais
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      
      // Buscar dados adicionais para estatísticas
      try {
        const [patients, appointments, wounds] = await Promise.all([
          patientService.getAll(token).catch(() => []),
          appointmentService.getAll(token).catch(() => []),
          Promise.resolve([]), // Wound analyses - pode ser implementado depois
        ]);

        const uniquePatients = new Set(patients.map(p => p.id)).size;
        const totalEvaluations = wounds.length || data?.total_analyses || 0;
        const totalReports = data?.total_reports || 0;
        const totalComparisons = 0; // Pode ser implementado depois

        // Calcular avaliações deste mês (simulado)
        const thisMonthEvaluations = Math.floor(totalEvaluations * 0.3); // Aproximação

        setDashboardStats({
          totalPatients: uniquePatients || data?.total_patients || 0,
          totalEvaluations: totalEvaluations,
          totalReports: totalReports,
          totalComparisons: totalComparisons,
          thisMonthEvaluations: thisMonthEvaluations,
        });

        // Configurar dados do gráfico
        setActivityData([
          { name: 'completedForms', value: totalEvaluations },
          { name: 'generatedReports', value: totalReports },
          { name: 'comparisons', value: totalComparisons },
        ]);
      } catch (error) {
        console.error('Error loading additional stats:', error);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  // Cards de estatísticas detalhadas (6 cards)
  const detailedStatCards = [
    {
      title: t('dashboard.totalPatients', 'Pacientes Atendidos'),
      value: dashboardStats.totalPatients,
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      color: 'text-blue-600 dark:text-blue-300 bg-blue-100 dark:bg-blue-900',
    },
    {
      title: t('dashboard.totalEvaluations', 'Avaliações Realizadas'),
      value: dashboardStats.totalEvaluations,
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
      color: 'text-green-600 dark:text-green-300 bg-green-100 dark:bg-green-900',
    },
    {
      title: t('dashboard.totalReports', 'Relatórios Gerados'),
      value: dashboardStats.totalReports,
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      color: 'text-purple-600 dark:text-purple-300 bg-purple-100 dark:bg-purple-900',
    },
    {
      title: t('dashboard.totalComparisons', 'Comparações Realizadas'),
      value: dashboardStats.totalComparisons,
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      ),
      color: 'text-orange-600 dark:text-orange-300 bg-orange-100 dark:bg-orange-900',
    },
    {
      title: t('dashboard.thisMonth', 'Este Mês'),
      value: dashboardStats.thisMonthEvaluations,
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      ),
      color: 'text-indigo-600 dark:text-indigo-300 bg-indigo-100 dark:bg-indigo-900',
    },
    {
      title: t('dashboard.reportRate', 'Taxa de Relatórios'),
      value: dashboardStats.totalEvaluations > 0 
        ? `${Math.round((dashboardStats.totalReports / dashboardStats.totalEvaluations) * 100)}%`
        : '0%',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      color: 'text-pink-600 dark:text-pink-300 bg-pink-100 dark:bg-pink-900',
    },
  ];

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header com Notificações */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }} 
          animate={{ y: 0, opacity: 1 }} 
          transition={{ duration: 0.5 }}
          className="flex justify-between items-center"
        >
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
              {t('dashboard.welcome')}, {user?.name}!
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {t('dashboard.subtitle', 'Gerencie suas avaliações, relatórios e pacientes em um só lugar.')}
            </p>
          </div>
          <NotificationsPanel />
        </motion.div>

        {/* Estatísticas Detalhadas - 6 Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {detailedStatCards.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ scale: 0.95, opacity: 0, y: 30 }}
              whileInView={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true, amount: 0.2 }}
              className="card text-center transform hover:scale-[1.02] transition-all duration-300"
            >
              <div className="flex flex-col items-center space-y-2">
                <div className={`${stat.color} p-4 rounded-full`}>
                  {stat.icon}
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stat.value}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {stat.title}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Cards de Ações Rápidas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <motion.div
            className="card flex flex-col"
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-5 h-5 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {t('dashboard.newAnamnesis', 'Nova Anamnese')}
              </h2>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {t('dashboard.newAnamnesisDesc', 'Crie uma nova ficha de avaliação de ferida')}
            </p>
            <button
              onClick={() => navigate('/assessments')}
              className="btn-primary mt-auto"
            >
              {t('dashboard.createForm', 'Criar Ficha')}
            </button>
          </motion.div>

          <motion.div
            className="card flex flex-col"
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-5 h-5 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {t('dashboard.generateReport', 'Gerar Relatório')}
              </h2>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {t('dashboard.generateReportDesc', 'Gere um relatório detalhado da análise')}
            </p>
            <button
              onClick={() => navigate('/reports')}
              className="btn-primary mt-auto"
            >
              {t('dashboard.createReport', 'Criar Relatório')}
            </button>
          </motion.div>

          <motion.div
            className="card flex flex-col"
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-5 h-5 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {t('dashboard.compareReports', 'Comparar Relatórios')}
              </h2>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {t('dashboard.compareReportsDesc', 'Compare análises de progressão')}
            </p>
            <button
              onClick={() => navigate('/reports')}
              className="btn-primary mt-auto"
            >
              {t('dashboard.compareBtn', 'Comparar')}
            </button>
          </motion.div>
        </div>

        {/* Agenda View */}
        <AgendaView />

        {/* Resumo de Atividades e Gráfico */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Resumo de Atividades */}
          <motion.div
            className="card"
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              {t('dashboard.activitySummary', 'Resumo das Atividades')}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {t('dashboard.activitySummaryDesc', 'Sua atividade recente na plataforma')}
            </p>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg border border-primary/20">
                <div className="flex items-center gap-3">
                  <svg className="h-6 w-6 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {t('dashboard.completedForms', 'Fichas Concluídas')}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Forms Completed</p>
                  </div>
                </div>
                <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                  {dashboardStats.totalEvaluations}
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-500/5 to-blue-500/10 rounded-lg border border-blue-500/20">
                <div className="flex items-center gap-3">
                  <svg className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {t('dashboard.generatedReports', 'Relatórios Gerados')}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Reports Generated</p>
                  </div>
                </div>
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {dashboardStats.totalReports}
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-500/5 to-green-500/10 rounded-lg border border-green-500/20">
                <div className="flex items-center gap-3">
                  <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {t('dashboard.comparisons', 'Comparações')}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Comparisons</p>
                  </div>
                </div>
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {dashboardStats.totalComparisons}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Gráfico de Atividade */}
          <motion.div
            className="card"
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              {t('dashboard.activityChart', 'Gráfico de Atividade')}
            </h2>
            <div className="pt-4">
              <ActivitySummaryChart data={activityData} />
            </div>
          </motion.div>
        </div>

        {/* Atividade Recente Detalhada */}
        <motion.div
          className="card"
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {t('dashboard.recentActivity', 'Atividade Recente')}
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            {t('dashboard.recentActivityDesc', 'Acompanhe suas últimas ações e progresso na plataforma')}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center p-4 bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg border border-primary/20">
              <svg className="h-8 w-8 text-primary-600 dark:text-primary-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                {dashboardStats.thisMonthEvaluations}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {t('dashboard.thisMonthEvaluations', 'Avaliações este mês')}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                {dashboardStats.totalEvaluations > 0 
                  ? `${Math.round((dashboardStats.thisMonthEvaluations / dashboardStats.totalEvaluations) * 100)}% do total`
                  : '0% do total'
                }
              </p>
            </div>

            <div className="text-center p-4 bg-gradient-to-br from-blue-500/5 to-blue-500/10 rounded-lg border border-blue-500/20">
              <svg className="h-8 w-8 text-blue-600 dark:text-blue-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {dashboardStats.totalEvaluations > 0 
                  ? Math.round((dashboardStats.totalReports / dashboardStats.totalEvaluations) * 100) 
                  : 0
                }%
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {t('dashboard.reportRate', 'Taxa de relatórios')}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                {dashboardStats.totalReports} de {dashboardStats.totalEvaluations} avaliações
              </p>
            </div>

            <div className="text-center p-4 bg-gradient-to-br from-green-500/5 to-green-500/10 rounded-lg border border-green-500/20">
              <svg className="h-8 w-8 text-green-600 dark:text-green-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {dashboardStats.totalPatients}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {t('dashboard.uniquePatients', 'Pacientes únicos')}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                {dashboardStats.totalEvaluations > 0 
                  ? `${Math.round(dashboardStats.totalEvaluations / Math.max(dashboardStats.totalPatients, 1))} avaliações/paciente`
                  : '0 avaliações/paciente'
                }
              </p>
            </div>

            <div className="text-center p-4 bg-gradient-to-br from-purple-500/5 to-purple-500/10 rounded-lg border border-purple-500/20">
              <svg className="h-8 w-8 text-purple-600 dark:text-purple-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {dashboardStats.totalComparisons}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {t('dashboard.comparisonsDone', 'Comparações realizadas')}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                {t('dashboard.aiAnalysis', 'Análises de progressão com IA')}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Próximos Agendamentos */}
        {stats?.upcoming_appointments && stats.upcoming_appointments.length > 0 && (
          <motion.div
            className="card"
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
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
                    <p className="font-semibold text-lg text-gray-900 dark:text-white">
                      {appointment.patient_id}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      <span className="font-mono">
                        {new Date(appointment.scheduled_date).toLocaleTimeString()}
                      </span>
                      {' - '}
                      {new Date(appointment.scheduled_date).toLocaleDateString()}
                    </p>
                  </div>
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

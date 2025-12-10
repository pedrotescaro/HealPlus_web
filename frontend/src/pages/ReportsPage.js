import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Button from '../components/Button';
import Loading from '../components/Loading';
import Alert from '../components/Alert';
import Modal from '../components/Modal';
import { woundService, reportService, patientService } from '../services/api';
import { motion } from 'framer-motion';
import { 
  FileText, Download, Eye, Calendar, User, Brain, 
  TrendingUp, TrendingDown, Minus, RefreshCw, Filter,
  ChevronDown, Search
} from 'lucide-react';

const ReportsPage = () => {
  const { t } = useTranslation();
  const { token } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState([]);
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState('');
  const [selectedReport, setSelectedReport] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [compareMode, setCompareMode] = useState(false);
  const [selectedForCompare, setSelectedForCompare] = useState([]);
  const [comparisonResult, setComparisonResult] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [patientsData] = await Promise.all([
        patientService.getAll(token)
      ]);
      setPatients(patientsData);

      if (patientsData.length > 0) {
        const firstPatientId = patientsData[0].id;
        const woundsData = await woundService.getPatientWounds(firstPatientId, token);
        setReports(woundsData);
        setSelectedPatient(firstPatientId);
      }
    } catch (err) {
      console.error('Error loading data:', err);
      setError(t('messages.error'));
    } finally {
      setLoading(false);
    }
  }, [token, t]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const loadPatientReports = useCallback(async (patientId) => {
    if (!patientId) return;
    setLoading(true);
    try {
      const woundsData = await woundService.getPatientWounds(patientId, token);
      setReports(woundsData);
      setSelectedPatient(patientId);
    } catch (err) {
      setError(t('messages.error'));
    } finally {
      setLoading(false);
    }
  }, [token, t]);

  const generatePDF = useCallback(async (reportId) => {
    try {
      const result = await reportService.generate(reportId, token);
      setSuccess(t('reports.pdfGenerated', 'PDF gerado com sucesso!'));
      if (result.url) {
        window.open(result.url, '_blank');
      }
    } catch (err) {
      setError(t('messages.error'));
    }
  }, [token, t]);

  const viewReportDetail = useCallback((report) => {
    setSelectedReport(report);
    setShowDetailModal(true);
  }, []);

  const toggleCompareSelection = useCallback((report) => {
    setSelectedForCompare(prev => {
      if (prev.find(r => r.id === report.id)) {
        return prev.filter(r => r.id !== report.id);
      }
      if (prev.length >= 2) {
        return [prev[1], report];
      }
      return [...prev, report];
    });
  }, []);

  const compareReports = useCallback(async () => {
    if (selectedForCompare.length !== 2) return;
    
    setLoading(true);
    try {
      const [report1, report2] = selectedForCompare;
      const result = await woundService.compareImages({
        image1Base64: report1.imageBase64,
        image1Id: report1.id,
        image1DateTime: report1.createdAt,
        image2Base64: report2.imageBase64,
        image2Id: report2.id,
        image2DateTime: report2.createdAt
      }, token);
      
      setComparisonResult(result);
      setSuccess(t('reports.comparisonComplete', 'Comparação concluída!'));
    } catch (err) {
      setError(t('messages.error'));
    } finally {
      setLoading(false);
    }
  }, [selectedForCompare, token, t]);

  const filteredReports = reports.filter(report => 
    report.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.notes?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getEvolutionIcon = (trend) => {
    if (trend > 0) return <TrendingUp className="w-5 h-5 text-green-500" />;
    if (trend < 0) return <TrendingDown className="w-5 h-5 text-red-500" />;
    return <Minus className="w-5 h-5 text-gray-500" />;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading && reports.length === 0) {
    return (
      <Layout>
        <Loading fullScreen={false} message={t('common.loading')} />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {t('reports.title', 'Relatórios')}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {t('reports.subtitle', 'Visualize e compare relatórios de avaliações')}
            </p>
          </div>
          
          <div className="flex gap-3">
            <Button
              variant={compareMode ? 'primary' : 'secondary'}
              onClick={() => {
                setCompareMode(!compareMode);
                setSelectedForCompare([]);
                setComparisonResult(null);
              }}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              {compareMode ? t('reports.exitCompare', 'Sair do Modo Comparar') : t('reports.compare', 'Comparar')}
            </Button>
          </div>
        </motion.div>

        {/* Alerts */}
        {error && <Alert type="error" message={error} onClose={() => setError('')} />}
        {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

        {/* Filters */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col md:flex-row gap-4"
        >
          {/* Patient Selector */}
          <div className="relative flex-1 max-w-xs">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={selectedPatient}
              onChange={(e) => loadPatientReports(e.target.value)}
              className="w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary-500 appearance-none"
            >
              <option value="">{t('reports.selectPatient', 'Selecione um paciente')}</option>
              {patients.map(patient => (
                <option key={patient.id} value={patient.id}>
                  {patient.name}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          </div>

          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder={t('common.search', 'Pesquisar...')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </motion.div>

        {/* Compare Mode Info */}
        {compareMode && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-primary-50 dark:bg-primary-900/30 border border-primary-200 dark:border-primary-700 rounded-lg p-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-primary-700 dark:text-primary-300">
                  {t('reports.compareMode', 'Modo Comparação')}
                </p>
                <p className="text-sm text-primary-600 dark:text-primary-400">
                  {t('reports.selectTwo', 'Selecione 2 relatórios para comparar')} ({selectedForCompare.length}/2)
                </p>
              </div>
              {selectedForCompare.length === 2 && (
                <Button onClick={compareReports} loading={loading}>
                  <Brain className="w-4 h-4 mr-2" />
                  {t('reports.compareNow', 'Comparar Agora')}
                </Button>
              )}
            </div>
          </motion.div>
        )}

        {/* Comparison Result */}
        {comparisonResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="p-6">
              <h3 className="text-xl font-bold mb-4 flex items-center">
                <Brain className="w-6 h-6 mr-2 text-primary-600" />
                {t('reports.comparisonResult', 'Resultado da Comparação')}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Analysis 1 */}
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <h4 className="font-bold mb-2">{t('reports.firstAnalysis', 'Primeira Análise')}</h4>
                  {comparisonResult.analiseImagem1 && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {comparisonResult.analiseImagem1.dataHoraCaptura && formatDate(comparisonResult.analiseImagem1.dataHoraCaptura)}
                    </p>
                  )}
                </div>

                {/* Evolution */}
                <div className="p-4 bg-primary-50 dark:bg-primary-900/30 rounded-lg flex flex-col items-center justify-center">
                  <h4 className="font-bold mb-2">{t('reports.evolution', 'Evolução')}</h4>
                  {comparisonResult.relatorioComparativo && (
                    <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                      {comparisonResult.relatorioComparativo.resumoDescritivoEvolucao}
                    </p>
                  )}
                </div>

                {/* Analysis 2 */}
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <h4 className="font-bold mb-2">{t('reports.secondAnalysis', 'Segunda Análise')}</h4>
                  {comparisonResult.analiseImagem2 && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {comparisonResult.analiseImagem2.dataHoraCaptura && formatDate(comparisonResult.analiseImagem2.dataHoraCaptura)}
                    </p>
                  )}
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Reports Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredReports.map((report, index) => (
            <motion.div
              key={report.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card 
                className={`p-4 cursor-pointer transition-all ${
                  compareMode && selectedForCompare.find(r => r.id === report.id)
                    ? 'ring-2 ring-primary-500 bg-primary-50 dark:bg-primary-900/20'
                    : 'hover:shadow-lg'
                }`}
                onClick={() => compareMode ? toggleCompareSelection(report) : viewReportDetail(report)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                      <FileText className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                    </div>
                    <div className="ml-3">
                      <p className="font-bold text-gray-900 dark:text-white">
                        {t('reports.report', 'Relatório')} #{report.id?.slice(-6)}
                      </p>
                      <p className="text-sm text-gray-500">
                        <Calendar className="w-3 h-3 inline mr-1" />
                        {report.createdAt && formatDate(report.createdAt)}
                      </p>
                    </div>
                  </div>
                  {compareMode && selectedForCompare.find(r => r.id === report.id) && (
                    <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      {selectedForCompare.findIndex(r => r.id === report.id) + 1}
                    </div>
                  )}
                </div>

                {report.aiAnalysis && (
                  <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center text-sm">
                      <Brain className="w-4 h-4 mr-2 text-primary-500" />
                      <span className="font-medium">
                        {report.aiAnalysis.classificacao_etiologica?.tipo_probabilistico || 'Analisado'}
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="flex-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      viewReportDetail(report);
                    }}
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    {t('reports.view', 'Ver')}
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    className="flex-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      generatePDF(report.id);
                    }}
                  >
                    <Download className="w-4 h-4 mr-1" />
                    PDF
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {filteredReports.length === 0 && !loading && (
          <Card className="p-12 text-center">
            <FileText className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 dark:text-gray-400">
              {t('reports.noReports', 'Nenhum relatório encontrado')}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              {t('reports.noReportsDesc', 'Faça uma nova avaliação para gerar relatórios')}
            </p>
          </Card>
        )}

        {/* Detail Modal */}
        <Modal
          isOpen={showDetailModal}
          onClose={() => setShowDetailModal(false)}
          title={t('reports.reportDetails', 'Detalhes do Relatório')}
          size="lg"
        >
          {selectedReport && (
            <div className="space-y-6">
              {/* Image */}
              {selectedReport.imageBase64 && (
                <div>
                  <h4 className="font-bold mb-2">{t('timers.woundImage', 'Imagem da Ferida')}</h4>
                  <img
                    src={selectedReport.imageBase64}
                    alt="Wound"
                    className="w-full max-h-64 object-contain rounded-lg bg-gray-100"
                  />
                </div>
              )}

              {/* AI Analysis */}
              {selectedReport.aiAnalysis && (
                <div>
                  <h4 className="font-bold mb-2 flex items-center">
                    <Brain className="w-5 h-5 mr-2 text-primary-600" />
                    {t('reports.aiAnalysis', 'Análise de IA')}
                  </h4>
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-3">
                    {selectedReport.aiAnalysis.classificacao_etiologica && (
                      <div>
                        <p className="text-sm font-medium text-gray-500">{t('reports.classification', 'Classificação')}</p>
                        <p className="text-lg font-bold text-primary-600">
                          {selectedReport.aiAnalysis.classificacao_etiologica.tipo_probabilistico}
                        </p>
                        <p className="text-sm text-gray-600">
                          Confiança: {selectedReport.aiAnalysis.classificacao_etiologica.confianca_percentual}%
                        </p>
                      </div>
                    )}
                    
                    {selectedReport.aiAnalysis.recomendacoes_prioritarias && (
                      <div>
                        <p className="text-sm font-medium text-gray-500 mb-2">{t('reports.recommendations', 'Recomendações')}</p>
                        <ul className="space-y-1">
                          {selectedReport.aiAnalysis.recomendacoes_prioritarias.map((rec, i) => (
                            <li key={i} className="text-sm text-gray-700 dark:text-gray-300 flex items-start">
                              <span className="w-2 h-2 bg-primary-500 rounded-full mt-1.5 mr-2 flex-shrink-0" />
                              {rec}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t">
                <Button
                  variant="primary"
                  className="flex-1"
                  onClick={() => generatePDF(selectedReport.id)}
                >
                  <Download className="w-4 h-4 mr-2" />
                  {t('reports.download', 'Baixar PDF')}
                </Button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </Layout>
  );
};

export default ReportsPage;

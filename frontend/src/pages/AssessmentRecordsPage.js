import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { 
  FileText, 
  Search, 
  Filter, 
  Calendar, 
  User, 
  ChevronRight,
  Eye,
  Download,
  Trash2,
  X,
  Activity,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Minus,
  Clock,
  MapPin,
  Stethoscope
} from 'lucide-react';
import Layout from '../components/Layout';
import { woundService, patientService } from '../services/api';

const AssessmentRecordsPage = () => {
  const { t } = useTranslation();
  const [assessments, setAssessments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPatient, setFilterPatient] = useState('');
  const [selectedAssessment, setSelectedAssessment] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [assessmentsData, patientsData] = await Promise.all([
        woundService.getAll(),
        patientService.getAll()
      ]);
      
      const assessmentsList = Array.isArray(assessmentsData) 
        ? assessmentsData 
        : (assessmentsData?.data || assessmentsData?.content || []);
      
      const patientsList = Array.isArray(patientsData) 
        ? patientsData 
        : (patientsData?.data || patientsData?.content || []);
      
      setAssessments(assessmentsList);
      setPatients(patientsList);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPatientName = (patientId) => {
    const patient = patients.find(p => p.id === patientId);
    return patient?.name || patient?.nome || 'Paciente não encontrado';
  };

  const getPatientData = (patientId) => {
    return patients.find(p => p.id === patientId) || null;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Data não disponível';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredAssessments = assessments.filter(assessment => {
    const patientName = getPatientName(assessment.patientId).toLowerCase();
    const matchesSearch = patientName.includes(searchTerm.toLowerCase()) ||
                          (assessment.notes || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (assessment.id || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPatient = !filterPatient || assessment.patientId === filterPatient;
    return matchesSearch && matchesPatient;
  });

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'improving':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'worsening':
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      default:
        return <Minus className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getRiskBadge = (risk) => {
    const riskLevel = risk?.level || risk || 'baixo';
    const colors = {
      'BAIXO': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'baixo': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'low': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'MODERADO': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      'moderado': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      'medium': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      'ALTO': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      'alto': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      'high': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      'CRÍTICO': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      'critico': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      'critical': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    };
    return colors[riskLevel] || colors['baixo'];
  };

  const openDetails = (assessment) => {
    setSelectedAssessment(assessment);
    setShowDetails(true);
  };

  const closeDetails = () => {
    setShowDetails(false);
    setSelectedAssessment(null);
  };

  const handleDelete = async (assessmentId) => {
    if (window.confirm(t('records.confirmDelete'))) {
      try {
        await woundService.delete(assessmentId);
        setAssessments(prev => prev.filter(a => a.id !== assessmentId));
        if (selectedAssessment?.id === assessmentId) {
          closeDetails();
        }
      } catch (error) {
        console.error('Erro ao excluir:', error);
      }
    }
  };

  // Componente do Card de Avaliação
  const AssessmentCard = ({ assessment, index }) => {
    const patient = getPatientData(assessment.patientId);
    const analysis = assessment.aiAnalysis || assessment.analysis || {};
    const classification = analysis.classificacao_etiologica || {};
    const risk = analysis.riskAssessment || classification.risco || {};

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-all group"
      >
        <div className="p-5">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-semibold text-lg">
                {getPatientName(assessment.patientId).charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {getPatientName(assessment.patientId)}
                </h3>
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <Calendar className="w-3.5 h-3.5" />
                  {formatDate(assessment.createdAt)}
                </div>
              </div>
            </div>
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getRiskBadge(risk)}`}>
              {risk?.level || t('records.evaluated')}
            </span>
          </div>

          {/* Tipo de Ferida */}
          {classification.tipo_probabilistico && (
            <div className="mb-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div className="flex items-center gap-2 text-sm">
                <Stethoscope className="w-4 h-4 text-primary-500" />
                <span className="font-medium text-gray-900 dark:text-white">
                  {classification.tipo_probabilistico}
                </span>
              </div>
              {classification.confianca_percentual && (
                <div className="mt-2">
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                    <span>{t('records.confidence')}</span>
                    <span>{classification.confianca_percentual}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1.5">
                    <div 
                      className="bg-primary-500 h-1.5 rounded-full transition-all"
                      style={{ width: `${classification.confianca_percentual}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Notas */}
          {assessment.notes && (
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
              {assessment.notes}
            </p>
          )}

          {/* Ações */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
            <div className="flex gap-2">
              <button
                onClick={() => openDetails(assessment)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-900/50 transition-colors"
              >
                <Eye className="w-4 h-4" />
                {t('records.viewDetails')}
              </button>
              <button
                onClick={() => handleDelete(assessment.id)}
                className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                title={t('common.delete')}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-primary-500 transition-colors" />
          </div>
        </div>
      </motion.div>
    );
  };

  // Modal de Detalhes
  const DetailsModal = () => {
    if (!selectedAssessment) return null;

    const patient = getPatientData(selectedAssessment.patientId);
    const analysis = selectedAssessment.aiAnalysis || selectedAssessment.analysis || {};
    const classification = analysis.classificacao_etiologica || {};
    const dimensional = analysis.analise_dimensional || {};
    const recommendations = analysis.recomendacoes_prioritarias || [];
    const risk = analysis.riskAssessment || {};
    const anamnesis = selectedAssessment.anamnesis || selectedAssessment.anamnesisData || {};
    const tissueData = selectedAssessment.tissueAssessment || anamnesis.tissueAssessment || {};

    return (
      <AnimatePresence>
        {showDetails && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={closeDetails}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-xl">
                      {getPatientName(selectedAssessment.patientId).charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">
                        {getPatientName(selectedAssessment.patientId)}
                      </h2>
                      <div className="flex items-center gap-3 text-primary-100 text-sm">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {formatDate(selectedAssessment.createdAt)}
                        </span>
                        <span className="flex items-center gap-1">
                          <FileText className="w-4 h-4" />
                          ID: {selectedAssessment.id}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={closeDetails}
                    className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  
                  {/* Dados do Paciente */}
                  {patient && (
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-5">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <User className="w-5 h-5 text-primary-500" />
                        {t('records.patientData')}
                      </h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500 dark:text-gray-400">{t('anamnesis.name')}:</span>
                          <span className="text-gray-900 dark:text-white font-medium">
                            {patient.name || patient.nome}
                          </span>
                        </div>
                        {(patient.age || patient.idade) && (
                          <div className="flex justify-between">
                            <span className="text-gray-500 dark:text-gray-400">{t('anamnesis.age')}:</span>
                            <span className="text-gray-900 dark:text-white">
                              {patient.age || patient.idade} {t('patients.years', 'anos')}
                            </span>
                          </div>
                        )}
                        {(patient.gender || patient.sexo) && (
                          <div className="flex justify-between">
                            <span className="text-gray-500 dark:text-gray-400">{t('anamnesis.gender')}:</span>
                            <span className="text-gray-900 dark:text-white">
                              {patient.gender || patient.sexo}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Classificação da Ferida */}
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-5">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <Stethoscope className="w-5 h-5 text-primary-500" />
                      {t('records.woundClassification')}
                    </h3>
                    <div className="space-y-3">
                      {classification.tipo_probabilistico && (
                        <div>
                          <span className="text-xs text-gray-500 dark:text-gray-400 uppercase">{t('records.type')}</span>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {classification.tipo_probabilistico}
                          </p>
                        </div>
                      )}
                      {classification.fase_cicatrizacao && (
                        <div>
                          <span className="text-xs text-gray-500 dark:text-gray-400 uppercase">{t('records.healingPhase')}</span>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {classification.fase_cicatrizacao}
                          </p>
                        </div>
                      )}
                      {classification.confianca_percentual && (
                        <div>
                          <span className="text-xs text-gray-500 dark:text-gray-400 uppercase">{t('records.aiConfidence')}</span>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex-1 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                              <div 
                                className="bg-gradient-to-r from-primary-500 to-primary-600 h-2 rounded-full"
                                style={{ width: `${classification.confianca_percentual}%` }}
                              />
                            </div>
                            <span className="text-sm font-semibold text-primary-600 dark:text-primary-400">
                              {classification.confianca_percentual}%
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Análise Dimensional */}
                  {(dimensional.area_total_afetada || dimensional.profundidade_estimada) && (
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-5">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-primary-500" />
                        {t('records.dimensionalAnalysis')}
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        {dimensional.area_total_afetada && (
                          <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg">
                            <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                              {dimensional.area_total_afetada}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{t('records.area')}</p>
                          </div>
                        )}
                        {dimensional.profundidade_estimada && (
                          <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg">
                            <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                              {dimensional.profundidade_estimada}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{t('records.depth')}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Avaliação de Tecidos */}
                  {(tissueData.granulation || tissueData.epithelialization || tissueData.slough || tissueData.necrosis) && (
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-5">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <Activity className="w-5 h-5 text-primary-500" />
                        {t('records.tissueComposition')}
                      </h3>
                      <div className="space-y-3">
                        {/* Barra visual */}
                        <div className="h-6 rounded-full overflow-hidden flex">
                          {tissueData.granulation > 0 && (
                            <div 
                              className="bg-red-500 h-full flex items-center justify-center text-white text-xs font-medium"
                              style={{ width: `${tissueData.granulation}%` }}
                            >
                              {tissueData.granulation > 10 && `${tissueData.granulation}%`}
                            </div>
                          )}
                          {tissueData.epithelialization > 0 && (
                            <div 
                              className="bg-pink-400 h-full flex items-center justify-center text-white text-xs font-medium"
                              style={{ width: `${tissueData.epithelialization}%` }}
                            >
                              {tissueData.epithelialization > 10 && `${tissueData.epithelialization}%`}
                            </div>
                          )}
                          {tissueData.slough > 0 && (
                            <div 
                              className="bg-yellow-400 h-full flex items-center justify-center text-gray-800 text-xs font-medium"
                              style={{ width: `${tissueData.slough}%` }}
                            >
                              {tissueData.slough > 10 && `${tissueData.slough}%`}
                            </div>
                          )}
                          {tissueData.necrosis > 0 && (
                            <div 
                              className="bg-gray-700 h-full flex items-center justify-center text-white text-xs font-medium"
                              style={{ width: `${tissueData.necrosis}%` }}
                            >
                              {tissueData.necrosis > 10 && `${tissueData.necrosis}%`}
                            </div>
                          )}
                        </div>
                        {/* Legenda */}
                        <div className="grid grid-cols-2 gap-2 text-xs text-gray-700 dark:text-gray-300">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-red-500"></div>
                            <span>{t('records.granulation')}: {tissueData.granulation || 0}%</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-pink-400"></div>
                            <span>{t('records.epithelialization')}: {tissueData.epithelialization || 0}%</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                            <span>{t('records.slough')}: {tissueData.slough || 0}%</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-gray-700"></div>
                            <span>{t('records.necrosis')}: {tissueData.necrosis || 0}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Recomendações */}
                  {recommendations.length > 0 && (
                    <div className="bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/30 dark:to-primary-800/30 rounded-xl p-5 lg:col-span-2">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-primary-500" />
                        {t('records.aiRecommendations')}
                      </h3>
                      <ul className="space-y-2">
                        {recommendations.map((rec, index) => (
                          <li key={index} className="flex items-start gap-3">
                            <span className="w-6 h-6 rounded-full bg-primary-500 text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                              {index + 1}
                            </span>
                            <span className="text-gray-700 dark:text-gray-300">{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Notas */}
                  {selectedAssessment.notes && (
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-5 lg:col-span-2">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-primary-500" />
                        {t('records.observations')}
                      </h3>
                      <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                        {selectedAssessment.notes}
                      </p>
                    </div>
                  )}

                  {/* Imagem */}
                  {selectedAssessment.imageBase64 && (
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-5 lg:col-span-2">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                        {t('records.woundImage')}
                      </h3>
                      <img 
                        src={selectedAssessment.imageBase64} 
                        alt="Ferida" 
                        className="max-w-full h-auto rounded-lg mx-auto max-h-96 object-contain"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
                <button
                  onClick={closeDetails}
                  className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                >
                  {t('common.close')}
                </button>
                <button
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  {t('records.exportPdf')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  };

  return (
    <Layout>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <FileText className="w-8 h-8 text-primary-500" />
            {t('records.title')}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            {t('records.subtitle')}
          </p>
        </div>

        {/* Filtros */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Busca */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder={t('records.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            
            {/* Filtro por paciente */}
            <div className="sm:w-64">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <select
                  value={filterPatient}
                  onChange={(e) => setFilterPatient(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none"
                >
                  <option value="">{t('records.allPatients')}</option>
                  {patients.map(patient => (
                    <option key={patient.id} value={patient.id}>
                      {patient.name || patient.nome}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Lista de Avaliações */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
          </div>
        ) : filteredAssessments.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <FileText className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {t('records.noRecords')}
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              {searchTerm || filterPatient 
                ? t('records.adjustFilters')
                : t('records.noRecordsHint')
              }
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAssessments.map((assessment, index) => (
              <AssessmentCard key={assessment.id} assessment={assessment} index={index} />
            ))}
          </div>
        )}

        {/* Contador */}
        {!loading && filteredAssessments.length > 0 && (
          <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
            {t('records.showing')} {filteredAssessments.length} {t('records.of')} {assessments.length} {t('records.assessments')}
          </div>
        )}

        {/* Modal de Detalhes */}
        <DetailsModal />
      </div>
    </Layout>
  );
};

export default AssessmentRecordsPage;

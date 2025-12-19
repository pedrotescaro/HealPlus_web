import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import Alert from '../components/Alert';
import Loading from '../components/Loading';
import { woundService, patientService } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Camera, Upload, X, ChevronRight, ChevronLeft, 
  FileText, Brain, AlertTriangle, CheckCircle, Image as ImageIcon,
  User, Stethoscope, Activity, FileCheck, Clock, Sparkles
} from 'lucide-react';

// Componentes avançados de anamnese
import { 
  AnamnesisForm, 
  WoundImageUploader, 
  WoundAnalysisResult, 
  TemporalEvolutionChart 
} from '../components/anamnesis';

const STEPS = ['patient', 'anamnesis', 'image', 'analysis', 'review'];

const AssessmentsPage = () => {
  const { t } = useTranslation();
  const { token } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const fileInputRef = useRef(null);
  
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [analysisResult, setAnalysisResult] = useState(null);
  const [temporalData, setTemporalData] = useState(null);
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [formData, setFormData] = useState({
    patientId: searchParams.get('patientId') || '',
    patientName: '',
    patientData: null,
    imageBase64: '',
    imagePreview: '',
    imageValidation: null,
    anamnesisData: null,
    timersData: {
      tissue: { type: '', percentage: 0 },
      infection: { signs: [], painLevel: 0 },
      moisture: { level: 'moderate', type: 'serous' },
      edges: { condition: 'attached', characteristics: 'regular' },
      repair: { observations: '', treatmentPlan: '' },
      social: { comorbidities: [], medications: [] }
    }
  });

  // Buscar lista de pacientes
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const data = await patientService.getAll(token);
        // O retorno pode ser um array diretamente ou um objeto com propriedade data
        const patientsList = Array.isArray(data) ? data : (data?.data || data?.content || []);
        setPatients(patientsList);
      } catch (err) {
        console.error('Error fetching patients:', err);
        setPatients([]);
      }
    };
    fetchPatients();
  }, [token]);

  // Filtrar pacientes baseado na busca
  const filteredPatients = patients.filter(patient => 
    patient.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.cpf?.includes(searchTerm)
  );

  // Selecionar paciente
  const selectPatient = useCallback((patient) => {
    setFormData(prev => ({
      ...prev,
      patientId: patient.id,
      patientName: patient.name,
      patientData: patient
    }));
    setSearchTerm('');
  }, []);

  // Handler para captura de imagem
  const handleImageCapture = useCallback((base64Image) => {
    setFormData(prev => ({
      ...prev,
      imageBase64: base64Image,
      imagePreview: base64Image
    }));
    setAnalysisResult(null);
  }, []);

  // Handler para validação de imagem
  const handleImageValidation = useCallback((validationResult) => {
    setFormData(prev => ({
      ...prev,
      imageValidation: validationResult
    }));
  }, []);

  // Handler para dados de anamnese
  const handleAnamnesisComplete = useCallback((anamnesisData) => {
    setFormData(prev => ({
      ...prev,
      anamnesisData
    }));
  }, []);

  const removeImage = useCallback(() => {
    setFormData(prev => ({
      ...prev,
      imageBase64: '',
      imagePreview: '',
      imageValidation: null
    }));
    setAnalysisResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  const handleTimersChange = useCallback((section, field, value) => {
    setFormData(prev => ({
      ...prev,
      timersData: {
        ...prev.timersData,
        [section]: {
          ...prev.timersData[section],
          [field]: value
        }
      }
    }));
  }, []);

  // Analisar imagem com IA avançada
  const analyzeImage = useCallback(async () => {
    if (!formData.imageBase64) {
      setError(t('messages.noImage', 'Por favor, faça upload de uma imagem'));
      return;
    }

    setAnalyzing(true);
    setError('');

    try {
      // Preparar dados para análise multimodal
      const analysisRequest = {
        patientId: formData.patientId || 'temp-patient',
        imageBase64: formData.imageBase64,
        clinicalData: formData.anamnesisData ? {
          comorbidities: formData.anamnesisData.comorbidities || [],
          medications: Object.values(formData.anamnesisData.medications || {}).flat(),
          woundInfo: formData.anamnesisData.woundInfo,
          vitalSigns: formData.anamnesisData.vitalSigns,
          bradenScale: formData.anamnesisData.bradenScale,
          painAssessment: formData.anamnesisData.painAssessment,
          nutritionalHistory: formData.anamnesisData.nutritionalHistory
        } : null
      };

      // Chamar análise completa (multimodal + explicação)
      const result = await woundService.analyzeComplete(analysisRequest, token);
      
      setAnalysisResult(result);
      
      // Buscar evolução temporal se houver avaliações anteriores
      if (formData.patientId) {
        try {
          const temporal = await woundService.getTemporalAnalysis(formData.patientId, token);
          setTemporalData(temporal);
        } catch (temporalError) {
          console.log('No temporal data available:', temporalError);
        }
      }
      
      setSuccess(t('messages.analysisComplete', 'Análise concluída com sucesso!'));
      setCurrentStep(3); // Ir para step de análise
    } catch (err) {
      console.error('Analysis error:', err);
      setError(err.response?.data?.message || t('messages.analysisError', 'Erro ao analisar imagem'));
    } finally {
      setAnalyzing(false);
    }
  }, [formData, token, t]);

  const handleSubmit = useCallback(async () => {
    setLoading(true);
    try {
      const assessmentData = {
        patientId: formData.patientId,
        imageBase64: formData.imageBase64,
        anamnesisData: formData.anamnesisData,
        timersData: formData.timersData,
        analysisResult: analysisResult
      };
      
      await woundService.saveAssessment(assessmentData, token);
      
      setSuccess(t('messages.assessmentSaved', 'Avaliação salva com sucesso!'));
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || t('messages.error'));
    } finally {
      setLoading(false);
    }
  }, [formData, analysisResult, token, navigate, t]);

  const nextStep = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  // Validar se pode avançar para próximo step
  const canProceed = useCallback(() => {
    switch (currentStep) {
      case 0: return !!formData.patientId; // Paciente selecionado
      case 1: return !!formData.anamnesisData; // Anamnese preenchida
      case 2: return !!formData.imageBase64 && formData.imageValidation?.isValid !== false; // Imagem válida
      case 3: return !!analysisResult; // Análise concluída
      default: return true;
    }
  }, [currentStep, formData, analysisResult]);

  const stepInfo = [
    { key: 'patient', icon: User, label: 'Paciente', color: 'primary' },
    { key: 'anamnesis', icon: Stethoscope, label: 'Anamnese', color: 'blue' },
    { key: 'image', icon: Camera, label: 'Imagem', color: 'green' },
    { key: 'analysis', icon: Brain, label: 'Análise IA', color: 'purple' },
    { key: 'review', icon: FileCheck, label: 'Revisão', color: 'amber' }
  ];

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8 overflow-x-auto pb-2">
      {stepInfo.map((step, index) => (
        <React.Fragment key={step.key}>
          <motion.div 
            className={`flex flex-col items-center cursor-pointer`}
            onClick={() => index < currentStep && setCurrentStep(index)}
            whileHover={{ scale: index < currentStep ? 1.05 : 1 }}
          >
            <div 
              className={`flex items-center justify-center w-12 h-12 rounded-full text-sm font-bold transition-all duration-300 ${
                index < currentStep 
                  ? 'bg-green-500 text-white' 
                  : index === currentStep 
                    ? 'bg-primary-600 text-white ring-4 ring-primary-200 dark:ring-primary-800' 
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
              }`}
            >
              {index < currentStep ? (
                <CheckCircle className="w-6 h-6" />
              ) : (
                <step.icon className="w-5 h-5" />
              )}
            </div>
            <span className={`text-xs mt-2 font-medium ${
              index <= currentStep ? 'text-primary-600 dark:text-primary-400' : 'text-gray-500'
            }`}>
              {step.label}
            </span>
          </motion.div>
          {index < stepInfo.length - 1 && (
            <div className={`w-12 md:w-20 h-1 mx-1 transition-all duration-300 ${
              index < currentStep 
                ? 'bg-green-500' 
                : 'bg-gray-200 dark:bg-gray-700'
            }`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );

  const renderPatientStep = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center mx-auto mb-4">
          <User className="w-8 h-8 text-primary-600 dark:text-primary-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {t('assessments.selectPatient', 'Selecione o Paciente')}
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          {t('assessments.selectPatientDesc', 'Escolha o paciente para esta avaliação')}
        </p>
      </div>

      {/* Paciente selecionado */}
      {formData.patientData ? (
        <Card className="p-4 border-2 border-primary-500 bg-primary-50 dark:bg-primary-900/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                {formData.patientData.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {formData.patientData.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {formData.patientData.cpf} • {formData.patientData.age || '-'} anos
                </p>
              </div>
            </div>
            <Button 
              variant="secondary" 
              size="sm"
              onClick={() => setFormData(prev => ({ ...prev, patientId: '', patientName: '', patientData: null }))}
            >
              Alterar
            </Button>
          </div>
        </Card>
      ) : (
        <>
          <Input
            label={t('patients.search', 'Buscar Paciente')}
            placeholder={t('assessments.searchPatient', 'Nome ou CPF do paciente...')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={<User className="w-5 h-5" />}
          />

          {/* Lista de pacientes */}
          <div className="max-h-80 overflow-y-auto space-y-2">
            {filteredPatients.length > 0 ? (
              filteredPatients.map(patient => (
                <motion.div
                  key={patient.id}
                  whileHover={{ scale: 1.01 }}
                  onClick={() => selectPatient(patient)}
                  className="p-4 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg cursor-pointer 
                           hover:border-primary-500 hover:shadow-md transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center font-medium">
                      {patient.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 dark:text-white">{patient.name}</h4>
                      <p className="text-sm text-gray-500">{patient.cpf}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
                </motion.div>
              ))
            ) : searchTerm ? (
              <div className="text-center py-8 text-gray-500">
                Nenhum paciente encontrado
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                Digite para buscar um paciente
              </div>
            )}
          </div>
        </>
      )}

      <div className="flex justify-end mt-6">
        <Button onClick={nextStep} variant="primary" disabled={!formData.patientId}>
          {t('common.next', 'Próximo')}
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </motion.div>
  );

  // Step de Anamnese Completa
  const renderAnamnesisStep = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
          <Stethoscope className="w-8 h-8 text-blue-600 dark:text-blue-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Anamnese Completa
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Preencha os dados clínicos detalhados do paciente e da ferida
        </p>
      </div>

      <AnamnesisForm 
        patientData={formData.patientData}
        onComplete={handleAnamnesisComplete}
        initialData={formData.anamnesisData}
      />

      <div className="flex justify-between mt-6">
        <Button onClick={prevStep} variant="secondary">
          <ChevronLeft className="w-4 h-4 mr-2" />
          {t('common.back', 'Voltar')}
        </Button>
        <Button onClick={nextStep} variant="primary" disabled={!formData.anamnesisData}>
          {t('common.next', 'Próximo')}
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </motion.div>
  );

  const renderImageStep = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
          <Camera className="w-8 h-8 text-green-600 dark:text-green-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {t('timers.woundImage', 'Imagem da Ferida')}
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Capture ou faça upload de uma foto da ferida para análise com IA
        </p>
      </div>

      <WoundImageUploader
        onImageCapture={handleImageCapture}
        onValidationComplete={handleImageValidation}
        existingImage={formData.imagePreview}
      />

      {formData.imagePreview && formData.imageValidation?.isValid && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center"
        >
          <Button 
            onClick={analyzeImage} 
            variant="primary" 
            size="lg"
            loading={analyzing}
            className="gap-2"
          >
            <Sparkles className="w-5 h-5" />
            Analisar com Inteligência Artificial
          </Button>
        </motion.div>
      )}

      <div className="flex justify-between mt-6">
        <Button onClick={prevStep} variant="secondary">
          <ChevronLeft className="w-4 h-4 mr-2" />
          {t('common.back', 'Voltar')}
        </Button>
        <Button 
          onClick={nextStep} 
          variant="primary" 
          disabled={!formData.imageBase64 || formData.imageValidation?.isValid === false}
        >
          {analysisResult ? 'Ver Análise' : t('common.next', 'Próximo')}
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </motion.div>
  );

  // Step de resultados de análise de IA
  const renderAnalysisStep = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-4">
          <Brain className="w-8 h-8 text-purple-600 dark:text-purple-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Análise de Inteligência Artificial
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Resultados da análise automática da ferida
        </p>
      </div>

      {/* Resultado da análise */}
      <WoundAnalysisResult
        analysisData={analysisResult}
        loading={analyzing}
        error={null}
        showHeatmap={true}
      />

      {/* Evolução temporal (se disponível) */}
      {temporalData && temporalData.assessments?.length >= 2 && (
        <div className="mt-8">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Evolução Temporal
          </h3>
          <TemporalEvolutionChart evolutionData={temporalData} />
        </div>
      )}

      <div className="flex justify-between mt-6">
        <Button onClick={prevStep} variant="secondary">
          <ChevronLeft className="w-4 h-4 mr-2" />
          {t('common.back', 'Voltar')}
        </Button>
        <Button onClick={nextStep} variant="primary" disabled={!analysisResult}>
          {t('common.next', 'Próximo')}
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </motion.div>
  );

  const renderReviewStep = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900 rounded-full flex items-center justify-center mx-auto mb-4">
          <FileCheck className="w-8 h-8 text-amber-600 dark:text-amber-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {t('assessments.review', 'Revisão da Avaliação')}
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          {t('assessments.reviewDesc', 'Confira os dados antes de salvar')}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Resumo do Paciente */}
        <Card className="p-4">
          <h3 className="font-bold text-lg mb-4 flex items-center">
            <User className="w-5 h-5 mr-2 text-primary-600" />
            Paciente
          </h3>
          <div className="space-y-2 text-sm">
            <p><span className="text-gray-500">Nome:</span> <strong>{formData.patientData?.name}</strong></p>
            <p><span className="text-gray-500">CPF:</span> {formData.patientData?.cpf}</p>
            {formData.anamnesisData?.patientDemographics && (
              <>
                <p><span className="text-gray-500">Idade:</span> {formData.anamnesisData.patientDemographics.age} anos</p>
                <p><span className="text-gray-500">Peso:</span> {formData.anamnesisData.patientDemographics.weight} kg</p>
              </>
            )}
          </div>
        </Card>

        {/* Resumo da Anamnese */}
        <Card className="p-4">
          <h3 className="font-bold text-lg mb-4 flex items-center">
            <Stethoscope className="w-5 h-5 mr-2 text-blue-600" />
            Anamnese
          </h3>
          {formData.anamnesisData && (
            <div className="space-y-2 text-sm">
              <p>
                <span className="text-gray-500">Comorbidades:</span>{' '}
                {formData.anamnesisData.comorbidities?.length || 0} registradas
              </p>
              <p>
                <span className="text-gray-500">Ferida:</span>{' '}
                {formData.anamnesisData.woundInfo?.etiology || 'Não especificada'}
              </p>
              <p>
                <span className="text-gray-500">Localização:</span>{' '}
                {formData.anamnesisData.woundInfo?.location || 'Não especificada'}
              </p>
              {formData.anamnesisData.bradenScale && (
                <p>
                  <span className="text-gray-500">Braden:</span>{' '}
                  {Object.values(formData.anamnesisData.bradenScale).reduce((a,b) => a + b, 0)} pontos
                </p>
              )}
            </div>
          )}
        </Card>

        {/* Imagem */}
        <Card className="p-4">
          <h3 className="font-bold text-lg mb-4 flex items-center">
            <ImageIcon className="w-5 h-5 mr-2 text-green-600" />
            {t('timers.woundImage', 'Imagem da Ferida')}
          </h3>
          {formData.imagePreview && (
            <img 
              src={formData.imagePreview} 
              alt="Wound" 
              className="w-full rounded-lg max-h-48 object-cover"
            />
          )}
        </Card>

        {/* Resultado da Análise */}
        {analysisResult && (
          <Card className="p-4">
            <h3 className="font-bold text-lg mb-4 flex items-center">
              <Brain className="w-5 h-5 mr-2 text-purple-600" />
              {t('assessments.aiAnalysis', 'Análise de IA')}
            </h3>
            <div className="space-y-3 text-sm">
              {analysisResult.classification && (
                <div className="p-3 bg-primary-50 dark:bg-primary-900/30 rounded-lg">
                  <p className="font-medium">Classificação:</p>
                  <p className="text-primary-700 dark:text-primary-300">
                    {analysisResult.classification.woundType}
                    {' - '}
                    {((analysisResult.confidence || 0) * 100).toFixed(0)}% confiança
                  </p>
                </div>
              )}
              {analysisResult.tissueSegmentation && (
                <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                  <p className="font-medium mb-2">Tecidos:</p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {Object.entries(analysisResult.tissueSegmentation)
                      .filter(([_, v]) => v > 0)
                      .slice(0, 4)
                      .map(([tissue, pct]) => (
                        <div key={tissue} className="flex justify-between">
                          <span className="capitalize">{tissue}</span>
                          <span className="font-medium">{pct.toFixed(0)}%</span>
                        </div>
                      ))
                    }
                  </div>
                </div>
              )}
              {analysisResult.recommendations?.length > 0 && (
                <div className="p-3 bg-green-50 dark:bg-green-900/30 rounded-lg">
                  <p className="font-medium mb-2">Recomendações:</p>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    {analysisResult.recommendations.slice(0, 3).map((rec, i) => (
                      <li key={i} className="text-green-700 dark:text-green-300">
                        {rec.title || rec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </Card>
        )}
      </div>

      {/* Timestamp */}
      <Card className="p-4 bg-gray-50 dark:bg-gray-800">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <Clock className="w-4 h-4" />
            Data da Avaliação
          </div>
          <strong>{new Date().toLocaleString('pt-BR')}</strong>
        </div>
      </Card>

      <div className="flex justify-between mt-6">
        <Button onClick={prevStep} variant="secondary">
          <ChevronLeft className="w-4 h-4 mr-2" />
          {t('common.back', 'Voltar')}
        </Button>
        <Button onClick={handleSubmit} variant="primary" loading={loading} size="lg">
          <CheckCircle className="w-5 h-5 mr-2" />
          {t('assessments.saveAssessment', 'Salvar Avaliação')}
        </Button>
      </div>
    </motion.div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0: return renderPatientStep();
      case 1: return renderAnamnesisStep();
      case 2: return renderImageStep();
      case 3: return renderAnalysisStep();
      case 4: return renderReviewStep();
      default: return renderPatientStep();
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {t('patients.newAssessment', 'Nova Avaliação')}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {t('assessments.createNew', 'Crie uma nova avaliação de ferida')}
            </p>
          </div>

          {renderStepIndicator()}

          {error && (
            <Alert type="error" message={error} onClose={() => setError('')} className="mb-6" />
          )}

          {success && (
            <Alert type="success" message={success} onClose={() => setSuccess('')} className="mb-6" />
          )}

          <Card className="p-6">
            <AnimatePresence mode="wait">
              {renderCurrentStep()}
            </AnimatePresence>
          </Card>
        </motion.div>
      </div>
    </Layout>
  );
};

export default AssessmentsPage;

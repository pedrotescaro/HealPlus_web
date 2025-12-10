import React, { useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
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
  FileText, Brain, AlertTriangle, CheckCircle, Image as ImageIcon
} from 'lucide-react';

const STEPS = ['patient', 'image', 'timers', 'review'];

const AssessmentsPage = () => {
  const { t } = useTranslation();
  const { token } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [analysisResult, setAnalysisResult] = useState(null);
  
  const [formData, setFormData] = useState({
    patientId: '',
    patientName: '',
    imageBase64: '',
    imagePreview: '',
    timersData: {
      tissue: { type: '', percentage: 0 },
      infection: { signs: [], painLevel: 0 },
      moisture: { level: 'moderate', type: 'serous' },
      edges: { condition: 'attached', characteristics: 'regular' },
      repair: { observations: '', treatmentPlan: '' },
      social: { comorbidities: [], medications: [] }
    }
  });

  const handleImageUpload = useCallback((e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError(t('messages.invalidImageType', 'Por favor, selecione uma imagem válida'));
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError(t('messages.imageTooLarge', 'A imagem deve ter no máximo 10MB'));
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setFormData(prev => ({
        ...prev,
        imageBase64: event.target.result,
        imagePreview: event.target.result
      }));
      setError('');
    };
    reader.readAsDataURL(file);
  }, [t]);

  const removeImage = useCallback(() => {
    setFormData(prev => ({
      ...prev,
      imageBase64: '',
      imagePreview: ''
    }));
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

  const analyzeImage = useCallback(async () => {
    if (!formData.imageBase64) {
      setError(t('messages.noImage', 'Por favor, faça upload de uma imagem'));
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await woundService.analyze({
        patientId: formData.patientId || 'temp-patient',
        imageBase64: formData.imageBase64,
        timersData: formData.timersData
      }, token);
      
      setAnalysisResult(result);
      setSuccess(t('messages.analysisComplete', 'Análise concluída com sucesso!'));
      setCurrentStep(3);
    } catch (err) {
      setError(err.response?.data?.message || t('messages.analysisError', 'Erro ao analisar imagem'));
    } finally {
      setLoading(false);
    }
  }, [formData, token, t]);

  const handleSubmit = useCallback(async () => {
    setLoading(true);
    try {
      await woundService.analyze({
        patientId: formData.patientId,
        imageBase64: formData.imageBase64,
        timersData: formData.timersData
      }, token);
      
      setSuccess(t('messages.assessmentSaved', 'Avaliação salva com sucesso!'));
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || t('messages.error'));
    } finally {
      setLoading(false);
    }
  }, [formData, token, navigate, t]);

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

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {STEPS.map((step, index) => (
        <React.Fragment key={step}>
          <div 
            className={`flex items-center justify-center w-10 h-10 rounded-full text-sm font-bold transition-all duration-300 ${
              index <= currentStep 
                ? 'bg-primary-600 text-white' 
                : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
            }`}
          >
            {index + 1}
          </div>
          {index < STEPS.length - 1 && (
            <div className={`w-16 h-1 mx-2 transition-all duration-300 ${
              index < currentStep 
                ? 'bg-primary-600' 
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
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {t('assessments.selectPatient', 'Selecione o Paciente')}
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          {t('assessments.selectPatientDesc', 'Escolha o paciente para esta avaliação')}
        </p>
      </div>

      <Input
        label={t('patients.name', 'Nome do Paciente')}
        placeholder={t('assessments.searchPatient', 'Buscar paciente...')}
        value={formData.patientName}
        onChange={(e) => setFormData(prev => ({ ...prev, patientName: e.target.value }))}
      />

      <div className="flex justify-end mt-6">
        <Button onClick={nextStep} variant="primary">
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
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {t('timers.woundImage', 'Imagem da Ferida')}
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          {t('assessments.imageDesc', 'Faça upload de uma foto clara da ferida para análise com IA')}
        </p>
      </div>

      <div className="flex flex-col items-center">
        {formData.imagePreview ? (
          <div className="relative w-full max-w-md">
            <img 
              src={formData.imagePreview} 
              alt="Wound preview" 
              className="w-full rounded-xl shadow-lg"
            />
            <button
              onClick={removeImage}
              className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="w-full max-w-md h-64 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all"
          >
            <Upload className="w-12 h-12 text-gray-400 mb-4" />
            <p className="text-gray-600 dark:text-gray-400 text-center">
              {t('timers.uploadImage', 'Clique para fazer upload')}
            </p>
            <p className="text-sm text-gray-500 mt-2">PNG, JPG até 10MB</p>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />

        {formData.imagePreview && (
          <Button 
            onClick={analyzeImage} 
            variant="primary" 
            className="mt-6"
            loading={loading}
          >
            <Brain className="w-5 h-5 mr-2" />
            {t('assessments.analyzeWithAI', 'Analisar com IA')}
          </Button>
        )}
      </div>

      <div className="flex justify-between mt-6">
        <Button onClick={prevStep} variant="secondary">
          <ChevronLeft className="w-4 h-4 mr-2" />
          {t('common.back', 'Voltar')}
        </Button>
        <Button onClick={nextStep} variant="primary" disabled={!formData.imageBase64}>
          {t('common.next', 'Próximo')}
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </motion.div>
  );

  const renderTimersStep = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {t('timers.title', 'Avaliação TIMERS')}
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          {t('assessments.timersDesc', 'Preencha os dados clínicos da ferida')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Tecido */}
        <Card className="p-4">
          <h3 className="font-bold text-lg mb-4 flex items-center text-primary-600 dark:text-primary-400">
            <span className="w-8 h-8 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center mr-2 text-sm">T</span>
            {t('timers.tissue', 'Tecido')}
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">{t('timers.granulation', 'Granulação')} (%)</label>
              <input
                type="range"
                min="0"
                max="100"
                value={formData.timersData.tissue.percentage}
                onChange={(e) => handleTimersChange('tissue', 'percentage', parseInt(e.target.value))}
                className="w-full"
              />
              <span className="text-sm text-gray-600">{formData.timersData.tissue.percentage}%</span>
            </div>
          </div>
        </Card>

        {/* Infecção */}
        <Card className="p-4">
          <h3 className="font-bold text-lg mb-4 flex items-center text-red-600 dark:text-red-400">
            <span className="w-8 h-8 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mr-2 text-sm">I</span>
            {t('timers.infection', 'Infecção')}
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">{t('timers.painIntensity', 'Intensidade da Dor')} (0-10)</label>
              <input
                type="range"
                min="0"
                max="10"
                value={formData.timersData.infection.painLevel}
                onChange={(e) => handleTimersChange('infection', 'painLevel', parseInt(e.target.value))}
                className="w-full"
              />
              <span className="text-sm text-gray-600">{formData.timersData.infection.painLevel}/10</span>
            </div>
          </div>
        </Card>

        {/* Umidade */}
        <Card className="p-4">
          <h3 className="font-bold text-lg mb-4 flex items-center text-blue-600 dark:text-blue-400">
            <span className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mr-2 text-sm">M</span>
            {t('timers.moisture', 'Umidade')}
          </h3>
          <div className="space-y-4">
            <select
              value={formData.timersData.moisture.level}
              onChange={(e) => handleTimersChange('moisture', 'level', e.target.value)}
              className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
            >
              <option value="absent">{t('timers.absent', 'Ausente')}</option>
              <option value="minimal">{t('timers.minimal', 'Mínimo')}</option>
              <option value="moderate">{t('timers.moderate', 'Moderado')}</option>
              <option value="abundant">{t('timers.abundant', 'Abundante')}</option>
            </select>
          </div>
        </Card>

        {/* Bordas */}
        <Card className="p-4">
          <h3 className="font-bold text-lg mb-4 flex items-center text-green-600 dark:text-green-400">
            <span className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mr-2 text-sm">E</span>
            {t('timers.edges', 'Bordas')}
          </h3>
          <div className="space-y-4">
            <select
              value={formData.timersData.edges.condition}
              onChange={(e) => handleTimersChange('edges', 'condition', e.target.value)}
              className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
            >
              <option value="attached">{t('timers.attached', 'Aderidas')}</option>
              <option value="detached">{t('timers.detached', 'Descoladas')}</option>
            </select>
          </div>
        </Card>
      </div>

      {/* Observações */}
      <Card className="p-4">
        <h3 className="font-bold text-lg mb-4 flex items-center text-purple-600 dark:text-purple-400">
          <span className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mr-2 text-sm">R</span>
          {t('timers.repair', 'Reparo e Recomendações')}
        </h3>
        <textarea
          value={formData.timersData.repair.observations}
          onChange={(e) => handleTimersChange('repair', 'observations', e.target.value)}
          placeholder={t('timers.observations', 'Observações...')}
          className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 min-h-[100px]"
        />
      </Card>

      <div className="flex justify-between mt-6">
        <Button onClick={prevStep} variant="secondary">
          <ChevronLeft className="w-4 h-4 mr-2" />
          {t('common.back', 'Voltar')}
        </Button>
        <Button onClick={nextStep} variant="primary">
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
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {t('assessments.review', 'Revisão da Avaliação')}
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          {t('assessments.reviewDesc', 'Confira os dados antes de salvar')}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Imagem */}
        <Card className="p-4">
          <h3 className="font-bold text-lg mb-4 flex items-center">
            <ImageIcon className="w-5 h-5 mr-2 text-primary-600" />
            {t('timers.woundImage', 'Imagem da Ferida')}
          </h3>
          {formData.imagePreview && (
            <img 
              src={formData.imagePreview} 
              alt="Wound" 
              className="w-full rounded-lg"
            />
          )}
        </Card>

        {/* Resultado da Análise */}
        {analysisResult && (
          <Card className="p-4">
            <h3 className="font-bold text-lg mb-4 flex items-center">
              <Brain className="w-5 h-5 mr-2 text-primary-600" />
              {t('assessments.aiAnalysis', 'Análise de IA')}
            </h3>
            <div className="space-y-3 text-sm">
              {analysisResult.aiAnalysis?.classificacao_etiologica && (
                <div className="p-3 bg-primary-50 dark:bg-primary-900/30 rounded-lg">
                  <p className="font-medium">{t('assessments.woundType', 'Tipo de Ferida')}:</p>
                  <p className="text-primary-700 dark:text-primary-300">
                    {analysisResult.aiAnalysis.classificacao_etiologica.tipo_probabilistico}
                    {' '}
                    ({analysisResult.aiAnalysis.classificacao_etiologica.confianca_percentual}% confiança)
                  </p>
                </div>
              )}
              {analysisResult.aiAnalysis?.recomendacoes_prioritarias && (
                <div className="p-3 bg-green-50 dark:bg-green-900/30 rounded-lg">
                  <p className="font-medium mb-2">{t('assessments.recommendations', 'Recomendações')}:</p>
                  <ul className="list-disc list-inside space-y-1">
                    {analysisResult.aiAnalysis.recomendacoes_prioritarias.map((rec, i) => (
                      <li key={i} className="text-green-700 dark:text-green-300">{rec}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </Card>
        )}
      </div>

      <div className="flex justify-between mt-6">
        <Button onClick={prevStep} variant="secondary">
          <ChevronLeft className="w-4 h-4 mr-2" />
          {t('common.back', 'Voltar')}
        </Button>
        <Button onClick={handleSubmit} variant="primary" loading={loading}>
          <CheckCircle className="w-5 h-5 mr-2" />
          {t('assessments.saveAssessment', 'Salvar Avaliação')}
        </Button>
      </div>
    </motion.div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0: return renderPatientStep();
      case 1: return renderImageStep();
      case 2: return renderTimersStep();
      case 3: return renderReviewStep();
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

import React, { useState, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Heart, Pill, AlertTriangle, Activity, 
  FileText, ChevronDown, ChevronUp, Check, Info,
  Stethoscope, Droplets, Thermometer, Scale
} from 'lucide-react';
import Card from '../Card';
import Input from '../Input';
import Button from '../Button';

/**
 * Componente de Anamnese Completa para Avaliação de Feridas
 * Sistema profissional baseado em protocolos de enfermagem
 */

// Opções de comorbidades comuns
const COMORBIDITIES_OPTIONS = [
  { id: 'diabetes', label: 'Diabetes Mellitus', risk: 'high' },
  { id: 'has', label: 'Hipertensão Arterial', risk: 'medium' },
  { id: 'insuf_venosa', label: 'Insuficiência Venosa', risk: 'high' },
  { id: 'dap', label: 'Doença Arterial Periférica', risk: 'high' },
  { id: 'insuf_cardiaca', label: 'Insuficiência Cardíaca', risk: 'medium' },
  { id: 'insuf_renal', label: 'Insuficiência Renal', risk: 'high' },
  { id: 'dpoc', label: 'DPOC', risk: 'medium' },
  { id: 'obesidade', label: 'Obesidade (IMC > 30)', risk: 'medium' },
  { id: 'desnutricao', label: 'Desnutrição', risk: 'high' },
  { id: 'imunossupressao', label: 'Imunossupressão', risk: 'high' },
  { id: 'neoplasia', label: 'Neoplasia/Câncer', risk: 'high' },
  { id: 'anemia', label: 'Anemia', risk: 'medium' },
  { id: 'tabagismo', label: 'Tabagismo', risk: 'medium' },
  { id: 'etilismo', label: 'Etilismo', risk: 'medium' },
  { id: 'paraplegia', label: 'Paraplegia/Tetraplegia', risk: 'high' },
  { id: 'demencia', label: 'Demência/Alzheimer', risk: 'medium' },
  { id: 'avc', label: 'AVC prévio', risk: 'medium' },
];

// Localizações anatômicas para feridas
const ANATOMICAL_LOCATIONS = [
  { group: 'Cabeça e Pescoço', locations: ['Couro cabeludo', 'Face', 'Orelha', 'Pescoço'] },
  { group: 'Tronco', locations: ['Tórax anterior', 'Tórax posterior', 'Região sacral', 'Região lombar', 'Abdome'] },
  { group: 'Membros Superiores', locations: ['Ombro', 'Braço', 'Cotovelo', 'Antebraço', 'Punho', 'Mão', 'Dedos'] },
  { group: 'Quadril e Pelve', locations: ['Região trocantérica D', 'Região trocantérica E', 'Região isquiática D', 'Região isquiática E', 'Crista ilíaca'] },
  { group: 'Membros Inferiores', locations: ['Coxa', 'Joelho', 'Perna terço superior', 'Perna terço médio', 'Perna terço inferior', 'Maléolo medial', 'Maléolo lateral', 'Calcâneo', 'Dorso do pé', 'Planta do pé', 'Dedos do pé'] },
];

// Etiologia/Tipos de feridas
const WOUND_ETIOLOGIES = [
  { id: 'lpp', label: 'Lesão por Pressão (LPP)', stages: ['Estágio 1', 'Estágio 2', 'Estágio 3', 'Estágio 4', 'Não classificável', 'Tissular profunda'] },
  { id: 'ulcera_venosa', label: 'Úlcera Venosa', stages: null },
  { id: 'ulcera_arterial', label: 'Úlcera Arterial', stages: null },
  { id: 'ulcera_mista', label: 'Úlcera Mista', stages: null },
  { id: 'pe_diabetico', label: 'Pé Diabético', stages: ['Wagner 0', 'Wagner 1', 'Wagner 2', 'Wagner 3', 'Wagner 4', 'Wagner 5'] },
  { id: 'cirurgica', label: 'Ferida Cirúrgica', stages: null },
  { id: 'traumatica', label: 'Ferida Traumática', stages: null },
  { id: 'queimadura', label: 'Queimadura', stages: ['1º grau', '2º grau superficial', '2º grau profundo', '3º grau'] },
  { id: 'deiscencia', label: 'Deiscência de sutura', stages: null },
  { id: 'outros', label: 'Outros', stages: null },
];

// Medicações que afetam cicatrização
const MEDICATION_CATEGORIES = [
  { category: 'Anticoagulantes', medications: ['Varfarina', 'Rivaroxabana', 'Apixabana', 'Enoxaparina', 'Heparina', 'AAS'] },
  { category: 'Corticoides', medications: ['Prednisona', 'Prednisolona', 'Dexametasona', 'Hidrocortisona'] },
  { category: 'Imunossupressores', medications: ['Metotrexato', 'Azatioprina', 'Ciclosporina', 'Tacrolimus'] },
  { category: 'Quimioterápicos', medications: ['Em tratamento ativo'] },
  { category: 'Anti-inflamatórios', medications: ['Ibuprofeno', 'Diclofenaco', 'Nimesulida', 'Naproxeno'] },
  { category: 'Hipoglicemiantes', medications: ['Metformina', 'Glibenclamida', 'Insulina'] },
  { category: 'Anti-hipertensivos', medications: ['Losartana', 'Enalapril', 'Anlodipino', 'Atenolol', 'Hidroclorotiazida'] },
];

// Escala de Braden
const BRADEN_SCALE = {
  sensoryPerception: {
    label: 'Percepção Sensorial',
    options: [
      { value: 1, label: 'Totalmente limitado' },
      { value: 2, label: 'Muito limitado' },
      { value: 3, label: 'Levemente limitado' },
      { value: 4, label: 'Nenhuma limitação' },
    ]
  },
  moisture: {
    label: 'Umidade',
    options: [
      { value: 1, label: 'Constantemente úmida' },
      { value: 2, label: 'Muito úmida' },
      { value: 3, label: 'Ocasionalmente úmida' },
      { value: 4, label: 'Raramente úmida' },
    ]
  },
  activity: {
    label: 'Atividade',
    options: [
      { value: 1, label: 'Acamado' },
      { value: 2, label: 'Confinado à cadeira' },
      { value: 3, label: 'Deambula ocasionalmente' },
      { value: 4, label: 'Deambula frequentemente' },
    ]
  },
  mobility: {
    label: 'Mobilidade',
    options: [
      { value: 1, label: 'Totalmente imóvel' },
      { value: 2, label: 'Muito limitada' },
      { value: 3, label: 'Levemente limitada' },
      { value: 4, label: 'Sem limitações' },
    ]
  },
  nutrition: {
    label: 'Nutrição',
    options: [
      { value: 1, label: 'Muito pobre' },
      { value: 2, label: 'Provavelmente inadequada' },
      { value: 3, label: 'Adequada' },
      { value: 4, label: 'Excelente' },
    ]
  },
  frictionShear: {
    label: 'Fricção e Cisalhamento',
    options: [
      { value: 1, label: 'Problema' },
      { value: 2, label: 'Problema potencial' },
      { value: 3, label: 'Sem problema aparente' },
    ]
  },
};

// Estado inicial padrão
const DEFAULT_FORM_DATA = {
  patientDemographics: {
    age: '',
    weight: '',
    height: '',
    gender: '',
    bedNumber: '',
    ward: ''
  },
  comorbidities: [],
  medications: [],
  woundInfo: {
    etiology: '',
    stage: '',
    location: '',
    locationSide: 'D',
    duration: '',
    durationUnit: 'days',
    previousTreatments: ''
  },
  woundDimensions: {
    length: '',
    width: '',
    depth: ''
  },
  vitalSigns: {
    temperature: '',
    bloodPressure: '',
    heartRate: '',
    oxygenSaturation: '',
    glycemia: ''
  },
  bradenScale: {
    sensoryPerception: 4,
    moisture: 4,
    activity: 4,
    mobility: 4,
    nutrition: 4,
    frictionShear: 3
  },
  painAssessment: {
    intensity: 0,
    type: '',
    location: '',
    frequency: '',
    relievingFactors: ''
  },
  nutritionalHistory: {
    appetite: 'normal',
    hydration: 'adequate',
    proteinIntake: 'adequate',
    supplements: ''
  },
  socialHistory: {
    caregiver: '',
    mobilityAid: '',
    homeConditions: '',
    observations: ''
  }
};

const AnamnesisForm = ({ patientData, onComplete, initialData }) => {
  const { t } = useTranslation();
  
  // Estado interno do formulário com valores padrão
  const [formData, setFormData] = useState(() => ({
    ...DEFAULT_FORM_DATA,
    ...(initialData || {})
  }));

  // Preencher dados do paciente automaticamente quando selecionado
  useEffect(() => {
    if (patientData) {
      setFormData(prev => ({
        ...prev,
        patientName: patientData.name || prev.patientName || '',
        patientId: patientData.id || prev.patientId || '',
        age: patientData.age || prev.age || '',
        gender: patientData.gender || prev.gender || '',
        contact: patientData.contact || patientData.phone || prev.contact || '',
        cpf: patientData.cpf || prev.cpf || '',
        weight: patientData.weight || prev.weight || '',
        height: patientData.height || prev.height || '',
        bloodType: patientData.bloodType || prev.bloodType || '',
        patientDemographics: {
          ...prev.patientDemographics,
          age: patientData.age || prev.patientDemographics?.age || '',
          weight: patientData.weight || prev.patientDemographics?.weight || '',
          height: patientData.height || prev.patientDemographics?.height || '',
          gender: patientData.gender || prev.patientDemographics?.gender || '',
          bedNumber: patientData.bedNumber || prev.patientDemographics?.bedNumber || '',
          ward: patientData.ward || prev.patientDemographics?.ward || ''
        }
      }));
    }
  }, [patientData]);
  
  const [expandedSections, setExpandedSections] = useState({
    demographics: true,
    comorbidities: true,
    medications: false,
    woundInfo: true,
    vitalSigns: false,
    braden: false,
    painAssessment: true,
    socialHistory: false,
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Handler interno para mudanças
  const onChange = useCallback((newData) => {
    setFormData(newData);
    // Notificar componente pai se onComplete estiver disponível
    if (onComplete) {
      onComplete(newData);
    }
  }, [onComplete]);

  const handleChange = useCallback((field, value) => {
    const updated = {
      ...formData,
      [field]: value
    };
    onChange(updated);
  }, [formData, onChange]);

  const handleNestedChange = useCallback((section, field, value) => {
    const updated = {
      ...formData,
      [section]: {
        ...(formData[section] || {}),
        [field]: value
      }
    };
    onChange(updated);
  }, [formData, onChange]);

  const toggleComorbidity = useCallback((id) => {
    const current = formData.comorbidities || [];
    const updated = current.includes(id) 
      ? current.filter(c => c !== id)
      : [...current, id];
    handleChange('comorbidities', updated);
  }, [formData.comorbidities, handleChange]);

  const toggleMedication = useCallback((med) => {
    const current = formData.medications || [];
    const updated = current.includes(med) 
      ? current.filter(m => m !== med)
      : [...current, med];
    handleChange('medications', updated);
  }, [formData.medications, handleChange]);

  const calculateBradenScore = useCallback(() => {
    const braden = formData.bradenScale || {};
    return Object.values(braden).reduce((sum, val) => sum + (val || 0), 0);
  }, [formData.bradenScale]);

  const getBradenRiskLevel = useCallback((score) => {
    if (score <= 9) return { level: 'Muito Alto', color: 'text-red-600 bg-red-100' };
    if (score <= 12) return { level: 'Alto', color: 'text-orange-600 bg-orange-100' };
    if (score <= 14) return { level: 'Moderado', color: 'text-yellow-600 bg-yellow-100' };
    if (score <= 18) return { level: 'Baixo', color: 'text-blue-600 bg-blue-100' };
    return { level: 'Sem risco', color: 'text-green-600 bg-green-100' };
  }, []);

  const renderSection = (id, title, icon, children) => {
    const isExpanded = expandedSections[id];
    const Icon = icon;
    
    return (
      <Card className="mb-4 overflow-hidden">
        <button
          type="button"
          onClick={() => toggleSection(id)}
          className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
              <Icon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            </div>
            <span className="font-semibold text-gray-900 dark:text-white">{title}</span>
          </div>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-gray-500" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-500" />
          )}
        </button>
        
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="p-4 space-y-4">
                {children}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    );
  };

  return (
    <div className="space-y-4">
      {/* Dados Demográficos */}
      {renderSection('demographics', 'Dados do Paciente', User, (
        <>
          {/* Indicador de dados pré-preenchidos */}
          {patientData && (
            <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg flex items-center gap-2">
              <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
              <span className="text-sm text-green-700 dark:text-green-300">
                Dados pré-preenchidos do paciente <strong>{patientData.name}</strong>. Revise e complete as informações.
              </span>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Input
              label="Nome Completo"
              value={formData.patientName || ''}
              onChange={(e) => handleChange('patientName', e.target.value)}
              placeholder="Nome do paciente"
              disabled={!!patientData?.name}
            />
            <Input
              label="Idade"
              type="number"
              value={formData.age || ''}
              onChange={(e) => handleChange('age', parseInt(e.target.value) || '')}
              placeholder="Anos"
              min="0"
              max="150"
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Sexo
              </label>
              <select
                value={formData.gender || ''}
                onChange={(e) => handleChange('gender', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
              >
                <option value="">Selecione</option>
                <option value="male">Masculino</option>
                <option value="female">Feminino</option>
                <option value="other">Outro</option>
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Peso (kg)"
              type="number"
              value={formData.weight || ''}
              onChange={(e) => handleChange('weight', parseFloat(e.target.value) || '')}
              placeholder="Ex: 70"
              step="0.1"
            />
            <Input
              label="Altura (cm)"
              type="number"
              value={formData.height || ''}
              onChange={(e) => handleChange('height', parseInt(e.target.value) || '')}
              placeholder="Ex: 170"
            />
          </div>
          
          {formData.weight && formData.height && (
            <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
              <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                IMC: {(formData.weight / Math.pow(formData.height / 100, 2)).toFixed(1)} kg/m²
              </span>
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Mobilidade
            </label>
            <div className="flex flex-wrap gap-2">
              {['Deambula', 'Cadeirante', 'Acamado', 'Deambula com auxílio'].map(option => (
                <button
                  key={option}
                  type="button"
                  onClick={() => handleChange('mobility', option)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    formData.mobility === option
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        </>
      ))}

      {/* Comorbidades */}
      {renderSection('comorbidities', 'Comorbidades e Fatores de Risco', Heart, (
        <>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            Selecione todas as condições que se aplicam ao paciente:
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {COMORBIDITIES_OPTIONS.map(({ id, label, risk }) => {
              const isSelected = (formData.comorbidities || []).includes(id);
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => toggleComorbidity(id)}
                  className={`flex items-center gap-2 p-3 rounded-lg border transition-all text-left ${
                    isSelected
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className={`w-5 h-5 rounded flex items-center justify-center ${
                    isSelected ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-600'
                  }`}>
                    {isSelected && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <span className={`text-sm ${isSelected ? 'text-primary-700 dark:text-primary-300 font-medium' : 'text-gray-700 dark:text-gray-300'}`}>
                    {label}
                  </span>
                  {risk === 'high' && (
                    <span className="ml-auto text-xs px-2 py-0.5 bg-red-100 text-red-700 rounded-full">
                      Alto risco
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          
          <div className="mt-4">
            <Input
              label="Outras comorbidades"
              value={formData.otherComorbidities || ''}
              onChange={(e) => handleChange('otherComorbidities', e.target.value)}
              placeholder="Especifique outras condições não listadas..."
            />
          </div>
          
          {/* Campos específicos para diabetes */}
          {(formData.comorbidities || []).includes('diabetes') && (
            <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
              <h4 className="font-medium text-amber-800 dark:text-amber-200 mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Dados Específicos - Diabetes
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Tipo de Diabetes
                  </label>
                  <select
                    value={formData.diabetesType || ''}
                    onChange={(e) => handleChange('diabetesType', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                  >
                    <option value="">Selecione</option>
                    <option value="type1">Tipo 1</option>
                    <option value="type2">Tipo 2</option>
                    <option value="gestational">Gestacional</option>
                    <option value="other">Outro</option>
                  </select>
                </div>
                <Input
                  label="HbA1c (%)"
                  type="number"
                  value={formData.hba1c || ''}
                  onChange={(e) => handleChange('hba1c', parseFloat(e.target.value) || '')}
                  placeholder="Ex: 7.5"
                  step="0.1"
                />
                <Input
                  label="Glicemia de jejum (mg/dL)"
                  type="number"
                  value={formData.fastingGlucose || ''}
                  onChange={(e) => handleChange('fastingGlucose', parseInt(e.target.value) || '')}
                  placeholder="Ex: 120"
                />
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.insulinUse || false}
                      onChange={(e) => handleChange('insulinUse', e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Usa insulina</span>
                  </label>
                </div>
              </div>
            </div>
          )}
        </>
      ))}

      {/* Medicações */}
      {renderSection('medications', 'Medicações em Uso', Pill, (
        <>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            Medicações que podem afetar a cicatrização:
          </p>
          
          {MEDICATION_CATEGORIES.map(({ category, medications }) => (
            <div key={category} className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {category}
              </h4>
              <div className="flex flex-wrap gap-2">
                {medications.map(med => {
                  const isSelected = (formData.medications || []).includes(med);
                  return (
                    <button
                      key={med}
                      type="button"
                      onClick={() => toggleMedication(med)}
                      className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                        isSelected
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      {med}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
          
          <Input
            label="Outras medicações"
            value={formData.otherMedications || ''}
            onChange={(e) => handleChange('otherMedications', e.target.value)}
            placeholder="Liste outras medicações em uso..."
          />
          
          <div className="flex items-center gap-4 mt-3">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.hasAllergies || false}
                onChange={(e) => handleChange('hasAllergies', e.target.checked)}
                className="w-4 h-4 rounded border-gray-300"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Possui alergias medicamentosas</span>
            </label>
          </div>
          
          {formData.hasAllergies && (
            <Input
              label="Alergias"
              value={formData.allergies || ''}
              onChange={(e) => handleChange('allergies', e.target.value)}
              placeholder="Liste as alergias conhecidas..."
            />
          )}
        </>
      ))}

      {/* Informações da Ferida */}
      {renderSection('woundInfo', 'Informações da Ferida', Stethoscope, (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Etiologia / Tipo de Ferida
              </label>
              <select
                value={formData.woundEtiology || ''}
                onChange={(e) => handleChange('woundEtiology', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
              >
                <option value="">Selecione o tipo</option>
                {WOUND_ETIOLOGIES.map(({ id, label }) => (
                  <option key={id} value={id}>{label}</option>
                ))}
              </select>
            </div>
            
            {formData.woundEtiology && WOUND_ETIOLOGIES.find(e => e.id === formData.woundEtiology)?.stages && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Estágio / Grau
                </label>
                <select
                  value={formData.woundStage || ''}
                  onChange={(e) => handleChange('woundStage', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                >
                  <option value="">Selecione</option>
                  {WOUND_ETIOLOGIES.find(e => e.id === formData.woundEtiology)?.stages.map(stage => (
                    <option key={stage} value={stage}>{stage}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Localização Anatômica
            </label>
            <div className="space-y-3">
              {ANATOMICAL_LOCATIONS.map(({ group, locations }) => (
                <div key={group}>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{group}</p>
                  <div className="flex flex-wrap gap-2">
                    {locations.map(loc => (
                      <button
                        key={loc}
                        type="button"
                        onClick={() => handleChange('woundLocation', loc)}
                        className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                          formData.woundLocation === loc
                            ? 'bg-primary-600 text-white'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                      >
                        {loc}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Tempo de existência"
              type="number"
              value={formData.woundDurationDays || ''}
              onChange={(e) => handleChange('woundDurationDays', parseInt(e.target.value) || '')}
              placeholder="Dias"
            />
            <Input
              label="Largura (cm)"
              type="number"
              value={formData.woundWidth || ''}
              onChange={(e) => handleChange('woundWidth', parseFloat(e.target.value) || '')}
              placeholder="Ex: 3.5"
              step="0.1"
            />
            <Input
              label="Comprimento (cm)"
              type="number"
              value={formData.woundLength || ''}
              onChange={(e) => handleChange('woundLength', parseFloat(e.target.value) || '')}
              placeholder="Ex: 4.0"
              step="0.1"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Profundidade
              </label>
              <select
                value={formData.woundDepth || ''}
                onChange={(e) => handleChange('woundDepth', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
              >
                <option value="">Selecione</option>
                <option value="superficial">Superficial (epiderme)</option>
                <option value="partial">Espessura parcial (derme)</option>
                <option value="full">Espessura total (subcutâneo)</option>
                <option value="deep">Profunda (músculo/osso)</option>
                <option value="unknown">Não avaliável</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Exsudato
              </label>
              <select
                value={formData.exudateLevel || ''}
                onChange={(e) => handleChange('exudateLevel', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
              >
                <option value="">Selecione</option>
                <option value="none">Ausente</option>
                <option value="minimal">Pequeno</option>
                <option value="moderate">Moderado</option>
                <option value="heavy">Abundante</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Tipo de Exsudato
            </label>
            <div className="flex flex-wrap gap-2">
              {['Seroso', 'Serossanguinolento', 'Sanguinolento', 'Purulento', 'Fétido'].map(type => (
                <button
                  key={type}
                  type="button"
                  onClick={() => handleChange('exudateType', type)}
                  className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                    formData.exudateType === type
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Bordas da Ferida
            </label>
            <div className="flex flex-wrap gap-2">
              {['Aderidas', 'Descoladas', 'Epitelizadas', 'Maceradas', 'Fibróticas', 'Hiperqueratóticas'].map(edge => (
                <button
                  key={edge}
                  type="button"
                  onClick={() => {
                    const current = formData.woundEdges || [];
                    const updated = current.includes(edge)
                      ? current.filter(e => e !== edge)
                      : [...current, edge];
                    handleChange('woundEdges', updated);
                  }}
                  className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                    (formData.woundEdges || []).includes(edge)
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {edge}
                </button>
              ))}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Pele Perilesional
            </label>
            <div className="flex flex-wrap gap-2">
              {['Íntegra', 'Hiperemiada', 'Macerada', 'Ressecada', 'Descamativa', 'Edemaciada'].map(skin => (
                <button
                  key={skin}
                  type="button"
                  onClick={() => {
                    const current = formData.perilesionalSkin || [];
                    const updated = current.includes(skin)
                      ? current.filter(s => s !== skin)
                      : [...current, skin];
                    handleChange('perilesionalSkin', updated);
                  }}
                  className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                    (formData.perilesionalSkin || []).includes(skin)
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {skin}
                </button>
              ))}
            </div>
          </div>
          
          {/* Avaliação do Leito da Ferida - Barra de Tecidos */}
          <div className="mt-6 pt-6 border-t dark:border-gray-700">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Avaliação do Leito da Ferida
            </h4>
            
            {/* Barra visual de proporção de tecidos */}
            <div className="mb-4">
              <div className="flex h-10 rounded-lg overflow-hidden border dark:border-gray-600">
                {(formData.tissueGranulation || 0) > 0 && (
                  <div 
                    className="flex items-center justify-center text-xs font-bold text-white"
                    style={{ 
                      width: `${formData.tissueGranulation || 0}%`,
                      backgroundColor: '#EF4444',
                      minWidth: (formData.tissueGranulation || 0) > 5 ? 'auto' : '0'
                    }}
                  >
                    {(formData.tissueGranulation || 0) > 10 && `Granulação ${formData.tissueGranulation}%`}
                  </div>
                )}
                {(formData.tissueEpithelialization || 0) > 0 && (
                  <div 
                    className="flex items-center justify-center text-xs font-bold text-gray-800"
                    style={{ 
                      width: `${formData.tissueEpithelialization || 0}%`,
                      backgroundColor: '#F472B6',
                      minWidth: (formData.tissueEpithelialization || 0) > 5 ? 'auto' : '0'
                    }}
                  >
                    {(formData.tissueEpithelialization || 0) > 10 && `Epitelização ${formData.tissueEpithelialization}%`}
                  </div>
                )}
                {(formData.tissueSlough || 0) > 0 && (
                  <div 
                    className="flex items-center justify-center text-xs font-bold text-gray-800"
                    style={{ 
                      width: `${formData.tissueSlough || 0}%`,
                      backgroundColor: '#FBBF24',
                      minWidth: (formData.tissueSlough || 0) > 5 ? 'auto' : '0'
                    }}
                  >
                    {(formData.tissueSlough || 0) > 10 && `Esfacelo ${formData.tissueSlough}%`}
                  </div>
                )}
                {(formData.tissueNecrosis || 0) > 0 && (
                  <div 
                    className="flex items-center justify-center text-xs font-bold text-white"
                    style={{ 
                      width: `${formData.tissueNecrosis || 0}%`,
                      backgroundColor: '#374151',
                      minWidth: (formData.tissueNecrosis || 0) > 5 ? 'auto' : '0'
                    }}
                  >
                    {(formData.tissueNecrosis || 0) > 10 && `Necrose ${formData.tissueNecrosis}%`}
                  </div>
                )}
                {/* Área vazia se não totalizar 100% */}
                {((formData.tissueGranulation || 0) + (formData.tissueEpithelialization || 0) + 
                  (formData.tissueSlough || 0) + (formData.tissueNecrosis || 0)) < 100 && (
                  <div 
                    className="flex items-center justify-center text-xs text-gray-400 bg-gray-200 dark:bg-gray-700"
                    style={{ 
                      flex: 1
                    }}
                  >
                    {((formData.tissueGranulation || 0) + (formData.tissueEpithelialization || 0) + 
                      (formData.tissueSlough || 0) + (formData.tissueNecrosis || 0)) === 0 && 
                      'Preencha os valores abaixo'}
                  </div>
                )}
              </div>
              
              {/* Legenda */}
              <div className="flex flex-wrap justify-center gap-4 mt-2 text-xs">
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: '#EF4444' }}></span>
                  Granulação ({formData.tissueGranulation || 0}%)
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: '#F472B6' }}></span>
                  Epitelização ({formData.tissueEpithelialization || 0}%)
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: '#FBBF24' }}></span>
                  Esfacelo ({formData.tissueSlough || 0}%)
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: '#374151' }}></span>
                  Necrose ({formData.tissueNecrosis || 0}%)
                </span>
              </div>
            </div>
            
            {/* Inputs para porcentagem de cada tecido */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Granulação (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.tissueGranulation || ''}
                  onChange={(e) => handleChange('tissueGranulation', Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-red-500"
                  style={{ borderColor: '#EF4444' }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Epitelização (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.tissueEpithelialization || ''}
                  onChange={(e) => handleChange('tissueEpithelialization', Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-pink-500"
                  style={{ borderColor: '#F472B6' }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Esfacelo (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.tissueSlough || ''}
                  onChange={(e) => handleChange('tissueSlough', Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-yellow-500"
                  style={{ borderColor: '#FBBF24' }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Necrose Seca (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.tissueNecrosis || ''}
                  onChange={(e) => handleChange('tissueNecrosis', Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-gray-500"
                  style={{ borderColor: '#374151' }}
                />
              </div>
            </div>
            
            {/* Alerta se a soma não for 100% */}
            {((formData.tissueGranulation || 0) + (formData.tissueEpithelialization || 0) + 
              (formData.tissueSlough || 0) + (formData.tissueNecrosis || 0)) > 0 &&
             ((formData.tissueGranulation || 0) + (formData.tissueEpithelialization || 0) + 
              (formData.tissueSlough || 0) + (formData.tissueNecrosis || 0)) !== 100 && (
              <div className={`mt-3 p-2 rounded-lg text-sm ${
                ((formData.tissueGranulation || 0) + (formData.tissueEpithelialization || 0) + 
                (formData.tissueSlough || 0) + (formData.tissueNecrosis || 0)) > 100
                  ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                  : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
              }`}>
                <AlertTriangle className="w-4 h-4 inline-block mr-1" />
                Total: {(formData.tissueGranulation || 0) + (formData.tissueEpithelialization || 0) + 
                        (formData.tissueSlough || 0) + (formData.tissueNecrosis || 0)}% 
                {((formData.tissueGranulation || 0) + (formData.tissueEpithelialization || 0) + 
                  (formData.tissueSlough || 0) + (formData.tissueNecrosis || 0)) > 100
                  ? ' - A soma excede 100%!'
                  : ' - A soma deve totalizar 100%'}
              </div>
            )}
            
            {/* Indicador de sucesso quando soma = 100% */}
            {((formData.tissueGranulation || 0) + (formData.tissueEpithelialization || 0) + 
              (formData.tissueSlough || 0) + (formData.tissueNecrosis || 0)) === 100 && (
              <div className="mt-3 p-2 rounded-lg text-sm bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
                <Check className="w-4 h-4 inline-block mr-1" />
                Total: 100% - Distribuição completa ✓
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.hasOdor || false}
                onChange={(e) => handleChange('hasOdor', e.target.checked)}
                className="w-4 h-4 rounded border-gray-300"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Presença de odor</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.hasTunneling || false}
                onChange={(e) => handleChange('hasTunneling', e.target.checked)}
                className="w-4 h-4 rounded border-gray-300"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Tunelização/Descolamento</span>
            </label>
          </div>
        </>
      ))}

      {/* Sinais Vitais */}
      {renderSection('vitalSigns', 'Sinais Vitais', Thermometer, (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Input
            label="PA Sistólica (mmHg)"
            type="number"
            value={formData.systolicBP || ''}
            onChange={(e) => handleChange('systolicBP', parseInt(e.target.value) || '')}
            placeholder="Ex: 120"
          />
          <Input
            label="PA Diastólica (mmHg)"
            type="number"
            value={formData.diastolicBP || ''}
            onChange={(e) => handleChange('diastolicBP', parseInt(e.target.value) || '')}
            placeholder="Ex: 80"
          />
          <Input
            label="FC (bpm)"
            type="number"
            value={formData.heartRate || ''}
            onChange={(e) => handleChange('heartRate', parseInt(e.target.value) || '')}
            placeholder="Ex: 72"
          />
          <Input
            label="Temperatura (°C)"
            type="number"
            value={formData.temperature || ''}
            onChange={(e) => handleChange('temperature', parseFloat(e.target.value) || '')}
            placeholder="Ex: 36.5"
            step="0.1"
          />
          <Input
            label="SpO2 (%)"
            type="number"
            value={formData.spo2 || ''}
            onChange={(e) => handleChange('spo2', parseInt(e.target.value) || '')}
            placeholder="Ex: 98"
          />
          <Input
            label="FR (irpm)"
            type="number"
            value={formData.respiratoryRate || ''}
            onChange={(e) => handleChange('respiratoryRate', parseInt(e.target.value) || '')}
            placeholder="Ex: 16"
          />
        </div>
      ))}

      {/* Escala de Braden */}
      {renderSection('braden', 'Escala de Braden (Risco de LPP)', Scale, (
        <>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Avaliação do risco de desenvolvimento de Lesão por Pressão:
          </p>
          
          <div className="space-y-4">
            {Object.entries(BRADEN_SCALE).map(([key, { label, options }]) => (
              <div key={key} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {label}
                </label>
                <div className="flex flex-wrap gap-2">
                  {options.map(({ value, label: optLabel }) => {
                    const isSelected = formData.bradenScale?.[key] === value;
                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() => handleNestedChange('bradenScale', key, value)}
                        className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                          isSelected
                            ? 'bg-primary-600 text-white'
                            : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600'
                        }`}
                      >
                        <span className="font-bold mr-1">{value}</span> - {optLabel}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          
          {Object.keys(formData.bradenScale || {}).length === Object.keys(BRADEN_SCALE).length && (
            <div className="mt-4">
              {(() => {
                const score = calculateBradenScore();
                const { level, color } = getBradenRiskLevel(score);
                return (
                  <div className={`p-4 rounded-lg ${color}`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-bold text-lg">Score Total: {score}</span>
                        <span className="mx-2">|</span>
                        <span className="font-medium">Risco: {level}</span>
                      </div>
                      <Info className="w-5 h-5" />
                    </div>
                    <p className="text-sm mt-2">
                      {score <= 12 
                        ? 'Recomenda-se mudança de decúbito a cada 2h e uso de superfície de suporte adequada.'
                        : score <= 18
                        ? 'Manter vigilância e medidas preventivas básicas.'
                        : 'Risco baixo, manter cuidados de rotina.'}
                    </p>
                  </div>
                );
              })()}
            </div>
          )}
        </>
      ))}

      {/* Avaliação da Dor */}
      {renderSection('painAssessment', 'Avaliação da Dor', Activity, (
        <>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Intensidade da Dor (0-10)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="0"
                max="10"
                value={formData.painLevel || 0}
                onChange={(e) => handleChange('painLevel', parseInt(e.target.value))}
                className="flex-1"
              />
              <span className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                formData.painLevel <= 3 
                  ? 'bg-green-100 text-green-700'
                  : formData.painLevel <= 6
                  ? 'bg-yellow-100 text-yellow-700'
                  : 'bg-red-100 text-red-700'
              }`}>
                {formData.painLevel || 0}
              </span>
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Sem dor</span>
              <span>Dor moderada</span>
              <span>Pior dor</span>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Característica da Dor
            </label>
            <div className="flex flex-wrap gap-2">
              {['Contínua', 'Intermitente', 'À manipulação', 'Pulsátil', 'Em queimação', 'Latejante'].map(char => (
                <button
                  key={char}
                  type="button"
                  onClick={() => handleChange('painCharacteristic', char)}
                  className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                    formData.painCharacteristic === char
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {char}
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex items-center gap-4 mt-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.takingAnalgesics || false}
                onChange={(e) => handleChange('takingAnalgesics', e.target.checked)}
                className="w-4 h-4 rounded border-gray-300"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Em uso de analgésicos</span>
            </label>
          </div>
        </>
      ))}

      {/* Histórico Social */}
      {renderSection('socialHistory', 'Histórico Social e Nutricional', FileText, (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Estado Nutricional
              </label>
              <select
                value={formData.nutritionalStatus || ''}
                onChange={(e) => handleChange('nutritionalStatus', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
              >
                <option value="">Selecione</option>
                <option value="well_nourished">Bem nutrido</option>
                <option value="risk">Risco nutricional</option>
                <option value="moderate_malnutrition">Desnutrição moderada</option>
                <option value="severe_malnutrition">Desnutrição grave</option>
              </select>
            </div>
            
            <Input
              label="Albumina sérica (g/dL)"
              type="number"
              value={formData.albumin || ''}
              onChange={(e) => handleChange('albumin', parseFloat(e.target.value) || '')}
              placeholder="Ex: 3.5"
              step="0.1"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Ingestão hídrica diária
            </label>
            <div className="flex flex-wrap gap-2">
              {['< 1L', '1-1.5L', '1.5-2L', '> 2L'].map(option => (
                <button
                  key={option}
                  type="button"
                  onClick={() => handleChange('waterIntake', option)}
                  className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                    formData.waterIntake === option
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Rede de apoio / Cuidador
              </label>
              <select
                value={formData.caregiverSupport || ''}
                onChange={(e) => handleChange('caregiverSupport', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
              >
                <option value="">Selecione</option>
                <option value="family">Familiar presente</option>
                <option value="caregiver">Cuidador profissional</option>
                <option value="institution">Instituição de longa permanência</option>
                <option value="alone">Mora sozinho</option>
                <option value="partial">Apoio parcial</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Condições de moradia
              </label>
              <select
                value={formData.housingConditions || ''}
                onChange={(e) => handleChange('housingConditions', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
              >
                <option value="">Selecione</option>
                <option value="adequate">Adequadas</option>
                <option value="partially_adequate">Parcialmente adequadas</option>
                <option value="inadequate">Inadequadas</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Observações adicionais
            </label>
            <textarea
              value={formData.additionalNotes || ''}
              onChange={(e) => handleChange('additionalNotes', e.target.value)}
              placeholder="Informações relevantes sobre o histórico do paciente, tratamentos anteriores, etc..."
              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 min-h-[100px]"
            />
          </div>
        </>
      ))}

      {/* Botão de Conclusão */}
      <div className="flex justify-end pt-4">
        <Button 
          variant="primary" 
          onClick={onComplete}
          className="px-8"
        >
          <Check className="w-5 h-5 mr-2" />
          Concluir Anamnese
        </Button>
      </div>
    </div>
  );
};

export default AnamnesisForm;

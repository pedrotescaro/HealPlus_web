/**
 * Exportações centralizadas dos componentes de anamnese e análise de feridas
 */

// Formulário completo de anamnese
export { default as AnamnesisForm } from './AnamnesisForm';

// Upload e validação de imagens
export { default as WoundImageUploader } from './WoundImageUploader';

// Resultados de análise de IA
export { default as WoundAnalysisResult } from './WoundAnalysisResult';

// Gráficos de evolução temporal
export { default as TemporalEvolutionChart } from './TemporalEvolutionChart';

// Constantes compartilhadas
export const WOUND_ETIOLOGIES = {
  PRESSURE_INJURY: 'Lesão por Pressão',
  DIABETIC_FOOT: 'Pé Diabético',
  VENOUS_ULCER: 'Úlcera Venosa',
  ARTERIAL_ULCER: 'Úlcera Arterial',
  SURGICAL: 'Ferida Cirúrgica',
  TRAUMATIC: 'Ferida Traumática',
  BURN: 'Queimadura',
  DERMATITIS: 'Dermatite',
  ONCOLOGICAL: 'Ferida Oncológica',
  OTHER: 'Outras'
};

export const TISSUE_TYPES = {
  GRANULATION: 'granulation',
  EPITHELIALIZATION: 'epithelialization',
  SLOUGH: 'slough',
  NECROSIS: 'necrosis',
  HYPERGRANULATION: 'hypergranulation',
  FIBRIN: 'fibrin',
  SKIN: 'skin'
};

export const EXUDATE_AMOUNTS = {
  NONE: 'none',
  SCANT: 'scant',
  SMALL: 'small',
  MODERATE: 'moderate',
  LARGE: 'large'
};

export const EXUDATE_TYPES = {
  SEROUS: 'serous',
  SANGUINEOUS: 'sanguineous',
  SEROSANGUINEOUS: 'serosanguineous',
  PURULENT: 'purulent'
};

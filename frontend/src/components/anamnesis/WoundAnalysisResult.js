import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, AlertTriangle, CheckCircle, Info, Zap, 
  TrendingUp, TrendingDown, Minus, Eye, Target,
  Layers, Droplets, Flame, Snowflake, AlertCircle
} from 'lucide-react';
import Card from '../Card';
import Loading from '../Loading';

/**
 * Componente para exibição dos resultados de análise de feridas por IA
 * Inclui segmentação de tecidos, classificação e recomendações
 */

// Cores e descrições para tipos de tecido
const TISSUE_CONFIG = {
  granulation: {
    color: '#EF4444', // vermelho vivo
    bgColor: 'bg-red-500',
    textColor: 'text-red-500',
    label: 'Tecido de Granulação',
    description: 'Tecido saudável de cicatrização, vermelho vivo e úmido',
    icon: TrendingUp,
    isHealthy: true
  },
  epithelialization: {
    color: '#F472B6', // rosa
    bgColor: 'bg-pink-400',
    textColor: 'text-pink-500',
    label: 'Epitelização',
    description: 'Novo tecido epitelial, rosa claro nas bordas',
    icon: CheckCircle,
    isHealthy: true
  },
  slough: {
    color: '#FCD34D', // amarelo
    bgColor: 'bg-yellow-400',
    textColor: 'text-yellow-600',
    label: 'Esfacelo',
    description: 'Tecido desvitalizado amarelado, necessita desbridamento',
    icon: AlertTriangle,
    isHealthy: false
  },
  necrosis: {
    color: '#1F2937', // preto/marrom escuro
    bgColor: 'bg-gray-800',
    textColor: 'text-gray-800',
    label: 'Necrose',
    description: 'Tecido morto escuro, requer desbridamento urgente',
    icon: AlertCircle,
    isHealthy: false
  },
  hypergranulation: {
    color: '#DC2626', // vermelho escuro
    bgColor: 'bg-red-700',
    textColor: 'text-red-700',
    label: 'Hipergranulação',
    description: 'Tecido de granulação excessivo, elevado',
    icon: TrendingUp,
    isHealthy: false
  },
  fibrin: {
    color: '#FEF3C7', // creme
    bgColor: 'bg-amber-100',
    textColor: 'text-amber-700',
    label: 'Fibrina',
    description: 'Película fibrosa amarelo-clara aderida ao leito',
    icon: Layers,
    isHealthy: false
  },
  skin: {
    color: '#D4A574', // tom de pele
    bgColor: 'bg-orange-300',
    textColor: 'text-orange-700',
    label: 'Pele Íntegra',
    description: 'Tecido perilesional saudável',
    icon: CheckCircle,
    isHealthy: true
  }
};

// Configuração de exsudato
const EXUDATE_CONFIG = {
  none: { label: 'Ausente', color: 'text-green-500', severity: 0 },
  scant: { label: 'Escasso', color: 'text-blue-500', severity: 1 },
  small: { label: 'Pequeno', color: 'text-yellow-500', severity: 2 },
  moderate: { label: 'Moderado', color: 'text-orange-500', severity: 3 },
  large: { label: 'Abundante', color: 'text-red-500', severity: 4 }
};

const EXUDATE_TYPE_CONFIG = {
  serous: { label: 'Seroso', description: 'Claro, aquoso' },
  sanguineous: { label: 'Sanguinolento', description: 'Vermelho, sangrento' },
  serosanguineous: { label: 'Serossanguinolento', description: 'Rosa, aguado' },
  purulent: { label: 'Purulento', description: 'Amarelo/verde, espesso - INFECÇÃO' }
};

// Componente de barra de progresso para tecidos
const TissueBar = ({ tissueType, percentage, showDetails = true }) => {
  const config = TISSUE_CONFIG[tissueType] || {
    color: '#6B7280',
    bgColor: 'bg-gray-500',
    label: tissueType,
    description: '',
    icon: Info,
    isHealthy: false
  };
  
  const Icon = config.icon;
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-1"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div 
            className={`w-3 h-3 rounded-full ${config.bgColor}`}
            style={{ backgroundColor: config.color }}
          />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {config.label}
          </span>
          {!config.isHealthy && percentage > 20 && (
            <AlertTriangle className="w-4 h-4 text-yellow-500" />
          )}
        </div>
        <span className="text-sm font-semibold text-gray-900 dark:text-white">
          {percentage.toFixed(1)}%
        </span>
      </div>
      
      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="h-full rounded-full"
          style={{ backgroundColor: config.color }}
        />
      </div>
      
      {showDetails && percentage > 5 && (
        <p className="text-xs text-gray-500 dark:text-gray-400 pl-5">
          {config.description}
        </p>
      )}
    </motion.div>
  );
};

// Componente de score de saúde da ferida
const WoundHealthScore = ({ healthyTissuePercent, score }) => {
  const getScoreColor = () => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    if (score >= 40) return 'text-orange-500';
    return 'text-red-500';
  };

  const getScoreLabel = () => {
    if (score >= 80) return 'Excelente';
    if (score >= 60) return 'Bom';
    if (score >= 40) return 'Moderado';
    if (score >= 20) return 'Ruim';
    return 'Crítico';
  };

  return (
    <div className="text-center p-6">
      <div className="relative w-32 h-32 mx-auto">
        {/* Círculo de fundo */}
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="64"
            cy="64"
            r="56"
            fill="none"
            stroke="currentColor"
            strokeWidth="12"
            className="text-gray-200 dark:text-gray-700"
          />
          <motion.circle
            cx="64"
            cy="64"
            r="56"
            fill="none"
            stroke="currentColor"
            strokeWidth="12"
            strokeLinecap="round"
            className={getScoreColor()}
            strokeDasharray={`${score * 3.51} 351`}
            initial={{ strokeDasharray: '0 351' }}
            animate={{ strokeDasharray: `${score * 3.51} 351` }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
          />
        </svg>
        
        {/* Valor central */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className={`text-3xl font-bold ${getScoreColor()}`}
          >
            {score}
          </motion.span>
          <span className="text-xs text-gray-500">Score</span>
        </div>
      </div>
      
      <p className={`mt-2 font-semibold ${getScoreColor()}`}>
        {getScoreLabel()}
      </p>
      <p className="text-sm text-gray-500 dark:text-gray-400">
        {healthyTissuePercent.toFixed(0)}% tecido saudável
      </p>
    </div>
  );
};

// Componente principal
const WoundAnalysisResult = ({ 
  analysisData, 
  loading = false,
  error = null,
  showHeatmap = true,
  onRequestExplanation = null
}) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('overview');
  const [showAllRecommendations, setShowAllRecommendations] = useState(false);

  // Calcular métricas derivadas
  const metrics = useMemo(() => {
    if (!analysisData) return null;

    const tissues = analysisData.tissueSegmentation || {};
    const healthyPercent = (tissues.granulation || 0) + (tissues.epithelialization || 0);
    const unhealthyPercent = (tissues.necrosis || 0) + (tissues.slough || 0) + (tissues.fibrin || 0);
    
    // Score de saúde (0-100)
    const healthScore = Math.min(100, Math.max(0, 
      healthyPercent * 0.8 + 
      (100 - unhealthyPercent) * 0.2
    ));

    return {
      healthyPercent,
      unhealthyPercent,
      healthScore: Math.round(healthScore),
      hasNecrosis: (tissues.necrosis || 0) > 5,
      hasInfectionRisk: analysisData.exudate?.type === 'purulent',
      needsDesbridement: (tissues.necrosis || 0) + (tissues.slough || 0) > 30
    };
  }, [analysisData]);

  if (loading) {
    return (
      <Card className="p-8">
        <div className="flex flex-col items-center justify-center space-y-4">
          <Loading size="lg" />
          <p className="text-gray-600 dark:text-gray-400 animate-pulse">
            Analisando imagem com IA...
          </p>
          <div className="text-sm text-gray-500 space-y-1 text-center">
            <p>Segmentação de tecidos...</p>
            <p>Classificação da ferida...</p>
            <p>Gerando recomendações...</p>
          </div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
        <div className="flex items-start gap-4">
          <AlertCircle className="w-8 h-8 text-red-500 flex-shrink-0" />
          <div>
            <h4 className="font-semibold text-red-800 dark:text-red-200">
              Erro na análise
            </h4>
            <p className="text-red-700 dark:text-red-300 mt-1">
              {error}
            </p>
            <p className="text-sm text-red-600 dark:text-red-400 mt-2">
              Por favor, tente novamente com uma imagem diferente ou entre em contato com o suporte.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  if (!analysisData) {
    return (
      <Card className="p-8 text-center">
        <Eye className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h4 className="text-lg font-medium text-gray-700 dark:text-gray-300">
          Nenhuma análise disponível
        </h4>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          Faça upload de uma imagem para iniciar a análise
        </p>
      </Card>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Visão Geral', icon: Activity },
    { id: 'tissues', label: 'Tecidos', icon: Layers },
    { id: 'recommendations', label: 'Recomendações', icon: Target }
  ];

  return (
    <div className="space-y-4">
      {/* Alertas críticos */}
      {metrics?.hasNecrosis && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="p-4 border-red-500 bg-red-50 dark:bg-red-900/20">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-red-500" />
              <div>
                <h4 className="font-semibold text-red-800 dark:text-red-200">
                  Necrose detectada
                </h4>
                <p className="text-sm text-red-700 dark:text-red-300">
                  Requer avaliação médica para desbridamento
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {metrics?.hasInfectionRisk && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="p-4 border-orange-500 bg-orange-50 dark:bg-orange-900/20">
            <div className="flex items-center gap-3">
              <Flame className="w-6 h-6 text-orange-500" />
              <div>
                <h4 className="font-semibold text-orange-800 dark:text-orange-200">
                  Risco de Infecção
                </h4>
                <p className="text-sm text-orange-700 dark:text-orange-300">
                  Exsudato purulento identificado - avaliação urgente necessária
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Navegação por tabs */}
      <Card className="p-0 overflow-hidden">
        <div className="flex border-b dark:border-gray-700">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium
                transition-colors ${
                  activeTab === tab.id
                    ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 border-b-2 border-primary-500'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          <AnimatePresence mode="wait">
            {/* Tab: Visão Geral */}
            {activeTab === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Score de saúde */}
                  <div className="border dark:border-gray-700 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                      Score de Cicatrização
                    </h4>
                    <WoundHealthScore 
                      healthyTissuePercent={metrics.healthyPercent}
                      score={metrics.healthScore}
                    />
                  </div>

                  {/* Classificação */}
                  <div className="border dark:border-gray-700 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">
                      Classificação da Ferida
                    </h4>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <span className="text-gray-600 dark:text-gray-300">Tipo</span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {analysisData.classification?.woundType || 'Não classificado'}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <span className="text-gray-600 dark:text-gray-300">Estágio</span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {analysisData.classification?.stage || '-'}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <span className="text-gray-600 dark:text-gray-300">Fase de Cicatrização</span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {analysisData.classification?.healingPhase || '-'}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <span className="text-gray-600 dark:text-gray-300">Confiança</span>
                        <span className={`font-semibold ${
                          (analysisData.confidence || 0) >= 0.8 ? 'text-green-600' :
                          (analysisData.confidence || 0) >= 0.6 ? 'text-yellow-600' :
                          'text-red-600'
                        }`}>
                          {((analysisData.confidence || 0) * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Exsudato */}
                {analysisData.exudate && (
                  <div className="border dark:border-gray-700 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4 flex items-center gap-2">
                      <Droplets className="w-4 h-4" />
                      Exsudato
                    </h4>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <span className="block text-xs text-gray-500 mb-1">Quantidade</span>
                        <span className={`font-semibold ${EXUDATE_CONFIG[analysisData.exudate.amount]?.color || 'text-gray-600'}`}>
                          {EXUDATE_CONFIG[analysisData.exudate.amount]?.label || analysisData.exudate.amount}
                        </span>
                      </div>
                      <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <span className="block text-xs text-gray-500 mb-1">Tipo</span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {EXUDATE_TYPE_CONFIG[analysisData.exudate.type]?.label || analysisData.exudate.type}
                        </span>
                      </div>
                      <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <span className="block text-xs text-gray-500 mb-1">Odor</span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {analysisData.exudate.odor || '-'}
                        </span>
                      </div>
                      <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <span className="block text-xs text-gray-500 mb-1">Cor</span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {analysisData.exudate.color || '-'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* Tab: Tecidos */}
            {activeTab === 'tissues' && (
              <motion.div
                key="tissues"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    Segmentação de Tecidos
                  </h4>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="flex items-center gap-1 text-green-600">
                      <CheckCircle className="w-4 h-4" />
                      Saudável: {metrics.healthyPercent.toFixed(0)}%
                    </span>
                    <span className="flex items-center gap-1 text-red-600">
                      <AlertTriangle className="w-4 h-4" />
                      Desvitalizado: {metrics.unhealthyPercent.toFixed(0)}%
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  {Object.entries(analysisData.tissueSegmentation || {})
                    .filter(([_, value]) => value > 0)
                    .sort((a, b) => b[1] - a[1])
                    .map(([tissue, percentage], index) => (
                      <TissueBar 
                        key={tissue}
                        tissueType={tissue}
                        percentage={percentage}
                        showDetails={true}
                      />
                    ))
                  }
                </div>

                {/* Visualização do Heatmap (se disponível) */}
                {showHeatmap && analysisData.heatmapUrl && (
                  <div className="mt-6 border dark:border-gray-700 rounded-lg overflow-hidden">
                    <div className="p-3 bg-gray-100 dark:bg-gray-800 border-b dark:border-gray-700">
                      <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                        <Target className="w-4 h-4" />
                        Mapa de Ativação da IA
                      </h5>
                    </div>
                    <div className="relative">
                      <img 
                        src={analysisData.heatmapUrl} 
                        alt="Heatmap de análise" 
                        className="w-full"
                      />
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* Tab: Recomendações */}
            {activeTab === 'recommendations' && (
              <motion.div
                key="recommendations"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                {analysisData.recommendations?.map((rec, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`p-4 rounded-lg border-l-4 ${
                      rec.priority === 'high' 
                        ? 'bg-red-50 dark:bg-red-900/20 border-red-500' 
                        : rec.priority === 'medium'
                        ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-500'
                        : 'bg-blue-50 dark:bg-blue-900/20 border-blue-500'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        rec.priority === 'high' ? 'bg-red-100 dark:bg-red-900' :
                        rec.priority === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900' :
                        'bg-blue-100 dark:bg-blue-900'
                      }`}>
                        <span className="text-sm font-bold">
                          {index + 1}
                        </span>
                      </div>
                      <div>
                        <h5 className="font-semibold text-gray-900 dark:text-white">
                          {rec.title}
                        </h5>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {rec.description}
                        </p>
                        {rec.products && (
                          <div className="mt-2">
                            <span className="text-xs text-gray-500">Produtos sugeridos:</span>
                            <p className="text-sm text-gray-700 dark:text-gray-300">
                              {rec.products.join(', ')}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}

                {(!analysisData.recommendations || analysisData.recommendations.length === 0) && (
                  <div className="text-center py-8">
                    <Info className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">
                      Nenhuma recomendação disponível
                    </p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Card>

      {/* Botão para explicação detalhada */}
      {onRequestExplanation && (
        <button
          onClick={onRequestExplanation}
          className="w-full py-3 text-center text-primary-600 dark:text-primary-400 
                   hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg 
                   transition-colors text-sm font-medium"
        >
          <Eye className="w-4 h-4 inline-block mr-2" />
          Ver explicação detalhada da IA
        </button>
      )}

      {/* Disclaimer legal */}
      <Card className="p-4 bg-gray-50 dark:bg-gray-800/50">
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
          <strong>Aviso:</strong> Esta análise é gerada por Inteligência Artificial e serve como 
          ferramenta auxiliar de apoio à decisão clínica. Não substitui a avaliação profissional 
          de saúde qualificado. Todas as decisões de tratamento devem ser tomadas por profissionais 
          habilitados com base na avaliação clínica completa do paciente.
        </p>
      </Card>
    </div>
  );
};

export default WoundAnalysisResult;

import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { 
  TrendingUp, TrendingDown, Minus, Calendar, Clock,
  Activity, Target, AlertCircle, CheckCircle, Info,
  ArrowUp, ArrowDown, ArrowRight, Zap
} from 'lucide-react';
import Card from '../Card';

/**
 * Componente para visualização da evolução temporal de feridas
 * Exibe gráficos de tendência, métricas de velocidade de cicatrização e prognóstico
 */

// Cores para gráficos
const CHART_COLORS = {
  area: '#22C55E',
  granulation: '#EF4444',
  necrosis: '#1F2937',
  epithelialization: '#EC4899'
};

// Componente de mini gráfico de linha
const MiniLineChart = ({ data, color, height = 60 }) => {
  if (!data || data.length < 2) {
    return (
      <div 
        className="flex items-center justify-center text-gray-400 text-sm"
        style={{ height }}
      >
        Dados insuficientes
      </div>
    );
  }

  const minValue = Math.min(...data);
  const maxValue = Math.max(...data);
  const range = maxValue - minValue || 1;

  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * 100;
    const y = ((maxValue - value) / range) * (height - 10) + 5;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg 
      viewBox={`0 0 100 ${height}`} 
      className="w-full"
      style={{ height }}
      preserveAspectRatio="none"
    >
      {/* Grid lines */}
      <line x1="0" y1={height/2} x2="100" y2={height/2} 
            stroke="currentColor" strokeOpacity="0.1" strokeWidth="1" />
      
      {/* Área sob a curva */}
      <polygon
        points={`0,${height} ${points} 100,${height}`}
        fill={color}
        fillOpacity="0.1"
      />
      
      {/* Linha principal */}
      <motion.polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.5, ease: 'easeOut' }}
      />
      
      {/* Ponto final */}
      <circle
        cx="100"
        cy={((maxValue - data[data.length - 1]) / range) * (height - 10) + 5}
        r="3"
        fill={color}
      />
    </svg>
  );
};

// Componente de indicador de tendência
const TrendIndicator = ({ trend, size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const config = {
    improving: { 
      icon: TrendingUp, 
      color: 'text-green-500', 
      bg: 'bg-green-100 dark:bg-green-900/30',
      label: 'Melhorando' 
    },
    worsening: { 
      icon: TrendingDown, 
      color: 'text-red-500', 
      bg: 'bg-red-100 dark:bg-red-900/30',
      label: 'Piorando' 
    },
    stable: { 
      icon: Minus, 
      color: 'text-yellow-500', 
      bg: 'bg-yellow-100 dark:bg-yellow-900/30',
      label: 'Estável' 
    }
  };

  const { icon: Icon, color, bg, label } = config[trend] || config.stable;

  return (
    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full ${bg}`}>
      <Icon className={`${sizeClasses[size]} ${color}`} />
      <span className={`text-sm font-medium ${color}`}>{label}</span>
    </div>
  );
};

// Componente de card de métrica
const MetricCard = ({ 
  title, 
  value, 
  unit, 
  trend, 
  trendValue, 
  icon: Icon,
  color = 'primary'
}) => {
  const colorClasses = {
    primary: 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400',
    green: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
    red: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
    yellow: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg"
    >
      <div className="flex items-start justify-between mb-2">
        <span className="text-sm text-gray-500 dark:text-gray-400">{title}</span>
        {Icon && (
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${colorClasses[color]}`}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>
      
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold text-gray-900 dark:text-white">
          {value}
        </span>
        {unit && (
          <span className="text-sm text-gray-500 dark:text-gray-400">{unit}</span>
        )}
      </div>
      
      {trend && (
        <div className="mt-2 flex items-center gap-2">
          {trend === 'up' && <ArrowUp className="w-4 h-4 text-green-500" />}
          {trend === 'down' && <ArrowDown className="w-4 h-4 text-red-500" />}
          {trend === 'stable' && <ArrowRight className="w-4 h-4 text-yellow-500" />}
          <span className={`text-sm ${
            trend === 'up' ? 'text-green-600' :
            trend === 'down' ? 'text-red-600' :
            'text-yellow-600'
          }`}>
            {trendValue}
          </span>
        </div>
      )}
    </motion.div>
  );
};

// Componente de linha do tempo de avaliações
const AssessmentTimeline = ({ assessments }) => {
  if (!assessments || assessments.length === 0) {
    return (
      <div className="text-center py-6 text-gray-500">
        Nenhuma avaliação anterior registrada
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Linha vertical */}
      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700" />
      
      <div className="space-y-6">
        {assessments.map((assessment, index) => (
          <motion.div
            key={assessment.id || index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="relative pl-10"
          >
            {/* Marcador do ponto */}
            <div className={`absolute left-2 w-5 h-5 rounded-full border-2 
                          ${index === 0 
                            ? 'bg-primary-500 border-primary-500' 
                            : 'bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600'
                          }`} 
            />
            
            <div className={`p-4 rounded-lg border ${
              index === 0 
                ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-800' 
                : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {new Date(assessment.date).toLocaleDateString('pt-BR')}
                </span>
                <TrendIndicator trend={assessment.trend} size="sm" />
              </div>
              
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Área</span>
                  <p className="font-medium">{assessment.area?.toFixed(1)} cm²</p>
                </div>
                <div>
                  <span className="text-gray-500">Granulação</span>
                  <p className="font-medium text-red-600">{assessment.granulation?.toFixed(0)}%</p>
                </div>
                <div>
                  <span className="text-gray-500">Score</span>
                  <p className="font-medium">{assessment.score}/100</p>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// Componente principal
const TemporalEvolutionChart = ({ 
  evolutionData,
  loading = false,
  minAssessments = 2
}) => {
  const { t } = useTranslation();

  // Calcular métricas derivadas
  const metrics = useMemo(() => {
    if (!evolutionData || !evolutionData.assessments || evolutionData.assessments.length < minAssessments) {
      return null;
    }

    const assessments = evolutionData.assessments;
    const firstAssessment = assessments[assessments.length - 1];
    const lastAssessment = assessments[0];

    // Variação de área
    const areaChange = firstAssessment.area - lastAssessment.area;
    const areaChangePercent = ((areaChange / firstAssessment.area) * 100).toFixed(1);

    // Dias entre primeira e última avaliação
    const daysBetween = Math.round(
      (new Date(lastAssessment.date) - new Date(firstAssessment.date)) / (1000 * 60 * 60 * 24)
    );

    // Taxa de cicatrização (cm²/semana)
    const healingRate = daysBetween > 0 
      ? ((areaChange / daysBetween) * 7).toFixed(2) 
      : 0;

    // Projeção de cicatrização completa
    const estimatedDaysToHeal = healingRate > 0 && lastAssessment.area > 0
      ? Math.ceil(lastAssessment.area / (healingRate / 7))
      : null;

    // Arrays para gráficos
    const areaData = assessments.map(a => a.area).reverse();
    const granulationData = assessments.map(a => a.granulation || 0).reverse();
    const scoreData = assessments.map(a => a.score || 0).reverse();

    // Determinar tendência geral
    let overallTrend = 'stable';
    if (areaChangePercent > 10) overallTrend = 'improving';
    if (areaChangePercent < -10) overallTrend = 'worsening';

    return {
      areaChange,
      areaChangePercent,
      daysBetween,
      healingRate,
      estimatedDaysToHeal,
      areaData,
      granulationData,
      scoreData,
      overallTrend,
      totalAssessments: assessments.length
    };
  }, [evolutionData, minAssessments]);

  // Estado de loading
  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
          <div className="h-40 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded" />
            ))}
          </div>
        </div>
      </Card>
    );
  }

  // Sem dados suficientes
  if (!metrics) {
    return (
      <Card className="p-8 text-center">
        <Activity className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h4 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Evolução Temporal
        </h4>
        <p className="text-gray-500 dark:text-gray-400 mb-4">
          São necessárias no mínimo {minAssessments} avaliações para análise de evolução
        </p>
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-full">
          <Info className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Avaliações registradas: {evolutionData?.assessments?.length || 0}
          </span>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com resumo */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Análise de Evolução Temporal
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Baseado em {metrics.totalAssessments} avaliações ao longo de {metrics.daysBetween} dias
            </p>
          </div>
          <TrendIndicator trend={metrics.overallTrend} size="lg" />
        </div>

        {/* Cards de métricas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricCard
            title="Redução de Área"
            value={Math.abs(metrics.areaChangePercent)}
            unit="%"
            trend={metrics.areaChange > 0 ? 'up' : metrics.areaChange < 0 ? 'down' : 'stable'}
            trendValue={`${metrics.areaChange > 0 ? '-' : '+'}${Math.abs(metrics.areaChange).toFixed(1)} cm²`}
            icon={Target}
            color={metrics.areaChange > 0 ? 'green' : 'red'}
          />
          
          <MetricCard
            title="Taxa de Cicatrização"
            value={Math.abs(metrics.healingRate)}
            unit="cm²/semana"
            icon={Zap}
            color={parseFloat(metrics.healingRate) > 0 ? 'green' : 'yellow'}
          />
          
          <MetricCard
            title="Dias de Acompanhamento"
            value={metrics.daysBetween}
            unit="dias"
            icon={Clock}
            color="primary"
          />
          
          <MetricCard
            title="Previsão de Cicatrização"
            value={metrics.estimatedDaysToHeal ? `~${metrics.estimatedDaysToHeal}` : 'N/A'}
            unit={metrics.estimatedDaysToHeal ? 'dias' : ''}
            icon={Calendar}
            color={metrics.estimatedDaysToHeal && metrics.estimatedDaysToHeal < 30 ? 'green' : 'yellow'}
          />
        </div>
      </Card>

      {/* Gráficos de evolução */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
            Evolução da Área
          </h4>
          <MiniLineChart data={metrics.areaData} color={CHART_COLORS.area} />
          <div className="flex justify-between text-xs text-gray-400 mt-2">
            <span>Primeira</span>
            <span>Última</span>
          </div>
        </Card>
        
        <Card className="p-4">
          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
            Evolução da Granulação
          </h4>
          <MiniLineChart data={metrics.granulationData} color={CHART_COLORS.granulation} />
          <div className="flex justify-between text-xs text-gray-400 mt-2">
            <span>Primeira</span>
            <span>Última</span>
          </div>
        </Card>
        
        <Card className="p-4">
          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
            Evolução do Score
          </h4>
          <MiniLineChart data={metrics.scoreData} color="#3B82F6" />
          <div className="flex justify-between text-xs text-gray-400 mt-2">
            <span>Primeira</span>
            <span>Última</span>
          </div>
        </Card>
      </div>

      {/* Timeline de avaliações */}
      <Card className="p-6">
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Histórico de Avaliações
        </h4>
        <AssessmentTimeline assessments={evolutionData.assessments} />
      </Card>

      {/* Prognóstico */}
      {evolutionData.prognosis && (
        <Card className={`p-6 border-l-4 ${
          evolutionData.prognosis.level === 'excellent' ? 'border-green-500 bg-green-50 dark:bg-green-900/20' :
          evolutionData.prognosis.level === 'good' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' :
          evolutionData.prognosis.level === 'moderate' ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20' :
          'border-red-500 bg-red-50 dark:bg-red-900/20'
        }`}>
          <div className="flex items-start gap-4">
            {evolutionData.prognosis.level === 'excellent' && (
              <CheckCircle className="w-8 h-8 text-green-500 flex-shrink-0" />
            )}
            {evolutionData.prognosis.level === 'good' && (
              <TrendingUp className="w-8 h-8 text-blue-500 flex-shrink-0" />
            )}
            {evolutionData.prognosis.level === 'moderate' && (
              <Info className="w-8 h-8 text-yellow-500 flex-shrink-0" />
            )}
            {(evolutionData.prognosis.level === 'poor' || evolutionData.prognosis.level === 'critical') && (
              <AlertCircle className="w-8 h-8 text-red-500 flex-shrink-0" />
            )}
            
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white text-lg">
                Prognóstico: {evolutionData.prognosis.label}
              </h4>
              <p className="text-gray-600 dark:text-gray-300 mt-1">
                {evolutionData.prognosis.description}
              </p>
              
              {evolutionData.prognosis.recommendations && (
                <ul className="mt-4 space-y-2">
                  {evolutionData.prognosis.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                      <ArrowRight className="w-4 h-4 mt-0.5 text-gray-400" />
                      {rec}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Disclaimer */}
      <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
        <strong>Nota:</strong> A análise de evolução temporal é baseada nas avaliações registradas 
        e serve como ferramenta de suporte. Projeções de cicatrização são estimativas e podem 
        variar de acordo com fatores clínicos do paciente.
      </p>
    </div>
  );
};

export default TemporalEvolutionChart;

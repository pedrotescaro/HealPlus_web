import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, X, ZoomIn, ZoomOut, RotateCw, Ruler,
  Camera, Image as ImageIcon, CheckCircle, AlertCircle
} from 'lucide-react';
import Card from '../Card';
import Button from '../Button';
import Alert from '../Alert';

/**
 * Componente avançado para upload e preparação de imagens de feridas
 * Inclui validação de qualidade, zoom, régua de medição
 */

const WoundImageUploader = ({ 
  onImageCapture, 
  onValidationComplete,
  existingImage = null 
}) => {
  const { t } = useTranslation();
  const fileInputRef = useRef(null);
  const canvasRef = useRef(null);
  const imageRef = useRef(null);
  
  const [imageData, setImageData] = useState(existingImage);
  const [imagePreview, setImagePreview] = useState(existingImage);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [validation, setValidation] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [showRuler, setShowRuler] = useState(false);
  const [rulerPoints, setRulerPoints] = useState([]);
  const [measurementMode, setMeasurementMode] = useState(false);

  // Validar qualidade da imagem
  const validateImage = useCallback(async (base64Image) => {
    setLoading(true);
    
    try {
      // Criar imagem para análise
      const img = new Image();
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = base64Image;
      });
      
      const validationResult = {
        isValid: true,
        warnings: [],
        info: {}
      };
      
      // Verificar dimensões
      validationResult.info.width = img.width;
      validationResult.info.height = img.height;
      
      if (img.width < 640 || img.height < 480) {
        validationResult.warnings.push('Resolução baixa - recomendado mínimo 640x480px');
      }
      
      if (img.width > 4096 || img.height > 4096) {
        validationResult.warnings.push('Imagem muito grande - será redimensionada automaticamente');
      }
      
      // Verificar proporção (evitar imagens muito alongadas)
      const ratio = Math.max(img.width, img.height) / Math.min(img.width, img.height);
      if (ratio > 2.5) {
        validationResult.warnings.push('Proporção incomum - verifique se a ferida está centralizada');
      }
      
      // Analisar brilho médio (imagem muito escura ou muito clara)
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = 100; // Amostragem reduzida
      canvas.height = 100;
      ctx.drawImage(img, 0, 0, 100, 100);
      
      const imageData = ctx.getImageData(0, 0, 100, 100);
      let totalBrightness = 0;
      
      for (let i = 0; i < imageData.data.length; i += 4) {
        const r = imageData.data[i];
        const g = imageData.data[i + 1];
        const b = imageData.data[i + 2];
        totalBrightness += (r + g + b) / 3;
      }
      
      const avgBrightness = totalBrightness / (100 * 100);
      validationResult.info.brightness = avgBrightness;
      
      if (avgBrightness < 50) {
        validationResult.warnings.push('Imagem muito escura - considere melhorar iluminação');
      } else if (avgBrightness > 220) {
        validationResult.warnings.push('Imagem muito clara - pode haver superexposição');
      }
      
      // Verificar se parece ser uma imagem médica (heurística simples)
      // Feridas tipicamente têm tons de vermelho/rosa/marrom
      let redPixels = 0;
      let skinTonePixels = 0;
      
      for (let i = 0; i < imageData.data.length; i += 4) {
        const r = imageData.data[i];
        const g = imageData.data[i + 1];
        const b = imageData.data[i + 2];
        
        // Detectar tons de vermelho (ferida)
        if (r > 120 && r > g * 1.2 && r > b * 1.2) {
          redPixels++;
        }
        
        // Detectar tons de pele
        if (r > 150 && g > 100 && b > 80 && r > g && g > b) {
          skinTonePixels++;
        }
      }
      
      const totalPixels = 100 * 100;
      validationResult.info.redPercentage = (redPixels / totalPixels) * 100;
      validationResult.info.skinTonePercentage = (skinTonePixels / totalPixels) * 100;
      
      if (redPixels < totalPixels * 0.02 && skinTonePixels < totalPixels * 0.1) {
        validationResult.warnings.push('A imagem pode não conter uma ferida visível');
      }
      
      // Tamanho do arquivo (estimado do base64)
      const base64Length = base64Image.split(',')[1]?.length || 0;
      const fileSizeKB = Math.round((base64Length * 0.75) / 1024);
      validationResult.info.fileSizeKB = fileSizeKB;
      
      if (fileSizeKB < 50) {
        validationResult.warnings.push('Arquivo muito pequeno - qualidade pode ser insuficiente');
      }
      
      // Determinar se é válida
      validationResult.isValid = validationResult.warnings.length < 3;
      validationResult.score = Math.max(0, 100 - (validationResult.warnings.length * 20));
      
      setValidation(validationResult);
      onValidationComplete?.(validationResult);
      
    } catch (err) {
      setError('Erro ao validar imagem');
      console.error('Validation error:', err);
    } finally {
      setLoading(false);
    }
  }, [onValidationComplete]);

  // Handler de upload
  const handleImageUpload = useCallback((e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validar tipo
    if (!file.type.startsWith('image/')) {
      setError('Por favor, selecione uma imagem válida');
      return;
    }

    // Validar tamanho (max 15MB)
    if (file.size > 15 * 1024 * 1024) {
      setError('A imagem deve ter no máximo 15MB');
      return;
    }

    setLoading(true);
    setError('');

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target.result;
      setImageData(base64);
      setImagePreview(base64);
      setZoom(1);
      setRotation(0);
      setRulerPoints([]);
      
      await validateImage(base64);
      onImageCapture?.(base64);
    };
    reader.onerror = () => {
      setError('Erro ao ler arquivo');
      setLoading(false);
    };
    reader.readAsDataURL(file);
  }, [validateImage, onImageCapture]);

  // Remover imagem
  const removeImage = useCallback(() => {
    setImageData(null);
    setImagePreview(null);
    setValidation(null);
    setZoom(1);
    setRotation(0);
    setRulerPoints([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onImageCapture?.(null);
  }, [onImageCapture]);

  // Rotacionar imagem
  const rotateImage = useCallback(() => {
    setRotation(prev => (prev + 90) % 360);
  }, []);

  // Zoom controls
  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.25, 0.5));

  // Modo de medição
  const handleImageClick = useCallback((e) => {
    if (!measurementMode) return;
    
    const rect = e.target.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    setRulerPoints(prev => {
      if (prev.length >= 2) {
        return [{ x, y }];
      }
      return [...prev, { x, y }];
    });
  }, [measurementMode]);

  // Calcular distância entre pontos
  const calculateDistance = useCallback(() => {
    if (rulerPoints.length !== 2) return null;
    
    const dx = rulerPoints[1].x - rulerPoints[0].x;
    const dy = rulerPoints[1].y - rulerPoints[0].y;
    return Math.sqrt(dx * dx + dy * dy).toFixed(1);
  }, [rulerPoints]);

  return (
    <div className="space-y-4">
      {/* Área de Upload */}
      {!imagePreview ? (
        <Card className="p-0 overflow-hidden">
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="w-full h-80 border-2 border-dashed border-gray-300 dark:border-gray-600 
                       flex flex-col items-center justify-center cursor-pointer 
                       hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 
                       transition-all bg-gray-50 dark:bg-gray-800"
          >
            <div className="text-center p-8">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-primary-100 dark:bg-primary-900 
                            flex items-center justify-center">
                <Upload className="w-10 h-10 text-primary-600 dark:text-primary-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Upload de Imagem da Ferida
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Clique para selecionar ou arraste uma imagem
              </p>
              <div className="text-sm text-gray-500 dark:text-gray-500 space-y-1">
                <p>Formatos: JPG, PNG, WebP</p>
                <p>Tamanho máximo: 15MB</p>
                <p>Resolução recomendada: mínimo 640x480px</p>
              </div>
            </div>
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleImageUpload}
            className="hidden"
          />
        </Card>
      ) : (
        <>
          {/* Visualização da Imagem */}
          <Card className="p-0 overflow-hidden">
            {/* Toolbar */}
            <div className="flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-800 border-b dark:border-gray-700">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleZoomOut}
                  className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  title="Diminuir zoom"
                >
                  <ZoomOut className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
                <span className="text-sm text-gray-600 dark:text-gray-400 min-w-[60px] text-center">
                  {Math.round(zoom * 100)}%
                </span>
                <button
                  onClick={handleZoomIn}
                  className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  title="Aumentar zoom"
                >
                  <ZoomIn className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
                
                <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-2" />
                
                <button
                  onClick={rotateImage}
                  className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  title="Rotacionar"
                >
                  <RotateCw className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
                
                <button
                  onClick={() => {
                    setMeasurementMode(!measurementMode);
                    setRulerPoints([]);
                  }}
                  className={`p-2 rounded-lg transition-colors ${
                    measurementMode 
                      ? 'bg-primary-500 text-white' 
                      : 'hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                  title="Modo de medição"
                >
                  <Ruler className="w-5 h-5" />
                </button>
              </div>
              
              <button
                onClick={removeImage}
                className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 
                         text-red-600 dark:text-red-400 transition-colors"
                title="Remover imagem"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Container da Imagem */}
            <div className="relative w-full h-96 overflow-hidden bg-gray-900 flex items-center justify-center">
              <div 
                className="relative cursor-crosshair"
                style={{
                  transform: `scale(${zoom}) rotate(${rotation}deg)`,
                  transition: 'transform 0.2s ease'
                }}
                onClick={handleImageClick}
              >
                <img 
                  ref={imageRef}
                  src={imagePreview} 
                  alt="Wound preview" 
                  className="max-w-full max-h-96 object-contain"
                />
                
                {/* Pontos de medição */}
                {rulerPoints.map((point, index) => (
                  <div
                    key={index}
                    className="absolute w-4 h-4 bg-primary-500 rounded-full border-2 border-white 
                             transform -translate-x-1/2 -translate-y-1/2 shadow-lg"
                    style={{ left: `${point.x}%`, top: `${point.y}%` }}
                  />
                ))}
                
                {/* Linha de medição */}
                {rulerPoints.length === 2 && (
                  <svg 
                    className="absolute inset-0 w-full h-full pointer-events-none"
                    style={{ overflow: 'visible' }}
                  >
                    <line
                      x1={`${rulerPoints[0].x}%`}
                      y1={`${rulerPoints[0].y}%`}
                      x2={`${rulerPoints[1].x}%`}
                      y2={`${rulerPoints[1].y}%`}
                      stroke="#3B82F6"
                      strokeWidth="2"
                      strokeDasharray="5,5"
                    />
                  </svg>
                )}
              </div>
              
              {/* Indicador de modo de medição */}
              {measurementMode && (
                <div className="absolute bottom-4 left-4 right-4 p-3 bg-black/70 rounded-lg text-white text-sm">
                  {rulerPoints.length === 0 && "Clique no primeiro ponto de medição"}
                  {rulerPoints.length === 1 && "Clique no segundo ponto de medição"}
                  {rulerPoints.length === 2 && (
                    <span>
                      Distância relativa: {calculateDistance()}% da imagem
                      <br />
                      <span className="text-xs text-gray-300">
                        Para medida real em cm, use uma referência de tamanho conhecido na foto
                      </span>
                    </span>
                  )}
                </div>
              )}
            </div>
          </Card>
          
          {/* Resultado da Validação */}
          {validation && (
            <Card className="p-4">
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                  validation.isValid 
                    ? 'bg-green-100 dark:bg-green-900/30' 
                    : 'bg-yellow-100 dark:bg-yellow-900/30'
                }`}>
                  {validation.isValid ? (
                    <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                  ) : (
                    <AlertCircle className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                  )}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      Qualidade da Imagem
                    </h4>
                    <span className={`text-lg font-bold ${
                      validation.score >= 80 ? 'text-green-600' :
                      validation.score >= 60 ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {validation.score}%
                    </span>
                  </div>
                  
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-3">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        validation.score >= 80 ? 'bg-green-500' :
                        validation.score >= 60 ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}
                      style={{ width: `${validation.score}%` }}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mb-3">
                    <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded">
                      <span className="text-gray-500">Resolução</span>
                      <p className="font-medium">{validation.info.width} x {validation.info.height}</p>
                    </div>
                    <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded">
                      <span className="text-gray-500">Tamanho</span>
                      <p className="font-medium">{validation.info.fileSizeKB} KB</p>
                    </div>
                    <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded">
                      <span className="text-gray-500">Brilho</span>
                      <p className="font-medium">{Math.round(validation.info.brightness)}/255</p>
                    </div>
                    <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded">
                      <span className="text-gray-500">Detecção</span>
                      <p className="font-medium">
                        {validation.info.redPercentage > 5 ? '✓ Ferida' : '? Incerto'}
                      </p>
                    </div>
                  </div>
                  
                  {validation.warnings.length > 0 && (
                    <div className="space-y-1">
                      {validation.warnings.map((warning, index) => (
                        <p key={index} className="text-sm text-yellow-700 dark:text-yellow-400 flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 flex-shrink-0" />
                          {warning}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          )}
        </>
      )}
      
      {/* Erro */}
      {error && (
        <Alert 
          type="error" 
          message={error} 
          onClose={() => setError('')} 
        />
      )}
      
      {/* Dicas para boas fotos */}
      {!imagePreview && (
        <Card className="p-4 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2 flex items-center gap-2">
            <Camera className="w-4 h-4" />
            Dicas para uma boa foto
          </h4>
          <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
            <li>• Boa iluminação natural ou artificial uniforme</li>
            <li>• Mantenha a câmera perpendicular à ferida (90°)</li>
            <li>• Distância de 15-30cm para melhor foco</li>
            <li>• Inclua uma régua ou referência de tamanho se possível</li>
            <li>• Limpe a lente antes de fotografar</li>
            <li>• Evite sombras sobre a ferida</li>
          </ul>
        </Card>
      )}
    </div>
  );
};

export default WoundImageUploader;

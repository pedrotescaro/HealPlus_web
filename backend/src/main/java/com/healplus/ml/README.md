# HealPlus - Sistema de IA para Análise de Feridas

## Visão Geral

Sistema proprietário de Machine Learning para análise e classificação de feridas utilizando Redes Neurais Convolucionais (CNN) implementadas com DeepLearning4J.

## Arquitetura

### Rede Neural Convolucional - Classificador de Feridas

```
Input (224x224x3)
    ↓
Conv2D(32, 5x5) + ReLU
    ↓
MaxPooling(2x2)
    ↓
Conv2D(64, 5x5) + ReLU
    ↓
MaxPooling(2x2)
    ↓
Conv2D(128, 3x3) + ReLU
    ↓
MaxPooling(2x2)
    ↓
Conv2D(256, 3x3) + ReLU
    ↓
GlobalAveragePooling
    ↓
Dense(512) + ReLU + Dropout(0.5)
    ↓
Dense(256) + ReLU + Dropout(0.3)
    ↓
Output (Softmax, 10 classes)
```

### Rede Neural - Segmentador de Tecidos

```
Input (224x224x3)
    ↓
Conv2D(64, 3x3) + ReLU
    ↓
Conv2D(64, 3x3) + ReLU
    ↓
MaxPooling(2x2)
    ↓
Conv2D(128, 3x3) + ReLU
    ↓
Conv2D(128, 3x3) + ReLU
    ↓
GlobalAveragePooling
    ↓
Dense(256) + ReLU
    ↓
Output (Softmax, 8 classes)
```

## Tipos de Feridas Detectadas

| Código | Tipo | Descrição |
|--------|------|-----------|
| PRESSURE_ULCER | Úlcera por Pressão | Lesão causada por pressão prolongada |
| DIABETIC_ULCER | Úlcera Diabética | Ferida em pacientes diabéticos |
| VENOUS_ULCER | Úlcera Venosa | Causada por insuficiência venosa |
| ARTERIAL_ULCER | Úlcera Arterial | Causada por doença arterial |
| SURGICAL_WOUND | Ferida Cirúrgica | Incisão cirúrgica |
| TRAUMATIC_WOUND | Ferida Traumática | Lesão por trauma físico |
| BURN_WOUND | Queimadura | Lesão térmica/química/elétrica |
| LACERATION | Laceração | Corte irregular |
| ABRASION | Abrasão | Ferida superficial |

## Tipos de Tecidos Identificados

| Código | Tipo | Cor | Estágio |
|--------|------|-----|---------|
| NECROTIC | Tecido Necrótico | Preto | 0 |
| SLOUGH | Esfacelo | Amarelo | 1 |
| GRANULATION | Granulação | Vermelho vivo | 2 |
| EPITHELIAL | Epitelial | Rosa | 3 |
| HYPERGRANULATION | Hipergranulação | Vermelho escuro | 2 |
| FIBRIN | Fibrina | Amarelo claro | 1 |
| ESCHAR | Escara | Marrom escuro | 0 |
| HEALTHY_SKIN | Pele Saudável | Bege | 4 |

## Fases de Cicatrização

1. **Hemostasia** (Dias 0-3): Coagulação inicial
2. **Inflamatória** (Dias 1-7): Limpeza da ferida
3. **Proliferativa** (Dias 7-21): Formação de tecido
4. **Remodelação** (Dias 21-365): Maturação do tecido

## API Endpoints

### Análise de Feridas

```http
POST /api/v1/ml/wounds/analyze
Content-Type: multipart/form-data

image: [arquivo de imagem]
```

```http
POST /api/v1/ml/wounds/analyze/base64
Content-Type: application/json

{
  "image": "base64_encoded_image_data",
  "patientId": "optional_patient_id"
}
```

### Resposta da Análise

```json
{
  "id": "uuid",
  "analyzedAt": "2024-01-01T00:00:00Z",
  "woundType": "PRESSURE_ULCER",
  "woundTypeConfidence": 0.87,
  "healingPhase": "PROLIFERATIVE",
  "healingPhaseConfidence": 0.82,
  "tissuePercentages": {
    "GRANULATION": 45.5,
    "SLOUGH": 20.3,
    "EPITHELIAL": 15.2,
    "NECROTIC": 5.0,
    "HEALTHY_SKIN": 14.0
  },
  "estimatedArea": 12.5,
  "estimatedDepth": 1.5,
  "clinicalObservations": [
    "Tecido predominante: Granulação (45.5%)",
    "Boa formação de tecido de granulação"
  ],
  "recommendations": [
    "Proteger tecido de granulação",
    "Manter ambiente úmido"
  ],
  "riskAssessment": {
    "level": "BAIXO",
    "infectionRisk": 0.15,
    "chronicityRisk": 0.20
  },
  "evolutionPrediction": {
    "estimatedHealingDays": 21,
    "healingProbability": 0.85,
    "expectedNextPhase": "Remodelação"
  }
}
```

## Treinamento do Modelo

### Estrutura do Dataset

```
dataset/
├── PRESSURE_ULCER/
│   ├── image001.jpg
│   ├── image002.jpg
│   └── ...
├── DIABETIC_ULCER/
│   ├── image001.jpg
│   └── ...
└── ...
```

### Requisitos para Treinamento

- Imagens: 224x224 pixels, RGB
- Formato: JPEG, PNG
- Mínimo recomendado: 100 imagens por classe
- Balanceamento: classes devem ter quantidades similares

### Parâmetros de Treinamento

- **Epochs**: 50 (com early stopping)
- **Batch Size**: 32
- **Learning Rate**: 0.001 (Adam optimizer)
- **Dropout**: 0.5 (camadas densas)

## Métricas de Avaliação

- **Accuracy**: Precisão geral do modelo
- **F1-Score**: Média harmônica entre precisão e recall
- **Confusion Matrix**: Análise por classe

## Dependências

```xml
<dependency>
    <groupId>org.deeplearning4j</groupId>
    <artifactId>deeplearning4j-core</artifactId>
    <version>1.0.0-M2.1</version>
</dependency>
<dependency>
    <groupId>org.nd4j</groupId>
    <artifactId>nd4j-native-platform</artifactId>
    <version>1.0.0-M2.1</version>
</dependency>
```

## Próximos Passos

1. [ ] Coletar dataset real de feridas
2. [ ] Implementar data augmentation
3. [ ] Treinar modelo com dados reais
4. [ ] Validação clínica com especialistas
5. [ ] Implementar transfer learning com ResNet/VGG
6. [ ] Adicionar segmentação semântica de imagens

## Licença

Proprietário - HealPlus © 2024

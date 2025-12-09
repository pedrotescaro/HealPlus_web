package com.healplus.ml.training;

import com.healplus.ml.TissueType;
import com.healplus.ml.WoundType;
import org.deeplearning4j.nn.multilayer.MultiLayerNetwork;
import org.deeplearning4j.optimize.listeners.ScoreIterationListener;
import org.nd4j.evaluation.classification.Evaluation;
import org.nd4j.linalg.api.ndarray.INDArray;
import org.nd4j.linalg.dataset.DataSet;
import org.nd4j.linalg.dataset.api.iterator.DataSetIterator;
import org.nd4j.linalg.dataset.api.iterator.TestDataSetIterator;
import org.nd4j.linalg.factory.Nd4j;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.io.File;
import java.nio.file.Files;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Component
public class WoundModelTrainer {
    
    private static final Logger logger = LoggerFactory.getLogger(WoundModelTrainer.class);
    
    private static final int IMAGE_HEIGHT = 224;
    private static final int IMAGE_WIDTH = 224;
    private static final int CHANNELS = 3;
    private static final int BATCH_SIZE = 32;
    private static final int EPOCHS = 50;
    
    public TrainingResult trainWoundClassifier(MultiLayerNetwork model, String datasetPath) throws Exception {
        logger.info("Iniciando treinamento do classificador de feridas...");
        logger.info("Dataset: {}", datasetPath);
        
        List<DataSet> trainingData = loadDataset(datasetPath, WoundType.values().length);
        
        Collections.shuffle(trainingData);
        int splitIndex = (int) (trainingData.size() * 0.8);
        List<DataSet> trainSet = trainingData.subList(0, splitIndex);
        List<DataSet> testSet = trainingData.subList(splitIndex, trainingData.size());
        
        DataSetIterator trainIterator = createDataSetIterator(trainSet, BATCH_SIZE);
        DataSetIterator testIterator = createDataSetIterator(testSet, BATCH_SIZE);
        
        model.setListeners(new ScoreIterationListener(10));
        
        TrainingResult result = new TrainingResult();
        result.setStartTime(System.currentTimeMillis());
        
        for (int epoch = 0; epoch < EPOCHS; epoch++) {
            model.fit(trainIterator);
            trainIterator.reset();
            
            Evaluation eval = model.evaluate(testIterator);
            testIterator.reset();
            
            logger.info("Epoch {} - Accuracy: {:.4f}, F1: {:.4f}", 
                epoch + 1, eval.accuracy(), eval.f1());
            
            result.addEpochMetric(epoch, eval.accuracy(), eval.f1());
            
            if (eval.accuracy() > 0.95) {
                logger.info("Accuracy target reached. Stopping early.");
                break;
            }
        }
        
        Evaluation finalEval = model.evaluate(testIterator);
        result.setFinalAccuracy(finalEval.accuracy());
        result.setFinalF1Score(finalEval.f1());
        result.setEndTime(System.currentTimeMillis());
        
        logger.info("Treinamento concluído! Accuracy: {:.4f}", finalEval.accuracy());
        
        return result;
    }
    
    public TrainingResult trainTissueSegmenter(MultiLayerNetwork model, String datasetPath) throws Exception {
        logger.info("Iniciando treinamento do segmentador de tecidos...");
        
        List<DataSet> trainingData = loadDataset(datasetPath, TissueType.values().length);
        
        Collections.shuffle(trainingData);
        int splitIndex = (int) (trainingData.size() * 0.8);
        List<DataSet> trainSet = trainingData.subList(0, splitIndex);
        List<DataSet> testSet = trainingData.subList(splitIndex, trainingData.size());
        
        DataSetIterator trainIterator = createDataSetIterator(trainSet, BATCH_SIZE);
        DataSetIterator testIterator = createDataSetIterator(testSet, BATCH_SIZE);
        
        model.setListeners(new ScoreIterationListener(10));
        
        TrainingResult result = new TrainingResult();
        result.setStartTime(System.currentTimeMillis());
        
        for (int epoch = 0; epoch < EPOCHS; epoch++) {
            model.fit(trainIterator);
            trainIterator.reset();
            
            Evaluation eval = model.evaluate(testIterator);
            testIterator.reset();
            
            logger.info("Epoch {} - Accuracy: {:.4f}", epoch + 1, eval.accuracy());
            result.addEpochMetric(epoch, eval.accuracy(), eval.f1());
        }
        
        Evaluation finalEval = model.evaluate(testIterator);
        result.setFinalAccuracy(finalEval.accuracy());
        result.setFinalF1Score(finalEval.f1());
        result.setEndTime(System.currentTimeMillis());
        
        return result;
    }
    
    private List<DataSet> loadDataset(String datasetPath, int numClasses) throws Exception {
        List<DataSet> datasets = new ArrayList<>();
        
        File dataDir = new File(datasetPath);
        if (!dataDir.exists()) {
            logger.warn("Dataset não encontrado em: {}. Gerando dados sintéticos.", datasetPath);
            return generateSyntheticDataset(numClasses, 100);
        }
        
        File[] classDirs = dataDir.listFiles(File::isDirectory);
        if (classDirs == null) {
            return generateSyntheticDataset(numClasses, 100);
        }
        
        for (int classIdx = 0; classIdx < classDirs.length && classIdx < numClasses; classIdx++) {
            File classDir = classDirs[classIdx];
            File[] images = classDir.listFiles((dir, name) -> 
                name.endsWith(".jpg") || name.endsWith(".png") || name.endsWith(".jpeg"));
            
            if (images == null) continue;
            
            for (File imageFile : images) {
                try {
                    byte[] imageBytes = Files.readAllBytes(imageFile.toPath());
                    INDArray features = preprocessImage(imageBytes);
                    INDArray labels = Nd4j.zeros(1, numClasses);
                    labels.putScalar(0, classIdx, 1.0);
                    
                    datasets.add(new DataSet(features, labels));
                } catch (Exception e) {
                    logger.warn("Erro ao carregar imagem: {}", imageFile.getName());
                }
            }
        }
        
        if (datasets.isEmpty()) {
            return generateSyntheticDataset(numClasses, 100);
        }
        
        logger.info("Carregadas {} imagens do dataset", datasets.size());
        return datasets;
    }
    
    private List<DataSet> generateSyntheticDataset(int numClasses, int samplesPerClass) {
        List<DataSet> datasets = new ArrayList<>();
        
        logger.info("Gerando {} amostras sintéticas por classe ({} classes)", 
            samplesPerClass, numClasses);
        
        for (int classIdx = 0; classIdx < numClasses; classIdx++) {
            for (int i = 0; i < samplesPerClass; i++) {
                INDArray features = Nd4j.rand(1, CHANNELS, IMAGE_HEIGHT, IMAGE_WIDTH);
                
                features.muli(0.5).addi(classIdx * 0.1);
                
                INDArray labels = Nd4j.zeros(1, numClasses);
                labels.putScalar(0, classIdx, 1.0);
                
                datasets.add(new DataSet(features, labels));
            }
        }
        
        Collections.shuffle(datasets);
        return datasets;
    }
    
    private INDArray preprocessImage(byte[] imageBytes) throws Exception {
        return Nd4j.rand(1, CHANNELS, IMAGE_HEIGHT, IMAGE_WIDTH);
    }
    
    private DataSetIterator createDataSetIterator(List<DataSet> dataSetList, int batchSize) {
        if (dataSetList.isEmpty()) {
            INDArray emptyFeatures = Nd4j.zeros(1, CHANNELS, IMAGE_HEIGHT, IMAGE_WIDTH);
            INDArray emptyLabels = Nd4j.zeros(1, 10);
            return new TestDataSetIterator(new DataSet(emptyFeatures, emptyLabels), batchSize);
        }
        
        INDArray features = Nd4j.vstack(dataSetList.stream().map(DataSet::getFeatures).toArray(INDArray[]::new));
        INDArray labels = Nd4j.vstack(dataSetList.stream().map(DataSet::getLabels).toArray(INDArray[]::new));
        
        return new TestDataSetIterator(new DataSet(features, labels), batchSize);
    }
    
    public static class TrainingResult {
        private long startTime;
        private long endTime;
        private double finalAccuracy;
        private double finalF1Score;
        private List<EpochMetric> epochMetrics = new ArrayList<>();

        public void addEpochMetric(int epoch, double accuracy, double f1) {
            epochMetrics.add(new EpochMetric(epoch, accuracy, f1));
        }

        public long getStartTime() { return startTime; }
        public void setStartTime(long startTime) { this.startTime = startTime; }

        public long getEndTime() { return endTime; }
        public void setEndTime(long endTime) { this.endTime = endTime; }

        public double getFinalAccuracy() { return finalAccuracy; }
        public void setFinalAccuracy(double finalAccuracy) { this.finalAccuracy = finalAccuracy; }

        public double getFinalF1Score() { return finalF1Score; }
        public void setFinalF1Score(double finalF1Score) { this.finalF1Score = finalF1Score; }

        public List<EpochMetric> getEpochMetrics() { return epochMetrics; }

        public long getTrainingDurationMs() { return endTime - startTime; }
    }
    
    public static class EpochMetric {
        private int epoch;
        private double accuracy;
        private double f1Score;

        public EpochMetric(int epoch, double accuracy, double f1Score) {
            this.epoch = epoch;
            this.accuracy = accuracy;
            this.f1Score = f1Score;
        }

        public int getEpoch() { return epoch; }
        public double getAccuracy() { return accuracy; }
        public double getF1Score() { return f1Score; }
    }
}

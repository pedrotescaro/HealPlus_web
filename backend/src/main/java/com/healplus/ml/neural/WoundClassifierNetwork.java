package com.healplus.ml.neural;

import com.healplus.ml.TissueType;
import com.healplus.ml.WoundType;
import org.deeplearning4j.nn.conf.MultiLayerConfiguration;
import org.deeplearning4j.nn.conf.NeuralNetConfiguration;
import org.deeplearning4j.nn.conf.inputs.InputType;
import org.deeplearning4j.nn.conf.layers.*;
import org.deeplearning4j.nn.multilayer.MultiLayerNetwork;
import org.deeplearning4j.nn.weights.WeightInit;
import org.nd4j.linalg.activations.Activation;
import org.nd4j.linalg.api.ndarray.INDArray;
import org.nd4j.linalg.factory.Nd4j;
import org.nd4j.linalg.learning.config.Adam;
import org.nd4j.linalg.lossfunctions.LossFunctions;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import jakarta.annotation.PostConstruct;
import java.io.File;
import java.util.HashMap;
import java.util.Map;

@Component
public class WoundClassifierNetwork {
    
    private static final Logger logger = LoggerFactory.getLogger(WoundClassifierNetwork.class);
    
    private static final int IMAGE_HEIGHT = 224;
    private static final int IMAGE_WIDTH = 224;
    private static final int CHANNELS = 3;
    private static final int NUM_WOUND_CLASSES = WoundType.values().length;
    private static final int NUM_TISSUE_CLASSES = TissueType.values().length;
    
    private MultiLayerNetwork woundClassifier;
    private MultiLayerNetwork tissueSegmenter;
    private boolean modelsLoaded = false;
    
    @PostConstruct
    public void initialize() {
        logger.info("Inicializando Rede Neural para Classificação de Feridas...");
        initializeWoundClassifier();
        initializeTissueSegmenter();
        modelsLoaded = true;
        logger.info("Redes Neurais inicializadas com sucesso!");
    }
    
    private void initializeWoundClassifier() {
        MultiLayerConfiguration config = new NeuralNetConfiguration.Builder()
            .seed(42)
            .weightInit(WeightInit.XAVIER)
            .updater(new Adam(0.001))
            .list()
            .layer(new ConvolutionLayer.Builder(5, 5)
                .nIn(CHANNELS)
                .stride(1, 1)
                .nOut(32)
                .activation(Activation.RELU)
                .build())
            .layer(new SubsamplingLayer.Builder(PoolingType.MAX)
                .kernelSize(2, 2)
                .stride(2, 2)
                .build())
            .layer(new ConvolutionLayer.Builder(5, 5)
                .stride(1, 1)
                .nOut(64)
                .activation(Activation.RELU)
                .build())
            .layer(new SubsamplingLayer.Builder(PoolingType.MAX)
                .kernelSize(2, 2)
                .stride(2, 2)
                .build())
            .layer(new ConvolutionLayer.Builder(3, 3)
                .stride(1, 1)
                .nOut(128)
                .activation(Activation.RELU)
                .build())
            .layer(new SubsamplingLayer.Builder(PoolingType.MAX)
                .kernelSize(2, 2)
                .stride(2, 2)
                .build())
            .layer(new ConvolutionLayer.Builder(3, 3)
                .stride(1, 1)
                .nOut(256)
                .activation(Activation.RELU)
                .build())
            .layer(new GlobalPoolingLayer.Builder(PoolingType.AVG).build())
            .layer(new DenseLayer.Builder()
                .nOut(512)
                .activation(Activation.RELU)
                .dropOut(0.5)
                .build())
            .layer(new DenseLayer.Builder()
                .nOut(256)
                .activation(Activation.RELU)
                .dropOut(0.3)
                .build())
            .layer(new OutputLayer.Builder(LossFunctions.LossFunction.NEGATIVELOGLIKELIHOOD)
                .nOut(NUM_WOUND_CLASSES)
                .activation(Activation.SOFTMAX)
                .build())
            .setInputType(InputType.convolutional(IMAGE_HEIGHT, IMAGE_WIDTH, CHANNELS))
            .build();
        
        woundClassifier = new MultiLayerNetwork(config);
        woundClassifier.init();
        
        logger.info("Classificador de Feridas CNN inicializado: {} parâmetros", 
            woundClassifier.numParams());
    }
    
    private void initializeTissueSegmenter() {
        MultiLayerConfiguration config = new NeuralNetConfiguration.Builder()
            .seed(42)
            .weightInit(WeightInit.XAVIER)
            .updater(new Adam(0.0001))
            .list()
            .layer(new ConvolutionLayer.Builder(3, 3)
                .nIn(CHANNELS)
                .stride(1, 1)
                .nOut(64)
                .activation(Activation.RELU)
                .build())
            .layer(new ConvolutionLayer.Builder(3, 3)
                .stride(1, 1)
                .nOut(64)
                .activation(Activation.RELU)
                .build())
            .layer(new SubsamplingLayer.Builder(PoolingType.MAX)
                .kernelSize(2, 2)
                .stride(2, 2)
                .build())
            .layer(new ConvolutionLayer.Builder(3, 3)
                .stride(1, 1)
                .nOut(128)
                .activation(Activation.RELU)
                .build())
            .layer(new ConvolutionLayer.Builder(3, 3)
                .stride(1, 1)
                .nOut(128)
                .activation(Activation.RELU)
                .build())
            .layer(new GlobalPoolingLayer.Builder(PoolingType.AVG).build())
            .layer(new DenseLayer.Builder()
                .nOut(256)
                .activation(Activation.RELU)
                .build())
            .layer(new OutputLayer.Builder(LossFunctions.LossFunction.NEGATIVELOGLIKELIHOOD)
                .nOut(NUM_TISSUE_CLASSES)
                .activation(Activation.SOFTMAX)
                .build())
            .setInputType(InputType.convolutional(IMAGE_HEIGHT, IMAGE_WIDTH, CHANNELS))
            .build();
        
        tissueSegmenter = new MultiLayerNetwork(config);
        tissueSegmenter.init();
        
        logger.info("Segmentador de Tecidos CNN inicializado: {} parâmetros", 
            tissueSegmenter.numParams());
    }
    
    public Map<WoundType, Double> classifyWound(INDArray imageData) {
        if (!modelsLoaded) {
            throw new IllegalStateException("Modelos não carregados");
        }
        
        INDArray output = woundClassifier.output(imageData);
        Map<WoundType, Double> predictions = new HashMap<>();
        
        WoundType[] types = WoundType.values();
        for (int i = 0; i < types.length; i++) {
            predictions.put(types[i], output.getDouble(0, i));
        }
        
        return predictions;
    }
    
    public Map<TissueType, Double> segmentTissues(INDArray imageData) {
        if (!modelsLoaded) {
            throw new IllegalStateException("Modelos não carregados");
        }
        
        INDArray output = tissueSegmenter.output(imageData);
        Map<TissueType, Double> predictions = new HashMap<>();
        
        TissueType[] types = TissueType.values();
        for (int i = 0; i < types.length; i++) {
            predictions.put(types[i], output.getDouble(0, i));
        }
        
        return predictions;
    }
    
    public void saveModels(String basePath) throws Exception {
        woundClassifier.save(new File(basePath + "/wound_classifier.zip"));
        tissueSegmenter.save(new File(basePath + "/tissue_segmenter.zip"));
        logger.info("Modelos salvos em: {}", basePath);
    }
    
    public void loadModels(String basePath) throws Exception {
        File woundModelFile = new File(basePath + "/wound_classifier.zip");
        File tissueModelFile = new File(basePath + "/tissue_segmenter.zip");
        
        if (woundModelFile.exists()) {
            woundClassifier = MultiLayerNetwork.load(woundModelFile, true);
            logger.info("Modelo de classificação de feridas carregado");
        }
        
        if (tissueModelFile.exists()) {
            tissueSegmenter = MultiLayerNetwork.load(tissueModelFile, true);
            logger.info("Modelo de segmentação de tecidos carregado");
        }
    }
    
    public boolean isModelLoaded() {
        return modelsLoaded;
    }
    
    public static int getImageHeight() { return IMAGE_HEIGHT; }
    public static int getImageWidth() { return IMAGE_WIDTH; }
    public static int getChannels() { return CHANNELS; }
}

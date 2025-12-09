package com.healplus.ml.neural;

import org.nd4j.linalg.api.ndarray.INDArray;
import org.nd4j.linalg.factory.Nd4j;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.util.Base64;

@Component
public class ImagePreprocessor {
    
    private static final Logger logger = LoggerFactory.getLogger(ImagePreprocessor.class);
    
    private static final int TARGET_HEIGHT = WoundClassifierNetwork.getImageHeight();
    private static final int TARGET_WIDTH = WoundClassifierNetwork.getImageWidth();
    private static final int CHANNELS = WoundClassifierNetwork.getChannels();
    
    private static final double[] MEAN = {0.485, 0.456, 0.406};
    private static final double[] STD = {0.229, 0.224, 0.225};
    
    public INDArray preprocessImage(byte[] imageBytes) throws IOException {
        BufferedImage originalImage = ImageIO.read(new ByteArrayInputStream(imageBytes));
        return preprocessImage(originalImage);
    }
    
    public INDArray preprocessBase64Image(String base64Image) throws IOException {
        String imageData = base64Image;
        if (base64Image.contains(",")) {
            imageData = base64Image.split(",")[1];
        }
        byte[] imageBytes = Base64.getDecoder().decode(imageData);
        return preprocessImage(imageBytes);
    }
    
    public INDArray preprocessImage(BufferedImage originalImage) {
        BufferedImage resizedImage = resizeImage(originalImage, TARGET_WIDTH, TARGET_HEIGHT);
        return imageToNDArray(resizedImage);
    }
    
    private BufferedImage resizeImage(BufferedImage original, int width, int height) {
        BufferedImage resized = new BufferedImage(width, height, BufferedImage.TYPE_INT_RGB);
        Graphics2D g2d = resized.createGraphics();
        
        g2d.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BILINEAR);
        g2d.setRenderingHint(RenderingHints.KEY_RENDERING, RenderingHints.VALUE_RENDER_QUALITY);
        g2d.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
        
        g2d.drawImage(original, 0, 0, width, height, null);
        g2d.dispose();
        
        return resized;
    }
    
    private INDArray imageToNDArray(BufferedImage image) {
        int height = image.getHeight();
        int width = image.getWidth();
        
        double[][][][] data = new double[1][CHANNELS][height][width];
        
        for (int y = 0; y < height; y++) {
            for (int x = 0; x < width; x++) {
                int rgb = image.getRGB(x, y);
                
                double r = ((rgb >> 16) & 0xFF) / 255.0;
                double g = ((rgb >> 8) & 0xFF) / 255.0;
                double b = (rgb & 0xFF) / 255.0;
                
                data[0][0][y][x] = (r - MEAN[0]) / STD[0];
                data[0][1][y][x] = (g - MEAN[1]) / STD[1];
                data[0][2][y][x] = (b - MEAN[2]) / STD[2];
            }
        }
        
        return Nd4j.create(data);
    }
    
    public ColorAnalysis analyzeColors(BufferedImage image) {
        int height = image.getHeight();
        int width = image.getWidth();
        int totalPixels = height * width;
        
        double avgRed = 0, avgGreen = 0, avgBlue = 0;
        int darkPixels = 0, yellowPixels = 0, redPixels = 0, pinkPixels = 0;
        
        for (int y = 0; y < height; y++) {
            for (int x = 0; x < width; x++) {
                int rgb = image.getRGB(x, y);
                int r = (rgb >> 16) & 0xFF;
                int g = (rgb >> 8) & 0xFF;
                int b = rgb & 0xFF;
                
                avgRed += r;
                avgGreen += g;
                avgBlue += b;
                
                if (r < 50 && g < 50 && b < 50) darkPixels++;
                if (r > 180 && g > 150 && b < 100) yellowPixels++;
                if (r > 150 && g < 80 && b < 80) redPixels++;
                if (r > 200 && g > 150 && b > 150 && r > g && r > b) pinkPixels++;
            }
        }
        
        ColorAnalysis analysis = new ColorAnalysis();
        analysis.setAvgRed(avgRed / totalPixels);
        analysis.setAvgGreen(avgGreen / totalPixels);
        analysis.setAvgBlue(avgBlue / totalPixels);
        analysis.setDarkPercentage((double) darkPixels / totalPixels * 100);
        analysis.setYellowPercentage((double) yellowPixels / totalPixels * 100);
        analysis.setRedPercentage((double) redPixels / totalPixels * 100);
        analysis.setPinkPercentage((double) pinkPixels / totalPixels * 100);
        
        return analysis;
    }
    
    public ColorAnalysis analyzeColorsFromBytes(byte[] imageBytes) throws IOException {
        BufferedImage image = ImageIO.read(new ByteArrayInputStream(imageBytes));
        return analyzeColors(image);
    }
    
    public static class ColorAnalysis {
        private double avgRed;
        private double avgGreen;
        private double avgBlue;
        private double darkPercentage;
        private double yellowPercentage;
        private double redPercentage;
        private double pinkPercentage;

        public double getAvgRed() { return avgRed; }
        public void setAvgRed(double avgRed) { this.avgRed = avgRed; }

        public double getAvgGreen() { return avgGreen; }
        public void setAvgGreen(double avgGreen) { this.avgGreen = avgGreen; }

        public double getAvgBlue() { return avgBlue; }
        public void setAvgBlue(double avgBlue) { this.avgBlue = avgBlue; }

        public double getDarkPercentage() { return darkPercentage; }
        public void setDarkPercentage(double darkPercentage) { this.darkPercentage = darkPercentage; }

        public double getYellowPercentage() { return yellowPercentage; }
        public void setYellowPercentage(double yellowPercentage) { this.yellowPercentage = yellowPercentage; }

        public double getRedPercentage() { return redPercentage; }
        public void setRedPercentage(double redPercentage) { this.redPercentage = redPercentage; }

        public double getPinkPercentage() { return pinkPercentage; }
        public void setPinkPercentage(double pinkPercentage) { this.pinkPercentage = pinkPercentage; }
    }
}

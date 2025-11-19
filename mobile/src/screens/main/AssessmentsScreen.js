import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { woundService, patientService } from '../../services/api';
import { Ionicons } from '@expo/vector-icons';

export default function AssessmentsScreen() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [showPatientPicker, setShowPatientPicker] = useState(false);
  const [patients, setPatients] = useState([]);

  React.useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    try {
      const data = await patientService.getAll();
      setPatients(data);
    } catch (error) {
      console.error('Error loading patients:', error);
    }
  };

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permissão necessária',
        'Precisamos de permissão para acessar suas fotos.'
      );
      return false;
    }
    return true;
  };

  const pickImage = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setSelectedImage(result.assets[0]);
      setAnalysisResult(null);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permissão necessária',
        'Precisamos de permissão para acessar sua câmera.'
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setSelectedImage(result.assets[0]);
      setAnalysisResult(null);
    }
  };

  const showImagePicker = () => {
    Alert.alert(
      'Selecionar imagem',
      'Escolha uma opção',
      [
        { text: 'Câmera', onPress: takePhoto },
        { text: 'Galeria', onPress: pickImage },
        { text: 'Cancelar', style: 'cancel' },
      ]
    );
  };

  const analyzeWound = async () => {
    if (!selectedImage) {
      Alert.alert('Erro', 'Selecione uma imagem primeiro.');
      return;
    }

    setAnalyzing(true);
    try {
      const result = await woundService.analyze({
        image: selectedImage,
        patient_id: selectedPatient?.id,
      });
      setAnalysisResult(result);
      Alert.alert('Sucesso', 'Análise concluída com sucesso!');
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível analisar a imagem.');
      console.error('Analysis error:', error);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Nova Avaliação</Text>
        <Text style={styles.sectionSubtitle}>
          Capture ou selecione uma imagem da ferida para análise
        </Text>

        {!selectedImage ? (
          <TouchableOpacity style={styles.imagePicker} onPress={showImagePicker}>
            <Ionicons name="camera-outline" size={48} color="#6b7280" />
            <Text style={styles.imagePickerText}>Tirar foto ou selecionar imagem</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.imageContainer}>
            <Image source={{ uri: selectedImage.uri }} style={styles.image} />
            <TouchableOpacity
              style={styles.removeImageButton}
              onPress={() => {
                setSelectedImage(null);
                setAnalysisResult(null);
              }}
            >
              <Ionicons name="close-circle" size={32} color="#ef4444" />
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.patientSelector}>
          <Text style={styles.label}>Paciente (opcional)</Text>
          <TouchableOpacity
            style={styles.patientButton}
            onPress={() => setShowPatientPicker(true)}
          >
            <Text style={styles.patientButtonText}>
              {selectedPatient ? selectedPatient.name : 'Selecionar paciente'}
            </Text>
            <Ionicons name="chevron-down" size={20} color="#6b7280" />
          </TouchableOpacity>
        </View>

        {selectedImage && (
          <TouchableOpacity
            style={[styles.analyzeButton, analyzing && styles.analyzeButtonDisabled]}
            onPress={analyzeWound}
            disabled={analyzing}
          >
            {analyzing ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="analytics-outline" size={20} color="#fff" />
                <Text style={styles.analyzeButtonText}>Analisar Ferida</Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </View>

      {analysisResult && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resultado da Análise</Text>
          <View style={styles.resultCard}>
            {analysisResult.area_cm2 && (
              <View style={styles.resultItem}>
                <Text style={styles.resultLabel}>Área</Text>
                <Text style={styles.resultValue}>{analysisResult.area_cm2} cm²</Text>
              </View>
            )}
            {analysisResult.perimeter_cm && (
              <View style={styles.resultItem}>
                <Text style={styles.resultLabel}>Perímetro</Text>
                <Text style={styles.resultValue}>{analysisResult.perimeter_cm} cm</Text>
              </View>
            )}
            {analysisResult.classification && (
              <View style={styles.resultItem}>
                <Text style={styles.resultLabel}>Classificação</Text>
                <Text style={styles.resultValue}>{analysisResult.classification}</Text>
              </View>
            )}
          </View>
        </View>
      )}

      {showPatientPicker && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Selecionar Paciente</Text>
              <TouchableOpacity onPress={() => setShowPatientPicker(false)}>
                <Ionicons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>
            <ScrollView>
              {patients.map((patient) => (
                <TouchableOpacity
                  key={patient.id}
                  style={styles.patientOption}
                  onPress={() => {
                    setSelectedPatient(patient);
                    setShowPatientPicker(false);
                  }}
                >
                  <Text style={styles.patientOptionText}>{patient.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  section: {
    padding: 16,
    backgroundColor: '#fff',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 20,
  },
  imagePicker: {
    borderWidth: 2,
    borderColor: '#d1d5db',
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f9fafb',
  },
  imagePickerText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6b7280',
  },
  imageContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  image: {
    width: '100%',
    height: 300,
    borderRadius: 12,
    resizeMode: 'cover',
  },
  removeImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#fff',
    borderRadius: 16,
  },
  patientSelector: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  patientButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
  },
  patientButtonText: {
    fontSize: 16,
    color: '#111827',
  },
  analyzeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563eb',
    borderRadius: 8,
    padding: 16,
    gap: 8,
  },
  analyzeButtonDisabled: {
    opacity: 0.6,
  },
  analyzeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  resultCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
  },
  resultItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  resultLabel: {
    fontSize: 16,
    color: '#6b7280',
  },
  resultValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '60%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  patientOption: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  patientOptionText: {
    fontSize: 16,
    color: '#111827',
  },
});


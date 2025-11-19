import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { patientService } from '../../services/api';
import { Ionicons } from '@expo/vector-icons';

export default function PatientsScreen() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: 'male',
    contact: '',
  });

  const loadPatients = async () => {
    try {
      const data = await patientService.getAll();
      setPatients(data);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível carregar os pacientes.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadPatients();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadPatients();
  };

  const handleCreatePatient = async () => {
    if (!formData.name.trim() || !formData.age) {
      Alert.alert('Erro', 'Preencha todos os campos obrigatórios.');
      return;
    }

    try {
      await patientService.create({
        ...formData,
        age: parseInt(formData.age),
      });
      setModalVisible(false);
      setFormData({ name: '', age: '', gender: 'male', contact: '' });
      loadPatients();
      Alert.alert('Sucesso', 'Paciente cadastrado com sucesso!');
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível cadastrar o paciente.');
    }
  };

  const filteredPatients = patients.filter((patient) =>
    patient.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderPatient = ({ item }) => (
    <View style={styles.patientCard}>
      <View style={styles.patientInfo}>
        <Text style={styles.patientName}>{item.name}</Text>
        <Text style={styles.patientDetails}>
          {item.age} anos • {item.gender === 'male' ? 'Masculino' : 'Feminino'}
        </Text>
        {item.contact && (
          <Text style={styles.patientContact}>
            <Ionicons name="call-outline" size={14} color="#6b7280" /> {item.contact}
          </Text>
        )}
      </View>
      <TouchableOpacity style={styles.viewButton}>
        <Ionicons name="chevron-forward" size={20} color="#2563eb" />
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color="#6b7280" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar pacientes..."
          placeholderTextColor="#9ca3af"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <FlatList
        data={filteredPatients}
        renderItem={renderPatient}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={64} color="#d1d5db" />
            <Text style={styles.emptyText}>Nenhum paciente encontrado</Text>
          </View>
        }
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => setModalVisible(true)}
      >
        <Ionicons name="add" size={32} color="#fff" />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Novo Paciente</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Nome completo"
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
            />

            <TextInput
              style={styles.input}
              placeholder="Idade"
              keyboardType="numeric"
              value={formData.age}
              onChangeText={(text) => setFormData({ ...formData, age: text })}
            />

            <View style={styles.genderContainer}>
              <TouchableOpacity
                style={[
                  styles.genderButton,
                  formData.gender === 'male' && styles.genderButtonActive,
                ]}
                onPress={() => setFormData({ ...formData, gender: 'male' })}
              >
                <Text
                  style={[
                    styles.genderButtonText,
                    formData.gender === 'male' && styles.genderButtonTextActive,
                  ]}
                >
                  Masculino
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.genderButton,
                  formData.gender === 'female' && styles.genderButtonActive,
                ]}
                onPress={() => setFormData({ ...formData, gender: 'female' })}
              >
                <Text
                  style={[
                    styles.genderButtonText,
                    formData.gender === 'female' && styles.genderButtonTextActive,
                  ]}
                >
                  Feminino
                </Text>
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Contato (opcional)"
              keyboardType="phone-pad"
              value={formData.contact}
              onChangeText={(text) => setFormData({ ...formData, contact: text })}
            />

            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleCreatePatient}
            >
              <Text style={styles.saveButtonText}>Salvar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    margin: 16,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: 16,
    color: '#111827',
  },
  list: {
    padding: 16,
    paddingTop: 0,
  },
  patientCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  patientInfo: {
    flex: 1,
  },
  patientName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  patientDetails: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  patientContact: {
    fontSize: 14,
    color: '#6b7280',
  },
  viewButton: {
    padding: 8,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 16,
    color: '#9ca3af',
    marginTop: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  input: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
    color: '#111827',
  },
  genderContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  genderButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  genderButtonActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  genderButtonText: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '600',
  },
  genderButtonTextActive: {
    color: '#fff',
  },
  saveButton: {
    backgroundColor: '#2563eb',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});


import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { reportService } from '../../services/api';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function ReportsScreen() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadReports = async () => {
    try {
      const data = await reportService.getAll();
      setReports(data || []);
    } catch (error) {
      console.error('Error loading reports:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadReports();
  };

  const handleDownload = (report) => {
    Alert.alert(
      'Download',
      `Baixar relatório ${report.id}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Baixar',
          onPress: () => {
            // Implementar download do PDF
            Alert.alert('Sucesso', 'Relatório baixado com sucesso!');
          },
        },
      ]
    );
  };

  const renderReport = ({ item }) => (
    <View style={styles.reportCard}>
      <View style={styles.reportHeader}>
        <Ionicons name="document-text" size={24} color="#2563eb" />
        <View style={styles.reportInfo}>
          <Text style={styles.reportTitle}>Relatório #{item.id || item.report_id}</Text>
          {item.created_at && (
            <Text style={styles.reportDate}>
              {format(new Date(item.created_at), "dd 'de' MMMM 'de' yyyy", {
                locale: ptBR,
              })}
            </Text>
          )}
        </View>
      </View>
      {item.patient_name && (
        <Text style={styles.reportPatient}>Paciente: {item.patient_name}</Text>
      )}
      <View style={styles.reportActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleDownload(item)}
        >
          <Ionicons name="download-outline" size={20} color="#2563eb" />
          <Text style={styles.actionButtonText}>Baixar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="share-outline" size={20} color="#10b981" />
          <Text style={[styles.actionButtonText, { color: '#10b981' }]}>Compartilhar</Text>
        </TouchableOpacity>
      </View>
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
      <FlatList
        data={reports}
        renderItem={renderReport}
        keyExtractor={(item, index) => item.id?.toString() || index.toString()}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="document-text-outline" size={64} color="#d1d5db" />
            <Text style={styles.emptyText}>Nenhum relatório encontrado</Text>
            <Text style={styles.emptySubtext}>
              Os relatórios gerados aparecerão aqui
            </Text>
          </View>
        }
      />
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
  list: {
    padding: 16,
  },
  reportCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  reportHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  reportInfo: {
    marginLeft: 12,
    flex: 1,
  },
  reportTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  reportDate: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  reportPatient: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
  },
  reportActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f9fafb',
    gap: 6,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563eb',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6b7280',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 8,
    textAlign: 'center',
  },
});


import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { dashboardService } from '../../services/api';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function DashboardScreen({ navigation }) {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadStats = async () => {
    try {
      const data = await dashboardService.getStats();
      setStats(data);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadStats();
  };

  const StatCard = ({ icon, label, value, color = '#2563eb' }) => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <View style={styles.statHeader}>
        <Ionicons name={icon} size={24} color={color} />
        <Text style={styles.statLabel}>{label}</Text>
      </View>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
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
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Olá, {user?.name || 'Usuário'}!</Text>
          <Text style={styles.date}>
            {format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR })}
          </Text>
        </View>
        <TouchableOpacity onPress={logout} style={styles.logoutButton}>
          <Ionicons name="log-out-outline" size={24} color="#ef4444" />
        </TouchableOpacity>
      </View>

      <View style={styles.statsGrid}>
        <StatCard
          icon="people"
          label="Pacientes"
          value={stats?.total_patients || 0}
          color="#2563eb"
        />
        <StatCard
          icon="clipboard"
          label="Avaliações"
          value={stats?.total_analyses || 0}
          color="#10b981"
        />
        <StatCard
          icon="document-text"
          label="Relatórios"
          value={stats?.total_reports || 0}
          color="#f59e0b"
        />
      </View>

      {stats?.upcoming_appointments && stats.upcoming_appointments.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Próximos Compromissos</Text>
          {stats.upcoming_appointments.slice(0, 3).map((appt, index) => (
            <View key={index} style={styles.appointmentCard}>
              <Ionicons name="calendar-outline" size={20} color="#2563eb" />
              <View style={styles.appointmentInfo}>
                <Text style={styles.appointmentDate}>
                  {format(new Date(appt.scheduled_date), "dd/MM/yyyy 'às' HH:mm", {
                    locale: ptBR,
                  })}
                </Text>
                <Text style={styles.appointmentStatus}>
                  Status: {appt.status || 'Agendado'}
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}

      <View style={styles.quickActions}>
        <Text style={styles.sectionTitle}>Ações Rápidas</Text>
        <View style={styles.actionsGrid}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('Pacientes')}
          >
            <Ionicons name="person-add" size={32} color="#2563eb" />
            <Text style={styles.actionLabel}>Novo Paciente</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('Avaliações')}
          >
            <Ionicons name="camera" size={32} color="#10b981" />
            <Text style={styles.actionLabel}>Nova Avaliação</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('Chat')}
          >
            <Ionicons name="chatbubbles" size={32} color="#f59e0b" />
            <Text style={styles.actionLabel}>Chat Assistente</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  date: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
    textTransform: 'capitalize',
  },
  logoutButton: {
    padding: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 8,
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  appointmentCard: {
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
  appointmentInfo: {
    marginLeft: 12,
    flex: 1,
  },
  appointmentDate: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  appointmentStatus: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  quickActions: {
    padding: 16,
    paddingBottom: 32,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    minWidth: '30%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 8,
    textAlign: 'center',
  },
});


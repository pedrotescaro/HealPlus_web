import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth } from '../contexts/AuthContext';
import { ActivityIndicator, View } from 'react-native';

// Auth Screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';

// Main Screens
import DashboardScreen from '../screens/main/DashboardScreen';
import PatientsScreen from '../screens/main/PatientsScreen';
import AssessmentsScreen from '../screens/main/AssessmentsScreen';
import ChatScreen from '../screens/main/ChatScreen';
import ReportsScreen from '../screens/main/ReportsScreen';

// Icons
import { Ionicons } from '@expo/vector-icons';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Dashboard') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Pacientes') {
            iconName = focused ? 'people' : 'people-outline';
          } else if (route.name === 'Avaliações') {
            iconName = focused ? 'clipboard' : 'clipboard-outline';
          } else if (route.name === 'Chat') {
            iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
          } else if (route.name === 'Relatórios') {
            iconName = focused ? 'document-text' : 'document-text-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#2563eb',
        tabBarInactiveTintColor: '#6b7280',
        headerShown: true,
        headerStyle: {
          backgroundColor: '#2563eb',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      })}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={DashboardScreen}
        options={{ title: 'Dashboard' }}
      />
      <Tab.Screen 
        name="Pacientes" 
        component={PatientsScreen}
        options={{ title: 'Pacientes' }}
      />
      <Tab.Screen 
        name="Avaliações" 
        component={AssessmentsScreen}
        options={{ title: 'Avaliações' }}
      />
      <Tab.Screen 
        name="Chat" 
        component={ChatScreen}
        options={{ title: 'Chat Assistente' }}
      />
      <Tab.Screen 
        name="Relatórios" 
        component={ReportsScreen}
        options={{ title: 'Relatórios' }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isAuthenticated ? (
        <>
          <Stack.Screen 
            name="Login" 
            component={LoginScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="Register" 
            component={RegisterScreen}
            options={{ title: 'Cadastro' }}
          />
        </>
      ) : (
        <Stack.Screen 
          name="Main" 
          component={MainTabs}
          options={{ headerShown: false }}
        />
      )}
    </Stack.Navigator>
  );
}


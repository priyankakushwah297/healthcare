import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { Text } from 'react-native';
import { HomeScreen } from '../screens/HomeScreen';
import { PatientPortalScreen } from '../screens/PatientPortalScreen';
import { DoctorPortalScreen } from '../screens/DoctorPortalScreen';
import { ReceptionistPortalScreen } from '../screens/ReceptionistPortalScreen';
import { TechnicianPortalScreen } from '../screens/TechnicianPortalScreen';
import { AdminPortalScreen } from '../screens/AdminPortalScreen';

const Tab = createBottomTabNavigator();

export const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: '#0C2B4E'
          },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: {
            fontWeight: '800',
            fontSize: 16
          },
          tabBarStyle: {
            backgroundColor: '#FFFFFF',
            borderTopColor: '#E2E8F0',
            height: 60,
            paddingBottom: 8,
            paddingTop: 6
          },
          tabBarActiveTintColor: '#0284C7',
          tabBarInactiveTintColor: '#64748B',
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '700'
          }
        }}
      >
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{
            title: "Healthcare Center",
            tabBarLabel: "Home",
            tabBarIcon: ({ focused }) => (
              <Text style={{ fontSize: 18 }}>{focused ? '🏥' : '🏢'}</Text>
            )
          }}
        />

        <Tab.Screen
          name="Patient"
          component={PatientPortalScreen}
          options={{
            title: "Patient Portal & EHR",
            tabBarLabel: "Patient",
            tabBarIcon: ({ focused }) => (
              <Text style={{ fontSize: 18 }}>{focused ? '👤' : '👥'}</Text>
            )
          }}
        />

        <Tab.Screen
          name="Doctor"
          component={DoctorPortalScreen}
          options={{
            title: "Doctor Desk & Rx",
            tabBarLabel: "Doctor",
            tabBarIcon: ({ focused }) => (
              <Text style={{ fontSize: 18 }}>{focused ? '👨‍⚕️' : '🩺'}</Text>
            )
          }}
        />

        <Tab.Screen
          name="Reception"
          component={ReceptionistPortalScreen}
          options={{
            title: "OPD & Admissions",
            tabBarLabel: "Reception",
            tabBarIcon: ({ focused }) => (
              <Text style={{ fontSize: 18 }}>{focused ? '👩‍💼' : '🎟️'}</Text>
            )
          }}
        />

        <Tab.Screen
          name="Lab"
          component={TechnicianPortalScreen}
          options={{
            title: "Diagnostic Lab Portal",
            tabBarLabel: "Labs",
            tabBarIcon: ({ focused }) => (
              <Text style={{ fontSize: 18 }}>{focused ? '🔬' : '🧪'}</Text>
            )
          }}
        />

        <Tab.Screen
          name="Admin"
          component={AdminPortalScreen}
          options={{
            title: "Hospital Bed Telemetry",
            tabBarLabel: "Admin",
            tabBarIcon: ({ focused }) => (
              <Text style={{ fontSize: 18 }}>{focused ? '🛡️' : '📊'}</Text>
            )
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

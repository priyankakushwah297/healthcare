import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Modal,
  TextInput,
  Alert
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';

export const HomeScreen = ({ navigation }: any) => {
  const { hospitalStats, currentRole, setRole, currentUser, addAppointment } = useAuth();
  const [modalVisible, setModalVisible] = useState(false);
  const [patientName, setPatientName] = useState(currentUser?.name || 'Rahul Sharma');
  const [patientPhone, setPatientPhone] = useState(currentUser?.mobile || '+91 98765 43210');
  const [department, setDepartment] = useState('Cardiology');
  const [symptoms, setSymptoms] = useState('');
  const [visitMode, setVisitMode] = useState<'Clinic' | 'Telephone' | 'Homecare'>('Clinic');

  const handleCallEmergency = () => {
    Linking.openURL('tel:102').catch(() => {
      Alert.alert('Emergency Contact', 'Call: +91 98765 43211 / 102');
    });
  };

  const handleBook = () => {
    if (!symptoms.trim()) {
      Alert.alert('Incomplete Form', 'Please enter symptoms or consultation reason.');
      return;
    }
    addAppointment({
      patientName,
      patientPhone,
      doctorName: department === 'Cardiology' ? 'Dr. Ananya Roy, MD' : 'Dr. Vikram Seth',
      department,
      date: new Date().toISOString().split('T')[0],
      timeSlot: '10:30 AM',
      visitMode,
      symptoms,
      consultationFee: visitMode === 'Homecare' ? '₹1,200' : '₹700'
    });
    setModalVisible(false);
    setSymptoms('');
    Alert.alert('Appointment Confirmed! ✅', 'Your consultation reference has been generated and saved to your portal.');
  };

  const roles: { role: UserRole; label: string; icon: string }[] = [
    { role: 'patient', label: 'Patient', icon: '👤' },
    { role: 'doctor', label: 'Doctor', icon: '👨‍⚕️' },
    { role: 'receptionist', label: 'Reception', icon: '👩‍💼' },
    { role: 'technician', label: 'Technician', icon: '🔬' },
    { role: 'hospital_admin', label: 'Admin', icon: '🛡️' }
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Top Header Badge */}
      <View style={styles.badgeContainer}>
        <Text style={styles.badgeText}>🛡️ NABH & JCI ACCREDITED SUPER-SPECIALITY</Text>
      </View>

      {/* Hero Card */}
      <View style={styles.heroCard}>
        <Text style={styles.heroTitle}>
          Healthcare crafted with <Text style={styles.heroGradient}>precision & empathy.</Text>
        </Text>
        <Text style={styles.heroSubtitle}>
          Welcome to {hospitalStats.name}. Advanced Clinical diagnostics, 24/7 emergency support, and cloud EHR designed seamlessly around your health.
        </Text>

        {/* Action Buttons */}
        <View style={styles.actionButtonsRow}>
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => setModalVisible(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryBtnText}>📅 Book Consultation</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.emergencyBtn}
            onPress={handleCallEmergency}
            activeOpacity={0.8}
          >
            <Text style={styles.emergencyBtnText}>🚨 24/7 Emergency: 102</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Role Switcher */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Switch Role Portals (RBAC)</Text>
        <Text style={styles.sectionSubtitle}>Tap a role to experience specialized dashboards:</Text>
        <View style={styles.roleGrid}>
          {roles.map((item) => {
            const isActive = currentRole === item.role;
            return (
              <TouchableOpacity
                key={item.role}
                style={[styles.roleCard, isActive && styles.activeRoleCard]}
                onPress={() => {
                  setRole(item.role);
                  if (item.role === 'doctor') navigation.navigate('Doctor');
                  else if (item.role === 'receptionist') navigation.navigate('Reception');
                  else if (item.role === 'technician') navigation.navigate('Lab');
                  else if (item.role === 'hospital_admin') navigation.navigate('Admin');
                  else navigation.navigate('Patient');
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.roleIcon}>{item.icon}</Text>
                <Text style={[styles.roleLabel, isActive && styles.activeRoleLabel]}>
                  {item.label}
                </Text>
                {isActive && <View style={styles.activeDot} />}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Live Hospital Telemetry Stats */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Live Hospital Telemetry</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statVal}>{hospitalStats.totalBeds}+</Text>
            <Text style={styles.statLabel}>Smart Inpatient Beds</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statVal}>{hospitalStats.totalDoctors}+</Text>
            <Text style={styles.statLabel}>Senior Specialists</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statVal, { color: '#0D9488' }]}>{hospitalStats.satisfactionRate}</Text>
            <Text style={styles.statLabel}>Clinical Satisfaction</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statVal, { color: '#0284C7' }]}>{hospitalStats.icuBeds}</Text>
            <Text style={styles.statLabel}>ICU Beds Available</Text>
          </View>
        </View>
      </View>

      {/* Booking Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Book a Consultation</Text>
            <Text style={styles.modalSubtitle}>Select your visit mode and preferred department</Text>

            {/* Visit Mode Selector */}
            <View style={styles.modeRow}>
              {(['Clinic', 'Telephone', 'Homecare'] as const).map((mode) => (
                <TouchableOpacity
                  key={mode}
                  style={[styles.modeBtn, visitMode === mode && styles.activeModeBtn]}
                  onPress={() => setVisitMode(mode)}
                >
                  <Text style={[styles.modeBtnText, visitMode === mode && styles.activeModeBtnText]}>
                    {mode === 'Clinic' ? '🏥 Clinic' : mode === 'Telephone' ? '📞 Tele' : '🏠 Home'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              style={styles.input}
              placeholder="Patient Full Name"
              value={patientName}
              onChangeText={setPatientName}
            />

            <TextInput
              style={styles.input}
              placeholder="Mobile Number"
              keyboardType="phone-pad"
              value={patientPhone}
              onChangeText={setPatientPhone}
            />

            <TextInput
              style={[styles.input, { height: 75, textAlignVertical: 'top' }]}
              placeholder="Describe symptoms / Medical concern..."
              multiline
              value={symptoms}
              onChangeText={setSymptoms}
            />

            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmBtn}
                onPress={handleBook}
              >
                <Text style={styles.confirmBtnText}>Confirm Booking</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC'
  },
  content: {
    padding: 16,
    paddingBottom: 40
  },
  badgeContainer: {
    backgroundColor: '#E0F2FE',
    borderWidth: 1,
    borderColor: '#BAE6FD',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 12
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#0284C7',
    letterSpacing: 0.5
  },
  heroCard: {
    backgroundColor: '#0C2B4E',
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#0284C7',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
    lineHeight: 28,
    marginBottom: 8
  },
  heroGradient: {
    color: '#38BDF8'
  },
  heroSubtitle: {
    fontSize: 13,
    color: '#94A3B8',
    lineHeight: 18,
    marginBottom: 18
  },
  actionButtonsRow: {
    flexDirection: 'column',
    gap: 10
  },
  primaryBtn: {
    backgroundColor: '#0284C7',
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center'
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14
  },
  emergencyBtn: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: '#F87171',
    paddingVertical: 11,
    borderRadius: 14,
    alignItems: 'center'
  },
  emergencyBtnText: {
    color: '#FCA5A5',
    fontWeight: '700',
    fontSize: 13
  },
  section: {
    marginBottom: 20
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0C2B4E',
    marginBottom: 4
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 12
  },
  roleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  roleCard: {
    flex: 1,
    minWidth: '30%',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2
  },
  activeRoleCard: {
    borderColor: '#0284C7',
    backgroundColor: '#F0F9FF'
  },
  roleIcon: {
    fontSize: 24,
    marginBottom: 4
  },
  roleLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334E68'
  },
  activeRoleLabel: {
    color: '#0284C7'
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#0284C7',
    marginTop: 4
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 14
  },
  statVal: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0C2B4E',
    marginBottom: 2
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B'
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(12, 43, 78, 0.6)',
    justifyContent: 'center',
    padding: 16
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0C2B4E',
    marginBottom: 4
  },
  modalSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 16
  },
  modeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14
  },
  modeBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center'
  },
  activeModeBtn: {
    backgroundColor: '#E0F2FE',
    borderColor: '#0284C7'
  },
  modeBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B'
  },
  activeModeBtnText: {
    color: '#0284C7',
    fontWeight: '800'
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 13,
    color: '#1E293B',
    marginBottom: 10
  },
  modalBtnRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    alignItems: 'center'
  },
  cancelBtnText: {
    fontWeight: '700',
    color: '#64748B',
    fontSize: 13
  },
  confirmBtn: {
    flex: 1,
    backgroundColor: '#0284C7',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center'
  },
  confirmBtnText: {
    fontWeight: '700',
    color: '#FFFFFF',
    fontSize: 13
  }
});

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert
} from 'react-native';
import { useAuth } from '../context/AuthContext';

export const ReceptionistPortalScreen = () => {
  const { currentUser, appointments, addAppointment, hospitalStats } = useAuth();
  const [walkinName, setWalkinName] = useState('');
  const [walkinPhone, setWalkinPhone] = useState('');
  const [selectedDept, setSelectedDept] = useState('Cardiology');
  const [symptoms, setSymptoms] = useState('');

  const handleRegisterWalkin = () => {
    if (!walkinName.trim() || !walkinPhone.trim()) {
      Alert.alert('Incomplete', 'Please provide patient name and phone.');
      return;
    }
    addAppointment({
      patientName: walkinName,
      patientPhone: walkinPhone,
      doctorName: selectedDept === 'Cardiology' ? 'Dr. Ananya Roy, MD' : 'Dr. Vikram Seth',
      department: selectedDept,
      date: new Date().toISOString().split('T')[0],
      timeSlot: 'Walk-in (Immediate)',
      visitMode: 'Clinic',
      symptoms: symptoms || 'Walk-in OPD Registration',
      consultationFee: '₹500'
    });
    setWalkinName('');
    setWalkinPhone('');
    setSymptoms('');
    Alert.alert('Walk-in Token Issued ✅', 'Patient has been registered and added to the OPD queue.');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Reception Header */}
      <View style={styles.headerCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>👩‍💼</Text>
        </View>
        <View style={styles.info}>
          <Text style={styles.name}>{currentUser?.name || 'Priya Kushwah'}</Text>
          <Text style={styles.roleTitle}>Front Desk & Walk-In Admission Desk</Text>
          <Text style={styles.stats}>Live Beds: {hospitalStats.occupiedBeds}/{hospitalStats.totalBeds} Occupied</Text>
        </View>
      </View>

      {/* Walk-in Registration Form */}
      <View style={styles.formCard}>
        <Text style={styles.formTitle}>⚡ Instant OPD Walk-in Registration</Text>
        <TextInput
          style={styles.input}
          placeholder="Patient Full Name"
          value={walkinName}
          onChangeText={setWalkinName}
        />
        <TextInput
          style={styles.input}
          placeholder="Patient Phone Number"
          keyboardType="phone-pad"
          value={walkinPhone}
          onChangeText={setWalkinPhone}
        />
        <TextInput
          style={styles.input}
          placeholder="Chief Symptoms / Reason"
          value={symptoms}
          onChangeText={setSymptoms}
        />
        <TouchableOpacity
          style={styles.registerBtn}
          onPress={handleRegisterWalkin}
          activeOpacity={0.8}
        >
          <Text style={styles.registerBtnText}>🎟️ Generate OPD Token</Text>
        </TouchableOpacity>
      </View>

      {/* OPD Queue List */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Active OPD Tokens ({appointments.length})</Text>
        {appointments.map((apt, index) => (
          <View key={apt.id} style={styles.tokenCard}>
            <View style={styles.tokenNum}>
              <Text style={styles.tokenNumText}>T-{101 + index}</Text>
            </View>
            <View style={styles.tokenDetails}>
              <Text style={styles.patientName}>{apt.patientName}</Text>
              <Text style={styles.patientSub}>{apt.department} • {apt.doctorName}</Text>
              <Text style={styles.tokenTime}>Slot: {apt.timeSlot}</Text>
            </View>
            <View style={styles.statusPill}>
              <Text style={styles.statusPillText}>{apt.status.toUpperCase()}</Text>
            </View>
          </View>
        ))}
      </View>
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
  headerCard: {
    backgroundColor: '#0C2B4E',
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#0284C7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14
  },
  avatarText: {
    fontSize: 24
  },
  info: {
    flex: 1
  },
  name: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF'
  },
  roleTitle: {
    fontSize: 11,
    color: '#38BDF8',
    fontWeight: '600',
    marginTop: 2
  },
  stats: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 20
  },
  formTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0C2B4E',
    marginBottom: 12
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 13,
    color: '#1E293B',
    marginBottom: 8
  },
  registerBtn: {
    backgroundColor: '#0284C7',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 4
  },
  registerBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13
  },
  section: {
    gap: 8
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0C2B4E',
    marginBottom: 6
  },
  tokenCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 8
  },
  tokenNum: {
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    marginRight: 12
  },
  tokenNumText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#0284C7'
  },
  tokenDetails: {
    flex: 1
  },
  patientName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0C2B4E'
  },
  patientSub: {
    fontSize: 11,
    color: '#64748B'
  },
  tokenTime: {
    fontSize: 10.5,
    color: '#334E68',
    fontWeight: '600'
  },
  statusPill: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8
  },
  statusPillText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#16A34A'
  }
});

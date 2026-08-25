import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert
} from 'react-native';
import { useAuth } from '../context/AuthContext';

export const DoctorPortalScreen = () => {
  const { currentUser, appointments, addPrescription } = useAuth();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState('Rahul Sharma');
  const [diagnosis, setDiagnosis] = useState('');
  const [medName, setMedName] = useState('Paracetamol 650mg');
  const [medDosage, setMedDosage] = useState('1 Tablet');
  const [medFreq, setMedFreq] = useState('Thrice Daily (TDS)');
  const [medDuration, setMedDuration] = useState('5 Days');
  const [advice, setAdvice] = useState('Hydration, bed rest, review if fever persists.');

  const handleIssueRx = () => {
    if (!diagnosis.trim()) {
      Alert.alert('Incomplete', 'Please enter primary clinical diagnosis.');
      return;
    }

    addPrescription({
      patientName: selectedPatient,
      doctorName: currentUser?.name || 'Dr. Ananya Roy, MD',
      doctorSpecialization: currentUser?.specialization || 'Cardiology',
      date: new Date().toISOString().split('T')[0],
      diagnosis,
      symptoms: 'Fever, myalgia, fatigue',
      medicines: [
        {
          id: `M-${Date.now()}`,
          name: medName,
          dosage: medDosage,
          frequency: medFreq,
          duration: medDuration,
          instructions: 'After meals with warm water'
        }
      ],
      advice,
      nextFollowUp: 'After 1 Week'
    });

    setModalVisible(false);
    setDiagnosis('');
    Alert.alert('Prescription Issued ✅', `Digital prescription successfully generated and dispatched to ${selectedPatient}'s portal.`);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Doctor Header */}
      <View style={styles.doctorHeader}>
        <View style={styles.docAvatar}>
          <Text style={styles.docAvatarText}>👨‍⚕️</Text>
        </View>
        <View style={styles.docInfo}>
          <Text style={styles.docName}>{currentUser?.name || 'Dr. Ananya Roy, MD'}</Text>
          <Text style={styles.docSpecialty}>{currentUser?.specialization || 'Senior Cardiologist'}</Text>
          <Text style={styles.docDept}>{currentUser?.department || 'Department of Cardiology'}</Text>
        </View>
      </View>

      {/* Action Bar */}
      <View style={styles.quickActionCard}>
        <Text style={styles.quickActionTitle}>Clinical Actions</Text>
        <TouchableOpacity
          style={styles.newRxBtn}
          onPress={() => setModalVisible(true)}
          activeOpacity={0.8}
        >
          <Text style={styles.newRxBtnText}>✍️ Issue Digital Prescription (Rx)</Text>
        </TouchableOpacity>
      </View>

      {/* Patient Queue */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Today's Patient Queue ({appointments.length})</Text>
        {appointments.map((apt, index) => (
          <View key={apt.id} style={styles.queueCard}>
            <View style={styles.tokenBox}>
              <Text style={styles.tokenText}>#{index + 1}</Text>
            </View>
            <View style={styles.queueInfo}>
              <Text style={styles.patientName}>{apt.patientName}</Text>
              <Text style={styles.queueMeta}>Mode: {apt.visitMode} • Time: {apt.timeSlot}</Text>
              <Text style={styles.queueSymptoms}>Symptoms: {apt.symptoms}</Text>
            </View>
            <TouchableOpacity
              style={styles.consultBtn}
              onPress={() => {
                setSelectedPatient(apt.patientName);
                setModalVisible(true);
              }}
            >
              <Text style={styles.consultBtnText}>Rx →</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>

      {/* Issue Rx Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <ScrollView contentContainerStyle={styles.modalScroll}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>Issue Digital Prescription</Text>
              <Text style={styles.modalSubtitle}>Prescribing for: <Text style={{ fontWeight: '800', color: '#0C2B4E' }}>{selectedPatient}</Text></Text>

              <TextInput
                style={styles.input}
                placeholder="Clinical Diagnosis (e.g. Acute Bronchitis)"
                value={diagnosis}
                onChangeText={setDiagnosis}
              />

              <Text style={styles.formHeader}>Medicine 1:</Text>
              <TextInput
                style={styles.input}
                placeholder="Medicine Name & Strength"
                value={medName}
                onChangeText={setMedName}
              />

              <View style={styles.row}>
                <TextInput
                  style={[styles.input, { flex: 1, marginRight: 6 }]}
                  placeholder="Dosage (e.g. 1 Tab)"
                  value={medDosage}
                  onChangeText={setMedDosage}
                />
                <TextInput
                  style={[styles.input, { flex: 1, marginLeft: 6 }]}
                  placeholder="Duration (e.g. 5 Days)"
                  value={medDuration}
                  onChangeText={setMedDuration}
                />
              </View>

              <TextInput
                style={styles.input}
                placeholder="Frequency (e.g. BD / TDS / Once Daily)"
                value={medFreq}
                onChangeText={setMedFreq}
              />

              <TextInput
                style={[styles.input, { height: 60, textAlignVertical: 'top' }]}
                placeholder="Dietary & Lifestyle Advice..."
                multiline
                value={advice}
                onChangeText={setAdvice}
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
                  onPress={handleIssueRx}
                >
                  <Text style={styles.confirmBtnText}>Sign & Issue Rx</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
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
  doctorHeader: {
    backgroundColor: '#0C2B4E',
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16
  },
  docAvatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#0D9488',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14
  },
  docAvatarText: {
    fontSize: 26
  },
  docInfo: {
    flex: 1
  },
  docName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF'
  },
  docSpecialty: {
    fontSize: 12,
    color: '#2DD4BF',
    fontWeight: '700',
    marginTop: 2
  },
  docDept: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2
  },
  quickActionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16
  },
  quickActionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 10
  },
  newRxBtn: {
    backgroundColor: '#0D9488',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center'
  },
  newRxBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13
  },
  section: {
    gap: 10
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0C2B4E',
    marginBottom: 4
  },
  queueCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 10
  },
  tokenBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#E0F2FE',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12
  },
  tokenText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#0284C7'
  },
  queueInfo: {
    flex: 1
  },
  patientName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0C2B4E'
  },
  queueMeta: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2
  },
  queueSymptoms: {
    fontSize: 11,
    color: '#475569',
    marginTop: 2,
    fontStyle: 'italic'
  },
  consultBtn: {
    backgroundColor: '#F0F9FF',
    borderWidth: 1,
    borderColor: '#BAE6FD',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10
  },
  consultBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0284C7'
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(12, 43, 78, 0.6)',
    justifyContent: 'center'
  },
  modalScroll: {
    padding: 16,
    justifyContent: 'center'
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0C2B4E',
    marginBottom: 2
  },
  modalSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 14
  },
  formHeader: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0C2B4E',
    marginBottom: 6
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 9,
    fontSize: 13,
    color: '#1E293B',
    marginBottom: 10
  },
  row: {
    flexDirection: 'row'
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
    backgroundColor: '#0D9488',
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

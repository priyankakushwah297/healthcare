import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert
} from 'react-native';
import { useAuth } from '../context/AuthContext';

export const PatientPortalScreen = () => {
  const { currentUser, appointments, prescriptions, labReports } = useAuth();
  const [activeTab, setActiveTab] = useState<'appointments' | 'prescriptions' | 'labs'>('appointments');

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Profile Header */}
      <View style={styles.profileCard}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>👤</Text>
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>{currentUser?.name || 'Rahul Sharma'}</Text>
          <Text style={styles.profileMeta}>
            Patient ID: {currentUser?.id || 'PAT-101'} • Blood Group: {currentUser?.bloodGroup || 'O+'}
          </Text>
          <Text style={styles.profilePhone}>{currentUser?.mobile || '+91 98765 43210'}</Text>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'appointments' && styles.activeTabBtn]}
          onPress={() => setActiveTab('appointments')}
        >
          <Text style={[styles.tabBtnText, activeTab === 'appointments' && styles.activeTabBtnText]}>
            📅 Appointments ({appointments.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'prescriptions' && styles.activeTabBtn]}
          onPress={() => setActiveTab('prescriptions')}
        >
          <Text style={[styles.tabBtnText, activeTab === 'prescriptions' && styles.activeTabBtnText]}>
            💊 Prescriptions ({prescriptions.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'labs' && styles.activeTabBtn]}
          onPress={() => setActiveTab('labs')}
        >
          <Text style={[styles.tabBtnText, activeTab === 'labs' && styles.activeTabBtnText]}>
            🔬 Labs ({labReports.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab Content: Appointments */}
      {activeTab === 'appointments' && (
        <View style={styles.listSection}>
          {appointments.map((apt) => (
            <View key={apt.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardRef}>{apt.bookingRef}</Text>
                <View style={styles.badgeScheduled}>
                  <Text style={styles.badgeScheduledText}>{apt.status.toUpperCase()}</Text>
                </View>
              </View>
              <Text style={styles.cardDoctor}>{apt.doctorName}</Text>
              <Text style={styles.cardDept}>{apt.department} • Mode: {apt.visitMode}</Text>
              <Text style={styles.cardDate}>🗓️ {apt.date} at {apt.timeSlot}</Text>
              <Text style={styles.cardSymptoms}>Reason: {apt.symptoms}</Text>
              <View style={styles.cardFooter}>
                <Text style={styles.feeText}>Fee: {apt.consultationFee}</Text>
                <TouchableOpacity
                  style={styles.actionLink}
                  onPress={() => Alert.alert('Appointment Details', `Ref: ${apt.bookingRef}\nDoctor: ${apt.doctorName}\nMode: ${apt.visitMode}\nStatus: Confirmed`)}
                >
                  <Text style={styles.actionLinkText}>View Pass →</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Tab Content: Prescriptions */}
      {activeTab === 'prescriptions' && (
        <View style={styles.listSection}>
          {prescriptions.map((rx) => (
            <View key={rx.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardRef}>{rx.prescriptionNumber}</Text>
                <Text style={styles.cardDate}>{rx.date}</Text>
              </View>
              <Text style={styles.cardDoctor}>{rx.doctorName} ({rx.doctorSpecialization})</Text>
              <Text style={styles.diagnosisTitle}>Diagnosis: <Text style={styles.diagnosisText}>{rx.diagnosis}</Text></Text>

              <Text style={styles.medsHeader}>Prescribed Medications:</Text>
              {rx.medicines.map((med, idx) => (
                <View key={med.id || idx} style={styles.medItem}>
                  <Text style={styles.medName}>💊 {med.name} — {med.dosage}</Text>
                  <Text style={styles.medMeta}>{med.frequency} • {med.duration}</Text>
                  <Text style={styles.medInstructions}>{med.instructions}</Text>
                </View>
              ))}

              <View style={styles.adviceBox}>
                <Text style={styles.adviceText}>💡 Advice: {rx.advice}</Text>
                <Text style={styles.followUpText}>Follow up: {rx.nextFollowUp}</Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Tab Content: Labs */}
      {activeTab === 'labs' && (
        <View style={styles.listSection}>
          {labReports.map((lab) => (
            <View key={lab.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardRef}>{lab.reportNumber}</Text>
                <View style={[styles.badgeScheduled, { backgroundColor: '#DCFCE7', borderColor: '#86EFAC' }]}>
                  <Text style={[styles.badgeScheduledText, { color: '#16A34A' }]}>{lab.status.toUpperCase()}</Text>
                </View>
              </View>
              <Text style={styles.cardDoctor}>{lab.testName}</Text>
              <Text style={styles.cardDept}>Dept: {lab.labDepartment} • Date: {lab.testDate}</Text>
              <Text style={styles.labResults}>Results: {lab.results}</Text>
              <Text style={styles.labFindings}>Findings: {lab.findings}</Text>
              <TouchableOpacity
                style={styles.downloadBtn}
                onPress={() => Alert.alert('Download Lab Report', `Downloading signed PDF report ${lab.reportNumber}...`)}
              >
                <Text style={styles.downloadBtnText}>📥 Download PDF Report</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
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
  profileCard: {
    backgroundColor: '#0C2B4E',
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16
  },
  avatarCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#0284C7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14
  },
  avatarText: {
    fontSize: 24
  },
  profileInfo: {
    flex: 1
  },
  profileName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF'
  },
  profileMeta: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2
  },
  profilePhone: {
    fontSize: 12,
    color: '#38BDF8',
    fontWeight: '600',
    marginTop: 2
  },
  tabRow: {
    flexDirection: 'row',
    backgroundColor: '#E2E8F0',
    borderRadius: 14,
    padding: 4,
    marginBottom: 16
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center'
  },
  activeTabBtn: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2
  },
  tabBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B'
  },
  activeTabBtnText: {
    color: '#0284C7',
    fontWeight: '800'
  },
  listSection: {
    gap: 12
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 12
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  cardRef: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0284C7'
  },
  badgeScheduled: {
    backgroundColor: '#E0F2FE',
    borderWidth: 1,
    borderColor: '#BAE6FD',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8
  },
  badgeScheduledText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#0284C7'
  },
  cardDoctor: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0C2B4E'
  },
  cardDept: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2
  },
  cardDate: {
    fontSize: 12,
    color: '#334E68',
    fontWeight: '600',
    marginTop: 6
  },
  cardSymptoms: {
    fontSize: 12,
    color: '#475569',
    marginTop: 4,
    fontStyle: 'italic'
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9'
  },
  feeText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0D9488'
  },
  actionLink: {
    paddingVertical: 4,
    paddingHorizontal: 8
  },
  actionLinkText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0284C7'
  },
  diagnosisTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0C2B4E',
    marginTop: 6
  },
  diagnosisText: {
    fontWeight: '400',
    color: '#334E68'
  },
  medsHeader: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0C2B4E',
    marginTop: 10,
    marginBottom: 6
  },
  medItem: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    padding: 10,
    marginBottom: 6
  },
  medName: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0C2B4E'
  },
  medMeta: {
    fontSize: 11,
    color: '#0284C7',
    fontWeight: '600',
    marginTop: 2
  },
  medInstructions: {
    fontSize: 10.5,
    color: '#64748B',
    marginTop: 2
  },
  adviceBox: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#DCFCE7',
    borderRadius: 10,
    padding: 10,
    marginTop: 8
  },
  adviceText: {
    fontSize: 11,
    color: '#166534',
    fontWeight: '600'
  },
  followUpText: {
    fontSize: 10.5,
    color: '#15803D',
    marginTop: 2
  },
  labResults: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0D9488',
    marginTop: 6
  },
  labFindings: {
    fontSize: 11.5,
    color: '#475569',
    marginTop: 4
  },
  downloadBtn: {
    backgroundColor: '#F0F9FF',
    borderWidth: 1,
    borderColor: '#BAE6FD',
    borderRadius: 10,
    paddingVertical: 8,
    alignItems: 'center',
    marginTop: 12
  },
  downloadBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0284C7'
  }
});

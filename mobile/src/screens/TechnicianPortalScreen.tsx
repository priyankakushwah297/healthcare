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

export const TechnicianPortalScreen = () => {
  const { currentUser, labReports, addLabReport } = useAuth();
  const [modalVisible, setModalVisible] = useState(false);
  const [patientName, setPatientName] = useState('Rahul Sharma');
  const [testName, setTestName] = useState('Serum Creatinine & Kidney Function Test');
  const [department, setDepartment] = useState('Biochemistry');
  const [results, setResults] = useState('Creatinine: 0.9 mg/dL (Normal)');
  const [findings, setFindings] = useState('Normal glomerular filtration rate.');

  const handleAddReport = () => {
    if (!testName.trim() || !results.trim()) {
      Alert.alert('Incomplete', 'Please enter test name and clinical results.');
      return;
    }
    addLabReport({
      patientName,
      doctorName: 'Dr. Ananya Roy, MD',
      testName,
      testDate: new Date().toISOString().split('T')[0],
      results,
      status: 'Ready',
      labDepartment: department,
      normalRange: '0.7 - 1.2 mg/dL',
      units: 'mg/dL',
      findings,
      isAbnormal: false
    });
    setModalVisible(false);
    Alert.alert('Lab Report Published ✅', `Diagnostic report for ${patientName} uploaded to patient EHR.`);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Technician Header */}
      <View style={styles.headerCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>🔬</Text>
        </View>
        <View style={styles.info}>
          <Text style={styles.name}>{currentUser?.name || 'Amit Verma'}</Text>
          <Text style={styles.roleTitle}>Staff Technician • Pathology & Radiology</Text>
          <Text style={styles.stats}>Active Diagnostic Orders: {labReports.length}</Text>
        </View>
      </View>

      {/* Action Bar */}
      <TouchableOpacity
        style={styles.newReportBtn}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.8}
      >
        <Text style={styles.newReportBtnText}>🧪 Upload / Publish New Lab Report</Text>
      </TouchableOpacity>

      {/* Lab Reports Queue */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Lab Diagnostic Reports Queue ({labReports.length})</Text>
        {labReports.map((report) => (
          <View key={report.id} style={styles.reportCard}>
            <View style={styles.reportHeader}>
              <Text style={styles.reportRef}>{report.reportNumber}</Text>
              <Text style={styles.reportDept}>{report.labDepartment}</Text>
            </View>
            <Text style={styles.testName}>{report.testName}</Text>
            <Text style={styles.patientMeta}>Patient: {report.patientName} • Date: {report.testDate}</Text>
            <Text style={styles.resultsText}>Result: {report.results}</Text>
            <Text style={styles.findingsText}>Findings: {report.findings}</Text>
            <View style={styles.footer}>
              <Text style={styles.statusText}>Status: {report.status}</Text>
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => Alert.alert('Test Details', `Report ID: ${report.reportNumber}\nPatient: ${report.patientName}\nTest: ${report.testName}\nFindings: ${report.findings}`)}
              >
                <Text style={styles.actionBtnText}>Inspect →</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>

      {/* Upload Report Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Publish Lab Diagnostic Report</Text>
            <TextInput
              style={styles.input}
              placeholder="Patient Name"
              value={patientName}
              onChangeText={setPatientName}
            />
            <TextInput
              style={styles.input}
              placeholder="Diagnostic Test Name"
              value={testName}
              onChangeText={setTestName}
            />
            <TextInput
              style={styles.input}
              placeholder="Lab Department (e.g. Pathology / Radiology)"
              value={department}
              onChangeText={setDepartment}
            />
            <TextInput
              style={styles.input}
              placeholder="Test Numerical/Visual Results"
              value={results}
              onChangeText={setResults}
            />
            <TextInput
              style={[styles.input, { height: 60, textAlignVertical: 'top' }]}
              placeholder="Technician Diagnostic Findings..."
              multiline
              value={findings}
              onChangeText={setFindings}
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
                onPress={handleAddReport}
              >
                <Text style={styles.confirmBtnText}>Publish Report</Text>
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
    backgroundColor: '#0D9488',
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
    color: '#2DD4BF',
    fontWeight: '600',
    marginTop: 2
  },
  stats: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2
  },
  newReportBtn: {
    backgroundColor: '#0D9488',
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 16
  },
  newReportBtnText: {
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
    marginBottom: 6
  },
  reportCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 10
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4
  },
  reportRef: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0284C7'
  },
  reportDept: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0D9488'
  },
  testName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0C2B4E'
  },
  patientMeta: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2
  },
  resultsText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#16A34A',
    marginTop: 6
  },
  findingsText: {
    fontSize: 11,
    color: '#475569',
    marginTop: 2
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9'
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0D9488'
  },
  actionBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4
  },
  actionBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0284C7'
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
    padding: 20
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '900',
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

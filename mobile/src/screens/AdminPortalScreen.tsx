import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert
} from 'react-native';
import { useAuth } from '../context/AuthContext';

export const AdminPortalScreen = () => {
  const { currentUser, hospitalStats, appointments, labReports, prescriptions } = useAuth();

  const occupiedPct = Math.round((hospitalStats.occupiedBeds / hospitalStats.totalBeds) * 100);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Admin Header */}
      <View style={styles.headerCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>🛡️</Text>
        </View>
        <View style={styles.info}>
          <Text style={styles.name}>{currentUser?.name || 'Hospital Super Admin'}</Text>
          <Text style={styles.roleTitle}>Executive Director • Master Operations</Text>
          <Text style={styles.stats}>Hospital Code: {hospitalStats.code}</Text>
        </View>
      </View>

      {/* Live Inpatient Bed Telemetry */}
      <View style={styles.telemetryCard}>
        <Text style={styles.cardHeaderTitle}>🛏️ Live Inpatient Bed Telemetry (350+ Beds)</Text>
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBarFill, { width: `${occupiedPct}%` }]} />
        </View>
        <Text style={styles.progressText}>
          {hospitalStats.occupiedBeds} of {hospitalStats.totalBeds} Beds Occupied ({occupiedPct}%)
        </Text>

        <View style={styles.bedBreakdownRow}>
          <View style={styles.bedBox}>
            <Text style={styles.bedBoxVal}>{hospitalStats.totalBeds - hospitalStats.occupiedBeds}</Text>
            <Text style={styles.bedBoxLabel}>Available General</Text>
          </View>
          <View style={styles.bedBox}>
            <Text style={[styles.bedBoxVal, { color: '#0284C7' }]}>{hospitalStats.icuBeds}</Text>
            <Text style={styles.bedBoxLabel}>Smart ICU Beds</Text>
          </View>
          <View style={styles.bedBox}>
            <Text style={[styles.bedBoxVal, { color: '#0D9488' }]}>{hospitalStats.ambulances}</Text>
            <Text style={styles.bedBoxLabel}>Ambulances</Text>
          </View>
        </View>
      </View>

      {/* Hospital Metrics Grid */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Hospital Clinical Overview</Text>
        <View style={styles.metricGrid}>
          <View style={styles.metricCard}>
            <Text style={styles.metricVal}>{appointments.length}</Text>
            <Text style={styles.metricLabel}>Total Consultations</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricVal}>{prescriptions.length}</Text>
            <Text style={styles.metricLabel}>Digital Prescriptions</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={[styles.metricVal, { color: '#0D9488' }]}>{labReports.length}</Text>
            <Text style={styles.metricLabel}>Diagnostic Lab Tests</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={[styles.metricVal, { color: '#0284C7' }]}>{hospitalStats.satisfactionRate}</Text>
            <Text style={styles.metricLabel}>Patient Satisfaction</Text>
          </View>
        </View>
      </View>

      {/* Quick Admin Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>System Governance</Text>
        <TouchableOpacity
          style={styles.adminActionBtn}
          onPress={() => Alert.alert('Roster Management', 'All 45+ Specialists and 12 Staff Technicians are on active scheduled shifts.')}
        >
          <Text style={styles.adminActionText}>👥 Manage Staff Credentialing & Roster</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.adminActionBtn, { backgroundColor: '#F0FDF4', borderColor: '#BBF7D0' }]}
          onPress={() => Alert.alert('NABH Compliance Audit', 'Audit score: 99.4% • All clinical EHR records encrypted and backed up.')}
        >
          <Text style={[styles.adminActionText, { color: '#166534' }]}>✅ NABH & JCI Compliance Report</Text>
        </TouchableOpacity>
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
  telemetryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16
  },
  cardHeaderTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0C2B4E',
    marginBottom: 10
  },
  progressBarContainer: {
    height: 10,
    backgroundColor: '#E2E8F0',
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 6
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#0284C7',
    borderRadius: 5
  },
  progressText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 12
  },
  bedBreakdownRow: {
    flexDirection: 'row',
    gap: 8
  },
  bedBox: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 10,
    alignItems: 'center'
  },
  bedBoxVal: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0C2B4E'
  },
  bedBoxLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 2,
    textAlign: 'center'
  },
  section: {
    marginBottom: 16
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0C2B4E',
    marginBottom: 8
  },
  metricGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10
  },
  metricCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  metricVal: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0C2B4E',
    marginBottom: 2
  },
  metricLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600'
  },
  adminActionBtn: {
    backgroundColor: '#F0F9FF',
    borderWidth: 1,
    borderColor: '#BAE6FD',
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 10
  },
  adminActionText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0284C7'
  }
});

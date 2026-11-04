import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { dashboardService } from '../services/services';
import { useAuth } from '../context/AuthContext';
import type { DashboardData } from '../types';

export default function DashboardScreen({ navigation }: any) {
  const { admin, logout } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboard = useCallback(async () => {
    try {
      const res = await dashboardService.get();
      setData(res.data);
    } catch (err) {
      console.error('Failed to load dashboard', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboard();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }

  const stats = data?.stats;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6366f1" />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome back,</Text>
          <Text style={styles.adminName}>{admin?.username || 'Admin'}</Text>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Quick Action Buttons */}
      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={[styles.actionBtn, styles.primaryAction]}
          onPress={() => navigation.navigate('CustomerForm', { mode: 'create' })}
        >
          <Text style={styles.actionBtnIcon}>➕</Text>
          <Text style={styles.primaryActionText}>Add Customer</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, styles.secondaryAction]}
          onPress={() => navigation.navigate('CustomerList')}
        >
          <Text style={styles.actionBtnIcon}>👥</Text>
          <Text style={styles.secondaryActionText}>All Customers</Text>
        </TouchableOpacity>
      </View>

      {/* Overview Cards */}
      <Text style={styles.sectionTitle}>System Overview</Text>

      <View style={styles.grid}>
        <View style={styles.card}>
          <Text style={styles.cardLabel}>TOTAL CUSTOMERS</Text>
          <Text style={styles.cardValue}>{stats?.totalCustomers ?? 0}</Text>
          <Text style={styles.cardSub}>Registered accounts</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>TOTAL COIN</Text>
          <Text style={[styles.cardValue, { color: '#818cf8' }]}>
            {(stats?.totalCoin ?? 0).toLocaleString()}
          </Text>
          <Text style={styles.cardSub}>Rem + With + Fee</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>BALANCE COIN</Text>
          <Text style={[styles.cardValue, { color: '#38bdf8' }]}>
            {(stats?.totalBalanceCoin ?? 0).toLocaleString()}
          </Text>
          <Text style={styles.cardSub}>Starting Balance</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>WITHDRAW COIN</Text>
          <Text style={[styles.cardValue, { color: '#fb923c' }]}>
            {(stats?.totalWithdrawCoin ?? 0).toLocaleString()}
          </Text>
          <Text style={styles.cardSub}>Total withdrawn</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>WITHDRAW FEE (5%)</Text>
          <Text style={[styles.cardValue, { color: '#f43f5e' }]}>
            {(stats?.totalWithdrawFee ?? 0).toLocaleString()}
          </Text>
          <Text style={styles.cardSub}>5% on withdrawals</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>REMAINING COIN</Text>
          <Text style={[styles.cardValue, { color: '#34d399' }]}>
            {(stats?.totalRemainingCoin ?? 0).toLocaleString()}
          </Text>
          <Text style={styles.cardSub}>Bal - With</Text>
        </View>
      </View>

      {/* Recent Customers */}
      {data?.recentCustomers && data.recentCustomers.length > 0 && (
        <View style={styles.recentSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Customers</Text>
            <TouchableOpacity onPress={() => navigation.navigate('CustomerList')}>
              <Text style={styles.viewAllText}>View All →</Text>
            </TouchableOpacity>
          </View>

          {data.recentCustomers.map((cust) => (
            <TouchableOpacity
              key={cust.id}
              style={styles.recentItem}
              onPress={() => navigation.navigate('CustomerDetail', { customerId: cust.id })}
            >
              <View>
                <Text style={styles.recentIdName}>{cust.idName}</Text>
                <Text style={styles.recentMail}>{cust.mailId || 'No email'}</Text>
              </View>
              <View style={styles.recentRight}>
                <Text style={styles.recentCoin}>
                  {(cust.totalCoin ?? 0).toLocaleString()} Coins
                </Text>
                <Text style={styles.arrowIcon}>›</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#090d16',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#090d16',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#94a3b8',
    marginTop: 12,
    fontSize: 14,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingTop: 8,
  },
  greeting: {
    fontSize: 13,
    color: '#94a3b8',
  },
  adminName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#f8fafc',
  },
  logoutBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#334155',
  },
  logoutText: {
    color: '#ef4444',
    fontSize: 13,
    fontWeight: '600',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  primaryAction: {
    backgroundColor: '#6366f1',
  },
  secondaryAction: {
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#334155',
  },
  actionBtnIcon: {
    fontSize: 16,
  },
  primaryActionText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  secondaryActionText: {
    color: '#f8fafc',
    fontSize: 15,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#f8fafc',
    marginBottom: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  card: {
    width: '48%',
    backgroundColor: '#0f172a',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  cardLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748b',
    letterSpacing: 0.5,
  },
  cardValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#f8fafc',
    marginVertical: 4,
  },
  cardSub: {
    fontSize: 11,
    color: '#94a3b8',
  },
  recentSection: {
    marginTop: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  viewAllText: {
    color: '#818cf8',
    fontSize: 13,
    fontWeight: '600',
  },
  recentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#0f172a',
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  recentIdName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#f8fafc',
  },
  recentMail: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  recentRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  recentCoin: {
    fontSize: 14,
    fontWeight: '700',
    color: '#818cf8',
  },
  arrowIcon: {
    color: '#64748b',
    fontSize: 18,
  },
});

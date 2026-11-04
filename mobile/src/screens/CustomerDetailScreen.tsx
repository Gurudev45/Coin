import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { customerService } from '../services/services';
import type { Customer } from '../types';

export default function CustomerDetailScreen({ route, navigation }: any) {
  const { customerId } = route.params;
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);

  // Reset password state
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    loadCustomer();
  }, [customerId]);

  const loadCustomer = async () => {
    try {
      const res = await customerService.getById(customerId);
      setCustomer(res.data);
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to load details');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    if (!customer) return;
    Alert.alert(
      'Delete Customer',
      `Are you sure you want to delete ${customer.idName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await customerService.delete(customer.id);
              Alert.alert('Deleted', `Customer ${customer.idName} was removed`, [
                { text: 'OK', onPress: () => navigation.goBack() },
              ]);
            } catch (err: any) {
              Alert.alert('Error', err.response?.data?.message || 'Delete failed');
            }
          },
        },
      ]
    );
  };

  const handleResetPassword = async () => {
    if (!newPassword.trim()) {
      Alert.alert('Required', 'Please enter a new password.');
      return;
    }

    setResetting(true);
    try {
      await customerService.resetPassword(customerId, newPassword);
      Alert.alert('Success', 'Customer password has been updated!');
      setResetModalOpen(false);
      setNewPassword('');
      loadCustomer();
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to reset password');
    } finally {
      setResetting(false);
    }
  };

  if (loading || !customer) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Top Identity Card */}
      <View style={styles.headerCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{customer.idName.slice(0, 2).toUpperCase()}</Text>
        </View>
        <Text style={styles.idNameTitle}>{customer.idName}</Text>
        <Text style={styles.mailSubtitle}>{customer.mailId || 'No email provided'}</Text>

        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.editBtn}
            onPress={() =>
              navigation.navigate('CustomerForm', { mode: 'edit', customerId: customer.id })
            }
          >
            <Text style={styles.editBtnText}>✏ Edit</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.pwdResetBtn}
            onPress={() => setResetModalOpen(true)}
          >
            <Text style={styles.pwdResetText}>🔑 Reset Pwd</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
            <Text style={styles.deleteBtnText}>🗑 Delete</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Basic Info Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Basic Information</Text>

        <View style={styles.row}>
          <Text style={styles.label}>ID Name:</Text>
          <Text style={styles.valHighlight}>{customer.idName}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Date:</Text>
          <Text style={styles.val}>{customer.date ? customer.date.split('T')[0] : '—'}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Mail ID:</Text>
          <Text style={styles.val}>{customer.mailId || '—'}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>M.Date:</Text>
          <Text style={styles.val}>{customer.mDate ? customer.mDate.split('T')[0] : '—'}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Password Status:</Text>
          <Text style={[styles.val, { color: '#818cf8', fontWeight: '700' }]}>
            {customer.passwordStatus}
          </Text>
        </View>
      </View>

      {/* Dropdown Values Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Selected Configurations</Text>

        <View style={styles.grid2}>
          <View style={styles.configBox}>
            <Text style={styles.configLabel}>Fixed Dropdown</Text>
            <Text style={styles.configVal}>{customer.fixedValue ?? 'None'}</Text>
          </View>

          <View style={styles.configBox}>
            <Text style={styles.configLabel}>Regular Dropdown</Text>
            <Text style={styles.configVal}>{customer.regularValue ?? 'None'}</Text>
          </View>

          <View style={styles.configBox}>
            <Text style={styles.configLabel}>Combo Dropdown</Text>
            <Text style={styles.configVal}>{customer.comboValue ?? 'None'}</Text>
          </View>

          <View style={styles.configBox}>
            <Text style={styles.configLabel}>ARP</Text>
            <Text style={styles.configVal}>{customer.arp ?? 'None'}</Text>
          </View>
        </View>
      </View>

      {/* Coin Calculation Breakdown */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Coin Balance & Calculations</Text>

        <View style={styles.coinCard}>
          <View style={styles.coinLine}>
            <Text style={styles.coinLineLabel}>Balance Coin</Text>
            <Text style={styles.coinLineVal}>{customer.balanceCoin.toLocaleString()}</Text>
          </View>

          <View style={styles.coinLine}>
            <Text style={styles.coinLineLabel}>Withdraw Coin</Text>
            <Text style={[styles.coinLineVal, { color: '#fb923c' }]}>
              {customer.withdrawCoin.toLocaleString()}
            </Text>
          </View>

          <View style={styles.coinLine}>
            <Text style={styles.coinLineLabel}>Withdraw Fee (5%)</Text>
            <Text style={[styles.coinLineVal, { color: '#f43f5e' }]}>
              {customer.withdrawFee.toLocaleString()}
            </Text>
          </View>

          <View style={styles.coinLine}>
            <Text style={styles.coinLineLabel}>Remaining Coin (Bal - With)</Text>
            <Text style={[styles.coinLineVal, { color: '#34d399' }]}>
              {customer.remainingCoin.toLocaleString()}
            </Text>
          </View>

          <View style={[styles.coinLine, styles.grandTotalLine]}>
            <Text style={styles.grandTotalLabel}>TOTAL COIN</Text>
            <Text style={styles.grandTotalVal}>{customer.totalCoin.toLocaleString()}</Text>
          </View>
        </View>
      </View>

      {/* Reset Password Modal */}
      <Modal
        visible={resetModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setResetModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Reset Password</Text>
            <Text style={styles.modalSubtitle}>
              Enter new password for customer {customer.idName}
            </Text>

            <TextInput
              style={styles.modalInput}
              placeholder="New password"
              placeholderTextColor="#64748b"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
            />

            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => {
                  setResetModalOpen(false);
                  setNewPassword('');
                }}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.confirmBtn, resetting && styles.confirmBtnDisabled]}
                onPress={handleResetPassword}
                disabled={resetting}
              >
                {resetting ? (
                  <ActivityIndicator color="#ffffff" size="small" />
                ) : (
                  <Text style={styles.confirmBtnText}>Save Password</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  headerCard: {
    backgroundColor: '#0f172a',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#1e1b4b',
    borderWidth: 2,
    borderColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#818cf8',
  },
  idNameTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#f8fafc',
  },
  mailSubtitle: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 4,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 18,
    width: '100%',
  },
  editBtn: {
    flex: 1,
    backgroundColor: '#1e1b4b',
    borderWidth: 1,
    borderColor: '#6366f1',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  editBtnText: {
    color: '#818cf8',
    fontWeight: '700',
    fontSize: 13,
  },
  pwdResetBtn: {
    flex: 1,
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#334155',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  pwdResetText: {
    color: '#f8fafc',
    fontWeight: '600',
    fontSize: 13,
  },
  deleteBtn: {
    flex: 1,
    backgroundColor: '#450a0a',
    borderWidth: 1,
    borderColor: '#7f1d1d',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  deleteBtnText: {
    color: '#f87171',
    fontWeight: '700',
    fontSize: 13,
  },
  section: {
    backgroundColor: '#0f172a',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#f8fafc',
    marginBottom: 14,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#1e293b',
  },
  label: {
    fontSize: 13,
    color: '#94a3b8',
  },
  val: {
    fontSize: 14,
    color: '#f8fafc',
    fontWeight: '500',
  },
  valHighlight: {
    fontSize: 14,
    color: '#818cf8',
    fontWeight: '700',
  },
  grid2: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  configBox: {
    width: '48%',
    backgroundColor: '#1e293b',
    padding: 12,
    borderRadius: 10,
  },
  configLabel: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '600',
  },
  configVal: {
    fontSize: 16,
    color: '#f8fafc',
    fontWeight: '700',
    marginTop: 4,
  },
  coinCard: {
    backgroundColor: '#090d16',
    borderRadius: 12,
    padding: 14,
  },
  coinLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  coinLineLabel: {
    fontSize: 13,
    color: '#94a3b8',
  },
  coinLineVal: {
    fontSize: 14,
    color: '#f8fafc',
    fontWeight: '700',
  },
  grandTotalLine: {
    marginTop: 8,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
  },
  grandTotalLabel: {
    fontSize: 15,
    fontWeight: '800',
    color: '#f8fafc',
  },
  grandTotalVal: {
    fontSize: 20,
    fontWeight: '800',
    color: '#818cf8',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    padding: 24,
  },
  modalBox: {
    backgroundColor: '#0f172a',
    borderRadius: 18,
    padding: 22,
    borderWidth: 1,
    borderColor: '#334155',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#f8fafc',
    marginBottom: 6,
  },
  modalSubtitle: {
    fontSize: 13,
    color: '#94a3b8',
    marginBottom: 16,
  },
  modalInput: {
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 10,
    color: '#f8fafc',
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    marginBottom: 18,
  },
  modalBtnRow: {
    flexDirection: 'row',
    gap: 10,
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: '#1e293b',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelBtnText: {
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: '600',
  },
  confirmBtn: {
    flex: 1,
    backgroundColor: '#6366f1',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  confirmBtnDisabled: {
    opacity: 0.6,
  },
  confirmBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
});

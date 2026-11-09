import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { customerService } from '../services/services';
import DropdownPicker from '../components/DropdownPicker';
import { FIXED_OPTIONS, REGULAR_OPTIONS, COMBO_OPTIONS } from '../types';

export default function CustomerFormScreen({ route, navigation }: any) {
  const mode = route.params?.mode || 'create';
  const customerId = route.params?.customerId;

  const [idName, setIdName] = useState('');
  const [date, setDate] = useState('');
  const [mailId, setMailId] = useState('');
  const [mDate, setMDate] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [fixedValue, setFixedValue] = useState<number | null>(null);
  const [regularValue, setRegularValue] = useState<number | null>(null);
  const [comboValue, setComboValue] = useState<number | null>(null);
  const [arp, setArp] = useState('');

  const [balanceCoin, setBalanceCoin] = useState('0');
  const [withdrawCoin, setWithdrawCoin] = useState('0');

  const [loading, setLoading] = useState(mode === 'edit');
  const [saving, setSaving] = useState(false);

  // Live Auto-Calculations
  const balNum = parseFloat(balanceCoin) || 0;
  const withNum = parseFloat(withdrawCoin) || 0;
  const withdrawFee = Math.round(withNum * 0.05 * 100) / 100;
  const remainingCoin = Math.round((balNum - withNum) * 100) / 100;
  const totalCoin = remainingCoin;

  useEffect(() => {
    if (mode === 'edit' && customerId) {
      loadCustomer();
    }
  }, [mode, customerId]);

  const loadCustomer = async () => {
    try {
      const res = await customerService.getById(customerId);
      const c = res.data;
      setIdName(c.idName || '');
      setDate(c.date ? c.date.split('T')[0] : '');
      setMailId(c.mailId || '');
      setMDate(c.mDate ? c.mDate.split('T')[0] : '');
      setFixedValue(c.fixedValue);
      setRegularValue(c.regularValue);
      setComboValue(c.comboValue);
      setArp(c.arp !== null && c.arp !== undefined ? String(c.arp) : '');
      setBalanceCoin(String(c.balanceCoin || 0));
      setWithdrawCoin(String(c.withdrawCoin || 0));
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to load customer');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!idName.trim()) {
      Alert.alert('Required Field', 'ID Name is required.');
      return;
    }

    if (mode === 'create' && !password.trim()) {
      Alert.alert('Required Field', 'Password is required when creating a new customer.');
      return;
    }

    setSaving(true);
    try {
      const payload: any = {
        id_name: idName.trim().toUpperCase(),
        date: date.trim() || undefined,
        mail_id: mailId.trim() || undefined,
        m_date: mDate.trim() || undefined,
        fixed_value: fixedValue,
        regular_value: regularValue,
        combo_value: comboValue,
        arp: arp.trim() ? parseFloat(arp) : null,
        balance_coin: balNum,
        withdraw_coin: withNum,
      };

      if (password.trim()) {
        payload.password = password;
      }

      if (mode === 'create') {
        await customerService.create(payload);
        Alert.alert('Success', `Customer ${payload.id_name} created successfully!`, [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      } else {
        await customerService.update(customerId, payload);
        Alert.alert('Success', `Customer ${payload.id_name} updated successfully!`, [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to save customer';
      Alert.alert('Save Failed', msg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
        <Text style={styles.loadingText}>Loading details...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.content}>
        {/* Section 1: Basic Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              ID Name <Text style={styles.required}>* (Unique Identifier)</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. GURU001"
              placeholderTextColor="#64748b"
              value={idName}
              onChangeText={setIdName}
              autoCapitalize="characters"
              editable={mode === 'create'}
            />
            {mode === 'edit' && (
              <Text style={styles.hint}>ID Name cannot be changed after creation</Text>
            )}
          </View>

          <View style={styles.inputRow}>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>Date (YYYY-MM-DD)</Text>
              <TextInput
                style={styles.input}
                placeholder="2026-10-23"
                placeholderTextColor="#64748b"
                value={date}
                onChangeText={setDate}
              />
            </View>

            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>M.Date (YYYY-MM-DD)</Text>
              <TextInput
                style={styles.input}
                placeholder="2026-11-23"
                placeholderTextColor="#64748b"
                value={mDate}
                onChangeText={setMDate}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Mail ID</Text>
            <TextInput
              style={styles.input}
              placeholder="user@example.com"
              placeholderTextColor="#64748b"
              value={mailId}
              onChangeText={setMailId}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Password {mode === 'create' ? <Text style={styles.required}>*</Text> : '(Leave blank to keep current)'}
            </Text>
            <View style={styles.passwordRow}>
              <TextInput
                style={styles.passwordInput}
                placeholder={mode === 'create' ? 'Enter password' : '••••••••'}
                placeholderTextColor="#64748b"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity
                style={styles.eyeBtn}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Text style={styles.eyeBtnText}>{showPassword ? 'Hide' : 'Show'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Section 2: Dropdowns */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Configuration Dropdowns</Text>

          <DropdownPicker
            label="Fixed"
            placeholder="Select Fixed"
            value={fixedValue}
            options={FIXED_OPTIONS}
            onSelect={setFixedValue}
          />

          <DropdownPicker
            label="Regular"
            placeholder="Select Regular"
            value={regularValue}
            options={REGULAR_OPTIONS}
            onSelect={setRegularValue}
          />

          <DropdownPicker
            label="Combo"
            placeholder="Select Combo"
            value={comboValue}
            options={COMBO_OPTIONS}
            onSelect={setComboValue}
          />

          <View style={styles.inputGroup}>
            <Text style={styles.label}>ARP</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 1.25"
              placeholderTextColor="#64748b"
              value={arp}
              onChangeText={setArp}
              keyboardType="numeric"
            />
          </View>
        </View>

        {/* Section 3: Coin Calculations */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Coin Calculations</Text>

          <View style={styles.inputRow}>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>Balance Coin</Text>
              <TextInput
                style={styles.input}
                placeholder="0"
                placeholderTextColor="#64748b"
                value={balanceCoin}
                onChangeText={setBalanceCoin}
                keyboardType="numeric"
              />
            </View>

            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>Withdraw Coin</Text>
              <TextInput
                style={styles.input}
                placeholder="0"
                placeholderTextColor="#64748b"
                value={withdrawCoin}
                onChangeText={setWithdrawCoin}
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* Auto Calculated Live Display */}
          <View style={styles.calcSummaryBox}>
            <Text style={styles.calcSummaryTitle}>Auto-Calculated Summary</Text>

            <View style={styles.calcRow}>
              <Text style={styles.calcLabel}>Withdraw Fee (5%):</Text>
              <Text style={[styles.calcVal, { color: '#f43f5e' }]}>
                {withdrawFee.toLocaleString()}
              </Text>
            </View>

            <View style={styles.calcRow}>
              <Text style={styles.calcLabel}>Remaining Coin (Bal - With):</Text>
              <Text style={[styles.calcVal, { color: '#34d399' }]}>
                {remainingCoin.toLocaleString()}
              </Text>
            </View>

            <View style={[styles.calcRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total Coin:</Text>
              <Text style={styles.totalVal}>{totalCoin.toLocaleString()}</Text>
            </View>
          </View>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={handleSubmit}
          disabled={saving}
          activeOpacity={0.8}
        >
          {saving ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.saveButtonText}>
              {mode === 'create' ? 'Create Customer' : 'Save Changes'}
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#090d16',
  },
  content: {
    padding: 16,
    paddingBottom: 50,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#090d16',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#94a3b8',
    marginTop: 10,
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
    fontSize: 16,
    fontWeight: '700',
    color: '#f8fafc',
    marginBottom: 14,
  },
  inputGroup: {
    marginBottom: 14,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#94a3b8',
    marginBottom: 6,
  },
  required: {
    color: '#ef4444',
  },
  hint: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 4,
  },
  input: {
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 10,
    color: '#f8fafc',
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 10,
  },
  passwordInput: {
    flex: 1,
    color: '#f8fafc',
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  eyeBtn: {
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  eyeBtnText: {
    color: '#818cf8',
    fontSize: 13,
    fontWeight: '600',
  },
  calcSummaryBox: {
    backgroundColor: '#090d16',
    borderRadius: 12,
    padding: 14,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  calcSummaryTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#818cf8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  calcRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  calcLabel: {
    fontSize: 13,
    color: '#94a3b8',
  },
  calcVal: {
    fontSize: 14,
    fontWeight: '700',
  },
  totalRow: {
    marginTop: 6,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#f8fafc',
  },
  totalVal: {
    fontSize: 18,
    fontWeight: '800',
    color: '#818cf8',
  },
  saveButton: {
    backgroundColor: '#6366f1',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
});

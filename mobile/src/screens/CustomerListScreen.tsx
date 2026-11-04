import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { customerService } from '../services/services';
import type { Customer, Pagination } from '../types';
import { FIXED_OPTIONS, REGULAR_OPTIONS, COMBO_OPTIONS } from '../types';
import DropdownPicker from '../components/DropdownPicker';

export default function CustomerListScreen({ navigation }: any) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });
  const [search, setSearch] = useState('');
  const [filterFixed, setFilterFixed] = useState<number | null>(null);
  const [filterRegular, setFilterRegular] = useState<number | null>(null);
  const [filterCombo, setFilterCombo] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const fetchCustomers = useCallback(
    async (page = 1) => {
      try {
        const params: Record<string, any> = { page, limit: 10 };
        if (search.trim()) params.search = search.trim();
        if (filterFixed !== null) params.fixedValue = filterFixed;
        if (filterRegular !== null) params.regularValue = filterRegular;
        if (filterCombo !== null) params.comboValue = filterCombo;

        const res = await customerService.getAll(params);
        setCustomers(res.data.customers);
        setPagination(res.data.pagination);
      } catch (err) {
        console.error('Failed to fetch customers', err);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [search, filterFixed, filterRegular, filterCombo]
  );

  useEffect(() => {
    fetchCustomers(1);
  }, [fetchCustomers]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchCustomers(1);
  };

  const handleDelete = (customer: Customer) => {
    Alert.alert(
      'Delete Customer',
      `Are you sure you want to delete ${customer.idName}? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await customerService.delete(customer.id);
              Alert.alert('Deleted', `Customer ${customer.idName} removed`);
              fetchCustomers(pagination.page);
            } catch (err: any) {
              Alert.alert('Error', err.response?.data?.message || 'Failed to delete');
            }
          },
        },
      ]
    );
  };

  const renderCustomerItem = ({ item }: { item: Customer }) => {
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.idNameText}>{item.idName}</Text>
            <Text style={styles.mailText}>{item.mailId || 'No email registered'}</Text>
          </View>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>
              Pwd: {item.passwordStatus}
            </Text>
          </View>
        </View>

        {/* Dropdown Values Row */}
        <View style={styles.dropdownBadges}>
          <View style={styles.badge}>
            <Text style={styles.badgeLabel}>Fixed: </Text>
            <Text style={styles.badgeValue}>{item.fixedValue ?? '—'}</Text>
          </View>
          <View style={styles.badge}>
            <Text style={styles.badgeLabel}>Regular: </Text>
            <Text style={styles.badgeValue}>{item.regularValue ?? '—'}</Text>
          </View>
          <View style={styles.badge}>
            <Text style={styles.badgeLabel}>Combo: </Text>
            <Text style={styles.badgeValue}>{item.comboValue ?? '—'}</Text>
          </View>
          {item.arp !== null && (
            <View style={styles.badge}>
              <Text style={styles.badgeLabel}>ARP: </Text>
              <Text style={styles.badgeValue}>{item.arp}</Text>
            </View>
          )}
        </View>

        {/* Coin Calculation Summary */}
        <View style={styles.coinGrid}>
          <View style={styles.coinCol}>
            <Text style={styles.coinColLabel}>Balance</Text>
            <Text style={styles.coinColVal}>{item.balanceCoin.toLocaleString()}</Text>
          </View>
          <View style={styles.coinCol}>
            <Text style={styles.coinColLabel}>Withdraw</Text>
            <Text style={[styles.coinColVal, { color: '#fb923c' }]}>
              {item.withdrawCoin.toLocaleString()}
            </Text>
          </View>
          <View style={styles.coinCol}>
            <Text style={styles.coinColLabel}>Fee (5%)</Text>
            <Text style={[styles.coinColVal, { color: '#f43f5e' }]}>
              {item.withdrawFee.toLocaleString()}
            </Text>
          </View>
          <View style={styles.coinCol}>
            <Text style={styles.coinColLabel}>Remaining</Text>
            <Text style={[styles.coinColVal, { color: '#34d399' }]}>
              {item.remainingCoin.toLocaleString()}
            </Text>
          </View>
          <View style={styles.coinCol}>
            <Text style={styles.coinColLabel}>Total Coin</Text>
            <Text style={[styles.coinColVal, { color: '#818cf8', fontWeight: '800' }]}>
              {item.totalCoin.toLocaleString()}
            </Text>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('CustomerDetail', { customerId: item.id })}
          >
            <Text style={styles.actionBtnText}>View</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.editBtn]}
            onPress={() =>
              navigation.navigate('CustomerForm', { mode: 'edit', customerId: item.id })
            }
          >
            <Text style={[styles.actionBtnText, styles.editBtnText]}>Edit</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.deleteBtn]}
            onPress={() => handleDelete(item)}
          >
            <Text style={[styles.actionBtnText, styles.deleteBtnText]}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Search & Filter Header */}
      <View style={styles.searchSection}>
        <View style={styles.searchRow}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search by ID Name or Mail..."
            placeholderTextColor="#64748b"
            value={search}
            onChangeText={setSearch}
            onSubmitEditing={() => fetchCustomers(1)}
          />
          <TouchableOpacity
            style={[styles.filterToggle, showFilters && styles.filterToggleActive]}
            onPress={() => setShowFilters(!showFilters)}
          >
            <Text style={styles.filterToggleText}>⚙ Filters</Text>
          </TouchableOpacity>
        </View>

        {/* Collapsible Dropdown Filters */}
        {showFilters && (
          <View style={styles.filterBox}>
            <DropdownPicker
              label="Fixed Filter"
              placeholder="All Fixed"
              value={filterFixed}
              options={FIXED_OPTIONS}
              onSelect={setFilterFixed}
            />
            <DropdownPicker
              label="Regular Filter"
              placeholder="All Regular"
              value={filterRegular}
              options={REGULAR_OPTIONS}
              onSelect={setFilterRegular}
            />
            <DropdownPicker
              label="Combo Filter"
              placeholder="All Combo"
              value={filterCombo}
              options={COMBO_OPTIONS}
              onSelect={setFilterCombo}
            />

            {(filterFixed !== null || filterRegular !== null || filterCombo !== null) && (
              <TouchableOpacity
                style={styles.clearFiltersBtn}
                onPress={() => {
                  setFilterFixed(null);
                  setFilterRegular(null);
                  setFilterCombo(null);
                }}
              >
                <Text style={styles.clearFiltersText}>Reset Filters</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      {/* Customer List */}
      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color="#6366f1" />
        </View>
      ) : (
        <FlatList
          data={customers}
          keyExtractor={(item) => item.id}
          renderItem={renderCustomerItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6366f1" />
          }
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Text style={styles.emptyIcon}>👤</Text>
              <Text style={styles.emptyText}>No customers found</Text>
              <Text style={styles.emptySub}>
                Try adjusting your search criteria or add a new customer
              </Text>
            </View>
          }
          ListFooterComponent={
            pagination.totalPages > 1 ? (
              <View style={styles.paginationRow}>
                <TouchableOpacity
                  style={[styles.pageBtn, pagination.page <= 1 && styles.pageBtnDisabled]}
                  disabled={pagination.page <= 1}
                  onPress={() => fetchCustomers(pagination.page - 1)}
                >
                  <Text style={styles.pageBtnText}>◀ Prev</Text>
                </TouchableOpacity>

                <Text style={styles.pageInfo}>
                  Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
                </Text>

                <TouchableOpacity
                  style={[
                    styles.pageBtn,
                    pagination.page >= pagination.totalPages && styles.pageBtnDisabled,
                  ]}
                  disabled={pagination.page >= pagination.totalPages}
                  onPress={() => fetchCustomers(pagination.page + 1)}
                >
                  <Text style={styles.pageBtnText}>Next ▶</Text>
                </TouchableOpacity>
              </View>
            ) : undefined
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#090d16',
  },
  searchSection: {
    padding: 14,
    backgroundColor: '#0f172a',
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  searchRow: {
    flexDirection: 'row',
    gap: 8,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: '#f8fafc',
    fontSize: 14,
  },
  filterToggle: {
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 10,
    paddingHorizontal: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterToggleActive: {
    backgroundColor: '#312e81',
    borderColor: '#6366f1',
  },
  filterToggleText: {
    color: '#cbd5e1',
    fontSize: 13,
    fontWeight: '600',
  },
  filterBox: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
  },
  clearFiltersBtn: {
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  clearFiltersText: {
    color: '#ef4444',
    fontSize: 13,
    fontWeight: '600',
  },
  listContent: {
    padding: 14,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#0f172a',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  idNameText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#f8fafc',
  },
  mailText: {
    fontSize: 13,
    color: '#94a3b8',
    marginTop: 2,
  },
  statusBadge: {
    backgroundColor: '#1e293b',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 11,
    color: '#818cf8',
    fontWeight: '600',
  },
  dropdownBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  badge: {
    flexDirection: 'row',
    backgroundColor: '#1e293b',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeLabel: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '600',
  },
  badgeValue: {
    fontSize: 11,
    color: '#f8fafc',
    fontWeight: '700',
  },
  coinGrid: {
    flexDirection: 'row',
    backgroundColor: '#090d16',
    borderRadius: 10,
    padding: 10,
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  coinCol: {
    alignItems: 'center',
  },
  coinColLabel: {
    fontSize: 10,
    color: '#64748b',
    marginBottom: 2,
  },
  coinColVal: {
    fontSize: 12,
    fontWeight: '700',
    color: '#f8fafc',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#1e293b',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  actionBtnText: {
    color: '#f8fafc',
    fontSize: 13,
    fontWeight: '600',
  },
  editBtn: {
    borderColor: '#6366f1',
    backgroundColor: '#1e1b4b',
  },
  editBtnText: {
    color: '#818cf8',
  },
  deleteBtn: {
    borderColor: '#7f1d1d',
    backgroundColor: '#450a0a',
  },
  deleteBtnText: {
    color: '#f87171',
  },
  loadingBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyBox: {
    alignItems: 'center',
    marginTop: 60,
    paddingHorizontal: 30,
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#f8fafc',
    marginBottom: 6,
  },
  emptySub: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
  },
  paginationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    paddingHorizontal: 8,
  },
  pageBtn: {
    backgroundColor: '#1e293b',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  pageBtnDisabled: {
    opacity: 0.4,
  },
  pageBtnText: {
    color: '#f8fafc',
    fontSize: 13,
    fontWeight: '600',
  },
  pageInfo: {
    color: '#94a3b8',
    fontSize: 12,
  },
});

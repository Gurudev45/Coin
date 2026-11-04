import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
  SafeAreaView,
} from 'react-native';

interface DropdownPickerProps<T extends number | string> {
  label: string;
  placeholder: string;
  value: T | null | undefined;
  options: readonly T[];
  onSelect: (value: T | null) => void;
  required?: boolean;
}

export default function DropdownPicker<T extends number | string>({
  label,
  placeholder,
  value,
  options,
  onSelect,
  required = false,
}: DropdownPickerProps<T>) {
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        {label} {required && <Text style={styles.required}>*</Text>}
      </Text>
      <TouchableOpacity
        style={styles.button}
        activeOpacity={0.8}
        onPress={() => setModalVisible(true)}
      >
        <Text style={value !== null && value !== undefined ? styles.valueText : styles.placeholderText}>
          {value !== null && value !== undefined ? String(value) : placeholder}
        </Text>
        <Text style={styles.arrow}>▼</Text>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <SafeAreaView style={styles.modalContent}>
            <View style={styles.header}>
              <Text style={styles.modalTitle}>Select {label}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.optionItem, value === null && styles.selectedOption]}
              onPress={() => {
                onSelect(null);
                setModalVisible(false);
              }}
            >
              <Text style={styles.optionText}>{placeholder} (None)</Text>
              {value === null && <Text style={styles.checkmark}>✓</Text>}
            </TouchableOpacity>

            <FlatList
              data={options as T[]}
              keyExtractor={(item) => String(item)}
              renderItem={({ item }) => {
                const isSelected = value === item;
                return (
                  <TouchableOpacity
                    style={[styles.optionItem, isSelected && styles.selectedOption]}
                    onPress={() => {
                      onSelect(item);
                      setModalVisible(false);
                    }}
                  >
                    <Text style={[styles.optionText, isSelected && styles.selectedOptionText]}>
                      {String(item)}
                    </Text>
                    {isSelected && <Text style={styles.checkmark}>✓</Text>}
                  </TouchableOpacity>
                );
              }}
            />
          </SafeAreaView>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#94a3b8',
    marginBottom: 6,
  },
  required: {
    color: '#ef4444',
  },
  button: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  valueText: {
    color: '#f8fafc',
    fontSize: 15,
    fontWeight: '500',
  },
  placeholderText: {
    color: '#64748b',
    fontSize: 15,
  },
  arrow: {
    color: '#94a3b8',
    fontSize: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#0f172a',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '60%',
    paddingBottom: 20,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  modalTitle: {
    color: '#f8fafc',
    fontSize: 17,
    fontWeight: '700',
  },
  closeButton: {
    color: '#94a3b8',
    fontSize: 18,
    padding: 4,
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#1e293b',
  },
  selectedOption: {
    backgroundColor: '#1e293b',
  },
  optionText: {
    color: '#cbd5e1',
    fontSize: 16,
  },
  selectedOptionText: {
    color: '#6366f1',
    fontWeight: '700',
  },
  checkmark: {
    color: '#6366f1',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

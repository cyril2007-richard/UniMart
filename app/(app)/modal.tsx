import { StatusBar } from 'expo-status-bar';
import { Platform, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';

import { Text, View } from '@/components/Themed';
import Colors from '@/constants/Colors';

export default function ModalScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const theme = Colors.light;

  const [minPrice, setMinPrice] = useState(params.minPrice ? String(params.minPrice) : '');
  const [maxPrice, setMaxPrice] = useState(params.maxPrice ? String(params.maxPrice) : '');

  const applyFilters = () => {
    router.dismiss();
    router.setParams({
        minPrice: minPrice,
        maxPrice: maxPrice
    });
  };

  const clearFilters = () => {
    setMinPrice('');
    setMaxPrice('');
    router.dismiss();
    router.setParams({
        minPrice: '',
        maxPrice: ''
    });
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Filter Products</Text>
        <TouchableOpacity onPress={() => router.back()}>
            <Text style={{ color: theme.purple, fontSize: 16, fontWeight: '600' }}>Close</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.separator} lightColor={Colors.light.surface} />

      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Price Range (₦)</Text>
            <View style={styles.row}>
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Min</Text>
                    <TextInput
                        style={[styles.input, { borderColor: theme.surface, color: theme.text }]}
                        placeholder="0"
                        placeholderTextColor={theme.secondaryText}
                        keyboardType="numeric"
                        value={minPrice}
                        onChangeText={setMinPrice}
                    />
                </View>
                <View style={styles.dash} />
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Max</Text>
                    <TextInput
                        style={[styles.input, { borderColor: theme.surface, color: theme.text }]}
                        placeholder="Any"
                        placeholderTextColor={theme.secondaryText}
                        keyboardType="numeric"
                        value={maxPrice}
                        onChangeText={setMaxPrice}
                    />
                </View>
            </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
            style={[styles.button, styles.resetButton, { borderColor: theme.surface }]} 
            onPress={clearFilters}
        >
            <Text style={[styles.buttonText, { color: theme.text }]}>Reset</Text>
        </TouchableOpacity>
        <TouchableOpacity 
            style={[styles.button, styles.applyButton, { backgroundColor: theme.purple }]} 
            onPress={applyFilters}
        >
            <Text style={[styles.buttonText, { color: 'white' }]}>Apply Filters</Text>
        </TouchableOpacity>
      </View>

      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 20 : 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  separator: {
    height: 1,
    width: '100%',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 15,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  inputGroup: {
    flex: 1,
  },
  label: {
    fontSize: 12,
    marginBottom: 6,
    opacity: 0.6,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  dash: {
    width: 10,
    height: 1,
    backgroundColor: '#ccc',
    marginHorizontal: 10,
    marginTop: 20,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    flexDirection: 'row',
    gap: 15,
    marginBottom: 20,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resetButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
  },
  applyButton: {
    // backgroundColor set inline
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

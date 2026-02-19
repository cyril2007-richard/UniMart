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
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <View style={[styles.header, { backgroundColor: theme.surface }]}>
        <Text style={styles.title}>Filter</Text>
        <TouchableOpacity onPress={() => router.back()}>
            <Text style={{ color: theme.primary, fontSize: 16, fontWeight: '600' }}>Done</Text>
        </TouchableOpacity>
      </View>
      
      <View style={[styles.separator, { backgroundColor: theme.secondaryBackground }]} />

      <ScrollView style={[styles.content, { backgroundColor: theme.background }]} contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={[styles.section, { backgroundColor: theme.background }]}>
            <Text style={styles.sectionTitle}>Price Range</Text>
            <View style={[styles.row, { backgroundColor: theme.background }]}>
                <View style={[styles.inputGroup, { backgroundColor: theme.background }]}>
                    <Text style={styles.label}>Min Price (₦)</Text>
                    <TextInput
                        style={[styles.input, { borderColor: theme.secondaryBackground, color: theme.text, backgroundColor: theme.surface }]}
                        placeholder="0"
                        placeholderTextColor={theme.mutedText}
                        keyboardType="numeric"
                        value={minPrice}
                        onChangeText={setMinPrice}
                    />
                </View>
                <View style={styles.dash} />
                <View style={[styles.inputGroup, { backgroundColor: theme.background }]}>
                    <Text style={styles.label}>Max Price (₦)</Text>
                    <TextInput
                        style={[styles.input, { borderColor: theme.secondaryBackground, color: theme.text, backgroundColor: theme.surface }]}
                        placeholder="Any"
                        placeholderTextColor={theme.mutedText}
                        keyboardType="numeric"
                        value={maxPrice}
                        onChangeText={setMaxPrice}
                    />
                </View>
            </View>
        </View>
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: theme.surface, borderTopColor: theme.secondaryBackground }]}>
        <TouchableOpacity 
            style={[styles.button, styles.resetButton, { borderColor: theme.secondaryBackground }]} 
            onPress={clearFilters}
        >
            <Text style={[styles.buttonText, { color: theme.secondaryText }]}>Clear</Text>
        </TouchableOpacity>
        <TouchableOpacity 
            style={[styles.button, styles.applyButton, { backgroundColor: theme.primary }]} 
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

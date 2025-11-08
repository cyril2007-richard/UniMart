import React from 'react';
import { StyleSheet, Text, View, FlatList, useColorScheme } from 'react-native';
import Colors from '../constants/Colors';
import { useListings } from '../contexts/ListingsContext';

export default function AnnouncementScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme === 'dark' ? 'dark' : 'light'];
  const { listings } = useListings();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.text }]}>Announcements</Text>
      <FlatList
        data={listings}
        renderItem={({ item }) => (
          <View style={[styles.listingItem, { backgroundColor: theme.background, borderColor: theme.tabIconDefault }]}>
            <Text style={[styles.listingTitle, { color: theme.text }]}>{item.title}</Text>
            <Text style={[styles.listingPrice, { color: theme.purple }]}>${item.price}</Text>
          </View>
        )}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 20,
  },
  listingItem: {
    padding: 15,
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  listingTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  listingPrice: {
    fontSize: 16,
    fontWeight: '700',
  },
});

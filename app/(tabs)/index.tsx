import { LinearGradient } from 'expo-linear-gradient';
import { Bell, Search, Settings, ShoppingCart } from 'lucide-react-native';
import React from 'react';
import { Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, useColorScheme, View } from 'react-native';
import Colors from '../../constants/Colors';

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors.light

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <LinearGradient
        colors={[theme.purple, theme.lightPurple]}
        style={styles.headerContainer}
      >
        {/* Top Row */}
        <View style={styles.topRow}>
          <View style={styles.logoRow}>
            <Image
              source={require('@/assets/logo.png')} 
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={[styles.appName, { color: theme.white }]}>UniMarket</Text>
          </View>

          <View style={styles.iconRow}>
            <TouchableOpacity>
              <ShoppingCart color={theme.white || '#fff'} size={22} />
            </TouchableOpacity>
            <TouchableOpacity>
              <Bell color={theme.white || '#fff'} size={22} />
            </TouchableOpacity>
            <TouchableOpacity>
              <Settings color={theme.white || '#fff'} size={22} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={[styles.searchBar, { backgroundColor: theme.background }]}>
          <Search color={theme.tabIconDefault} size={18} style={{ marginHorizontal: 8 }} />
          <TextInput
            placeholder="Search items, students, or categories..."
            placeholderTextColor={theme.tabIconDefault}
            style={[styles.searchInput, { color: theme.text }]}
          />
        </View>
      </LinearGradient>

      
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
       
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
 headerContainer: {
  height: 200,               
  paddingTop: 50,
  paddingHorizontal: 20,
  paddingBottom: 25,
  borderBottomLeftRadius: 10,
  borderBottomRightRadius: 10,
  justifyContent: 'flex-start', 
},
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 35,
    height: 35,
    marginRight: 8,
  },
  appName: {
    fontSize: 20,
    fontWeight: '700',
  },
  iconRow: {
    flexDirection: 'row',
    gap: 15,
  },
 searchBar: {
  flexDirection: 'row',
  alignItems: 'center',
  borderRadius: 10,          // make it more rounded
  marginTop: 'auto',         // pushes it to the bottom of the header
  marginBottom: 10,          // small space from header bottom
  paddingHorizontal: 16,     // more inner spacing
  paddingVertical: 12,       // thicker height
  shadowColor: '#000',
  shadowOpacity: 0.15,
  shadowRadius: 8,
  elevation: 6,
  backgroundColor: '#fff',   // you can keep theme.background if you prefer dynamic
},
  searchInput: {
    flex: 1,
    fontSize: 14,
  },
  scrollContainer: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
});


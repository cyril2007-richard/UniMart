import { Tabs } from 'expo-router';
import { Home, Search, User } from 'lucide-react-native';
import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';

import Colors from '../../../constants/Colors';
import FloatingAddButton from '../../../components/FloatingAddButton';

function TabIcon({
  Icon,
  color,
  focused,
}: {
  Icon: any;
  color: string;
  focused: boolean;
}) {
  const colors = Colors.light;
  const styles = StyleSheet.create({
    iconContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      width: 50,
      height: 50,
    },
    activeDot: {
      position: 'absolute',
      bottom: 0,
      width: 4,
      height: 4,
      borderRadius: 2,
      backgroundColor: colors.tint,
    },
  });
  return (
    <View style={styles.iconContainer}>
      <Icon size={24} color={color} strokeWidth={focused ? 2 : 1.5} />
      {focused && <View style={styles.activeDot} />}
    </View>
  );
}

export default function TabLayout() {
  const colors = Colors.light;

  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarShowLabel: false,
          tabBarStyle: {
            height: Platform.OS === 'ios' ? 90 : 70,
            paddingBottom: Platform.OS === 'ios' ? 30 : 10,
            paddingTop: 16,
            backgroundColor: colors.background,
            borderTopWidth: 0,
          },
          tabBarActiveTintColor: colors.tint,
          tabBarInactiveTintColor: colors.tabIconDefault,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            tabBarIcon: ({ color, focused }) => (
              <TabIcon Icon={Home} color={color} focused={focused} />
            ),
          }}
        />

        <Tabs.Screen
          name="shop"
          options={{
            tabBarIcon: ({ color, focused }) => (
              <TabIcon Icon={Search} color={color} focused={focused} />
            ),
          }}
        />

        <Tabs.Screen
          name="profile"
          options={{
            tabBarIcon: ({ color, focused }) => (
              <TabIcon Icon={User} color={color} focused={focused} />
            ),
          }}
        />
      </Tabs>
      <FloatingAddButton />
    </>
  );
}

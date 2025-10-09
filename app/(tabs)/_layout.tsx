import { LinearGradient } from 'expo-linear-gradient';
import { Tabs, useRouter } from 'expo-router';
import { Home, MessageCircle, Plus, Search, User } from 'lucide-react-native';
import React, { useEffect } from 'react';
import { Platform, StyleSheet, View } from 'react-native';


import { useAuth } from '../../contexts/AuthContext';
;

// UNIBEN Colors
const COLORS = {
  purple: '#4B0082',
  gold: '#FFD700',
  lightPurple: '#6A0DAD',
  darkPurple: '#330066',
  black: '#000000',
  gray: '#C4C4C4',
  white: '#FFFFFF',
};

function TabIcon({
  Icon,
  color,
  focused,
}: {
  Icon: any;
  color: string;
  focused: boolean;
}) {
  return (
    <View style={styles.iconContainer}>
      <Icon size={24} color={color} strokeWidth={focused ? 2.5 : 2} />
      {focused && <View style={styles.activeDot} />}
    </View>
  );
}

function AddButton({ focused }: { focused: boolean }) {
  return (
    <View
      style={[
        styles.addButtonContainer,
        focused && styles.addButtonContainerActive,
      ]}
    >
      <LinearGradient
        colors={[COLORS.gold, '#FFA500']}
        style={styles.addButtonGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Plus size={28} color={COLORS.white} strokeWidth={3} />
      </LinearGradient>
    </View>
  );
}

export default function TabLayout() {
  const { currentUser } = useAuth();
  const router = useRouter();        

  useEffect(() => {
    if (!currentUser) {
      router.replace('/login');
    }
  }, [currentUser]);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          height: Platform.OS === 'ios' ? 70 : 60,
          paddingBottom: Platform.OS === 'ios' ? 10 : 6,
          paddingTop: 16,
          backgroundColor: COLORS.white,
          borderTopWidth: 0,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.05,
          shadowRadius: 8,
        },
        tabBarActiveTintColor: COLORS.purple,
        tabBarInactiveTintColor: COLORS.gray,
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
        name="add"
        options={{
          tabBarIcon: ({ focused }) => <AddButton focused={focused} />,
        }}
      />

      <Tabs.Screen
        name="chat"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <TabIcon Icon={MessageCircle} color={color} focused={focused} />
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
  );
}

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
    backgroundColor: COLORS.purple,
  },
  addButtonContainer: {
    width: 60,
    height: 60,
    marginTop: 0,
  },
  addButtonContainerActive: {
    marginTop: -20,
  },
  addButtonGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: COLORS.white,
    shadowColor: COLORS.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});

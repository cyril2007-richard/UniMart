// app/_layout.tsx
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { CartProvider } from '../contexts/CartContext';
import { ListingsProvider } from '../contexts/ListingsContext';
import { NotificationProvider } from '../contexts/NotificationContext';
import { CategoryProvider } from '../contexts/CategoryContext';
import { ChatProvider } from '../contexts/ChatContext';
import { ActivityIndicator, View } from 'react-native';

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(app)',
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <AuthProvider>
      <ListingsProvider>
        <CartProvider>
          <NotificationProvider>
            <CategoryProvider>
              <ChatProvider>
                <RootLayoutNav />
              </ChatProvider>
            </CategoryProvider>
          </NotificationProvider>
        </CartProvider>
      </ListingsProvider>
    </AuthProvider>
  );
}

function RootLayoutNav() {
  const { currentUser, loading } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (currentUser && inAuthGroup) {
      router.replace('/');
    } else if (!currentUser && !inAuthGroup) {
      router.replace('/(auth)/login');
    }
  }, [currentUser, loading, segments]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(app)" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}
// app/_layout.tsx
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { AuthProvider } from '../contexts/AuthContext';
import { CartProvider } from '../contexts/CartContext';
import { ListingsProvider } from '../contexts/ListingsContext';
import { NotificationProvider } from '../contexts/NotificationContext';

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
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
            <RootLayoutNav />
          </NotificationProvider>
        </CartProvider>
      </ListingsProvider>
    </AuthProvider>
  );
}

function RootLayoutNav() {
  return (
    <ThemeProvider value={DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        {/* Main Tab Navigator */}
        <Stack.Screen name="(tabs)" />

        {/* Fullscreen Pages */}
        <Stack.Screen name="announcement" />
        <Stack.Screen name="login" />
        <Stack.Screen name="signup" />
        <Stack.Screen name="cart" />
        <Stack.Screen name="settings" />
        <Stack.Screen name="apply" />
        <Stack.Screen name="search" />
        <Stack.Screen name="support" />
        <Stack.Screen name="seller-profile" />
        <Stack.Screen name="product-detail" />
        <Stack.Screen name="product-screen" />
        <Stack.Screen name="new-chat" />
        <Stack.Screen name="chat/[id]" />

        {/* Modal Screens */}
        <Stack.Screen
          name="how-to-buy"
          options={{ presentation: 'modal' }}
        />
        <Stack.Screen
          name="how-to-sell"
          options={{ presentation: 'modal' }}
        />
        <Stack.Screen
          name="modal"
          options={{ presentation: 'modal' }}
        />

        {/* Catch-all */}
        <Stack.Screen name="+not-found" />
      </Stack>
    </ThemeProvider>
  );
}
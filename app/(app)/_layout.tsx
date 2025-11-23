import { Stack } from 'expo-router';
import { ThemeProvider, DefaultTheme } from '@react-navigation/native';

export default function AppLayout() {
  return (
    <ThemeProvider value={DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="announcement" />
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
        <Stack.Screen name="how-to-buy" options={{ presentation: 'transparentModal' }} />
        <Stack.Screen name="how-to-sell" options={{ presentation: 'transparentModal' }} />
        <Stack.Screen name="modal" options={{ presentation: 'transparentModal' }} />
      </Stack>
    </ThemeProvider>
  );
}

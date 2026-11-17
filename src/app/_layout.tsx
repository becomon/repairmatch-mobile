import { useEffect } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import { PlusJakartaSans_700Bold, PlusJakartaSans_800ExtraBold } from '@expo-google-fonts/plus-jakarta-sans';
import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { AuthProvider } from '@/features/auth';
import { colors } from '@/shared/theme';
import { API_BASE_URL } from '@/shared/api/config';

void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  // Wake the sleeping API as soon as the app opens, so the login does not pay the cold start.
  useEffect(() => {
    void fetch(`${API_BASE_URL}/appliance-types`).catch(() => undefined);
  }, []);

  useEffect(() => {
    if (loaded || error) void SplashScreen.hideAsync();
  }, [loaded, error]);

  if (!loaded && !error) return null;

  return (
    <AuthProvider>
      <StatusBar style="dark" />
      {/* On web the app is centred in a phone-width column so the preview matches the mockups. */}
      <View style={styles.outer}>
        <View style={styles.inner}>
          <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }} />
        </View>
      </View>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  outer: { flex: 1, alignItems: 'center', backgroundColor: Platform.OS === 'web' ? colors.surface2 : colors.background },
  inner: { flex: 1, width: '100%', maxWidth: 480, backgroundColor: colors.background },
});

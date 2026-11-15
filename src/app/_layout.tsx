import { useEffect } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import { Manrope_700Bold, Manrope_800ExtraBold } from '@expo-google-fonts/manrope';
import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { AuthProvider } from '@/features/auth/AuthProvider';
import { colors } from '@/shared/theme';

void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    Manrope_700Bold,
    Manrope_800ExtraBold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

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
  outer: { flex: 1, alignItems: 'center', backgroundColor: Platform.OS === 'web' ? '#e9edf5' : colors.background },
  inner: { flex: 1, width: '100%', maxWidth: 480, backgroundColor: colors.background },
});

import { ActivityIndicator, Text, View } from 'react-native';
export function Feedback({ busy, error, message }: { busy: boolean; error: string; message: string }) {
  return <View accessibilityLiveRegion="polite">
    {busy && <ActivityIndicator size="large" accessibilityLabel="Cargando" color="#c2410c" />}
    {!!error && <Text accessibilityRole="alert" style={{ color: '#b91c1c' }}>{error}</Text>}
    {!!message && <Text style={{ color: '#166534' }}>{message}</Text>}
  </View>;
}

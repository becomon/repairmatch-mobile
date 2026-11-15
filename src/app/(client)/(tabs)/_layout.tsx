import type { ColorValue } from 'react-native';
import { Tabs } from 'expo-router';
import { Icon, type IconName } from '@/shared/ui';
import { tabScreenOptions } from '@/shared/ui/tabOptions';

function tab(name: IconName, focusedName: IconName) {
  const TabIcon = ({ color, focused }: { color: ColorValue; focused: boolean }) => <Icon name={focused ? focusedName : name} size={24} color={color} />;
  TabIcon.displayName = 'TabIcon';
  return TabIcon;
}

export default function ClientTabs() {
  return (
    <Tabs screenOptions={tabScreenOptions}>
      <Tabs.Screen name="home" options={{ title: 'Inicio', tabBarIcon: tab('home-outline', 'home') }} />
      <Tabs.Screen name="requests" options={{ title: 'Solicitudes', tabBarIcon: tab('list-outline', 'list') }} />
      <Tabs.Screen name="services" options={{ title: 'Servicios', tabBarIcon: tab('construct-outline', 'construct') }} />
      <Tabs.Screen name="profile" options={{ title: 'Perfil', tabBarIcon: tab('person-outline', 'person') }} />
    </Tabs>
  );
}

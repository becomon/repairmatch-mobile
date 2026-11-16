import type { ColorValue } from 'react-native';
import { Tabs } from 'expo-router';
import { Icon, type IconName } from '@/shared/ui';
import { tabScreenOptions } from '@/shared/ui/tabOptions';

function tab(name: IconName, focusedName: IconName) {
  const TabIcon = ({ color, focused }: { color: ColorValue; focused: boolean }) => <Icon name={focused ? focusedName : name} size={24} color={color} />;
  TabIcon.displayName = 'TabIcon';
  return TabIcon;
}

export default function TechnicianTabs() {
  return (
    <Tabs screenOptions={tabScreenOptions}>
      <Tabs.Screen name="cases" options={{ title: 'Para ti', tabBarIcon: tab('sparkles-outline', 'sparkles') }} />
      <Tabs.Screen name="nearby" options={{ title: 'Oportunidades', tabBarIcon: tab('location-outline', 'location') }} />
      <Tabs.Screen name="work" options={{ title: 'Mi trabajo', tabBarIcon: tab('briefcase-outline', 'briefcase') }} />
      <Tabs.Screen name="account" options={{ title: 'Perfil', tabBarIcon: tab('person-outline', 'person') }} />
    </Tabs>
  );
}

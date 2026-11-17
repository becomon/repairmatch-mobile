import { useState } from 'react';
import { Image, Modal, Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radius, TOUCH } from '@/shared/theme';
import { Icon, Text } from '@/shared/ui';

/** Thumbnails that open a full-screen viewer; the viewer pages through all the photos. */
export function PhotoGallery({ uris }: { uris: string[] }) {
  const [open, setOpen] = useState<number | null>(null);
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  return (
    <>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {uris.map((uri, index) => (
          <Pressable key={`${uri}-${index}`} accessibilityRole="imagebutton" accessibilityLabel={`Ver foto ${index + 1} de ${uris.length}`} onPress={() => setOpen(index)}>
            <Image source={{ uri }} style={styles.thumb} />
          </Pressable>
        ))}
      </ScrollView>
      <Modal visible={open !== null} transparent animationType="fade" onRequestClose={() => setOpen(null)} statusBarTranslucent>
        <View style={styles.viewer}>
          <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false} contentOffset={{ x: (open ?? 0) * width, y: 0 }}>
            {uris.map((uri, index) => (
              <View key={`${uri}-${index}`} style={{ width, height, alignItems: 'center', justifyContent: 'center' }}>
                <Image source={{ uri }} resizeMode="contain" accessibilityLabel={`Foto ${index + 1} del electrodoméstico`} style={{ width, height: height * 0.75 }} />
              </View>
            ))}
          </ScrollView>
          <View style={[styles.top, { top: insets.top + 8 }]}>
            <Text variant="smallStrong" color={colors.white}>{open !== null ? `${open + 1} de ${uris.length}` : ''}</Text>
            <Pressable accessibilityRole="button" accessibilityLabel="Cerrar foto" onPress={() => setOpen(null)} style={styles.close}>
              <Icon name="close" size={26} color={colors.white} />
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  row: { gap: 10 },
  thumb: { width: 120, height: 120, borderRadius: radius.md, backgroundColor: colors.neutralSoft },
  viewer: { flex: 1, backgroundColor: colors.viewerBackdrop },
  top: { position: 'absolute', left: 20, right: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  close: { width: TOUCH, height: TOUCH, borderRadius: TOUCH / 2, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.viewerControl },
});

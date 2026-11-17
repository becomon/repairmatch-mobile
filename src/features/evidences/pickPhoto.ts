import * as ImagePicker from 'expo-image-picker';
import { Alert, Platform } from 'react-native';

export type PhotoSource = 'camera' | 'gallery';

function inform(title: string, message: string) {
  return new Promise<void>(resolve => {
    Alert.alert(title, message, [{ text: 'Aceptar', onPress: () => resolve() }], { cancelable: false });
  });
}

function firstAsset(result: ImagePicker.ImagePickerResult): ImagePicker.ImagePickerAsset | null {
  return result.canceled ? null : (result.assets[0] ?? null);
}

/** Camera or gallery. The browser has no camera dialog, so web always opens the file picker. */
export async function pickPhoto(source: PhotoSource): Promise<ImagePicker.ImagePickerAsset | null> {
  const options: ImagePicker.ImagePickerOptions = {
    mediaTypes: ['images'],
    quality: 0.8,
    allowsMultipleSelection: false,
    exif: false,
  };

  // Alert.alert is a no-op on web, so the camera confirmation would never resolve there.
  if (source === 'camera' && Platform.OS !== 'web') {
    const proceed = await new Promise<boolean>((resolve) => {
      Alert.alert("Acceso a la cámara", "Usa la cámara para fotografiar el electrodoméstico. También puedes elegir una foto de la galería.", [
        { text: "Galería", onPress: () => resolve(false) },
        { text: "Continuar", onPress: () => resolve(true) },
      ], { cancelable: false });
    });
    if (!proceed) return firstAsset(await ImagePicker.launchImageLibraryAsync(options));
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (permission.granted) return firstAsset(await ImagePicker.launchCameraAsync(options));
      await inform("Permiso de cámara denegado", "Puedes seleccionar una foto de la galería.");
    } catch {
      await inform("Cámara no disponible", "Elige una foto de la galería.");
    }
  }

  return firstAsset(await ImagePicker.launchImageLibraryAsync(options));
}

import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';

function inform(title: string, message: string) {
  return new Promise<void>(resolve => {
    Alert.alert(title, message, [{ text: 'Aceptar', onPress: () => resolve() }], { cancelable: false });
  });
}

export async function pickPhoto(source: 'camera' | 'gallery') {
  const options: ImagePicker.ImagePickerOptions = {
    mediaTypes: ['images'],
    quality: 0.8,
    allowsMultipleSelection: false,
    exif: false,
  };

  if (source === 'camera') {
    const proceed = await new Promise<boolean>((resolve) => {
      Alert.alert("Acceso a la cámara", "Usa la cámara para fotografiar el electrodoméstico. También puedes elegir una foto de la galería.", [
        { text: "Galería", onPress: () => resolve(false) },
        { text: "Continuar", onPress: () => resolve(true) },
      ], { cancelable: false });
    });
    if (!proceed) {
      const result = await ImagePicker.launchImageLibraryAsync(options);
      return result.canceled ? null : result.assets[0];
    }
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (permission.granted) {
        const result = await ImagePicker.launchCameraAsync(options);
        return result.canceled ? null : result.assets[0];
      } else {
        await inform("Permiso de cámara denegado", "Puedes seleccionar una foto de la galería.");
      }
    } catch {
      await inform("Cámara no disponible", "Elige una foto de la galería.");
    }
  }

  const result = await ImagePicker.launchImageLibraryAsync(options);
  return result.canceled ? null : result.assets[0];
}


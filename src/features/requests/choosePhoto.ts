import * as ImagePicker from 'expo-image-picker';
import { Platform } from 'react-native';
import { pickPhoto } from '../evidences/pickPhoto';

/** Camera or gallery. The browser has no camera dialog flow, so web always opens the file picker. */
export async function choosePhoto(source: 'camera' | 'gallery'): Promise<ImagePicker.ImagePickerAsset | null> {
  if (Platform.OS === 'web') {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.8, exif: false });
    return result.canceled ? null : (result.assets[0] ?? null);
  }
  return (await pickPhoto(source)) ?? null;
}

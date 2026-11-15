import type { ImagePickerAsset } from 'expo-image-picker';
import { Platform } from 'react-native';
import type { CreateEvidence } from './api';

export async function uploadPhoto(photo: ImagePickerAsset): Promise<CreateEvidence> {
  const cloudName = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const preset = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
  if (!cloudName || !/^[a-zA-Z0-9_-]+$/.test(cloudName) || !preset) {
    throw new Error("Primero configura el nombre de nube y el preset sin firma de Cloudinary.");
  }
  if (photo.fileSize && photo.fileSize > 10 * 1024 * 1024) {
    throw new Error("Elige una imagen menor de 10 MB.");
  }
  const body = new FormData();
  if (Platform.OS === 'web') {
    if (!photo.file) throw new Error("No se pudo leer la imagen seleccionada.");
    body.append('file', photo.file);
  } else {
    // React Native FormData accepts a local URI instead of a browser Blob.
    body.append('file', {
      uri: photo.uri,
      type: photo.mimeType || 'image/jpeg',
      name: photo.fileName || 'evidence.jpg',
    } as unknown as Blob);
  }
  body.append('upload_preset', preset);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 60_000);
  try {
    // Separate external upload: never send the RepairMatch Bearer to Cloudinary.
    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: 'POST', body, signal: controller.signal,
    });
    if (!response.ok) throw new Error("No se pudo subir la foto. Revisa tu conexión y el preset de subida.");
    const data: unknown = await response.json();
    if (!data || typeof data !== 'object' || !('secure_url' in data) ||
        typeof data.secure_url !== 'string' || !data.secure_url.startsWith('https://') ||
        data.secure_url.length > 500 || !('format' in data) ||
        typeof data.format !== 'string' || !/^[a-z0-9]+$/i.test(data.format)) {
      throw new Error("Cloudinary devolvió una respuesta de imagen no válida.");
    }
    const mediaType = `image/${data.format === 'jpg' ? 'jpeg' : data.format}`;
    if (mediaType.length > 50) throw new Error("Formato de imagen no compatible.");
    return { mediaUrl: data.secure_url, mediaType };
  } finally {
    clearTimeout(timer);
  }
}

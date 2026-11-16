import type { ImagePickerAsset } from 'expo-image-picker';
import { File } from 'expo-file-system';
import { fetch as expoFetch } from 'expo/fetch';
import { Platform } from 'react-native';
import { MAX_PHOTO_BYTES, UPLOAD_TIMEOUT_MS } from '@/shared/constants';
import type { CreateEvidence } from './api';

// Public values (unsigned preset); env vars override them for other accounts.
const CLOUD_NAME = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME || 'buwtlbce';
const UPLOAD_PRESET = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'repairmatch_unsigned';
const MAX_URL_CHARS = 500;
const MAX_MEDIA_TYPE_CHARS = 50;

/**
 * Native: `expo/fetch` with an `expo-file-system` `File`, the pairing the SDK 58 docs show for
 * multipart uploads (the `{ uri, type, name }` object is not supported). Web: the browser's own
 * `fetch` with the `File` the image picker returns.
 */
const send = Platform.OS === 'web' ? globalThis.fetch.bind(globalThis) : expoFetch;

function buildForm(photo: ImagePickerAsset): FormData {
  const body = new FormData();
  if (Platform.OS === 'web') {
    if (!photo.file) throw new Error('No se pudo leer la imagen seleccionada.');
    body.append('file', photo.file);
  } else {
    body.append('file', new File(photo.uri), photo.fileName || 'evidence.jpg');
  }
  body.append('upload_preset', UPLOAD_PRESET);
  return body;
}

/** Validates what the external host answered before it reaches the RepairMatch API. */
function toEvidence(data: unknown): CreateEvidence {
  if (!data || typeof data !== 'object' || !('secure_url' in data) ||
      typeof data.secure_url !== 'string' || !data.secure_url.startsWith('https://') ||
      data.secure_url.length > MAX_URL_CHARS || !('format' in data) ||
      typeof data.format !== 'string' || !/^[a-z0-9]+$/i.test(data.format)) {
    throw new Error('Cloudinary devolvió una respuesta de imagen no válida.');
  }
  const mediaType = `image/${data.format === 'jpg' ? 'jpeg' : data.format}`;
  if (mediaType.length > MAX_MEDIA_TYPE_CHARS) throw new Error('Formato de imagen no compatible.');
  return { mediaUrl: data.secure_url, mediaType };
}

export async function uploadPhoto(photo: ImagePickerAsset): Promise<CreateEvidence> {
  if (!CLOUD_NAME || !/^[a-zA-Z0-9_-]+$/.test(CLOUD_NAME) || !UPLOAD_PRESET) {
    throw new Error('Primero configura el nombre de nube y el preset sin firma de Cloudinary.');
  }
  if (photo.fileSize && photo.fileSize > MAX_PHOTO_BYTES) {
    throw new Error('Elige una imagen menor de 10 MB.');
  }
  const body = buildForm(photo);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), UPLOAD_TIMEOUT_MS);
  try {
    // Separate external upload: never send the RepairMatch Bearer to Cloudinary.
    const response = await send(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
      method: 'POST',
      body,
      signal: controller.signal,
    });
    if (!response.ok) throw new Error('No se pudo subir la foto. Revisa tu conexión y el preset de subida.');
    return toEvidence(await response.json());
  } finally {
    clearTimeout(timer);
  }
}

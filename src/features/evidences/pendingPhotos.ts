import type { ImagePickerAsset } from 'expo-image-picker';
import { api } from '@/shared/api/client';
import { createEvidenceApi } from './api';
import { uploadPhoto } from './cloudinary';

/**
 * Photos picked while publishing that failed to upload, kept in memory per request so the
 * client can retry with one tap instead of taking them again.
 */
const pending = new Map<number, ImagePickerAsset[]>();
const lastErrors = new Map<number, string>();

/** Human-readable cause of the last failed upload, shown so the user (and we) know why. */
export function getLastPhotoError(requestId: number): string | null {
  return lastErrors.get(requestId) ?? null;
}

export function setLastPhotoError(requestId: number, error: unknown): void {
  lastErrors.set(requestId, describeUploadError(error));
}

function describeUploadError(error: unknown): string {
  if (error && typeof error === "object" && "status" in error && typeof (error as { status: unknown }).status === "number") {
    const status = (error as { status: number }).status;
    if (status === 0) return "Sin conexión con el servidor.";
    return "El servidor rechazó la foto (código " + status + ").";
  }
  return error instanceof Error && error.message ? error.message : "Error desconocido.";
}

export function setPendingPhotos(requestId: number, photos: ImagePickerAsset[]): void {
  if (photos.length) pending.set(requestId, photos);
  else pending.delete(requestId);
}

export function getPendingPhotos(requestId: number): ImagePickerAsset[] {
  return pending.get(requestId) ?? [];
}

/** Uploads and registers one photo; throws on failure. */
export async function uploadEvidence(requestId: number, photo: ImagePickerAsset): Promise<void> {
  const metadata = await uploadPhoto(photo);
  await createEvidenceApi(api).add(requestId, metadata);
}

/** Retries every pending photo of a request; returns how many still failed. */
export async function retryPendingPhotos(requestId: number): Promise<number> {
  const failed: ImagePickerAsset[] = [];
  for (const photo of getPendingPhotos(requestId)) {
    try {
      await uploadEvidence(requestId, photo);
    } catch (error) {
      setLastPhotoError(requestId, error);
      failed.push(photo);
    }
  }
  setPendingPhotos(requestId, failed);
  return failed.length;
}

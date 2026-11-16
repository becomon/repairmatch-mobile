import { requestsApi } from '@/shared/api/endpoints';
import type { ServiceRequest } from '@/shared/api/types';
import type { ImagePickerAsset } from 'expo-image-picker';
import { setLastPhotoError, setPendingPhotos, uploadEvidence } from '../evidences/pendingPhotos';
import type { PublishDraft } from './draft';

export interface PublishResult {
  request: ServiceRequest;
  failedPhotos: number;
}

export const MAX_PHOTOS = 5;

/**
 * Creates the request first (evidences need its id), then uploads each photo to Cloudinary and
 * registers its URL. A failed photo never rolls back the request; the caller reports the count.
 */
export async function publishDraft(draft: PublishDraft, onProgress?: (message: string) => void): Promise<PublishResult> {
  if (draft.applianceTypeId === null) throw new Error('Elige el tipo de equipo.');
  if (!draft.location) throw new Error('Elige la ubicación del equipo.');

  onProgress?.('Publicando tu solicitud…');
  const request = await requestsApi.create({
    applianceTypeId: draft.applianceTypeId,
    originalDescription: draft.description.trim(),
    brand: draft.brand.trim() || null,
    model: draft.model.trim() || null,
    latitude: draft.location.latitude,
    longitude: draft.location.longitude,
  });

  const failed: ImagePickerAsset[] = [];
  for (let i = 0; i < draft.photos.length; i++) {
    onProgress?.(`Subiendo foto ${i + 1} de ${draft.photos.length}…`);
    try {
      await uploadEvidence(request.id, draft.photos[i]!);
    } catch (error) {
      setLastPhotoError(request.id, error);
      failed.push(draft.photos[i]!);
    }
  }
  // Keep failed photos so the detail screen can retry them without taking them again.
  setPendingPhotos(request.id, failed);
  return { request, failedPhotos: failed.length };
}

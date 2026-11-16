import { api } from '@/shared/api/client';
import { requestsApi } from '@/shared/api/endpoints';
import type { ServiceRequest } from '@/shared/api/types';
import { createEvidenceApi } from '../evidences/api';
import { uploadPhoto } from '../evidences/cloudinary';
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

  const evidences = createEvidenceApi(api);
  let failedPhotos = 0;
  for (let i = 0; i < draft.photos.length; i++) {
    onProgress?.(`Subiendo foto ${i + 1} de ${draft.photos.length}…`);
    try {
      const metadata = await uploadPhoto(draft.photos[i]!);
      await evidences.add(request.id, metadata);
    } catch {
      failedPhotos++;
    }
  }
  return { request, failedPhotos };
}

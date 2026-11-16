import { requestsApi } from '@/shared/api/endpoints';
import type { ServiceRequest } from '@/shared/api/types';
import { uploadRequestPhotos } from '@/features/evidences';
import type { PublishDraft } from './draft';

export interface PublishResult {
  request: ServiceRequest;
  failedPhotos: number;
}

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

  const failedPhotos = await uploadRequestPhotos(request.id, draft.photos, (done, total) =>
    onProgress?.(`Subiendo foto ${done} de ${total}…`),
  );
  return { request, failedPhotos };
}

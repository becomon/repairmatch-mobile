import type { ImagePickerAsset } from 'expo-image-picker';
import { api } from '@/shared/api/client';
import { createEvidenceApi } from './api';
import { uploadPhoto } from './cloudinary';

/** The one evidence client of the app: every HTTP call goes through `shared/api`. */
export const evidenceApi = createEvidenceApi(api);

/** Uploads one photo to the external host, then registers its URL. Throws on failure. */
export async function uploadEvidence(requestId: number, photo: ImagePickerAsset): Promise<void> {
  const metadata = await uploadPhoto(photo);
  await evidenceApi.add(requestId, metadata);
}

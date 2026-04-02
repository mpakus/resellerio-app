import type { ImagePickerAsset } from 'expo-image-picker';

import type {
  StorefrontAssetKind,
  StorefrontAssetUploadInstruction,
} from '@/src/features/settings/types';

export type StorefrontUploadAsset = Pick<
  ImagePickerAsset,
  'fileName' | 'fileSize' | 'height' | 'mimeType' | 'uri' | 'width'
>;

export function buildStorefrontAssetPayload(asset: StorefrontUploadAsset) {
  return {
    asset: {
      filename: asset.fileName ?? 'storefront-image.jpg',
      content_type: asset.mimeType ?? 'image/jpeg',
      byte_size: asset.fileSize ?? 1,
      width: asset.width ?? 1,
      height: asset.height ?? 1,
    },
  };
}

export async function uploadStorefrontAssetWithInstruction(
  instruction: StorefrontAssetUploadInstruction,
  asset: StorefrontUploadAsset,
) {
  const response = await fetch(asset.uri);
  const blob = await response.blob();

  const uploadResponse = await fetch(instruction.upload_url, {
    method: instruction.method,
    headers: instruction.headers,
    body: blob,
  });

  if (!uploadResponse.ok) {
    throw new Error(`Upload failed for ${resolveAssetLabel(asset)}.`);
  }
}

export function storefrontAssetKindLabel(kind: StorefrontAssetKind) {
  return kind === 'logo' ? 'logo' : 'header';
}

function resolveAssetLabel(asset: StorefrontUploadAsset) {
  return asset.fileName ?? 'storefront image';
}

import type { ImagePickerAsset } from 'expo-image-picker';

import { createProduct, finalizeProductUploads } from '@/src/features/products/api';
import type { ProductTab, UploadInstruction } from '@/src/features/products/types';

export type IntakeAsset = Pick<
  ImagePickerAsset,
  'assetId' | 'fileName' | 'fileSize' | 'height' | 'mimeType' | 'type' | 'uri' | 'width'
>;

type CreateAndUploadProductArgs = {
  token: string;
  assets: IntakeAsset[];
  productTab: ProductTab | null;
  uploadBinary?: (instruction: UploadInstruction, asset: IntakeAsset) => Promise<void>;
  onUploadStart?: (asset: IntakeAsset, index: number) => void;
  onUploadComplete?: (asset: IntakeAsset, index: number) => void;
};

export class ProductUploadError extends Error {
  index: number;
  fileName: string | null;

  constructor(index: number, asset: IntakeAsset, cause?: unknown) {
    super(resolveUploadErrorMessage(asset, cause));
    this.name = 'ProductUploadError';
    this.index = index;
    this.fileName = asset.fileName ?? null;
  }
}

export function buildCreateProductPayload(assets: IntakeAsset[], productTab: ProductTab | null) {
  return {
    product: {
      product_tab_id: productTab?.id ?? null,
    },
    uploads: assets.map((asset, index) => ({
      filename: asset.fileName ?? `photo-${index + 1}.jpg`,
      content_type: asset.mimeType ?? 'image/jpeg',
      byte_size: asset.fileSize ?? 1,
      position: index + 1,
      width: asset.width,
      height: asset.height,
    })),
  };
}

export function buildFinalizePayload(
  assets: IntakeAsset[],
  uploadInstructions: UploadInstruction[],
) {
  return uploadInstructions.map((instruction, index) => {
    const asset =
      assets[index] ??
      assets.find((candidate) => candidateMatchesInstruction(candidate, instruction)) ??
      assets[0];

    return {
      id: instruction.image_id,
      byte_size: asset?.fileSize ?? 1,
      width: asset?.width ?? 1,
      height: asset?.height ?? 1,
    };
  });
}

export async function uploadAssetWithInstruction(
  instruction: UploadInstruction,
  asset: IntakeAsset,
) {
  const response = await fetch(asset.uri);
  const blob = await response.blob();

  const uploadResponse = await fetch(instruction.upload_url, {
    method: instruction.method,
    headers: instruction.headers,
    body: blob,
  });

  if (!uploadResponse.ok) {
    throw new Error(`Upload failed for ${asset.fileName ?? 'image'}.`);
  }
}

export async function createAndUploadProduct({
  token,
  assets,
  productTab,
  uploadBinary = uploadAssetWithInstruction,
  onUploadStart,
  onUploadComplete,
}: CreateAndUploadProductArgs) {
  const createResponse = await createProduct(token, buildCreateProductPayload(assets, productTab));
  const instructions = createResponse.data.upload_instructions;

  for (const [index, instruction] of instructions.entries()) {
    const asset = assets[index];

    if (!asset) {
      throw new Error('Upload instructions did not match selected assets.');
    }

    try {
      onUploadStart?.(asset, index);
      await uploadBinary(instruction, asset);
      onUploadComplete?.(asset, index);
    } catch (error) {
      throw new ProductUploadError(index, asset, error);
    }
  }

  const finalizeResponse = await finalizeProductUploads(
    token,
    createResponse.data.product.id,
    buildFinalizePayload(assets, instructions),
  );

  return {
    createResponse,
    finalizeResponse,
  };
}

function candidateMatchesInstruction(asset: IntakeAsset, instruction: UploadInstruction) {
  const filename = asset.fileName?.trim();

  return Boolean(filename && instruction.storage_key.includes(filename));
}

function resolveUploadErrorMessage(asset: IntakeAsset, cause: unknown) {
  if (cause instanceof Error && cause.message.trim().length > 0) {
    return cause.message;
  }

  return `Upload failed for ${asset.fileName ?? 'image'}.`;
}

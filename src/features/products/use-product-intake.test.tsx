import { act, renderHook, waitFor } from '@testing-library/react-native';
import * as ImagePicker from 'expo-image-picker';

import {
  createAndUploadProduct,
  MAX_INTAKE_IMAGES,
  optimizeIntakeAsset,
  ProductUploadError,
} from '@/src/features/products/intake';
import { useProductIntake } from '@/src/features/products/use-product-intake';

jest.mock('expo-image-picker', () => ({
  requestMediaLibraryPermissionsAsync: jest.fn(),
  requestCameraPermissionsAsync: jest.fn(),
  launchImageLibraryAsync: jest.fn(),
  launchCameraAsync: jest.fn(),
}));

jest.mock('@/src/features/products/intake', () => {
  const actual = jest.requireActual('@/src/features/products/intake');

  return {
    ...actual,
    createAndUploadProduct: jest.fn(),
    optimizeIntakeAsset: jest.fn(),
  };
});

const mockedRequestMediaLibraryPermissionsAsync = jest.mocked(
  ImagePicker.requestMediaLibraryPermissionsAsync,
);
const mockedLaunchImageLibraryAsync = jest.mocked(ImagePicker.launchImageLibraryAsync);
const mockedCreateAndUploadProduct = jest.mocked(createAndUploadProduct);
const mockedOptimizeIntakeAsset = jest.mocked(optimizeIntakeAsset);
type OptimizedAsset = Awaited<ReturnType<typeof optimizeIntakeAsset>>;

function createDeferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((resolver) => {
    resolve = resolver;
  });

  return { promise, resolve };
}

describe('useProductIntake', () => {
  const productTabs = [
    {
      id: 'tab-7',
      name: 'Shoes',
      position: 1,
      inserted_at: '2026-04-01T00:00:00Z',
      updated_at: '2026-04-01T00:00:00Z',
    },
  ];

  const selectedAssets = [
    {
      assetId: '1',
      fileName: 'shoe-front.jpg',
      fileSize: 120000,
      height: 1600,
      mimeType: 'image/jpeg',
      type: 'image' as const,
      uri: 'file:///shoe-front.jpg',
      width: 1200,
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();

    mockedRequestMediaLibraryPermissionsAsync.mockResolvedValue({
      granted: true,
      canAskAgain: true,
      expires: 'never',
      status: 'granted' as never,
    });

    mockedLaunchImageLibraryAsync.mockResolvedValue({
      canceled: false,
      assets: selectedAssets,
    });

    mockedOptimizeIntakeAsset.mockImplementation(async (asset) => ({
      ...asset,
      uri: `${asset.uri.replace('.jpg', '')}-optimized.jpg`,
      fileName: 'shoe-front-optimized.jpg',
      fileSize: 64000,
      height: 900,
      mimeType: 'image/jpeg',
      width: 1200,
    }));
  });

  it('queues selected photo-library assets for upload', async () => {
    const { result } = renderHook(() => useProductIntake('token-123', productTabs));

    await act(async () => {
      await result.current.pickImages();
    });

    expect(result.current.queueItems).toHaveLength(1);
    expect(result.current.queueItems[0]).toMatchObject({
      asset: expect.objectContaining({
        fileName: 'shoe-front-optimized.jpg',
        fileSize: 64000,
        height: 900,
        mimeType: 'image/jpeg',
        uri: 'file:///shoe-front-optimized.jpg',
        width: 1200,
      }),
      status: 'queued',
      error: null,
    });
    expect(mockedOptimizeIntakeAsset).toHaveBeenCalledWith(selectedAssets[0]);
    expect(mockedLaunchImageLibraryAsync).toHaveBeenCalledWith(
      expect.objectContaining({ selectionLimit: MAX_INTAKE_IMAGES }),
    );
  });

  it('tracks resize progress before the upload queue begins', async () => {
    const resizeDeferred = createDeferred<OptimizedAsset>();
    mockedOptimizeIntakeAsset.mockImplementation(() => resizeDeferred.promise);

    const { result } = renderHook(() => useProductIntake('token-123', productTabs));

    let pendingPick!: Promise<void>;
    act(() => {
      pendingPick = result.current.pickImages();
    });

    await waitFor(() => {
      expect(result.current.isPreparingAssets).toBe(true);
    });
    expect(result.current.resizeProgress).toEqual({
      completed: 0,
      currentFileName: 'shoe-front.jpg',
      total: 1,
    });
    expect(result.current.queueItems[0]).toMatchObject({
      status: 'resizing',
    });

    resizeDeferred.resolve({
      ...selectedAssets[0],
      uri: 'file:///shoe-front-optimized.jpg',
      fileName: 'shoe-front-optimized.jpg',
      fileSize: 64000,
      height: 900,
      mimeType: 'image/jpeg',
      width: 1200,
    });

    await act(async () => {
      await pendingPick;
    });

    expect(result.current.isPreparingAssets).toBe(false);
    expect(result.current.resizeProgress).toEqual({
      completed: 0,
      currentFileName: null,
      total: 0,
    });
    expect(result.current.queueItems[0]?.status).toBe('queued');
  });

  it('blocks submit while image optimization is still running', async () => {
    const resizeDeferred = createDeferred<OptimizedAsset>();
    mockedOptimizeIntakeAsset.mockImplementation(() => resizeDeferred.promise);

    const { result } = renderHook(() => useProductIntake('token-123', productTabs));

    let pendingPick!: Promise<void>;
    act(() => {
      pendingPick = result.current.pickImages();
    });

    await waitFor(() => {
      expect(result.current.isPreparingAssets).toBe(true);
    });

    await act(async () => {
      await expect(result.current.submit()).resolves.toBeNull();
    });

    await waitFor(() => {
      expect(result.current.error).toBe('Wait for image optimization to finish before creating the product.');
    });
    expect(mockedCreateAndUploadProduct).not.toHaveBeenCalled();

    resizeDeferred.resolve({
      ...selectedAssets[0],
      uri: 'file:///shoe-front-optimized.jpg',
      fileName: 'shoe-front-optimized.jpg',
      fileSize: 64000,
      height: 900,
      mimeType: 'image/jpeg',
      width: 1200,
    });

    await act(async () => {
      await pendingPick;
    });
  });

  it('submits the selected queue and marks uploads as completed', async () => {
    mockedCreateAndUploadProduct.mockImplementation(async ({ assets, productTab, onUploadStart, onUploadComplete }) => {
      onUploadStart?.(assets[0], 0);
      onUploadComplete?.(assets[0], 0);

      return {
        finalizeResponse: {
          data: {
            product: {
              id: 'prod-44',
            },
          },
        },
      } as never;
    });

    const { result } = renderHook(() => useProductIntake('token-123', productTabs));

    await act(async () => {
      await result.current.pickImages();
    });

    act(() => {
      result.current.setSelectedProductTabId('tab-7');
    });

    let product = null;

    await act(async () => {
      product = await result.current.submit();
    });

    expect(mockedCreateAndUploadProduct).toHaveBeenCalledWith(
      expect.objectContaining({
        token: 'token-123',
        productTab: productTabs[0],
      }),
    );
    expect(result.current.queueItems[0]?.status).toBe('uploaded');
    expect(result.current.progress.uploaded).toBe(1);
    expect(product).toMatchObject({ id: 'prod-44' });
  });

  it('marks a failed upload and exposes retry state', async () => {
    mockedCreateAndUploadProduct.mockImplementation(async ({ assets, onUploadStart }) => {
      onUploadStart?.(assets[0], 0);
      throw new ProductUploadError(0, assets[0], new Error('Upload failed for shoe-front.jpg.'));
    });

    const { result } = renderHook(() => useProductIntake('token-123', productTabs));

    await act(async () => {
      await result.current.pickImages();
    });

    await act(async () => {
      await result.current.submit();
    });

    expect(result.current.queueItems[0]?.status).toBe('failed');
    expect(result.current.queueItems[0]?.error).toBe('Upload failed for shoe-front.jpg.');
    expect(result.current.hasFailedUploads).toBe(true);
    expect(result.current.error).toContain('Retry upload or start over.');

    act(() => {
      result.current.resetIntake();
    });

    expect(result.current.queueItems).toEqual([]);
    expect(result.current.error).toBeNull();
  });
});

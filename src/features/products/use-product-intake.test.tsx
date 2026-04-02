import { act, renderHook } from '@testing-library/react-native';
import * as ImagePicker from 'expo-image-picker';

import { createAndUploadProduct, ProductUploadError } from '@/src/features/products/intake';
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
  };
});

const mockedRequestMediaLibraryPermissionsAsync = jest.mocked(
  ImagePicker.requestMediaLibraryPermissionsAsync,
);
const mockedLaunchImageLibraryAsync = jest.mocked(ImagePicker.launchImageLibraryAsync);
const mockedCreateAndUploadProduct = jest.mocked(createAndUploadProduct);

describe('useProductIntake', () => {
  const productTabs = [
    {
      id: 7,
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
  });

  it('queues selected photo-library assets for upload', async () => {
    const { result } = renderHook(() => useProductIntake('token-123', productTabs));

    await act(async () => {
      await result.current.pickImages();
    });

    expect(result.current.queueItems).toHaveLength(1);
    expect(result.current.queueItems[0]).toMatchObject({
      status: 'queued',
      error: null,
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
              id: 44,
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
      result.current.setSelectedProductTabId(7);
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
    expect(product).toMatchObject({ id: 44 });
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

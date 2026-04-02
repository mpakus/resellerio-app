import { act, renderHook, waitFor } from '@testing-library/react-native';

import { pickImportArchive } from '@/src/features/transfers/archive';
import { createExport, createImport, getExport, getImport } from '@/src/features/transfers/api';
import { loadRecentExportIds, loadRecentImportIds, saveRecentExportIds, saveRecentImportIds } from '@/src/features/transfers/storage';
import { useTransfersOverview } from '@/src/features/transfers/use-transfers-overview';

jest.mock('@/src/features/transfers/archive', () => ({
  pickImportArchive: jest.fn(),
}));

jest.mock('@/src/features/transfers/api', () => ({
  createExport: jest.fn(),
  getExport: jest.fn(),
  createImport: jest.fn(),
  getImport: jest.fn(),
}));

jest.mock('@/src/features/transfers/storage', () => ({
  loadRecentExportIds: jest.fn(),
  loadRecentImportIds: jest.fn(),
  saveRecentExportIds: jest.fn(),
  saveRecentImportIds: jest.fn(),
  prependRecentTransferId: jest.requireActual('@/src/features/transfers/storage').prependRecentTransferId,
}));

const mockedPickImportArchive = jest.mocked(pickImportArchive);
const mockedCreateExport = jest.mocked(createExport);
const mockedGetExport = jest.mocked(getExport);
const mockedCreateImport = jest.mocked(createImport);
const mockedGetImport = jest.mocked(getImport);
const mockedLoadRecentExportIds = jest.mocked(loadRecentExportIds);
const mockedLoadRecentImportIds = jest.mocked(loadRecentImportIds);
const mockedSaveRecentExportIds = jest.mocked(saveRecentExportIds);
const mockedSaveRecentImportIds = jest.mocked(saveRecentImportIds);

describe('useTransfersOverview', () => {
  beforeAll(() => {
    jest.useFakeTimers();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  beforeEach(() => {
    jest.clearAllMocks();

    mockedLoadRecentExportIds.mockResolvedValue([11]);
    mockedLoadRecentImportIds.mockResolvedValue([21]);
    mockedGetExport.mockResolvedValue({
      data: {
        export: {
          id: 11,
          name: 'Catalog export',
          file_name: 'catalog.zip',
          filter_params: {},
          product_count: 12,
          status: 'completed',
          storage_key: 'users/1/exports/11/catalog.zip',
          download_url: 'https://cdn.example.test/catalog.zip',
          requested_at: '2026-04-02T00:00:00Z',
          completed_at: '2026-04-02T00:02:00Z',
          expires_at: '2026-04-09T00:02:00Z',
          error_message: null,
          inserted_at: '2026-04-02T00:00:00Z',
          updated_at: '2026-04-02T00:02:00Z',
        },
      },
    });
    mockedGetImport.mockResolvedValue({
      data: {
        import: {
          id: 21,
          status: 'completed',
          source_filename: 'catalog.zip',
          source_storage_key: 'users/1/imports/21/source.zip',
          requested_at: '2026-04-02T00:00:00Z',
          started_at: '2026-04-02T00:01:00Z',
          finished_at: '2026-04-02T00:04:00Z',
          total_products: 12,
          imported_products: 11,
          failed_products: 1,
          error_message: null,
          failure_details: {
            items: [],
          },
          payload: {},
          inserted_at: '2026-04-02T00:00:00Z',
          updated_at: '2026-04-02T00:04:00Z',
        },
      },
    });
    mockedPickImportArchive.mockResolvedValue({
      filename: 'catalog.zip',
      archiveBase64: 'YmFzZTY0LXppcA==',
    });
  });

  it('loads recent exports and imports from local history', async () => {
    const { result } = renderHook(() => useTransfersOverview('token-123'));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(mockedLoadRecentExportIds).toHaveBeenCalled();
    expect(mockedLoadRecentImportIds).toHaveBeenCalled();
    expect(mockedGetExport).toHaveBeenCalledWith('token-123', 11);
    expect(mockedGetImport).toHaveBeenCalledWith('token-123', 21);
    expect(result.current.recentExports[0]?.id).toBe(11);
    expect(result.current.recentImports[0]?.id).toBe(21);
  });

  it('starts a new export and persists it in recent history', async () => {
    mockedCreateExport.mockResolvedValue({
      data: {
        export: {
          id: 12,
          name: 'Ready inventory',
          file_name: 'ready-inventory.zip',
          filter_params: {},
          product_count: 5,
          status: 'queued',
          storage_key: null,
          download_url: null,
          requested_at: '2026-04-02T01:00:00Z',
          completed_at: null,
          expires_at: null,
          error_message: null,
          inserted_at: '2026-04-02T01:00:00Z',
          updated_at: '2026-04-02T01:00:00Z',
        },
      },
    });

    const { result } = renderHook(() => useTransfersOverview('token-123'));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    act(() => {
      result.current.setExportNameDraft('  Ready inventory  ');
    });

    await act(async () => {
      await result.current.startExport();
    });

    expect(mockedCreateExport).toHaveBeenCalledWith('token-123', '  Ready inventory  ');
    expect(mockedSaveRecentExportIds).toHaveBeenCalledWith([12, 11]);
    expect(result.current.recentExports[0]?.id).toBe(12);
    expect(result.current.exportNameDraft).toBe('');
  });

  it('starts a new import from a picked zip archive and persists it', async () => {
    mockedCreateImport.mockResolvedValue({
      data: {
        import: {
          id: 22,
          status: 'queued',
          source_filename: 'catalog.zip',
          source_storage_key: 'users/1/imports/22/source.zip',
          requested_at: '2026-04-02T01:00:00Z',
          started_at: null,
          finished_at: null,
          total_products: 0,
          imported_products: 0,
          failed_products: 0,
          error_message: null,
          failure_details: {},
          payload: {},
          inserted_at: '2026-04-02T01:00:00Z',
          updated_at: '2026-04-02T01:00:00Z',
        },
      },
    });

    const { result } = renderHook(() => useTransfersOverview('token-123'));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.startImport();
    });

    expect(mockedPickImportArchive).toHaveBeenCalled();
    expect(mockedCreateImport).toHaveBeenCalledWith(
      'token-123',
      'catalog.zip',
      'YmFzZTY0LXppcA==',
    );
    expect(mockedSaveRecentImportIds).toHaveBeenCalledWith([22, 21]);
    expect(result.current.recentImports[0]?.id).toBe(22);
  });

  it('polls recent jobs while any transfer is active and stops after completion', async () => {
    mockedLoadRecentExportIds.mockResolvedValue([31]);
    mockedLoadRecentImportIds.mockResolvedValue([]);
    mockedGetExport
      .mockResolvedValueOnce({
        data: {
          export: {
            id: 31,
            name: 'Queued export',
            file_name: 'queued-export.zip',
            filter_params: {},
            product_count: 2,
            status: 'queued',
            storage_key: null,
            download_url: null,
            requested_at: '2026-04-02T02:00:00Z',
            completed_at: null,
            expires_at: null,
            error_message: null,
            inserted_at: '2026-04-02T02:00:00Z',
            updated_at: '2026-04-02T02:00:00Z',
          },
        },
      })
      .mockResolvedValueOnce({
        data: {
          export: {
            id: 31,
            name: 'Queued export',
            file_name: 'queued-export.zip',
            filter_params: {},
            product_count: 2,
            status: 'completed',
            storage_key: 'users/1/exports/31/queued-export.zip',
            download_url: 'https://cdn.example.test/queued-export.zip',
            requested_at: '2026-04-02T02:00:00Z',
            completed_at: '2026-04-02T02:05:00Z',
            expires_at: '2026-04-09T02:05:00Z',
            error_message: null,
            inserted_at: '2026-04-02T02:00:00Z',
            updated_at: '2026-04-02T02:05:00Z',
          },
        },
      });

    const { result } = renderHook(() => useTransfersOverview('token-123'));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.isPolling).toBe(true);

    await act(async () => {
      jest.advanceTimersByTime(5000);
    });

    await waitFor(() => {
      expect(mockedGetExport).toHaveBeenCalledTimes(2);
    });

    await waitFor(() => {
      expect(result.current.recentExports[0]?.status).toBe('completed');
    });

    expect(result.current.isPolling).toBe(false);

    await act(async () => {
      jest.advanceTimersByTime(5000);
    });

    expect(mockedGetExport).toHaveBeenCalledTimes(2);
  });
});

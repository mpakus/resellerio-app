import {
  describeExportJob,
  describeImportJob,
  formatTransferStatus,
  hasActiveTransfers,
} from '@/src/features/transfers/helpers';

describe('transfer helpers', () => {
  it('detects active exports and imports', () => {
    expect(
      hasActiveTransfers(
        [
          {
            id: '1',
            name: 'Catalog',
            file_name: null,
            filter_params: {},
            product_count: null,
            status: 'queued',
            storage_key: null,
            download_url: null,
            requested_at: null,
            completed_at: null,
            expires_at: null,
            error_message: null,
            inserted_at: null,
            updated_at: null,
          },
        ],
        [],
      ),
    ).toBe(true);
  });

  it('formats transfer details for export and import cards', () => {
    expect(
      describeExportJob({
        id: '9',
        name: null,
        file_name: 'catalog.zip',
        filter_params: {
          query: 'fila',
          status: 'ready',
        },
        product_count: 4,
        status: 'completed',
        storage_key: 'users/1/exports/9/catalog.zip',
        download_url: 'https://cdn.example.test/catalog.zip',
        requested_at: null,
        completed_at: null,
        expires_at: null,
        error_message: null,
        inserted_at: null,
        updated_at: null,
      }),
    ).toBe('4 products · status ready · query "fila"');

    expect(
      describeImportJob({
        id: '4',
        status: 'completed',
        source_filename: 'catalog.zip',
        source_storage_key: 'users/1/imports/4/source.zip',
        requested_at: null,
        started_at: null,
        finished_at: null,
        total_products: 10,
        imported_products: 8,
        failed_products: 2,
        error_message: null,
        failure_details: {},
        payload: {},
        inserted_at: null,
        updated_at: null,
      }),
    ).toBe('8/10 imported · 2 failed');

    expect(formatTransferStatus('in_progress')).toBe('In Progress');
  });
});

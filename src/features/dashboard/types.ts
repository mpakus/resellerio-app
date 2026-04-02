import type { ProductSummary } from '@/src/features/products/types';

export type DashboardOverview = {
  totalProducts: number;
  readyProducts: number;
  processingProducts: number;
  inquiries: number;
  trackedExports: number;
  trackedImports: number;
  recentProducts: ProductSummary[];
};

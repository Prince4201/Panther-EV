'use client';
import { AuthProvider } from '@/components/auth/AuthProvider';
import { CartProvider } from '@/components/cart/CartProvider';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { CatalogProvider } from '@/components/catalog/CatalogProvider';
import { QuickEnquiryProvider } from '@/components/enquiry/QuickEnquiryProvider';
import type { Catalog } from '@/types/product';

export function Providers({ children, catalog }: { children: React.ReactNode; catalog?: Catalog }) {
  return <AuthProvider><CatalogProvider catalog={catalog}><CartProvider><QuickEnquiryProvider>{children}<CartDrawer /></QuickEnquiryProvider></CartProvider></CatalogProvider></AuthProvider>;
}

import React from 'react';
import { CatalogMenu } from '@/components/layout/CatalogMenu';

export default function ProductsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-brand-dark-950">
      <div className="hidden md:block w-64 border-r bg-white dark:bg-brand-dark-900">
        <CatalogMenu />
      </div>
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
}

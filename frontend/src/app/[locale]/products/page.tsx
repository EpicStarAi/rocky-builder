'use client';

import {useTranslations} from 'next-intl';
import {usePathname} from 'next/navigation';
import Link from 'next/link';
import {Header} from '@/components/layout/Header';
import {Footer} from '@/components/layout/Footer';
import {categories, products} from '@/data/products';
import {ArrowRight, Package} from 'lucide-react';

export default function ProductsPage() {
  const t = useTranslations();
  const pathname = usePathname();
  const locale = pathname.split('/')[1];

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50">
        {/* Page Header */}
        <section className="bg-brand-dark-900 text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl lg:text-4xl font-bold">{t('navigation.catalog')}</h1>
            <p className="mt-2 text-gray-400">
              {locale === 'ru'
                ? `${products.length} товаров в ${categories.length} категориях`
                : `${products.length} товарів у ${categories.length} категоріях`}
            </p>
          </div>
        </section>

        {/* Categories Grid */}
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">
              {locale === 'ru' ? 'Категории товаров' : 'Категорії товарів'}
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {categories.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/${locale}/products/${cat.slug}`}
                  className="group relative rounded-xl overflow-hidden bg-white border border-gray-200 hover:shadow-lg hover:border-brand-gold-300 transition-all"
                >
                  <div className="aspect-[16/9] overflow-hidden bg-gray-100">
                    {cat.image ? (
                      <img
                        src={cat.image}
                        alt={locale === 'ru' ? cat.nameRu : cat.nameUa}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-12 h-12 text-gray-300" />
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-brand-gold-600 transition-colors flex items-center gap-2">
                      {locale === 'ru' ? cat.nameRu : cat.nameUa}
                      <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {cat.productCount} {locale === 'ru' ? 'товаров' : 'товарів'}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

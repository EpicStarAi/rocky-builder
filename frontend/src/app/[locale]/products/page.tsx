'use client';

import {useTranslations} from 'next-intl';
import {usePathname} from 'next/navigation';
import Link from 'next/link';
import {Header} from '@/components/layout/Header';
import {Footer} from '@/components/layout/Footer';
import {categories, products} from '@/data/products';
import {ProductCard} from '@/components/product/ProductCard';
import {ArrowRight} from 'lucide-react';

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
                ? 'Профессиональные строительные материалы от ведущих производителей'
                : 'Професійні будівельні матеріали від провідних виробників'}
            </p>
          </div>
        </section>

        {/* Categories */}
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">
              {locale === 'ru' ? 'Категории' : 'Категорії'}
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
              {categories.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/${locale}/products/${cat.slug}`}
                  className="group relative rounded-xl overflow-hidden bg-white border border-gray-200 hover:shadow-lg hover:border-brand-gold-300 transition-all"
                >
                  <div className="aspect-[16/9] overflow-hidden">
                    <img
                      src={cat.image}
                      alt={locale === 'ru' ? cat.nameRu : cat.nameUa}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                  </div>
                  <div className="p-5">
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-brand-gold-600 transition-colors flex items-center gap-2">
                      {locale === 'ru' ? cat.nameRu : cat.nameUa}
                      <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                    </h3>
                    <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                      {locale === 'ru' ? cat.descriptionRu : cat.descriptionUa}
                    </p>
                  </div>
                </Link>
              ))}
            </div>

            {/* All Products */}
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {locale === 'ru' ? 'Все товары' : 'Усі товари'}
            </h2>
            <p className="text-gray-500 mb-8">
              {locale === 'ru'
                ? `${products.length} товаров в каталоге`
                : `${products.length} товарів у каталозі`}
            </p>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  slug={product.slug}
                  name={locale === 'ru' ? product.nameRu : product.name}
                  description={locale === 'ru' ? product.descriptionRu : product.description}
                  price={product.price}
                  oldPrice={product.oldPrice}
                  unit={product.unit}
                  image={product.image}
                  inStock={product.inStock}
                  specs={product.specs}
                  locale={locale}
                  categorySlug={product.category}
                />
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

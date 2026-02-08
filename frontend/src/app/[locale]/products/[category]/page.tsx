'use client';

import {useTranslations} from 'next-intl';
import {usePathname, useParams} from 'next/navigation';
import Link from 'next/link';
import {Header} from '@/components/layout/Header';
import {Footer} from '@/components/layout/Footer';
import {categories, products} from '@/data/products';
import {ProductCard} from '@/components/product/ProductCard';
import {ChevronRight, SlidersHorizontal} from 'lucide-react';
import {useState} from 'react';

type SortOption = 'popular' | 'price-asc' | 'price-desc' | 'newest';

export default function CategoryPage() {
  const t = useTranslations();
  const pathname = usePathname();
  const params = useParams();
  const locale = pathname.split('/')[1];
  const categorySlug = params.category as string;

  const [sortBy, setSortBy] = useState<SortOption>('popular');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [visibleCount, setVisibleCount] = useState(24);

  const category = categories.find((c) => c.slug === categorySlug);
  const categoryProducts = products.filter((p) => p.category === categorySlug);

  const filteredProducts = categoryProducts
    .filter((p) => (inStockOnly ? p.inStock : true))
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-asc': return a.price - b.price;
        case 'price-desc': return b.price - a.price;
        default: return 0;
      }
    });

  if (!category) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gray-50 dark:bg-brand-dark-950 flex items-center justify-center">
          <div className="text-center space-y-4">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {locale === 'ru' ? 'Категория не найдена' : 'Категорію не знайдено'}
            </h1>
            <Link
              href={`/${locale}/products`}
              className="inline-block px-6 py-3 bg-brand-gold-500 text-brand-dark-900 font-medium rounded-lg hover:bg-brand-gold-400 transition-colors"
            >
              {locale === 'ru' ? 'Вернуться в каталог' : 'Повернутися до каталогу'}
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 dark:bg-brand-dark-950">
        {/* Breadcrumb */}
        <div className="bg-white dark:bg-brand-dark-900 border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <nav className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <Link href={`/${locale}`} className="hover:text-brand-gold-600 transition-colors">
                {locale === 'ru' ? 'Главная' : 'Головна'}
              </Link>
              <ChevronRight className="w-4 h-4" />
              <Link href={`/${locale}/products`} className="hover:text-brand-gold-600 transition-colors">
                {t('navigation.catalog')}
              </Link>
              <ChevronRight className="w-4 h-4" />
              <span className="text-gray-900 dark:text-white font-medium">
                {locale === 'ru' ? category.nameRu : category.nameUa}
              </span>
            </nav>
          </div>
        </div>

        {/* Category Header */}
        <section className="bg-brand-dark-900 text-white py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold">
              {locale === 'ru' ? category.nameRu : category.nameUa}
            </h1>
            <p className="mt-2 text-gray-400 max-w-2xl">
              {locale === 'ru' ? category.descriptionRu : category.descriptionUa}
            </p>
          </div>
        </section>

        {/* Toolbar */}
        <section className="bg-white dark:bg-brand-dark-900 border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {locale === 'ru'
                  ? `${filteredProducts.length} товаров`
                  : `${filteredProducts.length} товарів`}
              </p>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={(e) => setInStockOnly(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-brand-gold-500 focus:ring-brand-gold-500 dark:bg-brand-dark-800"
                  />
                  {t('products.inStockOnly')}
                </label>

                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-gray-400" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    className="text-sm border-gray-300 dark:border-gray-600 dark:bg-brand-dark-800 dark:text-gray-300 rounded-lg focus:ring-brand-gold-500 focus:border-brand-gold-500"
                  >
                    <option value="popular">{t('products.sort.popular')}</option>
                    <option value="price-asc">{t('products.sort.priceLowToHigh')}</option>
                    <option value="price-desc">{t('products.sort.priceHighToLow')}</option>
                    <option value="newest">{t('products.sort.newest')}</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Products Grid */}
        <section className="py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {filteredProducts.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-lg text-gray-500 dark:text-gray-400">
                  {locale === 'ru' ? 'Товаров не найдено' : 'Товарів не знайдено'}
                </p>
              </div>
            ) : (
              <>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredProducts.slice(0, visibleCount).map((product) => (
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
                      categorySlug={categorySlug}
                    />
                  ))}
                </div>
                {visibleCount < filteredProducts.length && (
                  <div className="text-center mt-10">
                    <button
                      onClick={() => setVisibleCount(prev => prev + 24)}
                      className="px-8 py-3 bg-brand-gold-500 text-brand-dark-900 font-medium rounded-lg hover:bg-brand-gold-400 transition-colors"
                    >
                      {locale === 'ru'
                        ? `Показать ещё (${Math.min(24, filteredProducts.length - visibleCount)} из ${filteredProducts.length - visibleCount})`
                        : `Показати ще (${Math.min(24, filteredProducts.length - visibleCount)} з ${filteredProducts.length - visibleCount})`}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

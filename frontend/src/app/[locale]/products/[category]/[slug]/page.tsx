'use client';

import {useTranslations} from 'next-intl';
import {usePathname, useParams} from 'next/navigation';
import Link from 'next/link';
import {Header} from '@/components/layout/Header';
import {Footer} from '@/components/layout/Footer';
import {categories, products} from '@/data/products';
import {ChevronRight, ShoppingCart, Phone, Truck, Shield, ArrowLeft} from 'lucide-react';
import {useState} from 'react';

export default function ProductPage() {
  const t = useTranslations();
  const pathname = usePathname();
  const params = useParams();
  const locale = pathname.split('/')[1];
  const categorySlug = params.category as string;
  const productSlug = params.slug as string;

  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const product = products.find((p) => p.slug === productSlug);
  const category = categories.find((c) => c.slug === categorySlug);

  // Related products
  const relatedProducts = products.filter(
    (p) => p.category === categorySlug && p.slug !== productSlug
  ).slice(0, 4);

  if (!product) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gray-50 dark:bg-brand-dark-950 flex items-center justify-center">
          <div className="text-center space-y-4">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {locale === 'ru' ? 'Товар не найден' : 'Товар не знайдено'}
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

  const name = locale === 'ru' ? product.nameRu : product.name;
  const description = locale === 'ru' ? product.descriptionRu : product.description;
  const categoryName = category ? (locale === 'ru' ? category.nameRu : category.nameUa) : categorySlug;
  const discount = product.oldPrice
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
    : 0;

  const images = [product.image];

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 dark:bg-brand-dark-950">
        {/* Breadcrumb */}
        <div className="bg-white dark:bg-brand-dark-900 border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <nav className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 flex-wrap">
              <Link href={`/${locale}`} className="hover:text-brand-gold-600 transition-colors">
                {locale === 'ru' ? 'Главная' : 'Головна'}
              </Link>
              <ChevronRight className="w-4 h-4 flex-shrink-0" />
              <Link href={`/${locale}/products`} className="hover:text-brand-gold-600 transition-colors">
                {t('navigation.catalog')}
              </Link>
              <ChevronRight className="w-4 h-4 flex-shrink-0" />
              <Link href={`/${locale}/products/${categorySlug}`} className="hover:text-brand-gold-600 transition-colors">
                {categoryName}
              </Link>
              <ChevronRight className="w-4 h-4 flex-shrink-0" />
              <span className="text-gray-900 dark:text-white font-medium line-clamp-1">{name}</span>
            </nav>
          </div>
        </div>

        {/* Product Detail */}
        <section className="py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-10">
              {/* Images */}
              <div className="space-y-4">
                <div className="aspect-square rounded-xl overflow-hidden bg-white dark:bg-brand-dark-800 border border-gray-200 dark:border-gray-700">
                  <img
                    src={images[selectedImage]}
                    alt={name}
                    className="w-full h-full object-cover"
                  />
                </div>
                {images.length > 1 && (
                  <div className="flex gap-3">
                    {images.map((img, i) => (
                      <button
                        key={i}
                        onClick={() => setSelectedImage(i)}
                        className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                          i === selectedImage ? 'border-brand-gold-500' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                      >
                        <img src={img} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="space-y-6">
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">{name}</h1>
                  <p className="mt-1 text-sm text-gray-400">
                    {locale === 'ru' ? 'Артикул' : 'Артикул'}: {product.id.toUpperCase()}
                  </p>
                </div>

                {/* Price block */}
                <div className="bg-white dark:bg-brand-dark-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-4">
                  <div className="flex items-end gap-3">
                    <span className="text-3xl font-bold text-gray-900 dark:text-white">
                      {product.price.toLocaleString()} ₴
                    </span>
                    <span className="text-lg text-gray-400">/{product.unit}</span>
                    {discount > 0 && (
                      <span className="ml-2 bg-red-100 text-red-600 text-sm font-bold px-2.5 py-0.5 rounded-full">
                        -{discount}%
                      </span>
                    )}
                  </div>
                  {product.oldPrice && (
                    <p className="text-gray-400 line-through text-lg">
                      {product.oldPrice.toLocaleString()} ₴
                    </p>
                  )}

                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${product.inStock ? 'bg-green-500' : 'bg-red-500'}`} />
                    <span className={`text-sm font-medium ${product.inStock ? 'text-green-600' : 'text-red-600'}`}>
                      {product.inStock
                        ? (locale === 'ru' ? 'В наличии' : 'В наявності')
                        : (locale === 'ru' ? 'Нет в наличии' : 'Немає в наявності')}
                    </span>
                  </div>

                  {/* Quantity + Add to cart */}
                  <div className="flex items-center gap-4 pt-2">
                    <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="px-3 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-brand-dark-700 transition-colors"
                      >
                        −
                      </button>
                      <span className="px-4 py-2 text-center min-w-[3rem] font-medium dark:text-white">{quantity}</span>
                      <button
                        onClick={() => setQuantity(quantity + 1)}
                        className="px-3 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-brand-dark-700 transition-colors"
                      >
                        +
                      </button>
                    </div>
                    <button
                      disabled={!product.inStock}
                      className="flex-1 flex items-center justify-center gap-2 px-6 py-3 text-base font-medium rounded-lg bg-brand-gold-500 text-brand-dark-900 hover:bg-brand-gold-400 disabled:bg-gray-200 dark:disabled:bg-gray-700 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
                    >
                      <ShoppingCart className="w-5 h-5" />
                      {locale === 'ru' ? 'В корзину' : 'До кошика'}
                    </button>
                  </div>

                  <button className="w-full py-3 text-base font-medium rounded-lg border-2 border-brand-gold-500 text-brand-gold-600 dark:text-brand-gold-400 hover:bg-brand-gold-50 dark:hover:bg-brand-gold-900/20 transition-colors">
                    {locale === 'ru' ? 'Быстрый заказ' : 'Швидке замовлення'}
                  </button>
                </div>

                {/* Advantages */}
                <div className="grid grid-cols-3 gap-4">
                  {[
                    {icon: Truck, text: locale === 'ru' ? 'Доставка по Украине' : 'Доставка по Україні'},
                    {icon: Shield, text: locale === 'ru' ? 'Гарантия качества' : 'Гарантія якості'},
                    {icon: Phone, text: locale === 'ru' ? 'Консультация' : 'Консультація'},
                  ].map((item, i) => (
                    <div key={i} className="text-center p-3 bg-white dark:bg-brand-dark-800 rounded-lg border border-gray-100 dark:border-gray-700">
                      <item.icon className="w-5 h-5 mx-auto text-brand-gold-500 mb-1" />
                      <p className="text-xs text-gray-600 dark:text-gray-400">{item.text}</p>
                    </div>
                  ))}
                </div>

                {/* Description */}
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {locale === 'ru' ? 'Описание' : 'Опис'}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{description}</p>
                </div>

                {/* Specs */}
                {product.specs && Object.keys(product.specs).length > 0 && (
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                      {locale === 'ru' ? 'Характеристики' : 'Характеристики'}
                    </h2>
                    <div className="bg-white dark:bg-brand-dark-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                      {Object.entries(product.specs).map(([key, value], i) => (
                        <div
                          key={key}
                          className={`flex items-center justify-between px-5 py-3.5 ${
                            i % 2 === 0 ? 'bg-gray-50 dark:bg-brand-dark-900' : 'bg-white dark:bg-brand-dark-800'
                          }`}
                        >
                          <span className="text-sm text-gray-500 dark:text-gray-400">{key}</span>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Related products */}
            {relatedProducts.length > 0 && (
              <div className="mt-16">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  {locale === 'ru' ? 'Похожие товары' : 'Схожі товари'}
                </h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {relatedProducts.map((rp) => (
                    <Link
                      key={rp.id}
                      href={`/${locale}/products/${rp.category}/${rp.slug}`}
                      className="group bg-white dark:bg-brand-dark-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-all"
                    >
                      <div className="aspect-square bg-gray-100 dark:bg-brand-dark-900 overflow-hidden">
                        <img
                          src={rp.image}
                          alt={locale === 'ru' ? rp.nameRu : rp.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                      </div>
                      <div className="p-4">
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2 group-hover:text-brand-gold-600 dark:group-hover:text-brand-gold-400 transition-colors">
                          {locale === 'ru' ? rp.nameRu : rp.name}
                        </h3>
                        <p className="mt-2 text-lg font-bold text-gray-900 dark:text-white">
                          {rp.price.toLocaleString()} ₴
                          <span className="text-sm font-normal text-gray-400 ml-1">/{rp.unit}</span>
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Back button */}
            <div className="mt-10">
              <Link
                href={`/${locale}/products/${categorySlug}`}
                className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-brand-gold-600 dark:hover:text-brand-gold-400 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                {locale === 'ru' ? 'Назад к категории' : 'Назад до категорії'}
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

'use client';

import Link from 'next/link';
import {ShoppingCart, Eye} from 'lucide-react';

interface ProductCardProps {
  slug: string;
  name: string;
  description: string;
  price: number;
  oldPrice?: number;
  unit: string;
  image: string;
  inStock: boolean;
  specs?: Record<string, string>;
  locale: string;
  categorySlug: string;
}

export function ProductCard({
  slug,
  name,
  description,
  price,
  oldPrice,
  unit,
  image,
  inStock,
  specs,
  locale,
  categorySlug,
}: ProductCardProps) {
  const discount = oldPrice ? Math.round(((oldPrice - price) / oldPrice) * 100) : 0;

  return (
    <div className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg hover:border-brand-gold-300 transition-all duration-300">
      {/* Image */}
      <Link href={`/${locale}/products/${categorySlug}/${slug}`} className="block relative aspect-square overflow-hidden bg-gray-100">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        {discount > 0 && (
          <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
            -{discount}%
          </span>
        )}
        {!inStock && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="bg-white text-gray-800 text-sm font-medium px-4 py-2 rounded-lg">
              {locale === 'ru' ? 'Нет в наличии' : 'Немає в наявності'}
            </span>
          </div>
        )}
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
          <span className="bg-white/90 backdrop-blur-sm text-gray-900 text-sm font-medium px-4 py-2 rounded-lg flex items-center gap-2">
            <Eye className="w-4 h-4" />
            {locale === 'ru' ? 'Подробнее' : 'Детальніше'}
          </span>
        </div>
      </Link>

      {/* Content */}
      <div className="p-4 space-y-3">
        <Link href={`/${locale}/products/${categorySlug}/${slug}`}>
          <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 group-hover:text-brand-gold-600 transition-colors min-h-[2.5rem]">
            {name}
          </h3>
        </Link>

        <p className="text-xs text-gray-500 line-clamp-2 min-h-[2rem]">
          {description}
        </p>

        {/* Specs preview */}
        {specs && Object.keys(specs).length > 0 && (
          <div className="space-y-1">
            {Object.entries(specs).slice(0, 3).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between text-xs">
                <span className="text-gray-400">{key}</span>
                <span className="text-gray-600 font-medium">{value}</span>
              </div>
            ))}
          </div>
        )}

        {/* Price */}
        <div className="pt-2 border-t border-gray-100">
          <div className="flex items-end gap-2">
            <span className="text-xl font-bold text-gray-900">
              {price.toLocaleString()} ₴
            </span>
            <span className="text-sm text-gray-400">/{unit}</span>
          </div>
          {oldPrice && (
            <span className="text-sm text-gray-400 line-through">
              {oldPrice.toLocaleString()} ₴
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-1">
          <button
            disabled={!inStock}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg bg-brand-gold-500 text-brand-dark-900 hover:bg-brand-gold-400 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            <ShoppingCart className="w-4 h-4" />
            {locale === 'ru' ? 'В корзину' : 'До кошика'}
          </button>
        </div>
      </div>
    </div>
  );
}

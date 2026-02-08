'use client';

import {useTranslations} from 'next-intl';
import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {useState} from 'react';
import {ShoppingCart, Search, Menu, X, Phone, User} from 'lucide-react';
import {ThemeToggle} from '@/components/ui/ThemeToggle';

export function Header() {
  const t = useTranslations();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const locale = pathname.split('/')[1];

  const navigation = [
    {name: locale === 'ru' ? 'Термопанели' : 'Термопанелі', href: `/${locale}/products/termopaneli-fasadni`},
    {name: locale === 'ru' ? 'Сайдинг' : 'Сайдинг', href: `/${locale}/products/saiding`},
    {name: locale === 'ru' ? 'Черепица' : 'Черепиця', href: `/${locale}/products/cherepytsya`},
    {name: locale === 'ru' ? 'Профнастил' : 'Профнастил', href: `/${locale}/products/profnastyl`},
    {name: locale === 'ru' ? 'Каталог' : 'Каталог', href: `/${locale}/products`},
    {name: t('navigation.delivery'), href: `/${locale}/delivery`},
  ];

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-brand-dark-900 border-b border-gray-200 dark:border-gray-700">
      {/* Top Bar */}
      <div className="bg-brand-dark-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-10 text-sm">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <a href="tel:+380501234567" className="hover:text-brand-gold-400 transition-colors">
                  {t('header.phone')}
                </a>
              </div>
              <span className="hidden md:block text-gray-400">
                {t('header.workingHours')}
              </span>
            </div>
            
            <div className="flex items-center gap-4">
              <Link
                href={pathname.replace(`/${locale}`, '/ua')}
                className={locale === 'ua' ? 'text-brand-gold-400 font-medium' : 'hover:text-brand-gold-400'}
              >
                UA
              </Link>
              <span className="text-gray-600">|</span>
              <Link
                href={pathname.replace(`/${locale}`, '/ru')}
                className={locale === 'ru' ? 'text-brand-gold-400 font-medium' : 'hover:text-brand-gold-400'}
              >
                RU
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href={`/${locale}`} className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-gradient-gold flex items-center justify-center">
              <span className="text-2xl font-bold text-brand-dark-900">RB</span>
            </div>
            <div>
              <div className="text-xl font-bold text-gray-900 dark:text-white">ROCKY BUILDER</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">{t('header.slogan')}</div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-brand-gold-600 dark:hover:text-brand-gold-400 transition-colors"
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <button className="p-2 text-gray-700 dark:text-gray-300 hover:text-brand-gold-600 dark:hover:text-brand-gold-400 transition-colors">
              <Search className="w-5 h-5" />
            </button>
            <Link
              href={`/${locale}/account`}
              className="hidden sm:flex p-2 text-gray-700 dark:text-gray-300 hover:text-brand-gold-600 dark:hover:text-brand-gold-400 transition-colors"
            >
              <User className="w-5 h-5" />
            </Link>
            <Link
              href={`/${locale}/cart`}
              className="relative p-2 text-gray-700 dark:text-gray-300 hover:text-brand-gold-600 dark:hover:text-brand-gold-400 transition-colors"
            >
              <ShoppingCart className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-brand-gold-500 text-brand-dark-900 text-xs font-bold rounded-full flex items-center justify-center">
                0
              </span>
            </Link>
            
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-gray-700 dark:text-gray-300"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-brand-dark-900">
          <nav className="px-4 py-4 space-y-2">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block px-4 py-3 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-brand-dark-800 rounded-lg"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}

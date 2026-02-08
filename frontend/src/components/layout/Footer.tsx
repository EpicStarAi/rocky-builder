'use client';

import {useTranslations} from 'next-intl';
import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {Phone, Mail, MapPin} from 'lucide-react';

export function Footer() {
  const t = useTranslations();
  const pathname = usePathname();
  const locale = pathname.split('/')[1];

  return (
    <footer className="bg-brand-dark-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* About */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-brand-gold-400">
              {t('footer.about.title')}
            </h3>
            <p className="text-gray-400 text-sm">
              {t('footer.about.description')}
            </p>
          </div>

          {/* Contacts */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-brand-gold-400">
              {t('footer.contacts.title')}
            </h3>
            <div className="space-y-3 text-sm">
              <a
                href="https://maps.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-2 text-gray-400 hover:text-white transition-colors"
              >
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{t('footer.contacts.address')}</span>
              </a>
              <a
                href={`tel:${t('footer.contacts.phone')}`}
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
              >
                <Phone className="w-4 h-4 flex-shrink-0" />
                <span>{t('footer.contacts.phone')}</span>
              </a>
              <a
                href={`mailto:${t('footer.contacts.email')}`}
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
              >
                <Mail className="w-4 h-4 flex-shrink-0" />
                <span>{t('footer.contacts.email')}</span>
              </a>
            </div>
          </div>

          {/* Working Hours */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-brand-gold-400">
              {t('footer.workingHours.title')}
            </h3>
            <div className="space-y-2 text-sm text-gray-400">
              <p>{t('footer.workingHours.weekdays')}</p>
              <p>{t('footer.workingHours.saturday')}</p>
              <p>{t('footer.workingHours.sunday')}</p>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-brand-gold-400">
              Швидкі посилання
            </h3>
            <nav className="space-y-2 text-sm">
              <Link
                href={`/${locale}/products`}
                className="block text-gray-400 hover:text-white transition-colors"
              >
                {t('common.catalog')}
              </Link>
              <Link
                href={`/${locale}/calculators`}
                className="block text-gray-400 hover:text-white transition-colors"
              >
                {t('navigation.calculators')}
              </Link>
              <Link
                href={`/${locale}/delivery`}
                className="block text-gray-400 hover:text-white transition-colors"
              >
                {t('navigation.delivery')}
              </Link>
              <Link
                href={`/${locale}/contacts`}
                className="block text-gray-400 hover:text-white transition-colors"
              >
                {t('navigation.contacts')}
              </Link>
            </nav>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8">
          <p className="text-center text-sm text-gray-400">
            {t('footer.copyright')}
          </p>
        </div>
      </div>
    </footer>
  );
}

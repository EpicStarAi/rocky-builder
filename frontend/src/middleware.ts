import createMiddleware from 'next-intl/middleware';
import {locales} from './i18n';

export default createMiddleware({
  // Список всіх доступних локалей
  locales,
  
  // Локаль за замовчуванням
  defaultLocale: 'ua',
  
  // Завжди показувати префікс локалі в URL
  localePrefix: 'always',
  
  // Автоматичне визначення локалі на основі Accept-Language заголовка
  localeDetection: true,
});

export const config = {
  // Застосовувати middleware до всіх маршрутів крім статичних файлів та API
  matcher: ['/', '/(ua|ru)/:path*', '/((?!api|_next|_vercel|.*\\..*).*)']
};

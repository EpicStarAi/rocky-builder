import {getRequestConfig} from 'next-intl/server';
import {notFound} from 'next/navigation';

// Доступні локалі
export const locales = ['ua', 'ru'] as const;
export type Locale = typeof locales[number];

export default getRequestConfig(async ({requestLocale}) => {
  const locale = await requestLocale;

  if (!locale || !locales.includes(locale as any)) notFound();

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
    timeZone: 'Europe/Kiev',
    now: new Date()
  };
});

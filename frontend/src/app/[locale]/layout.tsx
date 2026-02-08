import {NextIntlClientProvider} from 'next-intl';
import {getMessages} from 'next-intl/server';
import {Inter} from 'next/font/google';
import '../globals.css';

const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata = {
  title: {
    template: '%s | ROCKY BUILDER',
    default: 'ROCKY BUILDER - Професійні будівельні матеріали',
  },
  description: 'Комплексні рішення для покрівлі, фасаду та огорожі. Якість європейських виробників за доступними цінами.',
  keywords: ['будівельні матеріали', 'покрівля', 'фасад', 'огорожа', 'термопанелі', 'сайдинг'],
};

export default async function LocaleLayout({
  children,
  params: {locale}
}: {
  children: React.ReactNode;
  params: {locale: string};
}) {
  // Отримуємо повідомлення для поточної локалі
  const messages = await getMessages();

  return (
    <html lang={locale} className={inter.variable}>
      <body className="min-h-screen bg-gray-50 antialiased">
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

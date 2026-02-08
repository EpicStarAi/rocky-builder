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
  description: 'Комплексні рішення для покрівлі та фасаду. Якість європейських виробників за доступними цінами.',
  keywords: ['будівельні матеріали', 'покрівля', 'фасад', 'термопанелі', 'сайдинг'],
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;
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

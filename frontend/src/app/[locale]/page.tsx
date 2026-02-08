import {useTranslations} from 'next-intl';
import Link from 'next/link';
import {ArrowRight, Shield, Truck, HeadphonesIcon, TrendingDown} from 'lucide-react';
import {Header} from '@/components/layout/Header';
import {Footer} from '@/components/layout/Footer';

export default function HomePage() {
  const t = useTranslations();

  return (
    <>
      <Header />
      <main>
        {/* Hero Section */}
        <section className="relative bg-gradient-dark text-white overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 bg-[url('/images/pattern-construction.svg')] bg-repeat opacity-20" />
          </div>
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-8">
                <div className="space-y-4">
                  <h1 className="text-5xl lg:text-7xl font-bold">
                    <span className="block">{t('home.hero.title')}</span>
                  </h1>
                  <p className="text-xl lg:text-2xl text-gray-300 font-medium">
                    {t('home.hero.subtitle')}
                  </p>
                  <p className="text-lg text-gray-400 max-w-xl">
                    {t('home.hero.description')}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Link
                    href="/products"
                    className="inline-flex items-center justify-center px-8 py-4 text-base font-medium rounded-lg text-gray-900 bg-brand-gold-500 hover:bg-brand-gold-400 transition-colors group"
                  >
                    {t('home.hero.ctaPrimary')}
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link
                    href="/calculators"
                    className="inline-flex items-center justify-center px-8 py-4 text-base font-medium rounded-lg text-white bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 transition-colors"
                  >
                    {t('home.hero.ctaSecondary')}
                  </Link>
                </div>
              </div>

              <div className="relative">
                <div className="aspect-square rounded-2xl bg-gradient-to-br from-brand-gold-500 to-brand-gold-700 p-1">
                  <div className="w-full h-full rounded-xl bg-brand-dark-900 flex items-center justify-center">
                    <img
                      src="/images/rocky-builder-logo.svg"
                      alt="ROCKY BUILDER"
                      className="w-3/4 h-3/4 object-contain"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  icon: Shield,
                  title: t('home.features.quality.title'),
                  description: t('home.features.quality.description'),
                },
                {
                  icon: Truck,
                  title: t('home.features.delivery.title'),
                  description: t('home.features.delivery.description'),
                },
                {
                  icon: HeadphonesIcon,
                  title: t('home.features.support.title'),
                  description: t('home.features.support.description'),
                },
                {
                  icon: TrendingDown,
                  title: t('home.features.prices.title'),
                  description: t('home.features.prices.description'),
                },
              ].map((feature, index) => (
                <div
                  key={index}
                  className="text-center space-y-4 p-6 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-brand-gold-100">
                    <feature.icon className="w-8 h-8 text-brand-gold-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Categories Preview */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                {t('navigation.catalog')}
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Широкий асортимент будівельних матеріалів для будь-яких проектів
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {slug: 'pokrivlya', name: t('navigation.roofing'), image: '/images/categories/roofing.jpg'},
                {slug: 'fasad', name: t('navigation.facade'), image: '/images/categories/facade.jpg'},
                {slug: 'ogoroja', name: t('navigation.fence'), image: '/images/categories/fence.jpg'},
              ].map((category) => (
                <Link
                  key={category.slug}
                  href={`/products/${category.slug}`}
                  className="group relative aspect-[4/3] rounded-xl overflow-hidden bg-gray-200"
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
                  <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
                    <h3 className="text-2xl font-bold text-white group-hover:text-brand-gold-400 transition-colors">
                      {category.name}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

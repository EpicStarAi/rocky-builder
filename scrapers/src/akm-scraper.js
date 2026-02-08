/**
 * ROCKY BUILDER — Скрапер для akm.kiev.ua (Азбука Покрівельних Матеріалів)
 *
 * Парсить:
 *  ─ Металочерепиця   (всі підкатегорії)
 *  ─ Профнастил        (всі підкатегорії)
 *  ─ Бітумна черепиця  (aquaizol, iko, tegola, kerabit, btm)
 *  ─ Водостічні системи (profil, rainway, bryza)
 *  ─ Сайдинг           (якщо є)
 *
 * Для кожного товару збирає:
 *   назва, ціна, одиниця, фото, категорія/підкатегорія,
 *   характеристики (товщина, покриття, виробник, гарантія, оцинкування, колір RAL),
 *   SKU, наявність, URL
 */

const cheerio = require('cheerio');
const pLimit = require('p-limit');
const {
  logger,
  fetchPage,
  sleep,
  parsePrice,
  parseUnit,
  slugify,
  saveJSON,
  saveCSV,
} = require('./utils');

// ═══════════════════════════════════════════════════════════════════════
// Конфігурація категорій
// ═══════════════════════════════════════════════════════════════════════
const BASE = 'https://akm.kiev.ua';

const CATEGORIES = [
  // ── Металочерепиця ──────────────────────────────
  {
    category: 'Металочерепиця',
    subcategory: 'Monterrey',
    url: '/ua/metallocherepitsa/monterrey/',
  },
  {
    category: 'Металочерепиця',
    subcategory: 'Premium',
    url: '/ua/metallocherepitsa/premium/',
  },
  {
    category: 'Металочерепиця',
    subcategory: 'Retro',
    url: '/ua/metallocherepitsa/retro/',
  },
  {
    category: 'Металочерепиця',
    subcategory: 'Maxima',
    url: '/ua/metallocherepitsa/maxima/',
  },
  {
    category: 'Металочерепиця',
    subcategory: 'Venera',
    url: '/ua/metallocherepitsa/venera/',
  },
  {
    category: 'Металочерепиця',
    subcategory: 'Madera',
    url: '/ua/metallocherepitsa/madera/',
  },
  {
    category: 'Металочерепиця',
    subcategory: 'Modern',
    url: '/ua/metallocherepitsa/modern/',
  },
  {
    category: 'Металочерепиця',
    subcategory: 'Модульна',
    url: '/ua/metallocherepitsa/modulnaya/',
  },

  // ── Профнастил ──────────────────────────────────
  {
    category: 'Профнастил',
    subcategory: 'ПС-07',
    url: '/ua/profnastil/profnastil-ps-07/',
  },
  {
    category: 'Профнастил',
    subcategory: 'ПС-08',
    url: '/ua/profnastil/profnastil-ps-08/',
  },
  {
    category: 'Профнастил',
    subcategory: 'ПС-10',
    url: '/ua/profnastil/profnastil-ps-10/',
  },
  {
    category: 'Профнастил',
    subcategory: 'ПС/ПК-15',
    url: '/ua/profnastil/profnastil-ps-pk-15/',
  },
  {
    category: 'Профнастил',
    subcategory: 'ПС/ПК-18',
    url: '/ua/profnastil/profnastil-ps-pk-18/',
  },
  {
    category: 'Профнастил',
    subcategory: 'ПС/ПК-20',
    url: '/ua/profnastil/profnastil-ps-pk-20/',
  },
  {
    category: 'Профнастил',
    subcategory: 'ПК-35',
    url: '/ua/profnastil/profnastil-pk-35/',
  },
  {
    category: 'Профнастил',
    subcategory: 'Т-40',
    url: '/ua/profnastil/profnastil-pk-40/',
  },
  {
    category: 'Профнастил',
    subcategory: 'Т-45',
    url: '/ua/profnastil/profnastil-pk-45/',
  },
  {
    category: 'Профнастил',
    subcategory: 'Н-57',
    url: '/ua/profnastil/profnastil-h-57/',
  },
  {
    category: 'Профнастил',
    subcategory: 'Н-75',
    url: '/ua/profnastil/profnastil-h-75/',
  },
  {
    category: 'Профнастил',
    subcategory: 'Н-92',
    url: '/ua/profnastil/profnastil-h-92/',
  },

  // ── Бітумна черепиця ────────────────────────────
  {
    category: 'Бітумна черепиця',
    subcategory: 'Aquaizol',
    url: '/ua/bitumnaya-cherepitsa/aquaizol/',
  },
  {
    category: 'Бітумна черепиця',
    subcategory: 'IKO',
    url: '/ua/bitumnaya-cherepitsa/iko/',
  },
  {
    category: 'Бітумна черепиця',
    subcategory: 'Tegola',
    url: '/ua/bitumnaya-cherepitsa/tegola/',
  },
  {
    category: 'Бітумна черепиця',
    subcategory: 'Kerabit',
    url: '/ua/bitumnaya-cherepitsa/kerabit/',
  },
  {
    category: 'Бітумна черепиця',
    subcategory: 'BTM',
    url: '/ua/bitumnaya-cherepitsa/btm/',
  },

  // ── Водостічні системи ──────────────────────────
  {
    category: 'Водостічні системи',
    subcategory: 'Profil',
    url: '/ua/vodostochnye-sistemy/profil/',
  },
  {
    category: 'Водостічні системи',
    subcategory: 'Rainway',
    url: '/ua/vodostochnye-sistemy/rainway/',
  },
  {
    category: 'Водостічні системи',
    subcategory: 'Bryza',
    url: '/ua/vodostochnye-sistemy/bryza/',
  },

  // ── Сайдинг ─────────────────────────────────────
  {
    category: 'Сайдинг',
    subcategory: 'Загальні',
    url: '/ua/sayding/',
  },
];

// ═══════════════════════════════════════════════════════════════════════
// Парсинг сторінки зі списком товарів
// ═══════════════════════════════════════════════════════════════════════

/**
 * Витягує перелік карток товарів з однієї сторінки каталогу.
 * Повертає масив { name, sku, price, unit, stock, url, image, colors, shortSpec }.
 */
function parseProductList(html, catInfo) {
  const $ = cheerio.load(html);
  const products = [];

  // Кожна карточка товару — блок з h4 > a (назва + посилання), SKU, ціна, зображення
  // AKM використовує OpenCart-подібну розмітку
  // Шукаємо все, що містить SKU-патерн та лінк на товар
  $('h4 a[href]').each((_i, el) => {
    const $a = $(el);
    const name = $a.text().trim();
    const href = $a.attr('href');
    if (!name || !href) return;

    // Шукаємо батьківський контейнер картки
    const $card = $a.closest('.product-layout, .product-thumb, [class*="product"]')
                  || $a.parent().parent().parent();

    // SKU — шукаємо текст "SKU XXXX"
    const cardText = $card.text();
    const skuMatch = cardText.match(/SKU\s*(\w+)/i);
    const sku = skuMatch ? skuMatch[1] : '';

    // Ціна — шукаємо паттерн «NNN грн/м²» або «NNN грн/шт»
    const priceMatch = cardText.match(/([\d\s,.]+)\s*грн\s*\/\s*(м²|м2|шт|м\.п|уп)/i);
    const price = priceMatch ? parsePrice(priceMatch[1]) : null;
    const unit = priceMatch ? parseUnit(priceMatch[2]) : 'м²';

    // Стара ціна (перекреслена)
    const oldPriceMatch = cardText.match(/([\d\s,.]+)\s*грн\s*\/\s*(м²|м2|шт|м\.п|уп).*?([\d\s,.]+)\s*грн/i);
    let oldPrice = null;
    // Деякі картки мають 2 ціни: нову і стару
    const allPrices = cardText.match(/([\d,.]+)\s*грн/g);
    if (allPrices && allPrices.length >= 2) {
      const p1 = parsePrice(allPrices[0]);
      const p2 = parsePrice(allPrices[1]);
      if (p1 && p2 && p2 > p1) {
        oldPrice = p2;
      }
    }

    // Наявність
    const stockText = cardText.toLowerCase();
    let stock = 'в наявності';
    if (stockText.includes('під замовлення')) {
      const orderMatch = cardText.match(/під замовлення\s*([\d-]+\s*дн\w*)?/i);
      stock = orderMatch ? `під замовлення ${orderMatch[1] || ''}`.trim() : 'під замовлення';
    }

    // Головне зображення (175x175)
    const images = [];
    $card.find('img[src*="175x175"], img[src*="catalog"]').each((_j, img) => {
      const src = $(img).attr('src');
      if (src && !images.includes(src)) {
        images.push(src.startsWith('http') ? src : BASE + src);
      }
    });
    // Також fallback — будь-яке зображення в картці
    if (!images.length) {
      $card.find('img[src]').each((_j, img) => {
        const src = $(img).attr('src');
        if (src && !src.includes('22x22') && !images.includes(src)) {
          images.push(src.startsWith('http') ? src : BASE + src);
        }
      });
    }

    // Кольори RAL — витягуємо з alt тексту зображень 22x22 та 175x175
    const colors = [];
    $card.find('img[alt]').each((_j, img) => {
      const alt = $(img).attr('alt')?.trim();
      if (alt) {
        const ralMatch = alt.match(/(\d{4})/);
        if (ralMatch && !colors.find((c) => c.ral === ralMatch[1])) {
          colors.push({
            ral: ralMatch[1],
            name: alt,
            image: $(img).attr('src')?.startsWith('http')
              ? $(img).attr('src')
              : BASE + $(img).attr('src'),
          });
        }
      }
    });

    // Коротка специфікація (текст під назвою: «Матова; Ширина:...; Цинк:...; Товщина:...;»)
    const specMatch = cardText.match(
      /(Матов\w+|Глянець|Принт);\s*Ширина:[^;]+;\s*Цинк:[^;]+;\s*Товщина:[^;]+/i
    );
    const shortSpec = specMatch ? specMatch[0].trim() : '';

    // Парсинг характеристик зі shortSpec
    const attributes = parseShortAttributes(shortSpec, name);

    products.push({
      source: 'akm',
      name,
      sku,
      price,
      old_price: oldPrice,
      unit,
      stock,
      url: href.startsWith('http') ? href : BASE + href,
      images,
      colors,
      category: catInfo.category,
      subcategory: catInfo.subcategory,
      attributes,
      scraped_at: new Date().toISOString(),
    });
  });

  return products;
}

/**
 * Парсинг атрибутів з короткої специфікації та назви товару
 */
function parseShortAttributes(shortSpec, name) {
  const attrs = {};

  // Товщина — з shortSpec або назви
  const thickMatch = shortSpec.match(/Товщина:([\d,.]+)\s*мм/i)
    || name.match(/([\d,.]+)\s*мм/);
  if (thickMatch) attrs.thickness_mm = thickMatch[1].replace(',', '.');

  // Покриття
  const coatingMatch = shortSpec.match(/^(Матов\w+|Глянець|Принт)/i)
    || name.match(/\b(МАТ|PE |PEMA|РЕ |Глянець)\b/i);
  if (coatingMatch) {
    const c = coatingMatch[1].toUpperCase();
    if (c.includes('МАТ') || c.includes('МАТОВ')) attrs.coating = 'PEMA';
    else if (c.includes('PE') || c.includes('РЕ') || c.includes('ГЛЯН')) attrs.coating = 'PE';
    else if (c.includes('ПРИНТ')) attrs.coating = 'Print';
    else attrs.coating = coatingMatch[1];
  }

  // Оцинкування
  const zincMatch = shortSpec.match(/Цинк:([\d]+)\s*\(?\s*г\/м/i);
  if (zincMatch) attrs.zinc_g_m2 = zincMatch[1];

  // Ширина
  const widthMatch = shortSpec.match(/Ширина:([\w/]+мм|[\w_']+)/i);
  if (widthMatch) attrs.width = widthMatch[1].replace(/_/g, ' ');

  // Виробник / Країна — з назви
  const manufacturers = [
    { pattern: /Німеччина\s*\(ThyssenKrupp\)/i, country: 'Німеччина', manufacturer: 'ThyssenKrupp' },
    { pattern: /Німеччина\s*\(Arcelor\)/i, country: 'Німеччина', manufacturer: 'Arcelor' },
    { pattern: /Італія\s*\(ARVEDI\)/i, country: 'Італія', manufacturer: 'ARVEDI' },
    { pattern: /Італія\s*\(Arvedi\)/i, country: 'Італія', manufacturer: 'ARVEDI' },
    { pattern: /Корея\s*(?:Dongbu|\(Dongbu\))/i, country: 'Корея', manufacturer: 'Dongbu' },
    { pattern: /Польща\s*\(Arcelor\)/i, country: 'Польща', manufacturer: 'Arcelor' },
    { pattern: /Словаччина\s*\(USS Kosice\)/i, country: 'Словаччина', manufacturer: 'USS Kosice' },
    { pattern: /Австрія\s*\(Voestalpine\)/i, country: 'Австрія', manufacturer: 'Voestalpine' },
    { pattern: /Китай\s*\(Sutor\)/i, country: 'Китай', manufacturer: 'Sutor' },
    { pattern: /Україна\s*\(Модуль\)/i, country: 'Україна', manufacturer: 'Модуль' },
    { pattern: /Україна(?!\s*\()/i, country: 'Україна', manufacturer: 'Україна' },
    { pattern: /Швеція\s*\(SSAB\)/i, country: 'Швеція', manufacturer: 'SSAB' },
    { pattern: /Бельгія/i, country: 'Бельгія', manufacturer: '' },
    { pattern: /Туреччина/i, country: 'Туреччина', manufacturer: '' },
  ];

  for (const m of manufacturers) {
    if (m.pattern.test(name)) {
      attrs.country = m.country;
      attrs.manufacturer = m.manufacturer;
      break;
    }
  }

  // Гарантія (з бітумної черепиці)
  const warrantyMatch = name.match(/Гарантія[_\s]*([\d]+)\s*рок/i)
    || shortSpec.match(/Гарантія[_\s]*([\d]+)/i);
  if (warrantyMatch) attrs.warranty_years = warrantyMatch[1];

  return attrs;
}

// ═══════════════════════════════════════════════════════════════════════
// Отримання кількості сторінок
// ═══════════════════════════════════════════════════════════════════════

function getTotalPages(html) {
  const $ = cheerio.load(html);
  // «Показано з 1 по 15 із 220 (15 сторінок)»
  const paginationText = $('body').text();
  const match = paginationText.match(/\((\d+)\s*сторін/i);
  if (match) return parseInt(match[1], 10);

  // Fallback — останній номер пагінації
  let maxPage = 1;
  $('a[href*="page-"]').each((_i, el) => {
    const href = $(el).attr('href') || '';
    const pageMatch = href.match(/page-(\d+)/);
    if (pageMatch) maxPage = Math.max(maxPage, parseInt(pageMatch[1], 10));
  });
  return maxPage;
}

// ═══════════════════════════════════════════════════════════════════════
// Парсинг сторінки окремого товару (де-тальна)
// ═══════════════════════════════════════════════════════════════════════

function parseProductDetail(html, product) {
  const $ = cheerio.load(html);

  // Опис товару
  const descTab = $('#tab-description, .tab-description, [id*="description"]').first();
  if (descTab.length) {
    product.description = descTab.text().trim().substring(0, 2000);
  }

  // Таблиця характеристик
  $('table tr, .attribute-group tr, .product-attribute tr').each((_i, el) => {
    const cells = $(el).find('td');
    if (cells.length >= 2) {
      const key = $(cells[0]).text().trim();
      const value = $(cells[1]).text().trim();
      if (key && value && key !== value) {
        const normKey = key
          .toLowerCase()
          .replace(/[^a-zа-яґєіїё0-9]+/g, '_')
          .replace(/^_|_$/g, '');
        product.attributes[normKey] = value;
      }
    }
  });

  // Більш великі зображення з галереї
  const largeImages = [];
  $('a[data-fancybox], a[data-lightbox], .product-gallery a, .swiper-slide a, a[href*="/catalog/"]').each(
    (_i, el) => {
      const href = $(el).attr('href');
      if (href && /\.(jpg|jpeg|png|webp)/i.test(href)) {
        const fullUrl = href.startsWith('http') ? href : BASE + href;
        if (!largeImages.includes(fullUrl)) largeImages.push(fullUrl);
      }
    }
  );
  if (largeImages.length) {
    product.images_large = largeImages;
  }

  return product;
}

// ═══════════════════════════════════════════════════════════════════════
// Головний процес
// ═══════════════════════════════════════════════════════════════════════

async function scrapeCategory(catInfo) {
  const { category, subcategory, url: catPath } = catInfo;
  const catUrl = BASE + catPath;
  logger.info(`── ${category} / ${subcategory}: ${catUrl}`);

  let html;
  try {
    html = await fetchPage(catUrl);
  } catch (err) {
    logger.error(`Не вдалось завантажити ${catUrl}: ${err.message}`);
    return [];
  }

  const totalPages = getTotalPages(html);
  logger.info(`   Сторінок: ${totalPages}`);

  let allProducts = parseProductList(html, catInfo);

  // Пагінація
  for (let page = 2; page <= totalPages; page++) {
    await sleep(800 + Math.random() * 700); // 0.8–1.5с між запитами
    const pageUrl = `${catUrl}page-${page}`;
    try {
      const pageHtml = await fetchPage(pageUrl);
      const pageProducts = parseProductList(pageHtml, catInfo);
      allProducts = allProducts.concat(pageProducts);
      logger.info(`   Стор. ${page}/${totalPages} — +${pageProducts.length} товарів`);
    } catch (err) {
      logger.warn(`   Помилка стор. ${page}: ${err.message}`);
    }
  }

  logger.info(`   Разом: ${allProducts.length} товарів у ${category}/${subcategory}`);
  return allProducts;
}

async function main() {
  const isTest = process.argv.includes('--test');
  const categories = isTest ? CATEGORIES.slice(0, 2) : CATEGORIES;

  logger.info('═══════════════════════════════════════════════════');
  logger.info('  AKM.KIEV.UA SCRAPER — Запуск');
  logger.info(`  Режим: ${isTest ? 'ТЕСТ (2 категорії)' : 'ПОВНИЙ'}`);
  logger.info(`  Категорій: ${categories.length}`);
  logger.info('═══════════════════════════════════════════════════');

  let allProducts = [];

  for (const cat of categories) {
    const products = await scrapeCategory(cat);
    allProducts = allProducts.concat(products);
    // Пауза між категоріями
    await sleep(1500 + Math.random() * 1000);
  }

  // Деду-плікація за URL
  const uniqueMap = new Map();
  for (const p of allProducts) {
    uniqueMap.set(p.url, p);
  }
  const unique = [...uniqueMap.values()];

  logger.info('═══════════════════════════════════════════════════');
  logger.info(`  ПІДСУМОК: ${unique.length} унікальних товарів`);
  logger.info('═══════════════════════════════════════════════════');

  // Збереження
  const timestamp = new Date().toISOString().slice(0, 10);
  saveJSON(`akm-products-${timestamp}.json`, unique);
  saveCSV(`akm-products-${timestamp}.csv`, unique);

  // Статистика по категоріях
  const stats = {};
  for (const p of unique) {
    const key = `${p.category} / ${p.subcategory}`;
    stats[key] = (stats[key] || 0) + 1;
  }
  logger.info('\nСтатистика по категоріях:');
  for (const [cat, count] of Object.entries(stats).sort((a, b) => b[1] - a[1])) {
    logger.info(`  ${cat}: ${count}`);
  }

  return unique;
}

// ═══════════════════════════════════════════════════════════════════════
module.exports = { main, CATEGORIES, parseProductList, parseProductDetail };

if (require.main === module) {
  main().catch((err) => {
    logger.error(`Критична помилка: ${err.message}`);
    process.exit(1);
  });
}

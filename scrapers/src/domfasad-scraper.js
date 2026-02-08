/**
 * ROCKY BUILDER — Скрапер для domfasad.com.ua
 *
 * Парсить категорії фасадних і терасних матеріалів:
 *  ─ Термопанелі
 *  ─ Фасадні панелі / Сайдинг
 *  ─ Терасна дошка ДПК
 *  ─ Софіт
 *  ─ Клінкерна плитка
 *  ─ + будь-які інші знайдені категорії
 *
 * Для кожного товару збирає:
 *   назва, ціна, фото URL, опис, категорія/підкатегорія,
 *   характеристики, наявність, SKU
 */

const cheerio = require('cheerio');
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
const BASE = 'https://domfasad.com.ua';

// Відомі категорії — скрапер також спробує знайти ще автоматично
const CATEGORIES = [
  {
    category: 'Термопанелі',
    subcategory: 'Загальні',
    url: '/termopaneli/',
  },
  {
    category: 'Фасадні панелі',
    subcategory: 'Загальні',
    url: '/fasadnye-paneli/',
  },
  {
    category: 'Терасна дошка ДПК',
    subcategory: 'Загальні',
    url: '/terrasnaya-doska-dpk/',
  },
  {
    category: 'Софіт',
    subcategory: 'Загальні',
    url: '/sofit/',
  },
  {
    category: 'Сайдинг',
    subcategory: 'Загальні',
    url: '/sajding/',
  },
  {
    category: 'Клінкерна плитка',
    subcategory: 'Загальні',
    url: '/klinkernaya-plitka/',
  },
  {
    category: 'Водостічні системи',
    subcategory: 'Загальні',
    url: '/vodostochnye-sistemy/',
  },
  {
    category: 'Підсистема для фасаду',
    subcategory: 'Загальні',
    url: '/podsistema-dlya-fasada/',
  },
];

// ═══════════════════════════════════════════════════════════════════════
// Автовиявлення категорій з головної сторінки
// ═══════════════════════════════════════════════════════════════════════

async function discoverCategories() {
  logger.info('Автовиявлення категорій з domfasad.com.ua...');
  try {
    const html = await fetchPage(BASE);
    const $ = cheerio.load(html);
    const found = [];

    // Шукаємо навігаційні посилання на категорії
    $('a[href]').each((_i, el) => {
      const href = $(el).attr('href') || '';
      const text = $(el).text().trim();
      // Відносні посилання на категорії (без query, без зовнішніх)
      if (
        href.startsWith('/') &&
        !href.includes('?') &&
        !href.includes('#') &&
        href.split('/').filter(Boolean).length === 1 &&
        text.length > 2 &&
        text.length < 100 &&
        !href.includes('login') &&
        !href.includes('cart') &&
        !href.includes('contact')
      ) {
        const slug = href.replace(/\//g, '');
        if (!found.find((f) => f.url === href) && !CATEGORIES.find((c) => c.url === href)) {
          found.push({
            category: text,
            subcategory: 'Загальні',
            url: href,
          });
        }
      }
    });

    if (found.length) {
      logger.info(`  Знайдено ${found.length} додаткових категорій`);
    }
    return found;
  } catch (err) {
    logger.warn(`Автовиявлення не вдалось: ${err.message}`);
    return [];
  }
}

// ═══════════════════════════════════════════════════════════════════════
// Парсинг – список товарів на сторінці каталогу
// ═══════════════════════════════════════════════════════════════════════

function parseProductList(html, catInfo) {
  const $ = cheerio.load(html);
  const products = [];

  // DomFasad — різні можливі селектори для товарних карток
  const cardSelectors = [
    '.product-card',
    '.product-item',
    '.product-layout',
    '.product-thumb',
    '[data-product-id]',
    '.catalog-item',
    '.goods-item',
    '.item-product',
  ];

  let $cards = $([]);
  for (const sel of cardSelectors) {
    $cards = $(sel);
    if ($cards.length) break;
  }

  // Fallback: шукаємо будь-які блоки з заголовком + ціною
  if (!$cards.length) {
    // Спробуємо знайти посилання на товари
    $('a[href]').each((_i, el) => {
      const href = $(el).attr('href') || '';
      const text = $(el).text().trim();
      // Пропускаємо пагінацію, категорії тощо
      if (
        text.length > 10 &&
        text.length < 300 &&
        href.includes(catInfo.url.replace(/\//g, '').substring(0, 10)) &&
        href !== catInfo.url &&
        href.match(/\/[\w-]+-\d+/) // URL з ID товару
      ) {
        const $parent = $(el).parent().parent();
        const priceText = $parent.text();
        const priceMatch = priceText.match(/([\d\s,.]+)\s*грн/i);

        products.push({
          source: 'domfasad',
          name: text,
          sku: '',
          price: priceMatch ? parsePrice(priceMatch[1]) : null,
          old_price: null,
          unit: 'шт',
          stock: 'в наявності',
          url: href.startsWith('http') ? href : BASE + href,
          images: [],
          colors: [],
          category: catInfo.category,
          subcategory: catInfo.subcategory,
          description: '',
          attributes: {},
          scraped_at: new Date().toISOString(),
        });
      }
    });
    return deduplicateByUrl(products);
  }

  $cards.each((_i, card) => {
    const $card = $(card);

    // Назва
    const $titleLink = $card
      .find('a.product-link, h3 a, h4 a, .product-title a, .item-title a, .name a')
      .first();
    const name = $titleLink.text().trim() || $card.find('h3, h4, .product-title, .item-title').first().text().trim();
    const href = $titleLink.attr('href') || $card.find('a[href]').first().attr('href');

    if (!name || !href) return;

    // Ціна
    const priceText = $card
      .find('.price-new, .product-price, .price, [data-price], .current-price, .new-price')
      .first()
      .text();
    const price = parsePrice(priceText);
    const unit = parseUnit(priceText);

    // Стара ціна
    const oldPriceText = $card.find('.price-old, .old-price, del, .was-price').first().text();
    const oldPrice = parsePrice(oldPriceText);

    // Зображення
    const images = [];
    $card.find('img[src], img[data-src]').each((_j, img) => {
      const src = $(img).attr('src') || $(img).attr('data-src');
      if (src && !src.includes('placeholder') && !src.includes('data:image')) {
        const fullUrl = src.startsWith('http') ? src : BASE + src;
        if (!images.includes(fullUrl)) images.push(fullUrl);
      }
    });

    // Наявність
    const cardText = $card.text().toLowerCase();
    let stock = 'в наявності';
    if (cardText.includes('немає') || cardText.includes('відсутн')) stock = 'немає в наявності';
    else if (cardText.includes('під замовлення') || cardText.includes('замовлен')) stock = 'під замовлення';

    // SKU
    const skuMatch = $card.text().match(/(?:арт|код|sku)[.:]*\s*(\w[\w-]*)/i);
    const sku = skuMatch ? skuMatch[1] : '';

    products.push({
      source: 'domfasad',
      name,
      sku,
      price,
      old_price: oldPrice,
      unit,
      stock,
      url: href.startsWith('http') ? href : BASE + href,
      images,
      colors: [],
      category: catInfo.category,
      subcategory: catInfo.subcategory,
      description: '',
      attributes: {},
      scraped_at: new Date().toISOString(),
    });
  });

  return products;
}

// ═══════════════════════════════════════════════════════════════════════
// Парсинг сторінки окремого товару
// ═══════════════════════════════════════════════════════════════════════

function parseProductDetail(html, product) {
  const $ = cheerio.load(html);

  // Назва (уточнення)
  const h1 = $('h1').first().text().trim();
  if (h1) product.name = h1;

  // Опис
  const descSelectors = [
    '.product-description',
    '#tab-description',
    '.description',
    '.product-text',
    '[itemprop="description"]',
  ];
  for (const sel of descSelectors) {
    const desc = $(sel).first();
    if (desc.length) {
      product.description = desc.text().trim().substring(0, 3000);
      break;
    }
  }

  // Зображення (повнорозмірні)
  const largeImages = [];
  $(
    '.product-image img, .product-gallery img, .swiper-slide img, ' +
      '[data-fancybox] img, .owl-carousel img, .slick-slide img'
  ).each((_i, img) => {
    const src = $(img).attr('src') || $(img).attr('data-src') || $(img).attr('data-image');
    if (src && !src.includes('placeholder') && !src.includes('data:image')) {
      const fullUrl = src.startsWith('http') ? src : BASE + src;
      if (!largeImages.includes(fullUrl)) largeImages.push(fullUrl);
    }
  });
  if (largeImages.length) product.images = largeImages;

  // Характеристики з таблиці
  $(
    '.product-specs tr, .specifications tr, .attributes tr, ' +
      '.product-attribute tr, .product-params tr, table.params tr, ' +
      '.char-table tr, .tab-pane table tr'
  ).each((_i, el) => {
    const cells = $(el).find('td, th');
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

  // Характеристики з dl > dt + dd
  $('dl dt').each((_i, el) => {
    const key = $(el).text().trim();
    const value = $(el).next('dd').text().trim();
    if (key && value) {
      const normKey = key
        .toLowerCase()
        .replace(/[^a-zа-яґєіїё0-9]+/g, '_')
        .replace(/^_|_$/g, '');
      product.attributes[normKey] = value;
    }
  });

  // Ціна (уточнення зі сторінки товару)
  if (!product.price) {
    const priceText = $(
      '.price-new, .product-price, [itemprop="price"], .price, .current-price'
    )
      .first()
      .text();
    product.price = parsePrice(priceText);
    product.unit = parseUnit(priceText);
  }

  // SKU
  if (!product.sku) {
    const skuMatch = $('body').text().match(/(?:арт|артикул|код|sku|article)[.:]*\s*(\w[\w-]*)/i);
    if (skuMatch) product.sku = skuMatch[1];
  }

  // Наявність
  const bodyText = $('body').text().toLowerCase();
  if (bodyText.includes('немає в наявності') || bodyText.includes('відсутній')) {
    product.stock = 'немає в наявності';
  } else if (bodyText.includes('під замовлення')) {
    product.stock = 'під замовлення';
  }

  // Бренд
  const brandMatch = $('[itemprop="brand"], .brand, .manufacturer').first().text().trim();
  if (brandMatch) product.attributes.brand = brandMatch;

  return product;
}

// ═══════════════════════════════════════════════════════════════════════
// Пагінація
// ═══════════════════════════════════════════════════════════════════════

function getTotalPages(html) {
  const $ = cheerio.load(html);

  // Варіант 1: текст «Показано 1–15 із 120»
  const text = $('body').text();
  const match = text.match(/\((\d+)\s*сторін/i);
  if (match) return parseInt(match[1], 10);

  // Варіант 2: пагінація-посилання
  let maxPage = 1;
  $('a[href*="page"], .pagination a, .paging a').each((_i, el) => {
    const href = $(el).attr('href') || '';
    const pageMatch = href.match(/page[=-](\d+)/i);
    if (pageMatch) maxPage = Math.max(maxPage, parseInt(pageMatch[1], 10));
    // Чисто числовий текст
    const pageNum = parseInt($(el).text().trim(), 10);
    if (pageNum > maxPage) maxPage = pageNum;
  });
  return maxPage;
}

function getPageUrl(baseUrl, page) {
  // domfasad може використовувати ?page=N або /page/N
  if (baseUrl.includes('?')) return `${baseUrl}&page=${page}`;
  const clean = baseUrl.endsWith('/') ? baseUrl : baseUrl + '/';
  return `${clean}?page=${page}`;
}

// ═══════════════════════════════════════════════════════════════════════
// Скрапінг однієї категорії
// ═══════════════════════════════════════════════════════════════════════

async function scrapeCategory(catInfo, { fetchDetails = false } = {}) {
  const catUrl = catInfo.url.startsWith('http') ? catInfo.url : BASE + catInfo.url;
  logger.info(`── ${catInfo.category} / ${catInfo.subcategory}: ${catUrl}`);

  let html;
  try {
    html = await fetchPage(catUrl);
  } catch (err) {
    logger.warn(`   Пропускаємо ${catUrl}: ${err.message}`);
    return [];
  }

  const totalPages = getTotalPages(html);
  logger.info(`   Сторінок: ${totalPages}`);

  let allProducts = parseProductList(html, catInfo);

  // Пагінація
  for (let page = 2; page <= totalPages; page++) {
    await sleep(1000 + Math.random() * 1000);
    const pageUrl = getPageUrl(catUrl, page);
    try {
      const pageHtml = await fetchPage(pageUrl);
      const pageProducts = parseProductList(pageHtml, catInfo);
      allProducts = allProducts.concat(pageProducts);
      logger.info(`   Стор. ${page}/${totalPages} — +${pageProducts.length} товарів`);
    } catch (err) {
      logger.warn(`   Помилка стор. ${page}: ${err.message}`);
    }
  }

  // Опціонально: завантажити деталі кожного товару
  if (fetchDetails && allProducts.length) {
    logger.info(`   Завантаження деталей для ${allProducts.length} товарів...`);
    for (let i = 0; i < allProducts.length; i++) {
      await sleep(600 + Math.random() * 800);
      try {
        const detailHtml = await fetchPage(allProducts[i].url);
        allProducts[i] = parseProductDetail(detailHtml, allProducts[i]);
        if ((i + 1) % 10 === 0) {
          logger.info(`   Деталі: ${i + 1}/${allProducts.length}`);
        }
      } catch (err) {
        logger.warn(`   Деталі ${allProducts[i].url}: ${err.message}`);
      }
    }
  }

  logger.info(`   Разом: ${allProducts.length} товарів у ${catInfo.category}/${catInfo.subcategory}`);
  return allProducts;
}

// ═══════════════════════════════════════════════════════════════════════
// Деду-плікація
// ═══════════════════════════════════════════════════════════════════════

function deduplicateByUrl(products) {
  const map = new Map();
  for (const p of products) {
    map.set(p.url, p);
  }
  return [...map.values()];
}

// ═══════════════════════════════════════════════════════════════════════
// Головний процес
// ═══════════════════════════════════════════════════════════════════════

async function main() {
  const isTest = process.argv.includes('--test');
  const fetchDetails = process.argv.includes('--details');

  logger.info('═══════════════════════════════════════════════════');
  logger.info('  DOMFASAD.COM.UA SCRAPER — Запуск');
  logger.info(`  Режим: ${isTest ? 'ТЕСТ (2 категорії)' : 'ПОВНИЙ'}`);
  logger.info(`  Деталі: ${fetchDetails ? 'ТАК' : 'НІ (--details для увімкнення)'}`);
  logger.info('═══════════════════════════════════════════════════');

  // Автовиявлення додаткових категорій
  const extraCats = isTest ? [] : await discoverCategories();
  const categories = isTest
    ? CATEGORIES.slice(0, 2)
    : [...CATEGORIES, ...extraCats];

  logger.info(`Категорій: ${categories.length}`);

  let allProducts = [];

  for (const cat of categories) {
    const products = await scrapeCategory(cat, { fetchDetails });
    allProducts = allProducts.concat(products);
    await sleep(1500 + Math.random() * 1000);
  }

  // Деду-плікація
  const unique = deduplicateByUrl(allProducts);

  logger.info('═══════════════════════════════════════════════════');
  logger.info(`  ПІДСУМОК: ${unique.length} унікальних товарів`);
  logger.info('═══════════════════════════════════════════════════');

  // Збереження
  const timestamp = new Date().toISOString().slice(0, 10);
  saveJSON(`domfasad-products-${timestamp}.json`, unique);
  saveCSV(`domfasad-products-${timestamp}.csv`, unique);

  // Статистика
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

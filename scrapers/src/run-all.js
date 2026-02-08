/**
 * ROCKY BUILDER — Запуск усіх скраперів + об'єднання результатів
 *
 * npm run scrape:all            — повний парсинг обох сайтів
 * npm run scrape:all -- --test  — тестовий режим (2 категорії кожного)
 */

const { main: scrapeAkm } = require('./akm-scraper');
const { main: scrapeDomfasad } = require('./domfasad-scraper');
const { logger, saveJSON, saveCSV, slugify } = require('./utils');

async function main() {
  const startTime = Date.now();

  logger.info('╔═══════════════════════════════════════════════════╗');
  logger.info('║     ROCKY BUILDER — Повний парсинг каталогів      ║');
  logger.info('║     akm.kiev.ua + domfasad.com.ua                 ║');
  logger.info('╚═══════════════════════════════════════════════════╝');

  // ── 1. Парсинг AKM ────────────────────────────────────────────────
  logger.info('\n▶ Крок 1/3: Парсинг akm.kiev.ua');
  let akmProducts = [];
  try {
    akmProducts = await scrapeAkm();
  } catch (err) {
    logger.error(`AKM scraper помилка: ${err.message}`);
  }

  // ── 2. Парсинг DomFasad ───────────────────────────────────────────
  logger.info('\n▶ Крок 2/3: Парсинг domfasad.com.ua');
  let domfasadProducts = [];
  try {
    domfasadProducts = await scrapeDomfasad();
  } catch (err) {
    logger.error(`DomFasad scraper помилка: ${err.message}`);
  }

  // ── 3. Об'єднання + нормалізація ──────────────────────────────────
  logger.info('\n▶ Крок 3/3: Об'єднання результатів');

  const allProducts = [...akmProducts, ...domfasadProducts].map((p) => ({
    ...p,
    slug: slugify(p.name),
    // Додаємо уніфіковану структуру для імпорту в БД
    _importReady: {
      name_ua: p.name,
      source: p.source,
      external_url: p.url,
      external_id: p.sku || slugify(p.name),
      base_price: p.price,
      old_price: p.old_price,
      unit: p.unit,
      in_stock: p.stock === 'в наявності',
      brand: p.attributes?.manufacturer || p.attributes?.brand || '',
      category_slug: slugify(p.category),
      subcategory_slug: slugify(p.subcategory),
      images: p.images || [],
      attributes: p.attributes || {},
    },
  }));

  const timestamp = new Date().toISOString().slice(0, 10);
  saveJSON(`all-products-${timestamp}.json`, allProducts);
  saveCSV(`all-products-${timestamp}.csv`, allProducts);

  // ── Підсумок ──────────────────────────────────────────────────────
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

  logger.info('\n╔═══════════════════════════════════════════════════╗');
  logger.info(`║  ПІДСУМОК                                         ║`);
  logger.info(`║  AKM:      ${String(akmProducts.length).padEnd(6)} товарів                    ║`);
  logger.info(`║  DomFasad: ${String(domfasadProducts.length).padEnd(6)} товарів                    ║`);
  logger.info(`║  Разом:    ${String(allProducts.length).padEnd(6)} товарів                    ║`);
  logger.info(`║  Час:      ${elapsed}с                               ║`);
  logger.info('╚═══════════════════════════════════════════════════╝');

  // Статистика по джерелах та категоріях
  const stats = {};
  for (const p of allProducts) {
    const key = `[${p.source}] ${p.category}`;
    stats[key] = (stats[key] || 0) + 1;
  }
  logger.info('\nДеталі по джерелах:');
  for (const [cat, count] of Object.entries(stats).sort((a, b) => b[1] - a[1])) {
    logger.info(`  ${cat}: ${count}`);
  }

  // Цінова статистика
  const withPrice = allProducts.filter((p) => p.price);
  if (withPrice.length) {
    const prices = withPrice.map((p) => p.price);
    logger.info('\nЦінова статистика:');
    logger.info(`  Товарів з ціною: ${withPrice.length} (${((withPrice.length / allProducts.length) * 100).toFixed(1)}%)`);
    logger.info(`  Мін. ціна: ${Math.min(...prices)} грн`);
    logger.info(`  Макс. ціна: ${Math.max(...prices)} грн`);
    logger.info(`  Середня:    ${(prices.reduce((a, b) => a + b, 0) / prices.length).toFixed(0)} грн`);
  }
}

if (require.main === module) {
  main().catch((err) => {
    logger.error(`Критична помилка: ${err.message}`);
    process.exit(1);
  });
}

/**
 * ROCKY BUILDER — Полный скрапер domfasad.com.ua v2
 * 
 * Стратегия:
 * 1. Получаем ВСЕ URL товаров из catalog-sitemap.xml (только /ua/ версии)
 * 2. Парсим каждую страницу товара
 * 3. Сохраняем JSON + CSV
 */

const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
const BASE = 'https://domfasad.com.ua';

let challengeHash = '';

async function getChallengeHash() {
  if (challengeHash) return challengeHash;
  const resp = await axios.get(BASE + '/', {
    headers: { 'User-Agent': UA },
    maxRedirects: 0,
    validateStatus: () => true,
  });
  const match = (resp.data || '').match(/defaultHash\s*=\s*"([a-f0-9]+)"/);
  challengeHash = match ? match[1] : '';
  console.log('Challenge hash:', challengeHash ? 'obtained' : 'MISSING');
  return challengeHash;
}

async function fetchPage(url, retries = 3) {
  const hash = await getChallengeHash();
  for (let i = 0; i < retries; i++) {
    try {
      const { data } = await axios.get(url, {
        headers: {
          'User-Agent': UA,
          'Accept': 'text/html,application/xhtml+xml',
          'Accept-Language': 'uk-UA,uk;q=0.9',
          'Cookie': `challenge_passed=${hash}`,
          'Referer': BASE + '/ua/',
        },
        timeout: 15000,
      });
      return data;
    } catch (e) {
      if (e.response && e.response.status === 404) return null;
      if (i === retries - 1) throw e;
      await new Promise(r => setTimeout(r, 2000 + i * 1000));
    }
  }
}

function parseProductPage(html, url) {
  const ch = cheerio.load(html);
  
  const name = ch('h1').first().text().trim();
  if (!name) return null;
  
  // Price
  let price = 0;
  ch('*').each((i, el) => {
    if (price > 0) return false;
    const node = ch(el);
    if (node.children().length === 0 || node.hasClass('product-price') || node.hasClass('price')) {
      const t = node.text().trim();
      const m = t.match(/^(\d[\d\s]*)(?:\.\d+)?\s*грн/);
      if (m) {
        const val = parseInt(m[1].replace(/\s/g, ''));
        if (val > 0 && val < 1000000) price = val;
      }
    }
  });
  
  if (!price) {
    const titleMatch = ch('title').text().match(/(\d[\d\s]*)\s*грн/);
    if (titleMatch) price = parseInt(titleMatch[1].replace(/\s/g, ''));
  }

  // Image
  let image = ch('meta[property="og:image"]').attr('content') || '';
  
  // Description
  let description = ch('meta[property="og:description"]').attr('content') || '';
  
  // Breadcrumbs
  const breadcrumbs = [];
  ch('[class*=breadcrumb] a, .breadcrumbs a').each((i, el) => {
    const text = ch(el).text().trim();
    if (text && text !== 'Головна' && text.length < 80) breadcrumbs.push(text);
  });
  let category = breadcrumbs.length > 0 ? breadcrumbs[0] : '';
  
  // Specs
  const specs = {};
  ch('.product-features__row').each((i, el) => {
    const key = ch(el).find('.product-features__cell--h').text().trim();
    const val = ch(el).find('.product-features__cell').not('.product-features__cell--h').text().trim();
    if (key && val && key.length < 80 && val.length < 200) specs[key] = val;
  });
  
  if (Object.keys(specs).length === 0) {
    ch('table tr').each((i, el) => {
      const cells = ch(el).find('td');
      if (cells.length >= 2) {
        const key = ch(cells[0]).text().trim();
        const val = ch(cells[1]).text().trim();
        if (key && val && key.length < 80 && val.length < 200) specs[key] = val;
      }
    });
  }
  
  // In stock
  const bodyText = ch('body').text();
  let inStock = !/нет в наличии|немає в наявності|нема в наявності/i.test(bodyText);
  
  // SKU
  let sku = '';
  const skuMatch = bodyText.match(/Артикул[:\s]+([A-Za-z0-9_-]+)/);
  if (skuMatch) sku = skuMatch[1];
  
  // Unit
  let unit = 'шт';
  if (/грн\/м\u00B2|грн\/м2/.test(bodyText)) unit = 'м\u00B2';
  else if (/грн\/м\.п\./.test(bodyText)) unit = 'м.п.';
  else if (/грн\/уп/.test(bodyText)) unit = 'уп';
  else if (/грн\/рулон/.test(bodyText)) unit = 'рулон';
  
  const slug = url.replace(BASE, '').replace(/^\/ua\//, '').replace(/\/$/, '');
  
  return {
    source: 'domfasad', name, slug, sku, price,
    oldPrice: null, unit, inStock, url, image,
    description: description.substring(0, 500),
    category, specs,
    scraped_at: new Date().toISOString(),
  };
}

const CATEGORY_SLUGS = new Set([
  'katalog', 'brendy', 'aktsii-i-spetspredlozheniya', 'o-nas',
  'oplata-i-dostavka', 'obmen-i-vozvrat', 'dogovor-publichnoy-oferty',
  'kontaktnaya-informatsiya', 'siteindex', 'checkout', 'otzyvy-o-magazine',
  'termopaneli-fasadnye', 'terrasnaya-doska', 'fasadnaia-doska',
  'cherepitsa', 'metallocherepitsa', 'bitumnaya-cherepitsa',
  'bitumnaya-cherepitsa-akvaizol', 'tsementno-peschanaya-cherepitsa-braas',
  'keramicheskaya-cherepitsa', 'falts',
  'sayding', 'vinilovyy-sayding', 'tsokolnyy-sayding', 'sayding-sofit',
  'metallicheskiy-sayding', 'metallycheskyi-sofyt',
  'profnastil', 'profnastyl-hladkyi', 'profnastil-ps-7', 'profnastil-ps-8',
  'profnastyl-ps-10', 'profnastyl-pk-10', 'profnastyl-ps-15', 'profnastyl-pk-15',
  'profnastyl-ps-20', 'profnastyl-pk-20', 'profnastil-pk-35',
  'vodostochnye-sistemy', 'drenazhnye-kanaly-tor',
  'setka-zabory-iz-setki-vorota-i-kalitki', 'setka-dlia-zabora',
  'zabory-yz-setky', 'vorota', 'kalytky', 'aksessuary-y-kreplenyia-dlia-setky',
  'zabory-i-ograzhdeniya', 'evroshtaketnyk', 'shtaketnik-shirokiy',
  'zabory-i-ograzhdeniya-iz-pvkh', 'zabory-zhaluzi',
  'polikarbonat-sotovyy', 'uteplitel', 'myneralnaia-vata', 'bazaltovaia-vata',
  'vetrobarier', 'hydrobarer', 'parobarer', 'evrobarer',
  'plenki-membrany-lenty', 'bordurnaya-lenta', 'teplitsy', 'montazh-saydinga',
]);

async function main() {
  const isTest = process.argv.includes('--test');
  const maxProducts = isTest ? 30 : 99999;
  
  console.log('\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550');
  console.log('  DOMFASAD.COM.UA SCRAPER v2 (sitemap-based)');
  console.log('  Режим: ' + (isTest ? 'ТЕСТ (до 30)' : 'ПОВНИЙ'));
  console.log('\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550');
  
  // Get sitemap
  console.log('Завантаження catalog-sitemap.xml...');
  const { data: sitemapXml } = await axios.get(
    BASE + '/content/export/domfasad.com.ua/catalog-sitemap.xml',
    { headers: { 'User-Agent': UA }, timeout: 30000 }
  );
  
  const sitemapCh = cheerio.load(sitemapXml, { xmlMode: true });
  const allUrls = [];
  sitemapCh('url').each((i, el) => {
    const loc = sitemapCh(el).find('loc').text().trim();
    if (loc.startsWith(BASE + '/ua/')) allUrls.push(loc);
  });
  
  console.log('UA URL у sitemap: ' + allUrls.length);
  
  // Filter out category pages
  const productUrls = allUrls.filter(url => {
    const slug = url.replace(BASE + '/ua/', '').replace(/\/$/, '');
    return !CATEGORY_SLUGS.has(slug) && !slug.includes('/page-') && slug.length > 3;
  });
  
  console.log('Товарних URL: ' + productUrls.length);
  
  const urlsToScrape = productUrls.slice(0, maxProducts);
  console.log('Буде спарсено: ' + urlsToScrape.length + '\n');
  
  const allProducts = [];
  let success = 0, failed = 0, noPrice = 0, processed = 0;
  const CONCURRENCY = 5;
  
  // Process in batches of CONCURRENCY
  for (let i = 0; i < urlsToScrape.length; i += CONCURRENCY) {
    const batch = urlsToScrape.slice(i, i + CONCURRENCY);
    const results = await Promise.allSettled(batch.map(async (url) => {
      try {
        const html = await fetchPage(url);
        if (!html) return { status: 'fail' };
        const product = parseProductPage(html, url);
        if (product && product.name) {
          if (product.price > 0) return { status: 'ok', product };
          return { status: 'noPrice' };
        }
        return { status: 'fail' };
      } catch (e) {
        return { status: 'fail' };
      }
    }));
    
    for (const r of results) {
      processed++;
      if (r.status === 'fulfilled') {
        const val = r.value;
        if (val.status === 'ok') { allProducts.push(val.product); success++; }
        else if (val.status === 'noPrice') noPrice++;
        else failed++;
      } else {
        failed++;
      }
    }
    
    if (processed % 50 === 0 || processed >= urlsToScrape.length) {
      const last = allProducts[allProducts.length - 1];
      console.log('  [' + processed + '/' + urlsToScrape.length + '] OK:' + success + ' ERR:' + failed + ' noPrice:' + noPrice + (last ? ' | ' + last.name.substring(0, 50) : ''));
    }
    
    // Save intermediate results every 500 products
    if (allProducts.length > 0 && allProducts.length % 500 < CONCURRENCY) {
      const tmpPath = path.join(__dirname, '..', 'output', 'domfasad-partial.json');
      fs.writeFileSync(tmpPath, JSON.stringify(allProducts, null, 2), 'utf-8');
    }
    
    await new Promise(r => setTimeout(r, 200));
  }
  
  console.log('\n\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550');
  console.log('  RESULT: ' + allProducts.length + ' products');
  console.log('  OK: ' + success + ', FAIL: ' + failed + ', No price: ' + noPrice);
  console.log('\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550');
  
  const catStats = {};
  allProducts.forEach(p => { catStats[p.category] = (catStats[p.category] || 0) + 1; });
  console.log('\nПо категоріях:');
  Object.entries(catStats).sort((a, b) => b[1] - a[1]).forEach(([cat, count]) => {
    console.log('  ' + (cat || '(no category)') + ': ' + count);
  });
  
  // Save
  const date = new Date().toISOString().split('T')[0];
  const outputDir = path.join(__dirname, '..', 'output');
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
  
  const jsonPath = path.join(outputDir, 'domfasad-products-' + date + '.json');
  fs.writeFileSync(jsonPath, JSON.stringify(allProducts, null, 2), 'utf-8');
  console.log('\nJSON: ' + jsonPath);
  
  if (allProducts.length > 0) {
    const csvPath = path.join(outputDir, 'domfasad-products-' + date + '.csv');
    const headers = ['name', 'sku', 'price', 'unit', 'inStock', 'category', 'url', 'image'];
    const bom = '\uFEFF';
    const rows = allProducts.map(p =>
      headers.map(h => {
        const v = String(p[h] || '');
        return v.includes(',') || v.includes('"') ? '"' + v.replace(/"/g, '""') + '"' : v;
      }).join(',')
    );
    fs.writeFileSync(csvPath, bom + [headers.join(','), ...rows].join('\n'), 'utf-8');
    console.log('CSV: ' + csvPath);
  }
}

main().catch(e => console.error('FATAL:', e));

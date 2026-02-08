const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

let challengeHash = '';

async function getChallengeHash() {
  if (challengeHash) return challengeHash;
  const resp = await axios.get('https://domfasad.com.ua/', {
    headers: { 'User-Agent': UA },
    maxRedirects: 0,
    validateStatus: () => true,
  });
  const match = (resp.data || '').match(/defaultHash\s*=\s*"([a-f0-9]+)"/);
  challengeHash = match ? match[1] : '';
  return challengeHash;
}

async function fetchPage(url) {
  const hash = await getChallengeHash();
  const { data } = await axios.get(url, {
    headers: {
      'User-Agent': UA,
      'Accept': 'text/html',
      'Accept-Language': 'uk-UA,uk;q=0.9',
      'Cookie': `challenge_passed=${hash}`,
    },
    timeout: 15000,
  });
  return data;
}

function parseProduct(html, url) {
  const $ = cheerio.load(html);
  
  const name = $('h1').first().text().trim();
  
  // Price - try multiple selectors
  let price = 0;
  let oldPrice = 0;
  
  // From title
  const titlePrice = $('title').text().match(/(\d[\d\s]*)\s*грн/);
  if (titlePrice) price = parseInt(titlePrice[1].replace(/\s/g, ''));
  
  // From page content - look for price elements
  const priceSelectors = [
    '.product-price__item--active', '.product-price__current', '.price-current',
    '.product__price', '[data-price]', '.j-product-price', '.price',
    '.product-price', '.product-page__price'
  ];
  
  for (const sel of priceSelectors) {
    const el = $(sel).first();
    if (el.length) {
      const text = el.text().replace(/\s/g, '');
      const m = text.match(/(\d+)/);
      if (m && parseInt(m[1]) > 0) {
        price = parseInt(m[1]);
        break;
      }
    }
  }
  
  // Old price
  const oldPriceSelectors = ['.product-price__item--old', '.price-old', '.product-price__old', '.old-price'];
  for (const sel of oldPriceSelectors) {
    const el = $(sel).first();
    if (el.length) {
      const text = el.text().replace(/\s/g, '');
      const m = text.match(/(\d+)/);
      if (m) oldPrice = parseInt(m[1]);
    }
  }
  
  // Image
  let image = $('meta[property="og:image"]').attr('content') || '';
  if (!image) {
    image = $('.product-image img, .product-gallery img, .product__image img').first().attr('src') || '';
  }
  
  // Description
  let description = $('meta[property="og:description"]').attr('content') || '';
  
  // Category from breadcrumbs
  let category = '';
  let subcategory = '';
  const breadcrumbs = [];
  $('a').each((i, el) => {
    const href = $(el).attr('href') || '';
    const text = $(el).text().trim();
    if (text.length > 0 && text.length < 60) {
      // Breadcrumb pattern - links that appear in typical breadcrumb containers
      const parent = $(el).parent();
      const parentClass = parent.attr('class') || '';
      if (parentClass.includes('breadcrumb') || parentClass.includes('crumb')) {
        breadcrumbs.push({ href, text });
      }
    }
  });
  
  // Also look for breadcrumb by itemtype
  $('[itemtype*="BreadcrumbList"] a, .breadcrumb a, .breadcrumbs a, .b-breadcrumbs a').each((i, el) => {
    breadcrumbs.push({ href: $(el).attr('href') || '', text: $(el).text().trim() });
  });
  
  if (breadcrumbs.length >= 2) {
    category = breadcrumbs[breadcrumbs.length - 2]?.text || '';
    subcategory = breadcrumbs[breadcrumbs.length - 1]?.text || '';
  }
  
  // Specs/characteristics
  const specs = {};
  // Common patterns for spec tables
  $('table tr, .characteristics tr, .product-params tr, .specs tr, .product-features__item').each((i, el) => {
    const cells = $(el).find('td, th, .label, .value, dt, dd');
    if (cells.length >= 2) {
      const key = $(cells[0]).text().trim();
      const val = $(cells[1]).text().trim();
      if (key && val && key.length < 60 && val.length < 100) {
        specs[key] = val;
      }
    }
  });
  
  // Also try dl/dt/dd pattern
  $('dl').each((i, dl) => {
    $(dl).find('dt').each((j, dt) => {
      const key = $(dt).text().trim();
      const dd = $(dt).next('dd');
      if (dd.length) {
        const val = dd.text().trim();
        if (key && val) specs[key] = val;
      }
    });
  });
  
  // Try div-based specs
  $('.product-params__item, .product-features__item, .product-char__item').each((i, el) => {
    const label = $(el).find('.product-params__label, .product-features__label, .label, span:first-child').text().trim();
    const value = $(el).find('.product-params__value, .product-features__value, .value, span:last-child').text().trim();
    if (label && value && label !== value) specs[label] = value;
  });
  
  // In stock
  let inStock = true;
  const stockText = $('body').text();
  if (/нет в наличии|немає в наявності|нема в наявності/i.test(stockText)) inStock = false;
  if (/в наличии|в наявності|є в наявності/i.test(stockText)) inStock = true;
  
  // SKU
  let sku = '';
  const skuMatch = $('body').text().match(/Артикул[:\s]+([A-Za-z0-9-]+)/);
  if (skuMatch) sku = skuMatch[1];
  
  // Unit
  let unit = 'шт';
  if (/\/м²|грн\/м2|за м²/.test($('body').text())) unit = 'м²';
  else if (/\/м\.п\.|за м\.п\./.test($('body').text())) unit = 'м.п.';
  
  return { name, price, oldPrice, image, description, category, subcategory, specs, inStock, sku, unit, url };
}

async function main() {
  // First parse one product in detail to verify
  const testUrls = [
    'https://domfasad.com.ua/ua/fagot-kolotyy-20mm-15kg/',
    'https://domfasad.com.ua/ua/terrasnaya-doska-dpk-bruggan-multicolor-130x19/',
    'https://domfasad.com.ua/ua/vinil-sayding-mitten-oregon-pride/',
  ];
  
  for (const url of testUrls) {
    try {
      console.log(`\n=== ${url} ===`);
      const html = await fetchPage(url);
      const product = parseProduct(html, url);
      console.log(JSON.stringify(product, null, 2));
      
      // Also output raw price/spec content for debugging
      const $ = cheerio.load(html);
      
      // Find all text containing "грн"
      const priceTexts = [];
      $('*').each((i, el) => {
        const t = $(el).clone().children().remove().end().text().trim();
        if (t && /\d+.*грн|₴/i.test(t) && t.length < 100) priceTexts.push(t);
      });
      console.log('\nPrice-related text:', priceTexts.slice(0, 5));
      
      // Find breadcrumbs
      console.log('\nBreadcrumb candidates:');
      $('[class*=breadcrumb], [class*=crumb], [itemtype*=Breadcrumb]').each((i, el) => {
        console.log(' ', $(el).text().trim().replace(/\s+/g, ' ').substring(0, 200));
      });
      
      // All classes containing product/spec/feature/param/char
      const specClasses = new Set();
      $('[class]').each((i, el) => {
        const cls = $(el).attr('class') || '';
        if (/param|spec|feature|char|detail|attr|prop/i.test(cls)) {
          specClasses.add(cls);
        }
      });
      console.log('\nSpec-related classes:', [...specClasses].slice(0, 20));
      
      await new Promise(r => setTimeout(r, 1000));
    } catch (e) {
      console.log(`ERROR: ${e.message}`);
    }
  }
}

main().catch(e => console.error(e));

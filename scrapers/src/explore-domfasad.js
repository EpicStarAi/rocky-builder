const axios = require('axios');
const cheerio = require('cheerio');

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

async function main() {
  // 1. Get catalog page
  console.log('=== Fetching catalog ===');
  const { data } = await axios.get('https://domfasad.com.ua/ua/katalog/', {
    headers: { 'User-Agent': UA, 'Accept': 'text/html', 'Accept-Language': 'uk-UA,uk;q=0.9' }
  });
  
  const $ = cheerio.load(data);
  console.log('Title:', $('title').text().trim());
  
  // Find all category links
  const links = new Set();
  $('a').each((i, el) => {
    const href = $(el).attr('href') || '';
    const text = $(el).text().trim();
    if (href && text && text.length > 2 && text.length < 100) {
      links.add(JSON.stringify({ href, text: text.substring(0, 80) }));
    }
  });
  
  console.log('\n=== All links with text ===');
  const parsed = [...links].map(l => JSON.parse(l));
  // Filter for catalog-like links
  const catalogLinks = parsed.filter(l => 
    l.href.includes('/ua/') && 
    !l.href.includes('#') && 
    !l.href.includes('javascript') &&
    !l.href.includes('login') &&
    !l.href.includes('register') &&
    !l.href.includes('oplata') &&
    !l.href.includes('obmen') &&
    !l.href.includes('kontakty') &&
    !l.href.includes('brendy') &&
    !l.href.includes('aktsii')
  );
  
  catalogLinks.forEach(l => console.log(l.href, '|', l.text));
  
  // 2. Now fetch a specific category to understand product HTML structure
  console.log('\n=== Fetching termopaneli category ===');
  const categories = [
    'https://domfasad.com.ua/ua/termopaneli/',
    'https://domfasad.com.ua/ua/fasadnye-paneli/',
    'https://domfasad.com.ua/ua/terrasnaya-doska-dpk/',
    'https://domfasad.com.ua/ua/sajding/',
    'https://domfasad.com.ua/ua/sofit/',
    'https://domfasad.com.ua/ua/klinkernaya-plitka/',
    'https://domfasad.com.ua/ua/vodostochnye-sistemy/',
    'https://domfasad.com.ua/ua/podsistema-dlya-fasada/',
  ];
  
  for (const catUrl of categories) {
    try {
      const { data: catData } = await axios.get(catUrl, {
        headers: { 'User-Agent': UA, 'Accept': 'text/html' },
        timeout: 10000
      });
      const c$ = cheerio.load(catData);
      const title = c$('title').text().trim();
      
      // Try common product selectors
      const selectors = [
        '.product-card', '.product-item', '.product', '.catalog-item',
        '.card-product', '.goods-item', '[data-product]', '.item-product',
        '.products-list .item', '.catalog-list .item', '.product-list-item',
        '.b-product-gallery__item', '.product-layout', '.product_item'
      ];
      
      let productCount = 0;
      let foundSelector = '';
      for (const sel of selectors) {
        const cnt = c$(sel).length;
        if (cnt > 0 && cnt > productCount) {
          productCount = cnt;
          foundSelector = sel;
        }
      }
      
      // Also try: look at all elements with price-like content
      let priceElements = 0;
      c$('*').each((i, el) => {
        const text = c$(el).text();
        if (/\d+\s*грн/.test(text) || /₴/.test(text)) priceElements++;
      });
      
      console.log(`\n${catUrl}`);
      console.log(`  Title: ${title}`);
      console.log(`  Products found: ${productCount} (selector: ${foundSelector})`);
      console.log(`  Elements with price: ${priceElements}`);
      
      if (productCount === 0) {
        // Try to find product-like blocks by looking at structure
        const allClasses = new Set();
        c$('[class]').each((i, el) => {
          const cls = c$(el).attr('class');
          if (cls && cls.length < 60) allClasses.add(cls);
        });
        const productish = [...allClasses].filter(c => 
          /product|item|card|goods|catalog/i.test(c)
        );
        console.log('  Product-like classes:', productish.slice(0, 15).join(', '));
      }
      
      // Show first product details
      if (productCount > 0) {
        const firstProduct = c$(foundSelector).first();
        console.log('  First product HTML (truncated):');
        console.log('  ', firstProduct.html()?.substring(0, 500));
      }
      
    } catch (e) {
      console.log(`\n${catUrl} - ERROR: ${e.message}`);
    }
  }
}

main().catch(e => console.error(e));

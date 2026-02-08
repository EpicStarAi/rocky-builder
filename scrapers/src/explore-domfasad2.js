const axios = require('axios');
const cheerio = require('cheerio');

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

async function getWithChallenge(url) {
  // First request - get challenge hash
  const resp1 = await axios.get(url, {
    headers: { 'User-Agent': UA, 'Accept': 'text/html', 'Accept-Language': 'uk-UA,uk;q=0.9' },
    maxRedirects: 0,
    validateStatus: () => true,
  });
  
  const html = typeof resp1.data === 'string' ? resp1.data : '';
  const hashMatch = html.match(/defaultHash\s*=\s*"([a-f0-9]+)"/);
  
  if (hashMatch) {
    const hash = hashMatch[1];
    // Second request with challenge cookie
    const resp2 = await axios.get(url, {
      headers: { 
        'User-Agent': UA,
        'Accept': 'text/html',
        'Accept-Language': 'uk-UA,uk;q=0.9',
        'Cookie': `challenge_passed=${hash}`,
      }
    });
    return resp2.data;
  }
  
  return resp1.data;
}

async function main() {
  // 1. Parse full catalog sitemap
  console.log('=== Fetching catalog sitemap ===');
  const { data: sitemapXml } = await axios.get(
    'https://domfasad.com.ua/content/export/domfasad.com.ua/catalog-sitemap.xml',
    { headers: { 'User-Agent': UA } }
  );
  
  const $s = cheerio.load(sitemapXml, { xmlMode: true });
  const allUrls = [];
  $s('url').each((i, el) => {
    const loc = $s(el).find('loc').text();
    const img = $s(el).find('image\\:loc').text();
    if (loc) allUrls.push({ url: loc, image: img });
  });
  
  console.log(`Total URLs in sitemap: ${allUrls.length}`);
  console.log('Sample URLs:');
  allUrls.slice(0, 20).forEach(u => console.log(`  ${u.url}  [img: ${u.image ? 'yes' : 'no'}]`));
  
  // 2. Try the homepage with challenge cookie
  console.log('\n=== Fetching homepage with challenge ===');
  const homeHtml = await getWithChallenge('https://domfasad.com.ua/ua/');
  const $h = cheerio.load(homeHtml);
  console.log('Title:', $h('title').text().trim());
  console.log('Has body content:', $h('body').text().trim().length > 100);
  
  // Look for category links in nav
  const navLinks = [];
  $h('a').each((i, el) => {
    const href = $h(el).attr('href') || '';
    const text = $h(el).text().trim();
    if (text.length > 2 && text.length < 80 && href.startsWith('/')) {
      navLinks.push({ href, text });
    }
  });
  console.log('\nNav links found:', navLinks.length);
  navLinks.forEach(l => console.log(`  ${l.href} | ${l.text}`));
  
  // 3. Try API with challenge cookie
  console.log('\n=== Trying API endpoints ===');
  // Get challenge hash first
  const resp1 = await axios.get('https://domfasad.com.ua/', {
    headers: { 'User-Agent': UA },
    maxRedirects: 0,
    validateStatus: () => true,
  });
  const hashMatch = (resp1.data || '').match(/defaultHash\s*=\s*"([a-f0-9]+)"/);
  const hash = hashMatch ? hashMatch[1] : '';
  
  const apiEndpoints = [
    '/api/v1/catalog',
    '/api/v1/categories', 
    '/api/v1/products',
    '/api/v2/catalog',
    '/api/catalog/list',
    '/api/catalog/categories',
    '/api/menu',
    '/api/site/menu',
  ];
  
  for (const ep of apiEndpoints) {
    try {
      const resp = await axios.get(`https://domfasad.com.ua${ep}`, {
        headers: { 
          'User-Agent': UA, 
          'Accept': 'application/json',
          'Cookie': `challenge_passed=${hash}`,
        },
        timeout: 5000,
        validateStatus: s => s < 500,
      });
      if (resp.status === 200 && resp.data) {
        const j = typeof resp.data === 'string' ? resp.data.substring(0, 300) : JSON.stringify(resp.data).substring(0, 300);
        if (!j.includes('UNDEFINED_FUNCTION')) {
          console.log(`✅ ${ep}: ${j}`);
        }
      }
    } catch (e) {}
  }
  
  // 4. Try fetching a product page with challenge
  console.log('\n=== Fetching a product page ===');
  if (allUrls.length > 0) {
    const productUrl = allUrls[0].url;
    console.log('URL:', productUrl);
    const productHtml = await getWithChallenge(productUrl);
    const $p = cheerio.load(productHtml);
    console.log('Title:', $p('title').text().trim());
    console.log('Body length:', $p('body').text().trim().length);
    
    // Look for price, name, description
    const h1 = $p('h1').text().trim();
    console.log('H1:', h1);
    
    // Look for JSON-LD structured data
    $p('script[type="application/ld+json"]').each((i, el) => {
      console.log('JSON-LD:', $p(el).html()?.substring(0, 500));
    });
    
    // Look for og:tags
    const ogTitle = $p('meta[property="og:title"]').attr('content');
    const ogDesc = $p('meta[property="og:description"]').attr('content');
    const ogImage = $p('meta[property="og:image"]').attr('content');
    console.log('OG Title:', ogTitle);
    console.log('OG Desc:', ogDesc);
    console.log('OG Image:', ogImage);
    
    // Print some of the content
    console.log('\nBody text (first 1000):', $p('body').text().trim().substring(0, 1000));
  }
}

main().catch(e => console.error('ERROR:', e.message));

const axios = require('axios');
const cheerio = require('cheerio');

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

async function main() {
  // Try getting the raw HTML to find API endpoints or data
  const { data } = await axios.get('https://domfasad.com.ua/', {
    headers: { 'User-Agent': UA, 'Accept': 'text/html' }
  });
  
  // Search for API endpoints in the JavaScript
  const apiMatches = data.match(/\/api\/[^"'\s]*/g) || [];
  const fetchMatches = data.match(/fetch\s*\([^)]+\)/g) || [];
  const axiosMatches = data.match(/axios\.[a-z]+\s*\([^)]+\)/g) || [];
  const urlMatches = data.match(/https?:\/\/[^"'\s<>]+domfasad[^"'\s<>]*/g) || [];
  const dataUrls = data.match(/["'](\/[a-z][\w/-]*\.json)["']/g) || [];
  const graphql = data.match(/graphql|query\s*{/gi) || [];
  
  console.log('API endpoints:', apiMatches.slice(0, 10));
  console.log('Fetch calls:', fetchMatches.slice(0, 5));
  console.log('URLs with domfasad:', urlMatches.slice(0, 10));
  console.log('JSON URLs:', dataUrls.slice(0, 10));
  console.log('GraphQL:', graphql.slice(0, 5));
  
  // Try common API patterns
  const apiPaths = [
    '/api/catalog',
    '/api/products',
    '/api/categories',
    '/wp-json/wp/v2/posts',
    '/graphql',
    '/rest/V1/categories',
    '/content/export/domfasad.com.ua/catalog-sitemap.xml',
  ];
  
  for (const path of apiPaths) {
    try {
      const url = `https://domfasad.com.ua${path}`;
      const resp = await axios.get(url, {
        headers: { 'User-Agent': UA, 'Accept': 'application/json,text/html' },
        timeout: 5000,
        validateStatus: s => s < 500
      });
      if (resp.status === 200) {
        const preview = typeof resp.data === 'string' 
          ? resp.data.substring(0, 500) 
          : JSON.stringify(resp.data).substring(0, 500);
        console.log(`\n✅ ${url} (${resp.status})`);
        console.log(preview);
      }
    } catch (e) {}
  }
  
  // Check if it's a Next.js or Nuxt site by looking at script tags
  const $ = cheerio.load(data);
  const scripts = [];
  $('script').each((i, el) => {
    const src = $(el).attr('src') || '';
    if (src) scripts.push(src);
  });
  console.log('\nScript sources:', scripts.slice(0, 10));
  
  // Check for __NEXT_DATA__ or __NUXT__
  const nextData = data.includes('__NEXT_DATA__');
  const nuxtData = data.includes('__NUXT__');
  const nuxt3 = data.includes('nuxt') || data.includes('_nuxt');
  console.log('\nNext.js:', nextData, '| Nuxt:', nuxtData, '| Nuxt-like:', nuxt3);
  
  // Look for meta/link in head for clues
  $('meta').each((i, el) => {
    const name = $(el).attr('name') || $(el).attr('property') || '';
    const content = $(el).attr('content') || '';
    if (name && content) console.log(`Meta: ${name} = ${content.substring(0, 100)}`);
  });
  
  // Print first 2000 chars of HTML to understand structure
  console.log('\n=== RAW HTML first 2000 chars ===');
  console.log(data.substring(0, 2000));
}

main().catch(e => console.error(e.message));

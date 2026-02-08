/**
 * Конвертация scraped JSON → frontend/src/data/products.ts
 * 
 * Usage: node src/generate-products-ts.js [path-to-json]
 *        По умолчанию ищет последний файл в output/
 */

const fs = require('fs');
const path = require('path');

// Маппинг категорий domfasad → slug
const CATEGORY_MAP = {
  'Термопанелі фасадні': { slug: 'termopaneli-fasadni', nameUa: 'Термопанелі фасадні', nameRu: 'Термопанели фасадные' },
  'Терасна дошка': { slug: 'terasna-doshka', nameUa: 'Терасна дошка', nameRu: 'Террасная доска' },
  'Фасадна дошка': { slug: 'fasadna-doshka', nameUa: 'Фасадна дошка', nameRu: 'Фасадная доска' },
  'Металочерепиця': { slug: 'metalocherepytsya', nameUa: 'Металочерепиця', nameRu: 'Металлочерепица' },
  'Бітумна черепиця': { slug: 'bitumna-cherepytsya', nameUa: 'Бітумна черепиця', nameRu: 'Битумная черепица' },
  'Бітумна черепиця Акваізол': { slug: 'bitumna-cherepytsya-akvaizol', nameUa: 'Бітумна черепиця Акваізол', nameRu: 'Битумная черепица Акваизол' },
  'Цементно-піщана черепиця Braas': { slug: 'tsementna-cherepytsya-braas', nameUa: 'Цементно-піщана черепиця Braas', nameRu: 'Цементно-песчаная черепица Braas' },
  'Керамічна черепиця': { slug: 'keramichna-cherepytsya', nameUa: 'Керамічна черепиця', nameRu: 'Керамическая черепица' },
  'Фальцева покрівля': { slug: 'faltseva-pokrivlya', nameUa: 'Фальцева покрівля', nameRu: 'Фальцевая кровля' },
  'Віниловий сайдинг': { slug: 'vinilovyi-saiding', nameUa: 'Віниловий сайдинг', nameRu: 'Виниловый сайдинг' },
  'Цокольний сайдинг': { slug: 'tsokolnyi-saiding', nameUa: 'Цокольний сайдинг', nameRu: 'Цокольный сайдинг' },
  'Сайдинг софіт': { slug: 'saiding-sofit', nameUa: 'Сайдинг софіт', nameRu: 'Сайдинг софит' },
  'Металевий сайдинг': { slug: 'metalevyi-saiding', nameUa: 'Металевий сайдинг', nameRu: 'Металлический сайдинг' },
  'Металевий софіт': { slug: 'metalevyi-sofit', nameUa: 'Металевий софіт', nameRu: 'Металлический софит' },
  'Профнастил': { slug: 'profnastyl', nameUa: 'Профнастил', nameRu: 'Профнастил' },
  'Профнастил гладкий': { slug: 'profnastyl-gladkyi', nameUa: 'Профнастил гладкий', nameRu: 'Профнастил гладкий' },
  'Профнастил ПС-7': { slug: 'profnastyl-ps-7', nameUa: 'Профнастил ПС-7', nameRu: 'Профнастил ПС-7' },
  'Профнастил ПС-8': { slug: 'profnastyl-ps-8', nameUa: 'Профнастил ПС-8', nameRu: 'Профнастил ПС-8' },
  'Профнастил ПС-10': { slug: 'profnastyl-ps-10', nameUa: 'Профнастил ПС-10', nameRu: 'Профнастил ПС-10' },
  'Профнастил ПК-10': { slug: 'profnastyl-pk-10', nameUa: 'Профнастил ПК-10', nameRu: 'Профнастил ПК-10' },
  'Профнастил ПС-15': { slug: 'profnastyl-ps-15', nameUa: 'Профнастил ПС-15', nameRu: 'Профнастил ПС-15' },
  'Профнастил ПК-15': { slug: 'profnastyl-pk-15', nameUa: 'Профнастил ПК-15', nameRu: 'Профнастил ПК-15' },
  'Профнастил ПС-20': { slug: 'profnastyl-ps-20', nameUa: 'Профнастил ПС-20', nameRu: 'Профнастил ПС-20' },
  'Профнастил ПК-20': { slug: 'profnastyl-pk-20', nameUa: 'Профнастил ПК-20', nameRu: 'Профнастил ПК-20' },
  'Профнастил ПК-35': { slug: 'profnastyl-pk-35', nameUa: 'Профнастил ПК-35', nameRu: 'Профнастил ПК-35' },
  'Водостічні системи': { slug: 'vodostichni-systemy', nameUa: 'Водостічні системи', nameRu: 'Водосточные системы' },
  'Дренажні канали TOR': { slug: 'drenazhni-kanaly', nameUa: 'Дренажні канали TOR', nameRu: 'Дренажные каналы TOR' },
  'Утеплювач': { slug: 'utepliuvach', nameUa: 'Утеплювач', nameRu: 'Утеплитель' },
  'Мінеральна вата': { slug: 'mineralna-vata', nameUa: 'Мінеральна вата', nameRu: 'Минеральная вата' },
  'Базальтова вата': { slug: 'bazaltova-vata', nameUa: 'Базальтова вата', nameRu: 'Базальтовая вата' },
  'Полікарбонат': { slug: 'polikarbonat', nameUa: 'Полікарбонат', nameRu: 'Поликарбонат' },
  'Теплиці': { slug: 'teplytsi', nameUa: 'Теплиці', nameRu: 'Теплицы' },
  'Плівки, мембрани, стрічки': { slug: 'plivky-membrany', nameUa: 'Плівки, мембрани, стрічки', nameRu: 'Пленки, мембраны, ленты' },
  'Вітробар\'єр': { slug: 'vitrobarier', nameUa: 'Вітробар\'єр', nameRu: 'Ветробарьер' },
  'Гідробар\'єр': { slug: 'gidrobarier', nameUa: 'Гідробар\'єр', nameRu: 'Гидробарьер' },
  'Паробар\'єр': { slug: 'parobarier', nameUa: 'Паробар\'єр', nameRu: 'Паробарьер' },
  'Євробар\'єр': { slug: 'yevrobarier', nameUa: 'Євробар\'єр', nameRu: 'Евробарьер' },
  'Бордюрна стрічка': { slug: 'bordiurna-strichka', nameUa: 'Бордюрна стрічка', nameRu: 'Бордюрная лента' },
  'Монтаж сайдингу': { slug: 'montazh-saidyngu', nameUa: 'Монтаж сайдингу', nameRu: 'Монтаж сайдинга' },
  'Сітка та огорожі': { slug: 'sitka-ogorozhi', nameUa: 'Сітка та огорожі', nameRu: 'Сетка и ограждения' },
  'Сітка, Паркани з сітки, Ворота та Хвіртки': { slug: 'sitka-ogorozhi', nameUa: 'Сітка та огорожі', nameRu: 'Сетка и ограждения' },
  'Євроштахетник': { slug: 'yevroshtakhetnyk', nameUa: 'Євроштахетник', nameRu: 'Евроштакетник' },
  'Штахетник широкий': { slug: 'shtakhetnyk-shyrokyi', nameUa: 'Штахетник широкий', nameRu: 'Штакетник широкий' },
  'Забори та огорожі ПВХ': { slug: 'zabory-pvkh', nameUa: 'Забори та огорожі ПВХ', nameRu: 'Заборы и ограждения ПВХ' },
  'Забори жалюзі': { slug: 'zabory-zhaluzi', nameUa: 'Забори жалюзі', nameRu: 'Заборы жалюзи' },
  'Паркани та огорожі': { slug: 'parkany-ogorozhi', nameUa: 'Паркани та огорожі', nameRu: 'Заборы и ограждения' },
  'Сайдинг': { slug: 'saiding', nameUa: 'Сайдинг', nameRu: 'Сайдинг' },
  'Черепиця': { slug: 'cherepytsya', nameUa: 'Черепиця', nameRu: 'Черепица' },
  'Оздоблювальні матеріали': { slug: 'ozdob-materialy', nameUa: 'Оздоблювальні матеріали', nameRu: 'Отделочные материалы' },
};

// Группировка подкатегорий в главные
const PARENT_CATEGORIES = {
  'termopaneli-fasadni': 'termopaneli-fasadni',
  'terasna-doshka': 'terasna-doshka',
  'fasadna-doshka': 'fasadna-doshka',
  // Черепица group
  'metalocherepytsya': 'cherepytsya',
  'bitumna-cherepytsya': 'cherepytsya',
  'bitumna-cherepytsya-akvaizol': 'cherepytsya',
  'tsementna-cherepytsya-braas': 'cherepytsya',
  'keramichna-cherepytsya': 'cherepytsya',
  'faltseva-pokrivlya': 'cherepytsya',
  'cherepytsya': 'cherepytsya',
  // Сайдинг group
  'vinilovyi-saiding': 'saiding',
  'tsokolnyi-saiding': 'saiding',
  'saiding-sofit': 'saiding',
  'metalevyi-saiding': 'saiding',
  'metalevyi-sofit': 'saiding',
  'saiding': 'saiding',
  // Профнастил group
  'profnastyl': 'profnastyl',
  'profnastyl-gladkyi': 'profnastyl',
  'profnastyl-ps-7': 'profnastyl',
  'profnastyl-ps-8': 'profnastyl',
  'profnastyl-ps-10': 'profnastyl',
  'profnastyl-pk-10': 'profnastyl',
  'profnastyl-ps-15': 'profnastyl',
  'profnastyl-pk-15': 'profnastyl',
  'profnastyl-ps-20': 'profnastyl',
  'profnastyl-pk-20': 'profnastyl',
  'profnastyl-pk-35': 'profnastyl',
  // Водосток
  'vodostichni-systemy': 'vodostichni-systemy',
  'drenazhni-kanaly': 'vodostichni-systemy',
  // Утеплитель group
  'utepliuvach': 'utepliuvach',
  'mineralna-vata': 'utepliuvach',
  'bazaltova-vata': 'utepliuvach',
  'vitrobarier': 'utepliuvach',
  'gidrobarier': 'utepliuvach',
  'parobarier': 'utepliuvach',
  'yevrobarier': 'utepliuvach',
  'plivky-membrany': 'utepliuvach',
  'bordiurna-strichka': 'utepliuvach',
  // Полікарбонат & теплиці
  'polikarbonat': 'polikarbonat',
  'teplytsi': 'polikarbonat',
  // Забор/огорожі
  'sitka-ogorozhi': 'ogorozhi',
  'yevroshtakhetnyk': 'ogorozhi',
  'shtakhetnyk-shyrokyi': 'ogorozhi',
  'zabory-pvkh': 'ogorozhi',
  'zabory-zhaluzi': 'ogorozhi',
  'parkany-ogorozhi': 'ogorozhi',
  // Монтаж
  'montazh-saidyngu': 'montazh',
  // Отделочные
  'ozdob-materialy': 'ozdob-materialy',
};

// Главные категории для навигации
const MAIN_CATEGORIES = [
  { slug: 'termopaneli-fasadni', nameUa: 'Термопанелі фасадні', nameRu: 'Термопанели фасадные', icon: '🏠' },
  { slug: 'saiding', nameUa: 'Сайдинг', nameRu: 'Сайдинг', icon: '🔧' },
  { slug: 'vodostichni-systemy', nameUa: 'Водостічні системи', nameRu: 'Водосточные системы', icon: '💧' },
  { slug: 'polikarbonat', nameUa: 'Полікарбонат і теплиці', nameRu: 'Поликарбонат и теплицы', icon: '🌿' },
  { slug: 'cherepytsya', nameUa: 'Черепиця', nameRu: 'Черепица', icon: '🏗️' },
  { slug: 'profnastyl', nameUa: 'Профнастил', nameRu: 'Профнастил', icon: '📐' },
  { slug: 'ozdob-materialy', nameUa: 'Оздоблювальні матеріали', nameRu: 'Отделочные материалы', icon: '🎨' },
  { slug: 'terasna-doshka', nameUa: 'Терасна дошка', nameRu: 'Террасная доска', icon: '🪵' },
  { slug: 'ogorozhi', nameUa: 'Огорожі та паркани', nameRu: 'Ограждения и заборы', icon: '🏗️' },
  { slug: 'utepliuvach', nameUa: 'Утеплювач', nameRu: 'Утеплитель', icon: '🧱' },
  { slug: 'fasadna-doshka', nameUa: 'Фасадна дошка', nameRu: 'Фасадная доска', icon: '🪵' },
];

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/['"]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9а-яіїєґ\-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function getCategorySlug(catName) {
  if (!catName) return 'other';
  const mapped = CATEGORY_MAP[catName];
  if (mapped) return mapped.slug;
  // Попробуем нечёткий поиск
  for (const [key, val] of Object.entries(CATEGORY_MAP)) {
    if (catName.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(catName.toLowerCase())) {
      return val.slug;
    }
  }
  return slugify(catName);
}

function getParentCategory(catSlug) {
  return PARENT_CATEGORIES[catSlug] || catSlug;
}

function escapeTS(str) {
  return str.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n');
}

function main() {
  // Find JSON file
  let jsonPath = process.argv[2];
  if (!jsonPath) {
    const outputDir = path.join(__dirname, '..', 'output');
    const files = fs.readdirSync(outputDir).filter(f => f.startsWith('domfasad-products-') && f.endsWith('.json'));
    files.sort().reverse();
    if (files.length === 0) {
      console.error('Не найден JSON с продуктами! Запустите скрапер сначала.');
      process.exit(1);
    }
    jsonPath = path.join(outputDir, files[0]);
  }

  console.log('Чтение:', jsonPath);
  const rawProducts = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
  console.log('Всего товаров в JSON:', rawProducts.length);

  // Determine unique categories
  const catCounts = {};
  rawProducts.forEach(p => {
    const catSlug = getCategorySlug(p.category);
    const parentSlug = getParentCategory(catSlug);
    catCounts[parentSlug] = (catCounts[parentSlug] || 0) + 1;
  });
  
  console.log('\nКатегории (parent):');
  Object.entries(catCounts).sort((a, b) => b[1] - a[1]).forEach(([slug, count]) => {
    console.log(`  ${slug}: ${count}`);
  });

  // Build categories array for TS
  const usedCategories = MAIN_CATEGORIES.filter(c => catCounts[c.slug] > 0);
  // Add any missing parent categories
  for (const [slug, count] of Object.entries(catCounts)) {
    if (!usedCategories.find(c => c.slug === slug)) {
      usedCategories.push({
        slug,
        nameUa: slug.replace(/-/g, ' '),
        nameRu: slug.replace(/-/g, ' '),
        icon: '📦',
      });
    }
  }

  // Build products
  const tsProducts = rawProducts.map((p, i) => {
    const catSlug = getCategorySlug(p.category);
    const parentSlug = getParentCategory(catSlug);
    return {
      id: `df-${String(i + 1).padStart(4, '0')}`,
      slug: p.slug || `product-${i + 1}`,
      name: p.name,
      nameRu: p.name, // domfasad is UA, use same name for now
      description: (p.description || '').substring(0, 300),
      descriptionRu: (p.description || '').substring(0, 300),
      price: p.price,
      oldPrice: p.oldPrice || undefined,
      unit: p.unit || 'шт',
      image: p.image,
      category: parentSlug,
      subcategory: catSlug !== parentSlug ? catSlug : undefined,
      inStock: p.inStock !== false,
      specs: p.specs && Object.keys(p.specs).length > 0 ? p.specs : undefined,
      sku: p.sku || undefined,
    };
  });

  // Generate TS file
  let ts = `// Auto-generated from domfasad.com.ua scraper — ${new Date().toISOString().split('T')[0]}
// Total: ${tsProducts.length} products, ${usedCategories.length} categories

export interface Product {
  id: string;
  slug: string;
  name: string;
  nameRu: string;
  description: string;
  descriptionRu: string;
  price: number;
  oldPrice?: number;
  unit: string;
  image: string;
  category: string;
  subcategory?: string;
  inStock: boolean;
  specs?: Record<string, string>;
  sku?: string;
}

export interface Category {
  slug: string;
  nameUa: string;
  nameRu: string;
  descriptionUa: string;
  descriptionRu: string;
  image: string;
  productCount?: number;
}

`;

  // Categories
  ts += 'export const categories: Category[] = [\n';
  for (const cat of usedCategories) {
    const count = catCounts[cat.slug] || 0;
    // Find first product image in this category
    const firstProduct = tsProducts.find(p => p.category === cat.slug);
    const image = firstProduct ? firstProduct.image : '';
    ts += `  {\n`;
    ts += `    slug: '${escapeTS(cat.slug)}',\n`;
    ts += `    nameUa: '${escapeTS(cat.nameUa)}',\n`;
    ts += `    nameRu: '${escapeTS(cat.nameRu)}',\n`;
    ts += `    descriptionUa: '${count} товарів у категорії',\n`;
    ts += `    descriptionRu: '${count} товаров в категории',\n`;
    ts += `    image: '${escapeTS(image)}',\n`;
    ts += `    productCount: ${count},\n`;
    ts += `  },\n`;
  }
  ts += '];\n\n';

  // Products
  ts += 'export const products: Product[] = [\n';
  for (const p of tsProducts) {
    ts += `  {\n`;
    ts += `    id: '${escapeTS(p.id)}',\n`;
    ts += `    slug: '${escapeTS(p.slug)}',\n`;
    ts += `    name: '${escapeTS(p.name)}',\n`;
    ts += `    nameRu: '${escapeTS(p.nameRu)}',\n`;
    ts += `    description: '${escapeTS(p.description)}',\n`;
    ts += `    descriptionRu: '${escapeTS(p.descriptionRu)}',\n`;
    ts += `    price: ${p.price},\n`;
    if (p.oldPrice) ts += `    oldPrice: ${p.oldPrice},\n`;
    ts += `    unit: '${escapeTS(p.unit)}',\n`;
    ts += `    image: '${escapeTS(p.image)}',\n`;
    ts += `    category: '${escapeTS(p.category)}',\n`;
    if (p.subcategory) ts += `    subcategory: '${escapeTS(p.subcategory)}',\n`;
    ts += `    inStock: ${p.inStock},\n`;
    if (p.sku) ts += `    sku: '${escapeTS(p.sku)}',\n`;
    if (p.specs) {
      ts += `    specs: {\n`;
      for (const [key, val] of Object.entries(p.specs)) {
        ts += `      '${escapeTS(key)}': '${escapeTS(val)}',\n`;
      }
      ts += `    },\n`;
    }
    ts += `  },\n`;
  }
  ts += '];\n\n';

  // Project photos (keep original)
  ts += `export const projectPhotos = [
  {
    id: 'ph-01',
    title: 'Чорноморськ — Колотий камінь',
    titleRu: 'Черноморск — Колотый камень',
    images: [
      'https://www.rocky.net.ua/foto-rocky/termopaneli/termop-foto-obektu/055-chernomorsk-kolotui-935-tsokol-660/21.jpg',
      'https://www.rocky.net.ua/foto-rocky/termopaneli/termop-foto-obektu/055-chernomorsk-kolotui-935-tsokol-660/22.jpg',
    ],
  },
  {
    id: 'ph-02',
    title: 'Буча — Колотий камінь + Дикий камінь',
    titleRu: 'Буча — Колотый камень + Дикий камень',
    images: [
      'https://www.rocky.net.ua/foto-rocky/termopaneli/termop-foto-obektu/051-bycha-678-kolotui-678-diki-kam/1.jpg',
      'https://www.rocky.net.ua/foto-rocky/termopaneli/termop-foto-obektu/051-bycha-678-kolotui-678-diki-kam/2.jpg',
    ],
  },
];

export const companyInfo = {
  name: 'TM ROCKY',
  phones: ['+38 (063) 930-99-26', '+38 (066) 014-30-36'],
  productionAddress: 'Бориспільський р-н, село Дударків, вул. Нова',
  showroomAddress: 'м. Київ, вул. Анни Ахматової, 13Д',
  email: 'info@rocky-builder.ua',
  workingHours: {
    weekdays: 'Пн-Пт: 9:00 - 18:00',
    saturday: 'Сб: 9:00 - 15:00',
    sunday: 'Нд: Вихідний',
  },
};
`;

  const outputPath = path.join(__dirname, '..', '..', 'frontend', 'src', 'data', 'products.ts');
  fs.writeFileSync(outputPath, ts, 'utf-8');
  console.log('\n✅ Файл создан:', outputPath);
  console.log(`   ${tsProducts.length} товаров, ${usedCategories.length} категорий`);
}

main();

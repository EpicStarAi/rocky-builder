/**
 * ROCKY BUILDER — Спільні утиліти для скраперів
 * Логування, HTTP-клієнт, затримки, збереження результатів
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');
const winston = require('winston');

// ── Логер ──────────────────────────────────────────────────────────────
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.printf(({ timestamp, level, message }) =>
      `${timestamp} [${level.toUpperCase().padEnd(5)}] ${message}`
    )
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({
      filename: path.join(__dirname, '..', 'output', 'scraper.log'),
      maxsize: 5_000_000,
    }),
  ],
});

// ── HTTP-клієнт з ретраями ─────────────────────────────────────────────
const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

const httpClient = axios.create({
  timeout: 30_000,
  headers: {
    'User-Agent': UA,
    'Accept-Language': 'uk-UA,uk;q=0.9,ru;q=0.8,en;q=0.7',
    Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  },
});

/**
 * Запит з автоматичними ретраями та затримкою (rate-limit-friendly).
 */
async function fetchPage(url, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await httpClient.get(url);
      return res.data;
    } catch (err) {
      const status = err.response?.status;
      logger.warn(
        `Спроба ${attempt}/${retries} для ${url} — ${status ?? err.code ?? err.message}`
      );
      if (attempt < retries) {
        const delay = 2000 * attempt + Math.random() * 1000;
        await sleep(delay);
      } else {
        throw err;
      }
    }
  }
}

// ── Helpers ────────────────────────────────────────────────────────────
function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

/** Безпечний парсинг ціни з рядка «341 грн/м²» */
function parsePrice(text) {
  if (!text) return null;
  const cleaned = text.replace(/\s/g, '').replace(',', '.');
  const match = cleaned.match(/([\d.]+)/);
  return match ? parseFloat(match[1]) : null;
}

/** Визначення одиниці виміру з рядка ціни */
function parseUnit(text) {
  if (!text) return 'шт';
  const t = text.toLowerCase();
  if (t.includes('м²') || t.includes('м2') || t.includes('кв.м')) return 'м²';
  if (t.includes('м.п') || t.includes('м п') || t.includes('мп')) return 'м.п.';
  if (t.includes('уп')) return 'уп';
  return 'шт';
}

/** Генерація slug з назви */
function slugify(str) {
  const map = {
    а: 'a', б: 'b', в: 'v', г: 'g', ґ: 'g', д: 'd', е: 'e', є: 'ye',
    ж: 'zh', з: 'z', и: 'y', і: 'i', ї: 'yi', й: 'y', к: 'k', л: 'l',
    м: 'm', н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't', у: 'u',
    ф: 'f', х: 'kh', ц: 'ts', ч: 'ch', ш: 'sh', щ: 'shch', ь: '',
    ю: 'yu', я: 'ya', ъ: '', э: 'e', ы: 'y',
  };

  return str
    .toLowerCase()
    .split('')
    .map((c) => map[c] ?? c)
    .join('')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 250);
}

// ── Збереження результатів ─────────────────────────────────────────────
function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function saveJSON(filename, data) {
  const dir = path.join(__dirname, '..', 'output');
  ensureDir(dir);
  const filepath = path.join(dir, filename);
  fs.writeFileSync(filepath, JSON.stringify(data, null, 2), 'utf-8');
  logger.info(`Збережено ${data.length} товарів → ${filepath}`);
}

function saveCSV(filename, data) {
  if (!data.length) return;
  const dir = path.join(__dirname, '..', 'output');
  ensureDir(dir);

  const headers = Object.keys(flattenProduct(data[0]));
  const rows = data.map((p) => {
    const flat = flattenProduct(p);
    return headers
      .map((h) => {
        let v = flat[h] ?? '';
        if (typeof v === 'string' && (v.includes(',') || v.includes('"') || v.includes('\n'))) {
          v = `"${v.replace(/"/g, '""')}"`;
        }
        return v;
      })
      .join(',');
  });

  const csv = [headers.join(','), ...rows].join('\n');
  const filepath = path.join(dir, filename);
  fs.writeFileSync(filepath, '\uFEFF' + csv, 'utf-8'); // BOM для Excel
  logger.info(`CSV збережено → ${filepath}`);
}

/** Розгортання вкладеного об'єкта для CSV */
function flattenProduct(p) {
  const flat = { ...p };
  if (flat.images && Array.isArray(flat.images)) {
    flat.images = flat.images.join(' | ');
  }
  if (flat.colors && Array.isArray(flat.colors)) {
    flat.colors = flat.colors.join(' | ');
  }
  if (flat.attributes && typeof flat.attributes === 'object') {
    for (const [k, v] of Object.entries(flat.attributes)) {
      flat[`attr_${k}`] = v;
    }
    delete flat.attributes;
  }
  return flat;
}

module.exports = {
  logger,
  fetchPage,
  sleep,
  parsePrice,
  parseUnit,
  slugify,
  saveJSON,
  saveCSV,
  ensureDir,
};

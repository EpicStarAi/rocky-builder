# ROCKY BUILDER — Скрапери

Автоматичні парсери для збору товарів з сайтів-постачальників.

## Джерела

| Сайт | Що збираємо |
|------|-------------|
| **akm.kiev.ua** | Металочерепиця, Профнастил, Бітумна черепиця, Водостоки, Забори, Сайдинг |
| **domfasad.com.ua** | Термопанелі, Фасадні панелі, Терасна дошка, Сайдинг, Клінкерна плитка |

## Швидкий старт

```bash
cd scrapers
npm install

# Тестовий запуск (2 категорії, ~1 хв)
npm run scrape:akm:test
npm run scrape:domfasad:test

# Повний парсинг одного сайту
npm run scrape:akm
npm run scrape:domfasad

# Парсинг усіх сайтів + об'єднання
npm run scrape:all
```

## Що збирається для кожного товару

| Поле | Опис |
|------|------|
| `name` | Назва товару |
| `sku` | Артикул/SKU |
| `price` | Ціна в грн |
| `old_price` | Стара ціна (якщо є знижка) |
| `unit` | Одиниця виміру (м², шт, м.п.) |
| `stock` | Наявність |
| `url` | URL товару на сайті-джерелі |
| `images` | Масив URL зображень |
| `colors` | Масив кольорів (RAL код, назва, зображення) |
| `category` | Категорія |
| `subcategory` | Підкатегорія |
| `attributes` | Характеристики (товщина, покриття, виробник, країна, гарантія, оцинкування) |

## Категорії AKM

- `/ua/metallocherepitsa/` — Monterrey, Premium, Retro, Maxima, Venera, Madera, Modern, Модульна
- `/ua/profnastil/` — ПС-07, ПС-08, ПС-10, ПС/ПК-15, ПС/ПК-18, ПС/ПК-20, ПК-35, Т-40, Т-45, Н-57, Н-75, Н-92
- `/ua/bitumnaya-cherepitsa/` — Aquaizol, IKO, Tegola, Kerabit, BTM
- `/ua/vodostochnye-sistemy/` — Profil, Rainway, Bryza
- `/ua/zabory-ograzhdeniya/` — Євроштакетник, Секційний, Жалюзі
- `/ua/sayding/`

## Результати

Файли зберігаються в папку `output/`:

```
output/
  akm-products-2026-02-08.json
  akm-products-2026-02-08.csv
  domfasad-products-2026-02-08.json
  domfasad-products-2026-02-08.csv
  all-products-2026-02-08.json       ← об'єднаний файл
  all-products-2026-02-08.csv
  scraper.log
```

## Характеристики, що витягуються з AKM

- `thickness_mm` — товщина металу (0.40, 0.43, 0.45, 0.50)
- `coating` — тип покриття (PE/PEMA/Print)
- `zinc_g_m2` — оцинкування (80, 100, 140, 225, 275 г/м²)
- `country` — країна виробника
- `manufacturer` — виробник сталі
- `width` — ширина листа
- `warranty_years` — гарантія (років)
- RAL кольори з зображеннями

## Rate Limiting

Скрапери дотримуються вежливого темпу:
- 0.8–1.5с між запитами сторінок
- 1.5–2.5с між категоріями
- Автоматичні ретраї (3 спроби)
- User-Agent імітує браузер

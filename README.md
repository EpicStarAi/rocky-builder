# ROCKY BUILDER - Гібридний каталог будівельних матеріалів

Професійна e-commerce платформа для агрегації та продажу будівельних матеріалів з трьох джерел (akm.kiev.ua, ac-rocky.ua, domfasad.com.ua).

## 🏗️ Архітектура

### Технологічний стек

**Frontend:**
- Next.js 15 (App Router) + React 18
- TypeScript + Tailwind CSS
- next-intl (UA/RU мультимовність)
- Zustand (state management)

**Backend:**
- PostgreSQL 16 (основна БД)
- Redis (кеш, сесії)
- Meilisearch (пошук)
- n8n (автоматизація парсингу)
- Medusa.js (e-commerce engine)

**Інфраструктура:**
- Docker Compose (локальна розробка)
- Hetzner VPS (production backend)
- Vercel (production frontend)

## 🚀 Швидкий старт

> **💡 Використовуєте VS Code?** Перегляньте [VSCODE_SETUP.md](./VSCODE_SETUP.md) для швидкої настройки з готовими tasks, debugging та extensions.

### Вимоги

- Node.js 18+
- Docker & Docker Compose
- Git
- (Рекомендовано) Visual Studio Code

### Крок 1: Клонування та встановлення

```bash
# Клонуємо репозиторій
git clone <repository-url>
cd rocky-builder

# Встановлюємо залежності frontend
cd frontend
npm install
cd ..
```

### Крок 2: Запуск інфраструктури

```bash
# Запускаємо всі сервіси через Docker Compose
docker-compose up -d

# Перевіряємо статус
docker-compose ps
```

Сервіси будуть доступні:
- PostgreSQL: `localhost:5432`
- Redis: `localhost:6379`
- Meilisearch: `http://localhost:7700`
- n8n: `http://localhost:5678` (admin/rocky2024)
- Medusa: `http://localhost:9000`

### Крок 3: Ініціалізація бази даних

База даних автоматично ініціалізується при першому запуску через `init.sql`.

Перевірка:
```bash
docker exec -it rocky-postgres psql -U rocky -d rocky_builder -c "\dt"
```

### Крок 4: Запуск Frontend

```bash
cd frontend

# Development mode
npm run dev

# Frontend доступний: http://localhost:3000
```

## 📁 Структура проекту

```
rocky-builder/
├── docker-compose.yml          # Оркестрація всіх сервісів
├── backend/
│   ├── init.sql               # SQL міграції
│   └── Dockerfile             # Medusa backend (TODO)
├── frontend/
│   ├── src/
│   │   ├── app/               # Next.js App Router
│   │   │   ├── [locale]/     # Мультимовні роути
│   │   │   └── globals.css   # Глобальні стилі
│   │   ├── components/        # React компоненти
│   │   │   ├── layout/       # Header, Footer
│   │   │   ├── ui/           # UI primitives
│   │   │   ├── product/      # Товарні компоненти
│   │   │   └── cart/         # Кошик
│   │   ├── lib/              # Утиліти, API клієнти
│   │   ├── types/            # TypeScript типи
│   │   └── i18n.ts           # Конфігурація мультимовності
│   ├── messages/             # Переклади (ua.json, ru.json)
│   ├── public/               # Статичні файли
│   └── package.json
└── n8n-workflows/            # n8n воркфлоу для парсингу
    ├── domfasad-scraper.json
    ├── akm-scraper.json
    └── master-workflow.json
```

## 🔧 Конфігурація

### Environment Variables

Створіть `.env` файл у кореневій директорії:

```env
# PostgreSQL
POSTGRES_USER=rocky
POSTGRES_PASSWORD=rocky_pass_2024
POSTGRES_DB=rocky_builder

# Redis
REDIS_URL=redis://localhost:6379

# Meilisearch
MEILI_MASTER_KEY=rocky_meili_master_key_2024

# n8n
N8N_BASIC_AUTH_USER=admin
N8N_BASIC_AUTH_PASSWORD=rocky2024

# Next.js
NEXT_PUBLIC_API_URL=http://localhost:9000
```

## 🔍 n8n Парсинг

### Імпорт воркфлоу

1. Відкрийте n8n: `http://localhost:5678`
2. Логін: `admin` / `rocky2024`
3. Import workflow → Оберіть файл з `n8n-workflows/`
4. Активуйте воркфлоу

### Тестування парсингу

```bash
# Запуск master workflow через webhook
curl -X POST http://localhost:5678/webhook/sync \
  -H "X-API-Key: secret_token" \
  -H "Content-Type: application/json" \
  -d '{
    "sites": ["domfasad"],
    "categories": ["terrasnaya-doska"],
    "force_full": false
  }'
```

### Перегляд спарсених даних

```bash
# PostgreSQL
docker exec -it rocky-postgres psql -U rocky -d rocky_builder

# Запити
SELECT * FROM sources;
SELECT * FROM categories;
SELECT COUNT(*) FROM products;
SELECT * FROM products LIMIT 5;
SELECT * FROM product_sources WHERE source_id = (SELECT id FROM sources WHERE name = 'domfasad');
```

## 🎨 Брендинг ROCKY BUILDER

### Колірна палітра

- **Золотий акцент:** `#eab308` (brand-gold-500)
- **Темний фон:** `#1a1a1a` (brand-dark-950)
- **Текст:** `#3d3d3d` (brand-dark-900)

### Шрифти

- **Основний:** Inter (Latin + Cyrillic)
- **Заголовки:** Inter Bold

## 📦 Наступні кроки

### Пріоритет 1: Базовий функціонал (1-2 тижні)

- [ ] Medusa backend setup
- [ ] API інтеграція frontend ↔ backend
- [ ] Сторінка каталогу з фільтрами
- [ ] Картка товару
- [ ] Кошик (localStorage → Medusa Cart)

### Пріоритет 2: n8n автопарсинг (1 тиждень)

- [ ] domfasad.com.ua воркфлоу
- [ ] akm.kiev.ua воркфлоу
- [ ] ac-rocky.ua воркфлоу (ручний + напівавтомат)
- [ ] Scheduler для синхронізації кожні 6 годин
- [ ] Price Monitor воркфлоу

### Пріоритет 3: Checkout & Payments (1 тиждень)

- [ ] Nova Poshta API інтеграція
- [ ] LiqPay інтеграція
- [ ] Форма швидкого замовлення
- [ ] Email/Telegram нотифікації

### Пріоритет 4: Калькулятори (1 тиждень)

- [ ] Калькулятор цегли
- [ ] Калькулятор покрівлі
- [ ] Калькулятор бетону
- [ ] Інтеграція з каталогом (автодобір товарів)

## 🐛 Troubleshooting

### PostgreSQL not starting

```bash
docker-compose down
docker volume rm rocky-builder_postgres_data
docker-compose up -d postgres
```

### n8n workflows not executing

Перевірте логи:
```bash
docker-compose logs -f n8n
```

### Frontend build errors

```bash
cd frontend
rm -rf .next node_modules
npm install
npm run dev
```

## 📞 Підтримка

Для питань та підтримки:
- Email: dev@rocky-builder.ua
- Telegram: @rocky_builder_support

## 📄 Ліцензія

Proprietary - ROCKY BUILDER © 2024

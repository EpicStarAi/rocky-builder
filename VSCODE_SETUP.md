# 🚀 Visual Studio Code Setup для ROCKY BUILDER

## Швидкий старт у VS Code

### 1. Відкрийте проект у VS Code

**Варіант A: Workspace (рекомендовано)**
```bash
# Відкрийте workspace файл
code rocky-builder.code-workspace
```

**Варіант B: Звичайна папка**
```bash
# Відкрийте кореневу директорію
code .
```

### 2. Встановіть рекомендовані розширення

Після відкриття проекту VS Code запропонує встановити рекомендовані розширення. Натисніть **"Install All"**.

Або встановіть вручну:
- ESLint
- Prettier
- Tailwind CSS IntelliSense
- Docker
- PostgreSQL
- GitLens
- Error Lens

### 3. Запустіть проект

#### Через VS Code Tasks (найпростіше)

1. Натисніть `Ctrl+Shift+P` (або `Cmd+Shift+P` на Mac)
2. Виберіть `Tasks: Run Task`
3. Виберіть `Full Stack: Start All`

Це автоматично:
- Запустить Docker сервіси (PostgreSQL, Redis, n8n, Meilisearch)
- Запустить Next.js frontend на http://localhost:3000

#### Через командний рядок

```bash
# Термінал 1: Запустіть інфраструктуру
docker-compose up -d

# Термінал 2: Запустіть frontend
cd frontend
npm install  # перший раз
npm run dev
```

### 4. Debugging

#### Debugging Next.js

1. Натисніть `F5` або перейдіть у `Run and Debug` (Ctrl+Shift+D)
2. Виберіть одну з конфігурацій:
   - **Next.js: debug server-side** - для серверного коду
   - **Next.js: debug client-side** - для клієнтського коду
   - **Full Stack Debug** - для обох одночасно

#### Debugging через Breakpoints

Додайте breakpoint у будь-який файл TypeScript/JavaScript:
- Клацніть ліворуч від номера рядка
- Або натисніть `F9`

## Доступні Tasks

### Frontend
- **Start Frontend Dev Server** - `npm run dev`
- **Build Frontend** - `npm run build`
- **Type Check** - перевірка TypeScript типів
- **Lint Frontend** - ESLint перевірка

### Docker
- **Docker: Start All Services** - запуск всієї інфраструктури
- **Docker: Stop All Services** - зупинка сервісів
- **Docker: View Logs** - перегляд логів
- **Docker: Rebuild Services** - перебудова контейнерів

### Database
- **PostgreSQL: Connect** - підключення до БД через psql

### Utilities
- **Open n8n Dashboard** - відкрити n8n у браузері
- **Open Frontend** - відкрити frontend у браузері

## Корисні команди

### Відкрити Command Palette
- Windows/Linux: `Ctrl+Shift+P`
- Mac: `Cmd+Shift+P`

### Швидкі дії
- **Run Task**: `Ctrl+Shift+P` → `Tasks: Run Task`
- **Debug**: `F5`
- **Open Terminal**: ``Ctrl+` ``
- **Quick Open File**: `Ctrl+P`
- **Search in Files**: `Ctrl+Shift+F`

## Структура workspace

Проект організовано у multi-root workspace:
- 🏗️ ROCKY BUILDER (Root) - конфігурація Docker, документація
- 🎨 Frontend - Next.js додаток
- 🗄️ Backend - SQL міграції, Medusa (TODO)
- 🤖 n8n Workflows - автоматизація парсингу
- 🕷️ Scrapers - скрипти для збору даних

## Налаштування

### Автоформатування

Файли автоматично форматуються при збереженні (`Ctrl+S`):
- TypeScript/JavaScript → Prettier
- CSS/Tailwind → Prettier

### ESLint

ESLint автоматично виправляє помилки при збереженні.

### IntelliSense

- **Tailwind CSS** - автодоповнення класів
- **TypeScript** - типізація
- **Import paths** - автодоповнення імпортів

## Troubleshooting

### Task не запускається

1. Перевірте, що Docker запущено
2. Перевірте порти (3000, 5432, 6379, 5678, 7700)
3. Перезапустіть VS Code

### Debugging не працює

1. Переконайтеся, що `npm run dev` запущено
2. Спробуйте перезапустити debug сесію (`Ctrl+Shift+F5`)
3. Перевірте консоль VS Code (Help → Toggle Developer Tools)

### Extensions не встановлюються

1. Відкрийте Extensions панель (`Ctrl+Shift+X`)
2. Встановіть вручну кожне розширення з `.vscode/extensions.json`

## Додаткові ресурси

- [Next.js Documentation](https://nextjs.org/docs)
- [VS Code Debugging](https://code.visualstudio.com/docs/editor/debugging)
- [Docker in VS Code](https://code.visualstudio.com/docs/containers/overview)

## Команда

Для питань пишіть:
- Email: dev@rocky-builder.ua
- Telegram: @rocky_builder_support

---

**Happy Coding! 🚀**

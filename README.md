# Банк — Интернет-банк клиента

React + TypeScript + Vite. Макеты — Figma «Банк — макеты», план и требования — `~/Desktop/тренировки/фронт-банка/`.

## Первый запуск

1. Собрать UI-библиотеку (один раз и после её изменений):
   ```bash
   cd ../bank-ui && npm install && npm run build
   ```
2. Установить зависимости и запустить:
   ```bash
   npm install
   npm run dev
   ```
3. Открыть http://localhost:5173. Бэкенд должен работать на http://localhost:8080 — запросы `/api/*` проксирует Vite.

## Команды

| Команда                           | Что делает                                                   |
| --------------------------------- | ------------------------------------------------------------ |
| `npm run dev`                     | dev-сервер на порту 5173, моки включены (`.env.development`) |
| `npm run build`                   | проверка типов и боевая сборка в `dist/` (без моков)         |
| `npm run preview`                 | посмотреть боевую сборку                                     |
| `npm test` / `npm run test:watch` | тесты (Vitest + Testing Library)                             |
| `npm run typecheck`               | только проверка типов                                        |
| `npm run lint`                    | ESLint                                                       |
| `npm run format`                  | Prettier                                                     |

## Моки (MSW)

Моки описаны в `src/mocks/handlers.ts`: эндпоинты из раздела «Планируется» промпта (счета, операции, переводы). Всё, что не описано, уходит на настоящий бэкенд. Выключить моки — `VITE_MOCKS=false` в `.env.development.local`.

### Сценарии моков

Состояния экранов переключаются в консоли браузера (DevTools → Console), затем обновить страницу:

```js
localStorage.setItem('mock:accounts', 'empty') // нет счетов
localStorage.setItem('mock:accounts', 'error') // ошибка 500 с кодом для поддержки
localStorage.setItem('mock:accounts', 'slow') // загрузка 3 секунды
localStorage.removeItem('mock:accounts') // обычные счета
```

## Стек

React 19, React Router 7, TanStack Query 5, react-hook-form + zod, CSS Modules + токены из `@bank/ui`, MSW 2, Vitest 4.

## Структура

```
src/
  app/       провайдеры, роутер, QueryClient
  pages/     экраны (сейчас — временная StartPage для проверки каркаса)
  mocks/     моки MSW
  test/      настройка тестов
```

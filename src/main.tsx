import '@bank/ui/fonts.css'
import '@bank/ui/style.css'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './app/App'

// Моки включаются переменной VITE_MOCKS (см. .env.development) и не попадают в боевую сборку:
// модуль с MSW загружается динамически только при включённом флаге.
async function enableMocks() {
  if (import.meta.env.VITE_MOCKS !== 'true') return
  const { worker } = await import('./mocks/browser')
  // bypass: всё, что не описано в моках, уходит на настоящий бэкенд.
  await worker.start({ onUnhandledRequest: 'bypass' })
}

const root = document.getElementById('root')
if (!root) throw new Error('Не найден элемент #root')

// Если моки не запустились (например, браузер не даёт зарегистрировать Service Worker),
// приложение всё равно стартует — просто без моков.
void enableMocks()
  .catch((error: unknown) => console.warn('[MSW] Моки не запущены:', error))
  .then(() => {
    createRoot(root).render(
      <StrictMode>
        <App />
      </StrictMode>,
    )
  })

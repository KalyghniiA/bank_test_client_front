import { delay, http, HttpResponse } from 'msw'
import { mockAccounts } from './data/accounts'

// Моки только для эндпоинтов, которых ещё нет на бэкенде (раздел «Планируется» в промпте).
// Готовые эндпоинты (/api/auth/*, /api/persons, /api/me) здесь не описываем — они идут на бэкенд.

/**
 * Сценарий для проверки состояний экрана. Задаётся в консоли браузера:
 *   localStorage.setItem('mock:accounts', 'empty')  // нет счетов
 *   localStorage.setItem('mock:accounts', 'error')  // ошибка 500
 *   localStorage.setItem('mock:accounts', 'slow')   // загрузка 3 секунды
 *   localStorage.removeItem('mock:accounts')        // обычные счета
 */
function accountsScenario(): string | null {
  try {
    return localStorage.getItem('mock:accounts')
  } catch {
    return null
  }
}

export const handlers = [
  http.get('/api/me/accounts', async () => {
    const scenario = accountsScenario()
    await delay(scenario === 'slow' ? 3000 : 300)
    if (scenario === 'empty') return HttpResponse.json([])
    if (scenario === 'error') {
      return HttpResponse.json(
        {
          type: 'about:blank',
          title: 'Внутренняя ошибка',
          status: 500,
          requestId: 'mock-b1946ac9',
        },
        { status: 500, headers: { 'Content-Type': 'application/problem+json' } },
      )
    }
    return HttpResponse.json(mockAccounts)
  }),
]

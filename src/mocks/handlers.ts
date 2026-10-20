import { http, HttpResponse } from 'msw'

// Моки только для эндпоинтов, которых ещё нет на бэкенде (раздел «Планируется» в промпте).
// Готовые эндпоинты (/api/auth/*, /api/persons, /api/me) здесь не описываем — они идут на бэкенд.
export const handlers = [http.get('/api/me/accounts', () => HttpResponse.json([]))]

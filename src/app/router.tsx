import { createBrowserRouter } from 'react-router'
import { buildAuthUrl } from '../session/authUrl'
import { meQueryKey } from '../session/useMe'
import { queryClient, setUnauthorizedHandler } from './queryClient'
import { routes } from './routes'

export const router = createBrowserRouter(routes)

// Неожиданный 401 в любом запросе: сессия истекла (15 минут без активности).
// Чистим кэш (данные прошлой сессии) и ведём на вход, запомнив, где был клиент.
setUnauthorizedHandler(() => {
  const { pathname, search } = router.state.location
  if (pathname === '/auth') return
  const hadSession = queryClient.getQueryData(meQueryKey) !== undefined
  queryClient.removeQueries()
  void router.navigate(buildAuthUrl(pathname + search, hadSession ? 'expired' : undefined), {
    replace: true,
  })
})

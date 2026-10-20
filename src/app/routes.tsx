import type { RouteObject } from 'react-router'
import { AuthPage } from '../pages/AuthPage/AuthPage'
import { HomePage } from '../pages/HomePage/HomePage'
import { NotFoundPage } from '../pages/NotFoundPage/NotFoundPage'
import { RequireAuth } from '../session/RequireAuth'

// Маршруты отдельно от роутера — чтобы в тестах собрать их в createMemoryRouter.
export const routes: RouteObject[] = [
  { path: '/auth', element: <AuthPage /> },
  {
    element: <RequireAuth />,
    children: [{ path: '/', element: <HomePage /> }],
  },
  { path: '*', element: <NotFoundPage /> },
]

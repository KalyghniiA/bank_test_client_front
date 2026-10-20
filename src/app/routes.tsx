import type { RouteObject } from 'react-router'
import { AppLayout } from '../layout/AppLayout'
import { AuthPage } from '../pages/AuthPage/AuthPage'
import { HomePage } from '../pages/HomePage/HomePage'
import { NotFoundPage } from '../pages/NotFoundPage/NotFoundPage'
import { RegisterPage } from '../pages/RegisterPage/RegisterPage'
import { RequireAuth } from '../session/RequireAuth'

// Маршруты отдельно от роутера — чтобы в тестах собрать их в createMemoryRouter.
export const routes: RouteObject[] = [
  { path: '/auth', element: <AuthPage /> },
  { path: '/register', element: <RegisterPage /> },
  {
    // Страницы вошедшего клиента: проверка сессии → общий каркас (шапка, нижнее меню) → страница.
    element: <RequireAuth />,
    children: [
      {
        element: <AppLayout />,
        children: [{ path: '/', element: <HomePage /> }],
      },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
]

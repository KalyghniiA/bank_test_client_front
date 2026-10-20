import { createBrowserRouter } from 'react-router'
import { StartPage } from '../pages/StartPage/StartPage'

export const router = createBrowserRouter([
  { path: '/', element: <StartPage /> },
  { path: '*', element: <p style={{ padding: 24 }}>Страница не найдена</p> },
])

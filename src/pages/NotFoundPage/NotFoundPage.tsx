import { Link } from 'react-router'

// Временная заглушка: макет «Страница не найдена» сделаем отдельной задачей.
export function NotFoundPage() {
  return (
    <main style={{ padding: 24, display: 'grid', gap: 12 }}>
      <h1>Страница не найдена</h1>
      <Link to="/">На главную</Link>
    </main>
  )
}

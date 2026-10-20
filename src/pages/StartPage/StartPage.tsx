import { Button, formatMoney } from '@bank/ui'
import { useQuery } from '@tanstack/react-query'
import styles from './StartPage.module.css'

// Временная страница: проверяет, что каркас собран. Уйдёт, когда появятся настоящие экраны.

async function checkBackend() {
  const response = await fetch('/api/health')
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  return 'доступен'
}

async function checkMocks() {
  const response = await fetch('/api/me/accounts', { credentials: 'include' })
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  const accounts: unknown = await response.json()
  if (!Array.isArray(accounts)) throw new Error('ожидался массив')
  return `работают, счетов: ${accounts.length}`
}

function Status({ query }: { query: { isPending: boolean; error: Error | null; data?: string } }) {
  if (query.isPending) return <span className={styles.label}>проверяем…</span>
  if (query.error) return <span className={styles.fail}>нет ({query.error.message})</span>
  return <span className={styles.ok}>{query.data}</span>
}

export function StartPage() {
  const backend = useQuery({ queryKey: ['check', 'backend'], queryFn: checkBackend, retry: false })
  const mocks = useQuery({ queryKey: ['check', 'mocks'], queryFn: checkMocks, retry: false })

  return (
    <main className={styles.page}>
      <h1 className={styles.title}>Банк: каркас клиента</h1>
      <section className={styles.card}>
        <div className={styles.row}>
          <span className={styles.label}>UI-библиотека</span>
          <span className={styles.ok}>{formatMoney('12345.67')}</span>
        </div>
        <div className={styles.row}>
          <span className={styles.label}>Бэкенд через прокси</span>
          <Status query={backend} />
        </div>
        <div className={styles.row}>
          <span className={styles.label}>Моки MSW</span>
          <Status query={mocks} />
        </div>
      </section>
      <Button icon="check-circle" onClick={() => void backend.refetch()}>
        Проверить бэкенд ещё раз
      </Button>
    </main>
  )
}

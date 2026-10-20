import { Alert, Button, Spinner } from '@bank/ui'
import { Navigate, Outlet, useLocation } from 'react-router'
import { isApiError } from '../api/ApiError'
import { buildAuthUrl } from './authUrl'
import { useMe } from './useMe'
import styles from './RequireAuth.module.css'

/** Пропускает к вложенным маршрутам только вошедшего клиента, остальных отправляет на /auth. */
export function RequireAuth() {
  const location = useLocation()
  const me = useMe()

  if (me.isPending) {
    return (
      <div className={styles.center}>
        <Spinner size={32} label="Загрузка" />
      </div>
    )
  }

  if (me.isError) {
    if (isApiError(me.error) && me.error.isUnauthorized) {
      // Данные клиента уже были, а теперь 401 — значит, сессия истекла (а не первый визит).
      const reason = me.data ? 'expired' : undefined
      return <Navigate to={buildAuthUrl(location.pathname + location.search, reason)} replace />
    }
    return (
      <div className={styles.center}>
        <Alert
          variant="error"
          title="Не удалось загрузить данные"
          supportCode={isApiError(me.error) ? me.error.requestId : undefined}
        >
          Проверьте соединение и попробуйте ещё раз
        </Alert>
        <Button variant="secondary" size="m" onClick={() => void me.refetch()}>
          Повторить
        </Button>
      </div>
    )
  }

  return <Outlet />
}

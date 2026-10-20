import { Alert, Button, Logo } from '@bank/ui'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router'
import { logout } from '../../api/auth'
import { buildAuthUrl } from '../../session/authUrl'
import { useMe } from '../../session/useMe'
import styles from './HomePage.module.css'

// Временная главная: проверяет цепочку «вход → защищённая страница → выход».
// Настоящая главная со счетами — следующая итерация.
export function HomePage() {
  const me = useMe()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const signOut = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.removeQueries()
      void navigate(buildAuthUrl(undefined, 'logout'), { replace: true })
    },
  })

  return (
    <main className={styles.page}>
      <Logo />
      <h1 className={styles.title}>Здравствуйте, {me.data?.firstName}</h1>
      <p className={styles.text}>Вы вошли. Главная со счетами появится в следующей итерации.</p>
      {signOut.isError && (
        <Alert variant="error" title="Не удалось выйти">
          Попробуйте ещё раз
        </Alert>
      )}
      <Button
        variant="secondary"
        icon="logout"
        loading={signOut.isPending}
        onClick={() => signOut.mutate()}
      >
        Выйти
      </Button>
    </main>
  )
}

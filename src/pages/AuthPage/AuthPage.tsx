import { Alert, Button, Logo, TextField } from '@bank/ui'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { Link, Navigate, useLocation, useNavigate, useSearchParams } from 'react-router'
import { z } from 'zod'
import { isApiError } from '../../api/ApiError'
import { login } from '../../api/auth'
import { parseReason, safeNext, type AuthReason } from '../../session/authUrl'
import { meQueryKey, useMe } from '../../session/useMe'
import styles from './AuthPage.module.css'

// На входе не проверяем длину логина и пароля: правила проверяет сервер,
// а неверные данные дают одно сообщение «Неверный логин или пароль».
const schema = z.object({
  login: z.string().trim().min(1, 'Введите логин'),
  password: z.string().min(1, 'Введите пароль'),
})

type FormValues = z.infer<typeof schema>

/** Логин, переданный со страницы регистрации через состояние роутера (в адрес не попадает). */
function loginFromState(state: unknown): string {
  if (
    typeof state === 'object' &&
    state !== null &&
    'login' in state &&
    typeof state.login === 'string'
  ) {
    return state.login
  }
  return ''
}

export function AuthPage() {
  const [searchParams] = useSearchParams()
  const next = safeNext(searchParams.get('next'))
  const reason = parseReason(searchParams.get('reason'))

  const location = useLocation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const me = useMe()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { login: loginFromState(location.state), password: '' },
  })

  const signIn = useMutation({
    mutationFn: login,
    meta: { ignoreUnauthorized: true },
    onSuccess: (person) => {
      queryClient.setQueryData(meQueryKey, person)
      void navigate(next, { replace: true })
    },
  })

  // Уже вошёл (например, открыл /auth в новой вкладке) — сразу туда, куда шёл.
  if (me.isSuccess) return <Navigate to={next} replace />

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <Logo />
        <section className={styles.card} aria-labelledby="auth-title">
          <header className={styles.heading}>
            <h1 id="auth-title" className={styles.title}>
              Вход
            </h1>
            <p className={styles.subtitle}>Войдите по логину и паролю</p>
          </header>

          {signIn.isError ? (
            <SignInError error={signIn.error} />
          ) : (
            reason && <ReasonAlert reason={reason} />
          )}

          <form
            className={styles.form}
            noValidate
            onSubmit={(event) => void handleSubmit((values) => signIn.mutate(values))(event)}
          >
            <fieldset className={styles.fields} disabled={signIn.isPending}>
              <TextField
                label="Логин"
                autoComplete="username"
                autoCapitalize="none"
                spellCheck={false}
                error={errors.login?.message}
                {...register('login')}
              />
              <TextField
                label="Пароль"
                type="password"
                autoComplete="current-password"
                error={errors.password?.message}
                {...register('password')}
              />
            </fieldset>
            <Button type="submit" fullWidth loading={signIn.isPending}>
              {signIn.isPending ? 'Входим…' : 'Войти'}
            </Button>
          </form>

          <p className={styles.footer}>
            Нет аккаунта? <Link to="/register">Зарегистрироваться</Link>
          </p>
        </section>
      </div>
    </main>
  )
}

function ReasonAlert({ reason }: { reason: AuthReason }) {
  if (reason === 'expired') {
    return (
      <Alert variant="info" title="Сессия истекла, войдите снова">
        После входа вернём вас на ту же страницу
      </Alert>
    )
  }
  return (
    <Alert variant="success" title="Вы вышли из аккаунта">
      Сессия завершена на этом устройстве
    </Alert>
  )
}

function SignInError({ error }: { error: Error }) {
  if (isApiError(error) && error.isUnauthorized) {
    return (
      <Alert variant="error" title="Неверный логин или пароль">
        Проверьте раскладку клавиатуры и Caps Lock
      </Alert>
    )
  }
  if (isApiError(error) && error.isNetworkError) {
    return (
      <Alert variant="error" icon="wifi-off" title="Нет соединения с сервером">
        Проверьте интернет и попробуйте ещё раз
      </Alert>
    )
  }
  return (
    <Alert
      variant="error"
      icon="wifi-off"
      title="Не удалось войти"
      supportCode={isApiError(error) ? error.requestId : undefined}
    >
      Сервер временно недоступен. Попробуйте через минуту
    </Alert>
  )
}

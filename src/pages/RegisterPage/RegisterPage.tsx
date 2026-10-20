import { Alert, Button, Icon, Logo, TextField } from '@bank/ui'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { Link, Navigate, useNavigate } from 'react-router'
import { isApiError } from '../../api/ApiError'
import { registerPerson, type Registration } from '../../api/persons'
import { TopBar } from '../../components/TopBar/TopBar'
import { useMe } from '../../session/useMe'
import { maskRuDate, parseRuDate } from '../../utils/date'
import { plural } from '../../utils/plural'
import {
  emptyRegisterValues,
  registerSchema,
  serverFieldToFormField,
  type RegisterValues,
} from './schema'
import styles from './RegisterPage.module.css'

function toRegistration(values: RegisterValues): Registration {
  return {
    person: {
      firstName: values.firstName,
      subName: values.lastName,
      middleName: values.middleName || null,
      // Схема уже проверила дату, поэтому здесь она точно разбирается.
      birthDate: parseRuDate(values.birthDate) ?? '',
      number: values.phone || null,
      email: values.email || null,
    },
    credentials: { login: values.login, password: values.password },
  }
}

export function RegisterPage() {
  const me = useMe()
  const navigate = useNavigate()

  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitted },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: emptyRegisterValues,
  })

  const signUp = useMutation({
    mutationFn: registerPerson,
    onError: (error) => {
      if (!isApiError(error)) return
      if (error.status === 409) {
        setError('login', { message: 'Логин уже занят — выберите другой' }, { shouldFocus: true })
        return
      }
      // 400: раскладываем ошибки сервера по полям формы, первое поле с ошибкой получает фокус.
      error.fieldErrors.forEach(({ field, message }, index) => {
        const name = serverFieldToFormField[field]
        if (name) setError(name, { message }, { shouldFocus: index === 0 })
      })
    },
  })

  // Уже вошёл — регистрация не нужна.
  if (me.isSuccess) return <Navigate to="/" replace />

  if (signUp.isSuccess) {
    const login = signUp.variables.credentials.login
    return (
      <Shell>
        <div className={styles.success}>
          <span className={styles.successIcon}>
            <Icon name="check-circle" size={44} />
          </span>
          <h1 className={styles.successTitle}>Аккаунт создан</h1>
          <p className={styles.successText}>Войдите с логином {login}, чтобы открыть первый счёт</p>
          <Button fullWidth onClick={() => void navigate('/auth', { state: { login } })}>
            Войти
          </Button>
        </div>
      </Shell>
    )
  }

  const errorCount = Object.keys(errors).length
  const generalError = signUp.isError && !hasFieldLevelError(signUp.error) ? signUp.error : null

  const submit = handleSubmit((values) => signUp.mutate(toRegistration(values)))

  return (
    <Shell>
      <h1 className={styles.title}>Регистрация</h1>

      {isSubmitted && errorCount > 0 && (
        <Alert
          variant="error"
          title={`Проверьте ${errorCount} ${plural(errorCount, 'поле', 'поля', 'полей')}`}
        >
          Ошибки отмечены под полями
        </Alert>
      )}
      {generalError && <GeneralError error={generalError} />}

      <form className={styles.form} noValidate onSubmit={(event) => void submit(event)}>
        <fieldset className={styles.fieldset} disabled={signUp.isPending}>
          <Section title="Личные данные">
            <div className={styles.row}>
              <TextField
                label="Фамилия"
                autoComplete="family-name"
                error={errors.lastName?.message}
                {...register('lastName')}
              />
              <TextField
                label="Имя"
                autoComplete="given-name"
                error={errors.firstName?.message}
                {...register('firstName')}
              />
            </div>
            <div className={styles.row}>
              <TextField
                label="Отчество (необязательно)"
                autoComplete="additional-name"
                error={errors.middleName?.message}
                {...register('middleName')}
              />
              <Controller
                control={control}
                name="birthDate"
                render={({ field }) => (
                  <TextField
                    label="Дата рождения"
                    placeholder="ДД.ММ.ГГГГ"
                    inputMode="numeric"
                    autoComplete="bday"
                    error={errors.birthDate?.message}
                    {...field}
                    onChange={(event) => field.onChange(maskRuDate(event.target.value))}
                  />
                )}
              />
            </div>
          </Section>

          <Section title="Контакты">
            <div className={styles.row}>
              <TextField
                label="Телефон (необязательно)"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                hint="Например, +79001234567"
                error={errors.phone?.message}
                {...register('phone')}
              />
              <TextField
                label="Email (необязательно)"
                type="email"
                autoComplete="email"
                error={errors.email?.message}
                {...register('email')}
              />
            </div>
          </Section>

          <Section title="Данные для входа">
            <div className={styles.row}>
              <TextField
                label="Логин"
                autoComplete="username"
                autoCapitalize="none"
                spellCheck={false}
                hint="От 3 до 100 символов"
                error={errors.login?.message}
                {...register('login')}
              />
              <TextField
                label="Пароль"
                type="password"
                autoComplete="new-password"
                hint="Не короче 8 символов"
                error={errors.password?.message}
                {...register('password')}
              />
            </div>
          </Section>
        </fieldset>

        <div className={styles.actions}>
          <Button type="submit" loading={signUp.isPending} className={styles.submit}>
            {signUp.isPending ? 'Создаём аккаунт…' : 'Создать аккаунт'}
          </Button>
          <p className={styles.toLogin}>
            Уже есть аккаунт? <Link to="/auth">Войти</Link>
          </p>
        </div>
      </form>
    </Shell>
  )
}

/** Каркас страницы: на телефоне — шапка «назад», на десктопе — логотип и карточка по центру. */
function Shell({ children }: { children: ReactNode }) {
  return (
    <main className={styles.page}>
      <TopBar title="Регистрация" backTo="/auth" className={styles.topBar} />
      <div className={styles.logo}>
        <Logo />
      </div>
      <section className={styles.card}>{children}</section>
    </main>
  )
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>{title}</h2>
      {children}
    </section>
  )
}

/** 409 и 400 с ошибками полей показываются у полей; остальное — общим уведомлением. */
function hasFieldLevelError(error: Error): boolean {
  if (!isApiError(error)) return false
  return (
    error.status === 409 || error.fieldErrors.some(({ field }) => field in serverFieldToFormField)
  )
}

function GeneralError({ error }: { error: Error }) {
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
      title="Не удалось создать аккаунт"
      supportCode={isApiError(error) && error.isServerError ? error.requestId : undefined}
    >
      {isApiError(error) && !error.isServerError ? error.title : 'Попробуйте ещё раз через минуту'}
    </Alert>
  )
}

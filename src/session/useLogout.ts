import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router'
import { logout } from '../api/auth'
import { buildAuthUrl } from './authUrl'

/** Выход: завершаем сессию на сервере, чистим кэш данных клиента, ведём на вход. */
export function useLogout() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.removeQueries()
      void navigate(buildAuthUrl(undefined, 'logout'), { replace: true })
    },
  })
}

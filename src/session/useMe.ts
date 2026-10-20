import { useQuery } from '@tanstack/react-query'
import { getMe } from '../api/auth'

export const meQueryKey = ['me'] as const

/** Текущий клиент. 401 здесь — нормальная ситуация («не вошёл»), поэтому глобальный обработчик её не трогает. */
export function useMe() {
  return useQuery({
    queryKey: meQueryKey,
    queryFn: getMe,
    meta: { ignoreUnauthorized: true },
  })
}

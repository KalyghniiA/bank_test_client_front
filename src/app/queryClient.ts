import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query'
import { isApiError } from '../api/ApiError'

interface RequestMeta extends Record<string, unknown> {
  /** 401 в этом запросе ожидаем (вход, проверка сессии) — на /auth не перенаправлять. */
  ignoreUnauthorized?: boolean
}

declare module '@tanstack/react-query' {
  interface Register {
    queryMeta: RequestMeta
    mutationMeta: RequestMeta
  }
}

let onUnauthorized: () => void = () => {}

/** Что делать при неожиданном 401 (сессия истекла). Назначается в router.tsx — там есть доступ к навигации. */
export function setUnauthorizedHandler(handler: () => void): void {
  onUnauthorized = handler
}

function handleError(error: unknown, meta: RequestMeta | undefined): void {
  if (isApiError(error) && error.isUnauthorized && !meta?.ignoreUnauthorized) onUnauthorized()
}

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error, query) => handleError(error, query.meta),
  }),
  mutationCache: new MutationCache({
    onError: (error, _variables, _onMutateResult, mutation) => handleError(error, mutation.meta),
  }),
  defaultOptions: {
    queries: {
      // Данные считаем свежими 30 секунд: при переходах между экранами не дёргаем сервер зря.
      staleTime: 30_000,
      // Повторяем один раз только сбои сети и сервера; 4xx повторять бессмысленно.
      retry: (failureCount, error) =>
        failureCount < 1 && (!isApiError(error) || error.isNetworkError || error.isServerError),
    },
    mutations: {
      // Мутации (в том числе денежные операции) никогда не повторяем автоматически.
      retry: false,
    },
  },
})

import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Данные считаем свежими 30 секунд: при переходах между экранами не дёргаем сервер зря.
      staleTime: 30_000,
      retry: 1,
    },
    mutations: {
      // Денежные операции никогда не повторяем автоматически.
      retry: false,
    },
  },
})

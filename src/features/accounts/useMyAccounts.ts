import { useQuery } from '@tanstack/react-query'
import { getMyAccounts } from '../../api/accounts'

export const myAccountsQueryKey = ['me', 'accounts'] as const

export function useMyAccounts() {
  return useQuery({ queryKey: myAccountsQueryKey, queryFn: getMyAccounts })
}

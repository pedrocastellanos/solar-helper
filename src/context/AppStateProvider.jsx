import { AppStateContext } from '@/context/app-state-context'

export function AppStateProvider({ value, children }) {
  return <AppStateContext value={value}>{children}</AppStateContext>
}

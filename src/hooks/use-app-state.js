import { useContext } from 'react'

import { AppStateContext } from '@/context/app-state-context'

export function useAppState() {
  const context = useContext(AppStateContext)
  if (!context) throw new Error('useAppState debe usarse dentro de AppStateProvider')
  return context
}

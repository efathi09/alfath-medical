import { createContext, useContext } from 'react'

export const AppNavContext = createContext(null)

export function useAppNav() {
  const ctx = useContext(AppNavContext)
  if (!ctx) throw new Error('useAppNav must be used inside <AppShell>')
  return ctx
}

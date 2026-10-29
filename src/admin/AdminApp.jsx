import { useCallback, useEffect, useState } from 'react'
import { adminApi, getToken, setToken } from './adminApi.js'
import Login from './Login.jsx'
import AdminShell from './AdminShell.jsx'
import { Spinner } from './ui.jsx'

export default function AdminApp() {
  const [state, setState] = useState('checking') // checking | out | in
  const [role, setRole] = useState(null)

  useEffect(() => {
    let alive = true
    async function verify() {
      if (!getToken()) {
        if (alive) setState('out')
        return
      }
      try {
        const session = await adminApi.session()
        if (alive) {
          setRole(session.role)
          setState('in')
        }
      } catch {
        setToken(null)
        if (alive) setState('out')
      }
    }
    verify()
    return () => {
      alive = false
    }
  }, [])

  const handleLogout = useCallback(() => {
    setToken(null)
    setRole(null)
    setState('out')
  }, [])

  useEffect(() => {
    document.title = 'لوحة التحكم | الفتح'
  }, [])

  if (state === 'checking') {
    return (
      <div className="grid min-h-screen place-items-center bg-ink-100">
        <Spinner className="size-8" />
      </div>
    )
  }

  if (state === 'out') {
    return (
      <Login
        onSuccess={(nextRole) => {
          setRole(nextRole)
          setState('in')
        }}
      />
    )
  }

  return <AdminShell onLogout={handleLogout} role={role} />
}

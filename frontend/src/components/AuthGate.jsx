
import { useAuthenticationStatus } from '@nhost/react'
import AuthPanel from './AuthPanel'

export default function AuthGate({ children }) {
  const { isAuthenticated, isLoading } = useAuthenticationStatus()
  if (isLoading) return <div style={{padding:24}}>Loading...</div>
  if (!isAuthenticated) return <AuthPanel />
  return children
}


import { Routes, Route, useNavigate } from 'react-router-dom'
import { useAuthenticationStatus, useUserEmail, useSignOut } from '@nhost/react'
import ChatList from './pages/ChatList'
import ChatView from './pages/ChatView'
import AuthGate from './components/AuthGate'

export default function App() {
  const { isAuthenticated, isLoading } = useAuthenticationStatus()
  const email = useUserEmail()
  const { signOut } = useSignOut()
  const nav = useNavigate()

  if (isLoading) return <div style={{padding: 24}}>Loading...</div>

  return (
    <div style={{fontFamily: 'Inter, system-ui, Avenir, Helvetica, Arial, sans-serif'}}>
      <header style={{display:'flex', gap:16, alignItems:'center', padding:16, borderBottom:'1px solid #eee'}}>
        <h3 style={{margin:0}}>🤖 Chatbot • Nhost + Hasura + n8n</h3>
        <nav style={{display:'flex', gap:12, marginLeft:'auto'}}>
          {isAuthenticated ? (
            <>
              <span>{email}</span>
              <button onClick={() => { signOut(); nav('/'); }}>Sign Out</button>
            </>
          ) : null}
        </nav>
      </header>

      <main style={{padding:16, maxWidth:900, margin:'0 auto'}}>
        <Routes>
          <Route path="/" element={<AuthGate><ChatList /></AuthGate>} />
          <Route path="/chat/:id" element={<AuthGate><ChatView /></AuthGate>} />
          <Route path="*" element={<div>Not Found</div>} />
        </Routes>
      </main>
    </div>
  )
}

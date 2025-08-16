
import { useSubscription, useMutation, gql } from '@apollo/client'
import { Link, useNavigate } from 'react-router-dom'

const SUBSCRIBE_CHATS = gql`
  subscription MyChats {
    chats(order_by: {created_at: desc}) {
      id
      created_at
    }
  }
`

const CREATE_CHAT = gql`
  mutation CreateChat {
    insert_chats_one(object: {}) {
      id
    }
  }
`

export default function ChatList() {
  const nav = useNavigate()
  const { data, loading, error } = useSubscription(SUBSCRIBE_CHATS)
  const [createChat, { loading: creating }] = useMutation(CREATE_CHAT, {
    onCompleted: (d) => d?.insert_chats_one?.id && nav(`/chat/${d.insert_chats_one.id}`)
  })

  return (
    <div>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
        <h2>Your Chats</h2>
        <button onClick={() => createChat()} disabled={creating}>+ New Chat</button>
      </div>
      {loading && <div>Loading...</div>}
      {error && <div style={{color:'crimson'}}>Error: {error.message}</div>}
      <ul style={{listStyle:'none', padding:0, display:'grid', gap:8}}>
        {data?.chats?.map((c) => (
          <li key={c.id} style={{border:'1px solid #eee', borderRadius:8, padding:12}}>
            <Link to={`/chat/${c.id}`}>Chat {c.id.slice(0,8)} • {new Date(c.created_at).toLocaleString()}</Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

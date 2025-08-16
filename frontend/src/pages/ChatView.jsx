
import { useParams } from 'react-router-dom'
import { useSubscription, useMutation, gql } from '@apollo/client'
import { useState } from 'react'

const SUBSCRIBE_MESSAGES = gql`
  subscription ChatMessages($chat_id: uuid!) {
    messages(where: {chat_id: {_eq: $chat_id}}, order_by: {created_at: asc}) {
      id
      sender
      content
      created_at
    }
  }
`

const INSERT_USER_MESSAGE = gql`
  mutation InsertUserMessage($chat_id: uuid!, $content: String!) {
    insert_messages_one(object: {chat_id: $chat_id, sender: "user", content: $content}) {
      id
    }
  }
`

const SEND_MESSAGE = gql`
  mutation SendMessage($chat_id: uuid!, $content: String!) {
    sendMessage(input: {chat_id: $chat_id, content: $content}) {
      reply
    }
  }
`

export default function ChatView() {
  const { id } = useParams()
  const { data, loading, error } = useSubscription(SUBSCRIBE_MESSAGES, { variables: { chat_id: id } })
  const [insertMsg] = useMutation(INSERT_USER_MESSAGE)
  const [sendMsg] = useMutation(SEND_MESSAGE)
  const [text, setText] = useState('')

  const onSend = async (e) => {
    e.preventDefault()
    const content = text.trim()
    if (!content) return
    setText('')
    try {
      await insertMsg({ variables: { chat_id: id, content } })
      await sendMsg({ variables: { chat_id: id, content } })
    } catch (err) {
      alert('Failed to send: ' + err.message)
    }
  }

  return (
    <div>
      <h2>Chat</h2>
      {loading && <div>Loading...</div>}
      {error && <div style={{color:'crimson'}}>Error: {error.message}</div>}
      <div style={{border:'1px solid #eee', borderRadius:8, padding:12, minHeight:300}}>
        {(data?.messages || []).map(m => (
          <div key={m.id} style={{display:'flex', marginBottom:8, justifyContent: m.sender === 'user' ? 'flex-end' : 'flex-start'}}>
            <div style={{maxWidth:'70%', padding:'8px 12px', borderRadius:12, background: m.sender === 'user' ? '#DCF8C6' : '#F0F0F0'}}>
              <div style={{opacity:.6, fontSize:12, marginBottom:4}}>{m.sender}</div>
              <div>{m.content}</div>
            </div>
          </div>
        ))}
      </div>
      <form onSubmit={onSend} style={{display:'flex', gap:8, marginTop:12}}>
        <input value={text} onChange={e=>setText(e.target.value)} placeholder="Type your message..." style={{flex:1}} />
        <button type="submit">Send</button>
      </form>
    </div>
  )
}

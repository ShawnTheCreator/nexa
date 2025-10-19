"use client"
import React from 'react'
import { API_BASE_URL } from '@/lib/api'

export function ChatModal() {
  const [open, setOpen] = React.useState(false)
  const [messages, setMessages] = React.useState<any[]>([])
  const [input, setInput] = React.useState('')
  const [loading, setLoading] = React.useState(false)

  React.useEffect(() => {
    const handler = () => setOpen(true)
    window.addEventListener('openChat', handler)
    return () => window.removeEventListener('openChat', handler)
  }, [])

  async function send() {
    if (!input) return
    setLoading(true)
    setMessages(prev => [...prev, { from: 'user', text: input }])
    try {
      const res = await fetch(`${API_BASE_URL}/api/assistant`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: input })
      })
      const json = await res.json()
      setMessages(prev => [...prev, { from: 'bot', text: json.answer || 'No response' }])
    } catch (err) {
      setMessages(prev => [...prev, { from: 'bot', text: 'Error' }])
    } finally {
      setLoading(false)
      setInput('')
    }
  }

  if (!open) return null

  return (
    <div className="fixed right-6 bottom-6 z-50 w-96 rounded shadow-lg bg-white p-3">
      <div className="flex justify-between items-center mb-2">
        <strong className="text-white" style={{ backgroundColor: '#4f47e6', padding: '4px 8px', borderRadius: 6 }}>Chat</strong>
        <button onClick={() => setOpen(false)}>X</button>
      </div>
      <div className="h-64 overflow-y-auto mb-2">
        {messages.map((m, i) => (
          <div key={i} className={`mb-2 ${m.from === 'user' ? 'text-right' : 'text-left'}`}>
            <div className={`inline-block p-2 rounded ${m.from === 'user' ? 'bg-gray-100' : 'bg-[#4f47e6] text-white'}`}>{m.text}</div>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input className="flex-1 border rounded px-2" value={input} onChange={(e) => setInput(e.target.value)} />
        <button className="px-3 py-1 bg-[#4f47e6] text-white rounded" onClick={send} disabled={loading}>{loading ? '...' : 'Send'}</button>
      </div>
    </div>
  )
}

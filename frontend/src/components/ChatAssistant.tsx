"use client"
import React from 'react'
import { Button } from './Button'
import { API_BASE_URL } from '@/lib/api'

export function ChatAssistant() {
  const [open, setOpen] = React.useState(false)
  const [input, setInput] = React.useState('')
  const [messages, setMessages] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(false)

  async function sendToAssistant() {
    if (!input) return
    setLoading(true)
    setMessages(prev => [...prev, { from: 'user', text: input }])
    try {
      const res = await fetch(`${API_BASE_URL}/api/moderation/text`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: input })
      })
      const json = await res.json()
      // placeholder: moderation returns ok/blocked - we echo back
      setMessages(prev => [...prev, { from: 'assistant', text: json.ok ? 'Looks fine ✅' : 'Blocked ❌' }])
    } catch (err) {
      setMessages(prev => [...prev, { from: 'assistant', text: 'Error checking content' }])
    } finally {
      setLoading(false)
      setInput('')
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {open ? (
        <div className="w-80 rounded bg-white shadow-lg p-3">
          <div className="mb-2 flex justify-between items-center">
            <strong>Assistant</strong>
            <button onClick={() => setOpen(false)}>X</button>
          </div>
          <div className="h-40 overflow-y-auto border p-2 mb-2">
            {messages.map((m, i) => (
              <div key={i} className={`mb-1 ${m.from === 'user' ? 'text-right' : 'text-left'}`}>
                <div className={`inline-block p-1 rounded ${m.from === 'user' ? 'bg-indigo-100' : 'bg-gray-100'}`}>{m.text}</div>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input className="flex-1 border rounded px-2" value={input} onChange={(e) => setInput(e.target.value)} />
            <Button onClick={sendToAssistant} isLoading={loading}>Send</Button>
          </div>
        </div>
      ) : (
        <Button onClick={() => setOpen(true)} className="rounded-full p-3">🤖</Button>
      )}
    </div>
  )
}

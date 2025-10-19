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
      // backend returns { success: true, data: <provider response> }
      let botText = 'No response'
      if (json) {
        // If backend already returned a simple answer field
        if (typeof json.answer === 'string' && json.answer.trim()) {
          botText = json.answer
        }
        // If we have a provider response under data, attempt to extract text
        else if (json.data) {
          const prov = json.data
          // OpenAI Responses API: prov.output -> [{ content: [{ type, text }] }]
          try {
            if (Array.isArray(prov.output) && prov.output.length) {
              const outParts = []
              for (const out of prov.output) {
                if (Array.isArray(out.content)) {
                  for (const c of out.content) {
                    if (c?.text) outParts.push(c.text)
                    else if (c?.type === 'output_text' && c?.text) outParts.push(c.text)
                    else if (typeof c === 'string') outParts.push(c)
                  }
                }
                // Fallback: some responses use `content[0].items` or `content_text`
                else if (typeof out?.text === 'string') {
                  outParts.push(out.text)
                }
              }
              if (outParts.length) botText = outParts.join('\n\n')
            }
            // Older style: choices -> [{ text }]
            else if (Array.isArray(prov.choices) && prov.choices.length) {
              botText = prov.choices
                .map((c: { text?: string; message?: { content?: string } }) => c.text || c.message?.content || '')
                .join('\n')
            }
            // Direct text field
            else if (typeof prov.text === 'string') {
              botText = prov.text
            }
          } catch (e) {
            console.error('Failed to parse provider response in chat:', e)
          }
        }
      }

      setMessages(prev => [...prev, { from: 'bot', text: botText }])
    } catch (err) {
      console.error('Chat send error:', err)
      setMessages(prev => [...prev, { from: 'bot', text: 'Error sending message' }])
    } finally {
      setLoading(false)
      setInput('')
    }
  }

  if (!open) return null

  return (
    <div className="fixed right-6 bottom-6 z-50 w-96 rounded shadow-lg bg-white text-black p-3">
      <div className="flex justify-between items-center mb-2">
        <strong className="text-white" style={{ backgroundColor: '#4f47e6', padding: '4px 8px', borderRadius: 6 }}>Chat</strong>
        <button onClick={() => setOpen(false)}>X</button>
      </div>
      <div className="h-64 overflow-y-auto mb-2">
        {messages.map((m, i) => (
          <div key={i} className={`mb-2 ${m.from === 'user' ? 'text-right' : 'text-left'}`}>
            <div className={`inline-block p-2 rounded ${m.from === 'user' ? 'bg-gray-100 text-black' : 'bg-[#4f47e6] text-white'}`}>{m.text}</div>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input className="flex-1 border rounded px-2 text-black bg-white" value={input} onChange={(e) => setInput(e.target.value)} />
        <button className="px-3 py-1 bg-[#4f47e6] text-white rounded" onClick={send} disabled={loading}>{loading ? '...' : 'Send'}</button>
      </div>
    </div>
  )
}

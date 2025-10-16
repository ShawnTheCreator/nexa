"use client"
import React from "react"
import { Button } from "@/components/Button"
import { Divider } from "@/components/dashboard/Divider"
import { Input } from "@/components/Input"
import { Textarea } from "@/components/Textarea"
import { API_BASE_URL } from "@/lib/api"

export default function ChatPage() {
  const [partnerId, setPartnerId] = React.useState("")
  const [messages, setMessages] = React.useState<any[]>([])
  const [content, setContent] = React.useState("")
  const [loading, setLoading] = React.useState(false)

  async function loadConversation() {
    if (!partnerId) return
    setLoading(true)
    const res = await fetch(`${API_BASE_URL}/api/chat/conversations/${partnerId}`, { credentials: "include" })
    const json = await res.json()
    setMessages(json.data || [])
    setLoading(false)
  }

  async function send() {
    if (!partnerId || !content) return
    const res = await fetch(`${API_BASE_URL}/api/chat/messages`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ receiverId: partnerId, content }),
    })
    if (res.ok) {
      setContent("")
      loadConversation()
    }
  }

  return (
    <main>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-50">Chat</h1>
          <p className="text-gray-500 sm:text-sm/6 dark:text-gray-500">Texting interface between users</p>
        </div>
        <div className="flex gap-2">
          <Input placeholder="Partner user ID" value={partnerId} onChange={(e) => setPartnerId(e.target.value)} />
          <Button onClick={loadConversation} isLoading={loading}>Load</Button>
        </div>
      </div>
      <Divider />

      <section className="space-y-4">
        <div className="h-80 overflow-y-auto rounded border p-3">
          {messages.map((m) => (
            <div key={m.id} className="mb-2">
              <div className="text-xs text-gray-500">{new Date(m.createdAt).toLocaleString()}</div>
              <div className="rounded bg-gray-100 p-2 dark:bg-gray-900">{m.content}</div>
            </div>
          ))}
          {messages.length === 0 && <p className="text-sm text-gray-500">No messages yet.</p>}
        </div>
        <div className="flex gap-2">
          <Textarea className="h-20" placeholder="Type a message" value={content} onChange={(e) => setContent(e.target.value)} />
          <Button onClick={send}>Send</Button>
        </div>
      </section>
    </main>
  )
}
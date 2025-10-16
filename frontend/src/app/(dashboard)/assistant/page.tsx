"use client"
import React from "react"
import { Button } from "@/components/Button"
import { Divider } from "@/components/dashboard/Divider"
import { Textarea } from "@/components/Textarea"

export default function AssistantPage() {
  const [prompt, setPrompt] = React.useState("What is this website about?")
  const [answer, setAnswer] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  async function ask() {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      })
      if (!res.ok) throw new Error(await res.text())
      const json = await res.json()
      setAnswer(json.answer || "")
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-50">Assistant</h1>
          <p className="text-gray-500 sm:text-sm/6 dark:text-gray-500">Ask the chatbot about the website</p>
        </div>
        <Button onClick={ask} isLoading={loading}>Ask</Button>
      </div>
      <Divider />
      {error ? <p className="text-red-600">{error}</p> : null}

      <section className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <Textarea className="h-40" value={prompt} onChange={(e) => setPrompt(e.target.value)} />
        </div>
        <div>
          <div className="h-40 whitespace-pre-wrap rounded border p-3">{answer || "The assistant will respond here."}</div>
        </div>
      </section>
    </main>
  )
}
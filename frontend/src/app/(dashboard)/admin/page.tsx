"use client"
import React from "react"
import { Button } from "@/components/Button"
import { Divider } from "@/components/dashboard/Divider"
import { API_BASE_URL } from "@/lib/api"

export default function AdminDashboard() {
  const [categories, setCategories] = React.useState<any[]>([])
  const [ideas, setIdeas] = React.useState<any[]>([])
  const [error, setError] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(false)
  const [newCategory, setNewCategory] = React.useState({ name: "", type: "idea", description: "" })

  async function refresh() {
    try {
      setLoading(true)
      setError(null)
      const [catRes, ideasRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/categories?includeInactive=true`, { credentials: "include" }),
        fetch(`${API_BASE_URL}/api/ideas`, { credentials: "include" }),
      ])
      const catJson = await catRes.json()
      const ideasJson = await ideasRes.json()
      setCategories(catJson.data || [])
      setIdeas(ideasJson.data || [])
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => { refresh() }, [])

  async function approveIdea(id: string) {
    await fetch(`${API_BASE_URL}/api/ideas/${id}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "approved" }),
    })
    refresh()
  }

  async function rejectIdea(id: string) {
    await fetch(`${API_BASE_URL}/api/ideas/${id}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "rejected" }),
    })
    refresh()
  }

  return (
    <main>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-50">Admin Dashboard</h1>
          <p className="text-gray-500 sm:text-sm/6 dark:text-gray-500">Manage categories and user ideas</p>
        </div>
        <Button onClick={refresh} isLoading={loading}>Refresh</Button>
      </div>
      <Divider />
      {error ? <p className="text-red-600">{error}</p> : null}

      <section className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <div>
          <h2 className="text-xl font-medium">Categories</h2>
          <div className="mt-3 space-y-2 rounded border p-3">
            <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
              <input className="rounded border px-2 py-1" placeholder="Name" value={newCategory.name} onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })} />
              <select className="rounded border px-2 py-1" value={newCategory.type} onChange={(e) => setNewCategory({ ...newCategory, type: e.target.value })}>
                <option value="idea">idea</option>
                <option value="ticket">ticket</option>
              </select>
              <input className="rounded border px-2 py-1" placeholder="Description" value={newCategory.description} onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })} />
            </div>
            <Button onClick={async () => {
              await fetch(`${API_BASE_URL}/api/categories`, {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: newCategory.name, type: newCategory.type, description: newCategory.description })
              })
              setNewCategory({ name: "", type: "idea", description: "" })
              refresh()
            }}>Create Category</Button>
          </div>
          <ul className="mt-3 space-y-2">
            {categories.map((c) => (
              <li key={c.id} className="flex items-center justify-between rounded border px-3 py-2">
                <div>
                  <p className="font-medium">{c.name}</p>
                  <p className="text-xs text-gray-500">Type: {c.type} • {c.isActive ? "Active" : "Inactive"}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="light" onClick={async () => {
                    await fetch(`${API_BASE_URL}/api/categories/${c.id}`, {
                      method: "PATCH",
                      credentials: "include",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ description: c.description })
                    })
                    refresh()
                  }}>Update</Button>
                  <Button variant="ghost" onClick={async () => {
                    await fetch(`${API_BASE_URL}/api/categories/${c.id}/archive`, { method: "POST", credentials: "include" })
                    refresh()
                  }}>Archive</Button>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-medium">Ideas</h2>
          <ul className="mt-3 space-y-2">
            {ideas.map((i) => (
              <li key={i.id} className="flex items-center justify-between rounded border px-3 py-2">
                <div>
                  <p className="font-medium">{i.title}</p>
                  <p className="text-xs text-gray-500">Status: {i.status}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="light" onClick={() => approveIdea(i.id)}>Approve</Button>
                  <Button variant="ghost" onClick={() => rejectIdea(i.id)}>Reject</Button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  )
}
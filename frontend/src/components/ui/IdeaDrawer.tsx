"use client"
import React from "react"
import { Button } from "@/components/Button"
import {
  Drawer,
  DrawerBody,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/Drawer"
import { Input } from "@/components/Input"
import { Label } from "@/components/Label"
import { Textarea } from "@/components/Textarea"
import { API_BASE_URL } from "@/lib/api"

interface IdeaDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function IdeaDrawer({ open, onOpenChange }: IdeaDrawerProps) {
  const [title, setTitle] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [attachments, setAttachments] = React.useState<FileList | null>(null)
  const [video, setVideo] = React.useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  async function handleSubmitIdea() {
    try {
      setIsSubmitting(true)
      setError(null)
      // Basic moderation check before submitting (requires auth)
      try {
        const modRes = await fetch(`${API_BASE_URL}/api/moderation/text`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: `${title}\n\n${description}` }),
        })
        const modJson = await modRes.json()
        if (modJson && modJson.ok === false) {
          throw new Error('Your idea contains content that is not allowed: ' + (modJson.reasons || []).join(', '))
        }
      } catch (mErr) {
        throw mErr
      }

      // Ensure there's at least one image attachment
      const hasImage = attachments && Array.from(attachments).some((f) => f.type.startsWith('image/'))
      if (!hasImage) {
        throw new Error('Please upload at least one image for your idea (compulsory)')
      }

      // Check video length client-side if provided
      if (video) {
        // Attempt to check duration via blob URL (best-effort)
        const url = URL.createObjectURL(video)
        const vidEl = document.createElement('video')
        const loaded = await new Promise<boolean>((resolve) => {
          vidEl.preload = 'metadata'
          vidEl.src = url
          vidEl.onloadedmetadata = () => {
            URL.revokeObjectURL(url)
            resolve(vidEl.duration <= 60)
          }
          vidEl.onerror = () => resolve(false)
        })
        if (!loaded) throw new Error('Video must be 60 seconds or less')
      }

      const res = await fetch(`${API_BASE_URL}/api/ideas`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description }),
      })
      if (!res.ok) throw new Error(await res.text())
      const data = await res.json()
      const ideaId = data.data?.id

      if (attachments && attachments.length > 0 && ideaId) {
        const form = new FormData()
        Array.from(attachments).forEach((file) => form.append("attachments", file))
        const res2 = await fetch(`${API_BASE_URL}/api/ideas/${ideaId}/attachments`, {
          method: "POST",
          credentials: "include",
          body: form,
        })
        if (!res2.ok) throw new Error(await res2.text())
      }

      if (video && ideaId) {
        const form = new FormData()
        form.append("video", video)
        const res3 = await fetch(`${API_BASE_URL}/api/ideas/${ideaId}/video`, {
          method: "POST",
          credentials: "include",
          body: form,
        })
        if (!res3.ok) throw new Error(await res3.text())
      }

      onOpenChange(false)
      setTitle("")
      setDescription("")
      setAttachments(null)
      setVideo(null)
    } catch (e: any) {
      setError(e.message || "Failed to submit idea")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="sm:max-w-2xl">
        <DrawerHeader>
          <DrawerTitle>
            <p>Submit Idea</p>
            <span className="text-sm font-normal text-gray-500 dark:text-gray-500">
              Share your innovation with optional attachments or video
            </span>
          </DrawerTitle>
        </DrawerHeader>
        <DrawerBody className="-mx-6 space-y-6 overflow-y-scroll border-t border-gray-200 px-6 dark:border-gray-800">
          <div>
            <Label className="font-medium">Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Idea title" />
          </div>
          <div>
            <Label className="font-medium">Description</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe your idea" className="h-32" />
          </div>
          <div>
            <Label className="font-medium">Attachments</Label>
            <Input type="file" multiple accept="image/*,application/pdf,video/*" onChange={(e) => setAttachments(e.target.files)} />
            <p className="mt-1 text-xs text-gray-500">Max 5 files. Up to 25MB each.</p>
          </div>
          <div>
            <Label className="font-medium">Video</Label>
            <Input type="file" accept="video/*" onChange={(e) => setVideo(e.target.files?.[0] || null)} />
            <p className="mt-1 text-xs text-gray-500">Up to 50MB. MP4 recommended.</p>
          </div>
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
        </DrawerBody>
        <DrawerFooter>
          <Button onClick={handleSubmitIdea} isLoading={isSubmitting}>Submit</Button>
          <DrawerClose>
            <Button variant="secondary">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
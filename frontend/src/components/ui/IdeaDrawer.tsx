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
  const [video, setVideo] = React.useState<File | null>(null)
  const [imageFile, setImageFile] = React.useState<File | null>(null)
  const [docFile, setDocFile] = React.useState<File | null>(null)
  const [recording, setRecording] = React.useState(false)
  const [recordedBlob, setRecordedBlob] = React.useState<Blob | null>(null)
  const mediaRecorderRef = React.useRef<MediaRecorder | null>(null)
  const recordedChunksRef = React.useRef<Blob[]>([])
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [people, setPeople] = React.useState<string[]>([])
  const [availablePeople, setAvailablePeople] = React.useState<any[]>([])

  React.useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/users?q=`, { credentials: 'include' })
        const json = await res.json()
        setAvailablePeople(json.data || [])
      } catch (err) {
        // ignore
      }
    })()
  }, [])

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

      // Ensure there's exactly one image
      if (!imageFile) throw new Error('Please upload one image for your idea (compulsory)')

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

      // upload image and doc if present
      if (ideaId) {
        const form = new FormData()
        if (imageFile) form.append('image', imageFile)
        if (docFile) form.append('document', docFile)
        if (form.has('image') || form.has('document')) {
          const res2 = await fetch(`${API_BASE_URL}/api/ideas/${ideaId}/attachments`, {
            method: 'POST',
            credentials: 'include',
            body: form
          })
          if (!res2.ok) throw new Error(await res2.text())
        }
      }

      // If user recorded a video in-app, upload that instead of file input
      const uploadVideoFile = recordedBlob ? new File([recordedBlob], 'recorded.webm', { type: recordedBlob.type }) : video
      if (uploadVideoFile && ideaId) {
        const form = new FormData()
        form.append("video", uploadVideoFile)
        const res3 = await fetch(`${API_BASE_URL}/api/ideas/${ideaId}/video`, {
          method: "POST",
          credentials: "include",
          body: form,
        })
        if (!res3.ok) throw new Error(await res3.text())
      }

      // Optionally persist selected people — this example posts to an endpoint you may implement
      if (people.length > 0 && ideaId) {
        try {
          await fetch(`${API_BASE_URL}/api/ideas/${ideaId}/assignees`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ assignees: people })
          })
        } catch (e) {
          // ignore
        }
      }

      onOpenChange(false)
  setTitle("")
  setDescription("")
  setImageFile(null)
  setDocFile(null)
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
            <Label className="font-medium">Image (required)</Label>
            <Input type="file" accept="image/*" capture="environment" onChange={(e) => setImageFile(e.target.files?.[0] || null)} />
            <p className="mt-1 text-xs text-gray-500">One image required. You can take a photo with your device.</p>
          </div>
          <div>
            <Label className="font-medium">Document (optional)</Label>
            <Input type="file" accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={(e) => setDocFile(e.target.files?.[0] || null)} />
            <p className="mt-1 text-xs text-gray-500">One document (PDF or DOC).</p>
          </div>
          <div>
            <Label className="font-medium">Video</Label>
            <Input type="file" accept="video/*" capture="environment" onChange={(e) => setVideo(e.target.files?.[0] || null)} />
            <p className="mt-1 text-xs text-gray-500">Up to 50MB. MP4 recommended.</p>

            <div className="mt-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={async () => {
                    if (recording) {
                      // stop
                      mediaRecorderRef.current?.stop()
                      setRecording(false)
                    } else {
                      // start: request mic+camera
                      try {
                        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true })
                        recordedChunksRef.current = []
                        const mr = new MediaRecorder(stream, { mimeType: 'video/webm; codecs=vp8,opus' })
                        mediaRecorderRef.current = mr
                        mr.ondataavailable = (e) => { if (e.data.size > 0) recordedChunksRef.current.push(e.data) }
                        mr.onstop = () => {
                          const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' })
                          setRecordedBlob(blob)
                          // stop all tracks
                          stream.getTracks().forEach(t => t.stop())
                        }
                        mr.start()
                        setRecording(true)
                        // auto-stop after 60s
                        setTimeout(() => {
                          if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') mediaRecorderRef.current.stop()
                        }, 60_000)
                      } catch (err) {
                        console.error('Media error', err)
                      }
                    }
                  }}
                  className="rounded bg-indigo-600 px-3 py-1 text-white"
                >
                  {recording ? 'Stop recording' : 'Record video (60s)'}
                </button>
                {recordedBlob ? (
                  <video className="h-28 rounded" controls src={URL.createObjectURL(recordedBlob)} />
                ) : null}
              </div>
            </div>
          </div>
          <div>
            <Label className="font-medium">Assign to people</Label>
            <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto border p-2">
              {availablePeople.map((p) => (
                <label key={p.Id} className="flex items-center gap-2">
                  <input type="checkbox" checked={people.includes(p.Id)} onChange={(e) => setPeople((prev) => e.target.checked ? [...prev, p.Id] : prev.filter(id => id !== p.Id))} />
                  <span className="text-sm">{p.FirstName} {p.LastName}</span>
                </label>
              ))}
            </div>
            <p className="mt-1 text-xs text-gray-500">Select people responsible for this idea.</p>
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
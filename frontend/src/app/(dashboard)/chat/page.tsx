"use client"
import React from "react"
import { Button } from "@/components/Button"
import { Input } from "@/components/Input"
import { Textarea } from "@/components/Textarea"
import { API_BASE_URL } from "@/lib/api"

// Socket.IO client will be dynamically imported in useEffect to avoid SSR issues
let ioClient: any = null;

export default function ChatPage() {
  const [partnerId, setPartnerId] = React.useState("")
  const [messages, setMessages] = React.useState<any[]>([])
  const [content, setContent] = React.useState("")
  const [selectedFiles, setSelectedFiles] = React.useState<File[]>([])
  const [recording, setRecording] = React.useState(false)
  const [recorderBlob, setRecorderBlob] = React.useState<Blob | null>(null)
  const [loading, setLoading] = React.useState(false)
  const [contacts, setContacts] = React.useState<any[]>([])
  const [search, setSearch] = React.useState("")
  const [selected, setSelected] = React.useState<any | null>(null)

  React.useEffect(() => {
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/users?q=${encodeURIComponent(search)}`, { credentials: 'include' })
        const json = await res.json()
        setContacts(json.data || [])
      } catch (err) {
        // ignore
      }
    }, 300)
    return () => clearTimeout(t)
  }, [search])

  // Socket.IO setup for real-time updates
  React.useEffect(() => {
    let socket: any;
    let currentUserId: string | null = null;
    (async () => {
      // fetch profile to get current user id so we can identify the socket
      try {
        const pr = await fetch(`${API_BASE_URL}/api/auth/profile`, { credentials: 'include' });
        if (pr.ok) {
          const j = await pr.json();
          currentUserId = j.user?.id || j.user?.Id || null;
        }
      } catch (e) {
        // ignore
      }
      try {
        const mod = await import('socket.io-client');
        ioClient = mod.io;
        socket = ioClient(API_BASE_URL, { withCredentials: true });
        // identify the user after connecting - backend expects `identify`
        // Emit identify with user id when available
        socket.on('connect', () => {
          console.log('socket connected', socket.id);
          if (currentUserId) socket.emit('identify', currentUserId);
        });

        socket.on('message:new', (msg:any) => {
          // If the message belongs to current conversation, append it
          const id = partnerId || selected?.Id;
          if (!id) return;
          if (msg.receiverId === id || msg.senderId === id) {
            setMessages((prev) => [...prev, msg]);
            // scroll to bottom
            const el = document.getElementById('messages');
            if (el) el.scrollTop = el.scrollHeight;
          }
        });
      } catch (err: any) {
        console.warn('Socket.IO client failed to load:', err?.message || err);
      }
    })();

    return () => { if (socket) socket.disconnect(); }
  }, [partnerId, selected])

  async function loadConversation() {
    const id = partnerId || selected?.Id
    if (!id) return
    setLoading(true)
    const res = await fetch(`${API_BASE_URL}/api/chat/conversations/${id}`, { credentials: "include" })
    const json = await res.json()
    setMessages(json.data || [])
    setLoading(false)
  }

  async function send() {
    const id = partnerId || selected?.Id
    if (!id || !content) return
    // If there are files or recorder blob, send as multipart/form-data
    const fd = new FormData();
    fd.append('receiverId', id);
    fd.append('content', content);
    selectedFiles.forEach((f) => fd.append('files', f));
    if (recorderBlob) {
      fd.append('files', new File([recorderBlob], `voice-${Date.now()}.webm`, { type: recorderBlob.type }));
    }

    const res = await fetch(`${API_BASE_URL}/api/chat/messages`, {
      method: 'POST',
      credentials: 'include',
      body: fd
    });

    if (res.ok) {
      setContent('');
      setSelectedFiles([]);
      setRecorderBlob(null);
      loadConversation();
    }
  }

  // File input change handler
  function onFilesChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files ? Array.from(e.target.files) : [];
    setSelectedFiles(files);
  }

  // Voice recorder using MediaRecorder - 30s cap
  async function toggleRecording() {
    if (recording) {
      // stop
      setRecording(false);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];
      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        setRecorderBlob(blob);
        stream.getTracks().forEach(t => t.stop());
      };
      mediaRecorder.start();
      setRecording(true);

      // auto-stop after 30s
      setTimeout(() => {
        if (mediaRecorder.state !== 'inactive') mediaRecorder.stop();
        setRecording(false);
      }, 30000);
    } catch (err) {
      console.error('Recording error', err);
      alert('Unable to access microphone');
    }
  }

  return (
    <main className="h-[80vh]">
      <div className="flex h-full overflow-hidden rounded border">
        {/* Left: contacts */}
        <aside className="w-80 border-r p-4">
          <div className="mb-3">
            <Input placeholder="Search users by name" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div className="space-y-2 overflow-y-auto h-[70vh]">
            {contacts.map((c) => (
              <div key={c.Id} className={`flex items-center gap-3 p-2 rounded cursor-pointer ${selected?.Id === c.Id ? 'bg-gray-100' : ''}`} onClick={() => { setSelected(c); setPartnerId(c.Id); loadConversation(); }}>
                {c.ProfilePicUrl ? <img src={c.ProfilePicUrl} className="h-10 w-10 rounded-full object-cover" /> : <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">{(c.FirstName||'')[0]}</div>}
                <div>
                  <div className="font-medium">{c.FirstName} {c.LastName}</div>
                </div>
              </div>
            ))}
            {contacts.length === 0 && <p className="text-sm text-gray-500">No contacts</p>}
          </div>
        </aside>

        {/* Right: conversation */}
        <section className="flex-1 p-4 flex flex-col">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">{selected ? `${selected.FirstName} ${selected.LastName}` : 'Select a contact'}</h2>
            </div>
            <div>
              <div className="flex gap-2">
                <Button onClick={() => alert('Start call (placeholder)')} className="bg-green-600">Call</Button>
                <Button onClick={() => { const name = prompt('Group name'); if (name) alert('Group "' + name + '" created (placeholder)') }}>Create Group</Button>
                <Button onClick={loadConversation} isLoading={loading}>Refresh</Button>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 p-2" id="messages">
            {messages.map((m) => (
              <div key={m.id} className={`max-w-[60%] ${m.senderId === selected?.Id ? 'self-start' : 'self-end'} `}>
                  <div className={`rounded-xl p-3 ${m.senderId === selected?.Id ? 'bg-gray-100' : 'bg-blue-600 text-white'}`}>
                    <div className="text-sm">{m.content}</div>
                    {/* Attachments */}
                    {m.attachments && m.attachments.length > 0 && (
                      <div className="mt-2 space-y-2">
                        {m.attachments.map((a:any) => (
                          <div key={a.id} className="rounded p-1 bg-white text-black">
                            {a.contentType?.startsWith('image') ? (
                              <img src={a.url} className="max-w-full rounded" />
                            ) : a.contentType?.startsWith('audio') ? (
                              <audio controls src={a.url} />
                            ) : (
                              <a href={a.url} target="_blank" rel="noreferrer" className="text-sm underline">{a.fileName || 'Attachment'}</a>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">{new Date(m.createdAt).toLocaleTimeString()}</div>
                </div>
            ))}
            {messages.length === 0 && <p className="text-sm text-gray-500">No messages yet.</p>}
          </div>

          <div className="mt-3 flex gap-2">
            <div className="flex-1">
              <Textarea className="h-20" placeholder="Type a message" value={content} onChange={(e) => setContent(e.target.value)} />
              <div className="flex items-center gap-2 mt-2">
                <input type="file" multiple accept="image/*,audio/*" onChange={onFilesChange} />
                <Button onClick={toggleRecording} className={recording ? 'bg-red-600' : ''}>{recording ? 'Stop' : 'Record'}</Button>
                {recorderBlob && <span className="text-sm text-gray-500">Recorded ({Math.round((recorderBlob.size/1024)/10)/100} KB)</span>}
              </div>
            </div>
            <div className="flex flex-col">
              <Button onClick={send}>Send</Button>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
"use client";
import React from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerBody,
  DrawerFooter,
  DrawerClose,
} from "@/components/Drawer";
import { Button } from "@/components/Button";
import { API_BASE_URL } from "@/lib/api";

export function IdeaDetailDrawer({ open, onOpenChange, ideaId }: { open: boolean; onOpenChange: (b: boolean) => void; ideaId?: string }) {
  const [idea, setIdea] = React.useState<any | null>(null);
  const [comments, setComments] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [commentText, setCommentText] = React.useState('');
  const [rating, setRating] = React.useState<number | null>(null);

  async function submitComment() {
    if (!commentText.trim() || !ideaId) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/ideas/${ideaId}/comments`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: commentText }),
      });
      if (!res.ok) throw new Error('Failed to post comment');
      setCommentText('');
      // refresh comments
      const cRes = await fetch(`${API_BASE_URL}/api/ideas/${ideaId}/comments`);
      const cJson = await cRes.json();
      setComments(cJson.data || []);
    } catch (err) {
      console.error('submitComment error', err);
    }
  }

  async function submitRating(value: number) {
    if (!ideaId) return;
    try {
      await fetch(`${API_BASE_URL}/api/ratings/${ideaId}/rate`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating: value }),
      });
      setRating(value);
    } catch (err) {
      console.error('submitRating error', err);
    }
  }

  React.useEffect(() => {
    if (!open || !ideaId) return;
    setLoading(true);
    (async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/ideas/${ideaId}`, { credentials: 'include' });
        const json = await res.json();
        setIdea(json.data || null);

        const cRes = await fetch(`${API_BASE_URL}/api/ideas/${ideaId}/comments`);
        const cJson = await cRes.json();
        setComments(cJson.data || []);
      } catch (err) {
        // ignore
      } finally {
        setLoading(false);
      }
    })();
  }, [open, ideaId]);

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="sm:max-w-2xl">
        <DrawerHeader>
          <DrawerTitle>{idea?.title || 'Idea'}</DrawerTitle>
        </DrawerHeader>
        <DrawerBody className="-mx-6 px-6">
          {loading ? <p>Loading…</p> : null}
          {idea ? (
            <div>
              <p className="mb-4 text-sm text-gray-700 dark:text-gray-300">{idea.description}</p>
              {idea.attachmentUrls ? (
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {JSON.parse(idea.attachmentUrls).map((u: string) => (
                    <img key={u} src={u} className="h-28 w-full object-cover rounded" />
                  ))}
                </div>
              ) : null}
              {idea.videoUrl ? (
                <video controls src={idea.videoUrl} className="w-full rounded mb-4" />
              ) : null}

              <h4 className="font-medium">Comments</h4>
              <div className="mt-2 space-y-2">
                {comments.map((c) => (
                  <div key={c.Id || c.id} className="rounded border p-2">
                    <div className="text-xs text-gray-500">{c.FirstName} {c.LastName}</div>
                    <div className="text-sm">{c.Text}</div>
                  </div>
                ))}
                {comments.length === 0 ? <p className="text-sm text-gray-500">No comments yet.</p> : null}
                <div className="mt-3 flex gap-2">
                  <input value={commentText} onChange={(e) => setCommentText(e.target.value)} placeholder="Write a comment" className="flex-1 rounded border px-2 py-1" />
                  <button onClick={submitComment} className="rounded bg-blue-600 px-3 py-1 text-white">Comment</button>
                </div>
                <div className="mt-4">
                  <div className="text-sm font-medium">Rate this idea</div>
                  <div className="mt-2 flex items-center gap-1">
                    {[1,2,3,4,5].map((s) => (
                      <button key={s} onClick={() => submitRating(s)} className={`text-xl ${rating && rating >= s ? 'text-yellow-400' : 'text-gray-300'}`}>
                        ★
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </DrawerBody>
        <DrawerFooter>
          <DrawerClose>
            <Button variant="secondary">Close</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

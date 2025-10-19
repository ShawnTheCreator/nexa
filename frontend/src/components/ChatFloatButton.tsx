"use client"
import React from 'react'

export function ChatFloatButton() {
  const openChat = () => {
    try { window.dispatchEvent(new CustomEvent('openChat')) } catch (e) { /* ignore */ }
  }

  return (
    <div className="fixed right-6 bottom-6 z-50">
      <button aria-label="Open chat" onClick={openChat} className="h-12 w-12 rounded-full bg-[#4f47e6] text-white shadow-lg flex items-center justify-center">💬</button>
    </div>
  )
}

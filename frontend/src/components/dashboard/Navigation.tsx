"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { TabNavigation, TabNavigationLink } from "@/components/dashboard/TabNavigation"
import React from "react"
import { API_BASE_URL } from "@/lib/api"

const Logo = (props: any) => (
  <svg fill="#a855f7" viewBox="0 0 24 24" {...props}>
    <path d="M9 2L10.5 7L15 8.5L10.5 10L9 15L7.5 10L3 8.5L7.5 7L9 2Z" />
    <path d="M15 11L16 14L19 15L16 16L15 19L14 16L11 15L14 14L15 11Z" />
    <path d="M6 16L7 18L9 19L7 20L6 22L5 20L3 19L5 18L6 16Z" />
    <circle cx="12" cy="12" r="1" fill="currentColor" />
  </svg>
)

function Navigation() {
  const pathname = usePathname()
  const [profile, setProfile] = React.useState<any | null>(null)

  React.useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/auth/profile`, { credentials: 'include' })
        if (res.ok) {
          const json = await res.json()
          setProfile(json.user || null)
        }
      } catch (err) {
        // ignore
      }
    })()
  }, [])

  async function logout() {
    try {
      await fetch(`${API_BASE_URL}/api/auth/logout`, { method: 'POST', credentials: 'include' })
    } finally {
      window.location.href = '/auth/login'
    }
  }
  return (
    <div className="shadow-s sticky top-0 z-20 bg-white dark:bg-gray-950">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 pt-3">
        <div className="flex items-center gap-2">
          <span className="sr-only">Nexa</span>
          <Logo className="h-10 w-10"/>
          <h3 className="font-bold">Nexa</h3>
        </div>
        <div className="flex items-center gap-4">
          {profile ? (
            <div className="relative flex items-center gap-3">
              {profile.ProfilePicUrl ? (
                <img src={profile.ProfilePicUrl} alt="profile" className="h-8 w-8 rounded-full object-cover" style={{ boxShadow: '0 0 0 2px #4f47e6' }} />
              ) : (
                <div className="h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium" style={{ backgroundColor: '#4f47e6', color: '#ffffff' }}>
                  {((profile.firstName || '').charAt(0) + (profile.lastName || '').charAt(0)).toUpperCase()}
                </div>
              )}
              <div className="text-sm">{profile.firstName} {profile.lastName}</div>
              <div className="relative">
                <button className="ml-2 px-2 py-1 rounded bg-indigo-700 text-white focus:outline-none focus:ring-0" onClick={() => { const el = document.getElementById('profile-menu'); if (el) el.classList.toggle('hidden') }}>⋯</button>
                <div id="profile-menu" className="hidden absolute right-0 mt-2 w-44 rounded bg-indigo-700 text-white p-2 shadow-none ring-0">
                  <Link href="/settings" className="block px-2 py-1">Settings</Link>
                  <button onClick={logout} className="w-full text-left px-2 py-1">Logout</button>
                </div>
              </div>
            </div>
          ) : null}
          
        </div>
      </div>
      <TabNavigation className="mt-5">
    <div className="mx-auto flex w-full max-w-7xl items-center px-6">
      <TabNavigationLink
        className="inline-flex gap-2"
        asChild
        active={pathname === "/overview"}
      >
        <Link href="/overview">Overview</Link>
      </TabNavigationLink>
      <TabNavigationLink
        className="inline-flex gap-2"
        asChild
        active={pathname === "/ideas"}
      >
        <Link href="/ideas">Ideas</Link>
      </TabNavigationLink>
      <TabNavigationLink
        className="inline-flex gap-2"
        asChild
        active={pathname === "/chat"}
      >
        <Link href="/chat">Chat</Link>
      </TabNavigationLink>
      {profile && profile.isAdmin ? (
        <TabNavigationLink
          className="inline-flex gap-2"
          asChild
          active={pathname === "/admin"}
        >
          <Link href="/admin">Admin</Link>
        </TabNavigationLink>
      ) : null}
    </div>
  </TabNavigation>
    </div>
  )
}

export { Navigation }
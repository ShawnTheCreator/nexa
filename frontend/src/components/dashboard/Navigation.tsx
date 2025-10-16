"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { TabNavigation, TabNavigationLink } from "@/components/dashboard/TabNavigation"

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
  return (
    <div className="shadow-s sticky top-0 z-20 bg-white dark:bg-gray-950">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 pt-3">
        <div className="flex items-center gap-2">
          <span className="sr-only">Nexa</span>
          <Logo className="h-10 w-10"/>
          <h3 className="font-bold">Nexa</h3>
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
        active={pathname === "/assistant"}
      >
        <Link href="/assistant">Assistant</Link>
      </TabNavigationLink>
      <TabNavigationLink
        className="inline-flex gap-2"
        asChild
        active={pathname === "/chat"}
      >
        <Link href="/chat">Chat</Link>
      </TabNavigationLink>
      <TabNavigationLink
        className="inline-flex gap-2"
        asChild
        active={pathname === "/admin"}
      >
        <Link href="/admin">Admin</Link>
      </TabNavigationLink>
      <TabNavigationLink
        className="inline-flex gap-2"
        asChild
        active={pathname === "/voting"}
      >
        <Link href="/voting">Voting</Link>
      </TabNavigationLink>
      <TabNavigationLink
        className="inline-flex gap-2"
        asChild
        active={pathname === "/settings"}
      >
        <Link href="/settings">Settings</Link>
      </TabNavigationLink>
    </div>
  </TabNavigation>
    </div>
  )
}

export { Navigation }
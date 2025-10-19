"use client"

import { siteConfig } from "@/app/siteConfig"
import useScroll from "@/lib/use-scroll"
import { cx } from "@/lib/utils"
import { RiCloseLine, RiMenuLine } from "@remixicon/react"
import Link from "next/link"
import React from "react"
import { Button } from "../Button"

const Logo = (props: React.SVGProps<SVGSVGElement>) => (
  <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
    <path d="M9 2L10.5 7L15 8.5L10.5 10L9 15L7.5 10L3 8.5L7.5 7L9 2Z" />
    <path d="M15 11L16 14L19 15L16 16L15 19L14 16L11 15L14 14L15 11Z" />
    <path d="M6 16L7 18L9 19L7 20L6 22L5 20L3 19L5 18L6 16Z" />
    <circle cx="12" cy="12" r="1" fill="currentColor" />
  </svg>
)

export function Navigation() {
  const scrolled = useScroll(15)
  const [open, setOpen] = React.useState(false)

  React.useEffect(() => {
    const mediaQuery: MediaQueryList = window.matchMedia("(min-width: 768px)")
    const handleMediaQueryChange = () => setOpen(false)
    mediaQuery.addEventListener("change", handleMediaQueryChange)
    handleMediaQueryChange()
    return () => mediaQuery.removeEventListener("change", handleMediaQueryChange)
  }, [])

  return (
    <header
      className={cx(
        "fixed inset-x-3 top-4 z-50 mx-auto flex max-w-6xl transform-gpu animate-slide-down-fade justify-center overflow-hidden rounded-3xl border border-transparent px-3 py-3 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1.03)] will-change-transform",
        open === true ? "h-52" : "h-16",
        scrolled || open === true
          ? "backdrop-blur-nav max-w-3xl border-gray-100 bg-white/80 shadow-xl shadow-black/5 dark:border-white/15 dark:bg-black/70"
          : "bg-white/0 dark:bg-gray-950/0",
      )}
    >
      <div className="w-full md:my-auto">
        <div className="relative flex items-center justify-between">
          <Link href={siteConfig.baseLinks.home} aria-label="Home">
            <div className="flex items-center gap-2">
              <Logo className="w-8 h-8 text-indigo-600" />
              <span className="text-xl font-medium text-gray-900 dark:text-gray-50">
                Nexa
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:absolute md:left-1/2 md:top-1/2 md:block md:-translate-x-1/2 md:-translate-y-1/2 md:transform">
            <div className="flex items-center gap-10 font-medium">
              <Link className="px-2 py-1 text-gray-900 dark:text-gray-50" href={siteConfig.baseLinks.about}>
                About
              </Link>
              <Link className="px-2 py-1 text-gray-900 dark:text-gray-50" href={siteConfig.baseLinks.pricing}>
                Pricing
              </Link>
              <Link className="px-2 py-1 text-gray-900 dark:text-gray-50" href={siteConfig.baseLinks.changelog}>
                Changelog
              </Link>
            </div>
          </nav>

          {/* Desktop Buttons */}
          <div className="hidden md:flex items-center gap-4">
            <Link href="/auth/login">
              <Button className="h-10 font-semibold">Login</Button>
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex gap-x-2 md:hidden">
            <Button onClick={() => setOpen(!open)} variant="light" className="aspect-square p-2">
              {open ? <RiCloseLine aria-hidden="true" className="size-5" /> : <RiMenuLine aria-hidden="true" className="size-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Nav */}
        <nav className={cx("my-6 flex flex-col gap-4 text-lg ease-in-out will-change-transform md:hidden", open ? "" : "hidden")}>
          <ul className="space-y-4 font-medium">
            <li onClick={() => setOpen(false)}>
              <Link href={siteConfig.baseLinks.about}>About</Link>
            </li>
            <li onClick={() => setOpen(false)}>
              <Link href={siteConfig.baseLinks.pricing}>Pricing</Link>
            </li>
            <li onClick={() => setOpen(false)}>
              <Link href={siteConfig.baseLinks.changelog}>Changelog</Link>
            </li>
            <li onClick={() => setOpen(false)}>
              <Link href="/auth/login">Login</Link>
            </li>
            <li onClick={() => setOpen(false)}>
              <Button>Book demo</Button>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  )
}

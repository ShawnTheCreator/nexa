import Link from "next/link"
import { siteConfig } from "@/app/siteConfig"
import { Button } from "@/components/Button"
import { ArrowAnimated } from "@/components/ui/ArrowAnimated"

const Logo = (props) => (
  <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
    <path d="M9 2L10.5 7L15 8.5L10.5 10L9 15L7.5 10L3 8.5L7.5 7L9 2Z" />
    <path d="M15 11L16 14L19 15L16 16L15 19L14 16L11 15L14 14L15 11Z" />
    <path d="M6 16L7 18L9 19L7 20L6 22L5 20L3 19L5 18L6 16Z" />
    <circle cx="12" cy="12" r="1" fill="currentColor" />
  </svg>
)

export default function NotFound() {
  return (
    <div className="flex h-screen flex-col items-center justify-center">
      <Link href={siteConfig.baseLinks.home}>
        <div className="flex items-center gap-2 mt-6">
          <Logo className="h-10 w-10 text-indigo-600" />
          <span className="text-2xl font-bold text-gray-900 dark:text-gray-50">
            Nexa
          </span>
        </div>
      </Link>
      <p className="mt-6 text-4xl font-semibold text-indigo-600 sm:text-5xl dark:text-indigo-500">
        404
      </p>
      <h1 className="mt-4 text-2xl font-semibold text-gray-900 dark:text-gray-50">
        Page not found
      </h1>
      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
        Sorry, we couldn’t find the page you’re looking for.
      </p>
      <Button asChild className="group mt-8" variant="light">
        <Link href={siteConfig.baseLinks.home}>
          Go to the home page
          <ArrowAnimated
            className="stroke-gray-900 dark:stroke-gray-50"
            aria-hidden="true"
          />
        </Link>
      </Button>
    </div>
  )
}

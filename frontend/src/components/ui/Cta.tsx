import React from "react"
import Link from "next/link"

export default function CTA() {
  return (
    <section className="mx-auto mt-32 max-w-4xl text-center">
      <h2 className="bg-gradient-to-br from-gray-900 to-gray-800 bg-clip-text py-2 text-4xl font-bold tracking-tighter text-transparent sm:text-6xl md:text-6xl dark:from-gray-50 dark:to-gray-300">
        Ready to start innovating?
      </h2>
      <p className="mx-auto mt-6 max-w-2xl text-lg leading-7 text-gray-600 dark:text-gray-400">
        Join companies already accelerating their ideas with our innovation 
        management platform. Take your concepts from vision to reality faster 
        and smarter.
      </p>
      <div className="mt-10 flex justify-center">
        <Link
          href="/get-started"
          className="rounded-2xl bg-indigo-600 px-6 py-3 text-lg font-semibold text-white shadow-md transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          Get started
        </Link>
      </div>
    </section>
  )
}

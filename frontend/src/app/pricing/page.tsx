"use client"
import { Badge } from "@/components/Badge"
import { Button } from "@/components/Button"
import { ArrowAnimated } from "@/components/ui/ArrowAnimated"
import { Faqs } from "@/components/ui/Faqs"
import Testimonial from "@/components/ui/Testimonial"
// removed unused import
import {
  RiCheckLine,
  RiUserLine,
  RiCloudLine,
} from "@remixicon/react"
import Link from "next/link"
import React from "react"

interface Plan {
  name: string
  description: string
  capacity: string[]
  features: string[]
  isStarter: boolean
  isRecommended: boolean
  buttonText: string
  buttonLink: string
}

interface FeatureRow {
  name: string
  plans: Record<string, boolean | string>
}

const plans: Plan[] = [
  {
    name: "Explorer",
    description: "For solo hackers and early adapters ready to play with Nexa.",
    capacity: ["5 explorers, 1 guide", "1 playground"],
    features: ["1000 actions per day", "5 GB sandbox", "Community Slack support"],
    isStarter: true,
    isRecommended: false,
    buttonText: "Dive in",
    buttonLink: "#",
  },
  {
    name: "Collaborator",
    description: "For small teams ready to build something cool together.",
    capacity: ["20 explorers, 3 guides", "Up to 5 playgrounds"],
    features: ["Unlimited actions", "Shared workspace", "Slack Connect"],
    isStarter: false,
    isRecommended: false,
    buttonText: "Collaborate now",
    buttonLink: "#",
  },
  {
    name: "Innovator",
    description: "For big ideas that need room to grow and experiment.",
    capacity: ["Unlimited explorers and guides", "Infinite playgrounds"],
    features: ["Unlimited actions", "Advanced controls", "SSO & integrations"],
    isStarter: false,
    isRecommended: true,
    buttonText: "Go big!",
    buttonLink: "#",
  },
]

const sections: { name: string; features: FeatureRow[] }[] = [
  {
    name: "Workspace Fun",
    features: [
      { name: "Email notifications & webhooks", plans: { Explorer: true, Collaborator: true, Innovator: true } },
      { name: "Playgrounds", plans: { Explorer: "1", Collaborator: "5", Innovator: "∞" } },
      { name: "Sandbox storage", plans: { Explorer: "5 GB", Collaborator: "20 GB", Innovator: "∞" } },
      { name: "Seats", plans: { Explorer: "5 explorers", Collaborator: "20 explorers", Innovator: "∞" } },
    ],
  },
  {
    name: "Automation",
    features: [
      { name: "Service accounts", plans: { Explorer: true, Collaborator: true, Innovator: true } },
      { name: "Admin API", plans: { Collaborator: true, Innovator: true } },
      { name: "No-code workflow builder", plans: { Explorer: "Limited", Collaborator: "Standard", Innovator: "Enhanced" } },
    ],
  },
  {
    name: "Analytics",
    features: [
      { name: "Analytics retention", plans: { Explorer: "7 days", Collaborator: "1 year", Innovator: "∞" } },
      { name: "Anomaly detection", plans: { Collaborator: true, Innovator: true } },
      { name: "Custom report builder", plans: { Innovator: true } },
    ],
  },
  {
    name: "Support",
    features: [
      { name: "Slack", plans: { Explorer: "Community", Collaborator: "Connect", Innovator: "Dedicated guide" } },
      { name: "Email", plans: { Explorer: "2-4 days", Collaborator: "1-2 days", Innovator: "Priority" } },
    ],
  },
]

export default function Pricing() {
  return (
    <div className="px-3">
      <section
        aria-labelledby="pricing-title"
        className="animate-slide-up-fade"
        style={{ animationDuration: "600ms", animationFillMode: "backwards" }}
      >
        <Badge>Plans</Badge>
        <h1 className="mt-2 inline-block bg-gradient-to-br from-gray-900 to-gray-800 bg-clip-text py-2 text-4xl font-bold tracking-tighter text-transparent sm:text-6xl md:text-6xl dark:from-gray-50 dark:to-gray-300">
          Pick your adventure
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-gray-700 dark:text-gray-400">
          Explore Nexa the way you want. No wallets needed — just curiosity and imagination.
        </p>
      </section>

      <section className="mt-20 grid grid-cols-1 gap-x-14 gap-y-8 lg:grid-cols-3">
        {plans.map((plan, planIdx) => (
          <div key={planIdx} className="mt-6">
            {plan.isRecommended && (
              <div className="flex h-4 items-center">
                <div className="relative w-full">
                  <div className="absolute inset-0 flex items-center" aria-hidden="true">
                    <div className="w-full border-t border-indigo-600 dark:border-indigo-400" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-white px-3 text-xs font-medium text-indigo-600 dark:bg-gray-950 dark:text-indigo-400">
                      Most adventurous
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="mx-auto max-w-md">
              <h2 className="mt-6 text-sm font-semibold text-gray-900 dark:text-gray-50">{plan.name}</h2>
              <p className="mt-3 text-sm leading-6 text-gray-600 dark:text-gray-400">{plan.description}</p>
              <div className="mt-6">
                <Button asChild className="group">
                  <Link href={plan.buttonLink}>
                    {plan.buttonText}
                    <ArrowAnimated />
                  </Link>
                </Button>
              </div>
              <ul className="mt-8 text-sm text-gray-700 dark:text-gray-400">
                {plan.capacity.map((feature, index) => (
                  <li key={feature} className="flex items-center gap-x-3 py-1.5">
                    {index === 0 && <RiUserLine className="size-4 shrink-0 text-gray-500" aria-hidden="true" />}
                    {index === 1 && <RiCloudLine className="size-4 shrink-0 text-gray-500" aria-hidden="true" />}
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <ul className="mt-4 text-sm text-gray-700 dark:text-gray-400">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-x-3 py-1.5">
                    <RiCheckLine className="size-4 shrink-0 text-indigo-600 dark:text-indigo-400" aria-hidden="true" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </section>

      <section className="mx-auto mt-20 max-w-xl sm:mt-32 lg:max-w-6xl" aria-labelledby="testimonial">
        <Testimonial />
      </section>

      {/* Plan details for small screens */}
      <section className="mt-20 sm:mt-36">
        <div className="mx-auto space-y-8 sm:max-w-md lg:hidden">
          {plans.map((plan) => (
            <div key={plan.name}>
              <div className="rounded-xl bg-gray-400/5 p-6 ring-1 ring-inset ring-gray-200 dark:ring-gray-800">
                <h2 className="text-base font-semibold leading-6 text-gray-900 dark:text-gray-50">{plan.name}</h2>
                <p className="text-sm font-normal text-gray-600 dark:text-gray-400">{plan.description}</p>
              </div>
              <ul role="list" className="mt-10 space-y-10 text-sm leading-6 text-gray-900 dark:text-gray-50">
                {sections.map((section) => (
                  <li key={section.name}>
                    <h3 className="font-semibold">{section.name}</h3>
                    <ul role="list" className="mt-2 divide-y divide-gray-200 dark:divide-gray-800">
                      {section.features.map((feature) =>
                        feature.plans[plan.name] ? (
                          <li key={feature.name} className="flex gap-x-3 py-2.5">
                            <RiCheckLine className="size-5 flex-none text-indigo-600 dark:text-indigo-400" aria-hidden="true" />
                            <span>
                              {feature.name}{" "}
                              {typeof feature.plans[plan.name] === "string" && (
                                <span className="text-sm leading-6 text-gray-600 dark:text-gray-400">
                                  ({feature.plans[plan.name]})
                                </span>
                              )}
                            </span>
                          </li>
                        ) : null
                      )}
                    </ul>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <Faqs />
    </div>
  )
}

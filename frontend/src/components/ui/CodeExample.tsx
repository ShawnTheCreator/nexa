'use client';

import { useState } from "react"
import {
  RiLinksLine,
  RiPlugLine,
  RiShieldKeyholeLine,
  RiStackLine,
} from "@remixicon/react"
import { Badge } from "../Badge"

const features = [
  {
    name: "Fits into your workflow",
    description:
      "Capture and evaluate ideas without disrupting existing processes. From research to execution, everything integrates seamlessly.",
    icon: RiStackLine,
  },
  {
    name: "Plug & play innovation",
    description:
      "Deploy structured idea pipelines quickly and adapt them to fit your organisation's strategy.",
    icon: RiPlugLine,
  },
  {
    name: "Integrate with tools you use",
    description:
      "Easily connect to collaboration platforms, reporting systems, and project management tools.",
    icon: RiLinksLine,
  },
  {
    name: "Security & trust",
    description:
      "Confidential ideas and strategic projects are safeguarded with enterprise-grade security.",
    icon: RiShieldKeyholeLine,
  },
]

export default function ImageTabsSection() {
  const [activeTab, setActiveTab] = useState("capture")

  const tabs = [
    {
      id: "capture",
      label: "Capture Ideas",
      image: "/images/code1.jpg"
    },
    {
      id: "evaluate",
      label: "Evaluate & Score",
      image: "/images/code2.webp"
    }
  ]

  return (
    <section
      aria-labelledby="innovation-image-example-title"
      className="mx-auto mt-28 w-full max-w-6xl px-3"
    >
      <Badge>Innovation-first</Badge>
      <h2
        id="innovation-image-example-title"
        className="mt-2 inline-block bg-gradient-to-br from-gray-900 to-gray-800 bg-clip-text py-2 text-4xl font-bold tracking-tighter text-transparent sm:text-6xl md:text-6xl dark:from-gray-50 dark:to-gray-300"
      >
        Built for innovators, <br /> trusted by teams
      </h2>
      <p className="mt-6 max-w-2xl text-lg text-gray-600 dark:text-gray-400">
        Structure, evaluate, and transform ideas into action. Query, filter, and
        track innovation across departments with clarity and ease.
      </p>
      
      <div className="mt-12">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
        
        <div className="mt-8">
          <div className="relative rounded-lg overflow-hidden shadow-2xl bg-white dark:bg-gray-900 ring-1 ring-black/5 dark:ring-white/5">
            {tabs.map((tab) => (
              <div
                key={tab.id}
                className={`transition-all duration-300 ${
                  activeTab === tab.id ? 'block' : 'hidden'
                }`}
              >
                <img
                  src={tab.image}
                  alt={tab.label}
                  className="w-full h-[31rem] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute bottom-6 left-6">
                  <h3 className="text-white text-xl font-semibold mb-2">
                    {tab.label}
                  </h3>
                  <p className="text-white/80 text-sm max-w-md">
                    {tab.id === 'capture' 
                      ? 'Streamlined interface for collecting and organizing innovative ideas from all team members.'
                      : 'Advanced evaluation tools with scoring algorithms to assess idea feasibility and impact.'
                    }
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <dl className="mt-24 grid grid-cols-4 gap-10">
        {features.map((item) => (
          <div
            key={item.name}
            className="col-span-full sm:col-span-2 lg:col-span-1"
          >
            <div className="w-fit rounded-lg p-2 shadow-md shadow-indigo-400/30 ring-1 ring-black/5 dark:shadow-indigo-600/30 dark:ring-white/5">
              <item.icon
                aria-hidden="true"
                className="size-6 text-indigo-600 dark:text-indigo-400"
              />
            </div>
            <dt className="mt-6 font-semibold text-gray-900 dark:text-gray-50">
              {item.name}
            </dt>
            <dd className="mt-2 leading-7 text-gray-600 dark:text-gray-400">
              {item.description}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
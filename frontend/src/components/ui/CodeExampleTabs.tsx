"use client"
import * as Tabs from "@radix-ui/react-tabs"
import { RiLightbulbLine, RiTeamLine } from "@remixicon/react"
import Arrow from "../Arrow"

export default function CodeExampleTabs({
  tab1,
  tab2,
}: {
  tab1?: any
  tab2?: any
}) {
  return (
    <Tabs.Root
      className="mt-14 grid grid-cols-12 gap-8"
      defaultValue="tab1"
      orientation="vertical"
    >
      <Tabs.List
        className="col-span-full flex w-full flex-col gap-8 md:order-2 md:col-span-5"
        aria-label="Select feature"
      >
        <Tabs.Trigger
          className="group relative flex flex-1 flex-col items-start justify-start rounded-xl p-6 text-left shadow-lg ring-1 ring-gray-200 dark:ring-white/5 dark:data-[state=active]:shadow-indigo-900/30"
          value="tab1"
        >
          <div className="absolute -left-[36px] top-1/2 hidden -rotate-90 group-data-[state=active]:flex">
            <Arrow
              width={18}
              height={8}
              className="fill-gray-950 dark:fill-gray-900"
            />
          </div>
          <div className="flex items-center gap-4">
            <div className="aspect-square w-fit rounded-lg bg-white p-2 text-gray-700 ring-1 ring-black/10 transition-all group-data-[state=active]:text-indigo-600 group-data-[state=active]:shadow-md group-data-[state=active]:shadow-indigo-500/20 dark:bg-gray-950 dark:text-gray-400 dark:ring-white/10 dark:group-data-[state=active]:text-indigo-400 dark:group-data-[state=active]:shadow-indigo-600/50">
              <RiLightbulbLine aria-hidden="true" className="size-5" />
            </div>
            <p className="font-semibold tracking-tight text-gray-700 transition-all group-data-[state=active]:text-indigo-600 sm:text-lg dark:text-gray-400 dark:group-data-[state=active]:text-indigo-400">
              Capture Ideas
            </p>
          </div>
          <p className="mt-4 leading-7 text-gray-600 dark:text-gray-400">
            Provide a digital space for users to log, organize, and prioritize ideas. Ensure no idea gets lost and every contribution is visible.
          </p>
        </Tabs.Trigger>
        <Tabs.Trigger
          className="group relative flex flex-1 flex-col items-start justify-start rounded-xl p-6 text-left shadow-lg ring-1 ring-gray-200 dark:ring-white/5 dark:data-[state=active]:shadow-indigo-900/30"
          value="tab2"
        >
          <div className="absolute -left-[36px] top-1/2 hidden -rotate-90 sm:group-data-[state=active]:flex">
            <Arrow
              width={18}
              height={8}
              className="fill-gray-950 dark:fill-gray-900"
            />
          </div>
          <div className="flex items-center gap-4">
            <div className="data-state aspect-square w-fit rounded-lg bg-white p-2 text-gray-700 ring-1 ring-black/10 transition-all group-data-[state=active]:text-indigo-600 group-data-[state=active]:shadow-md group-data-[state=active]:shadow-indigo-500/20 dark:bg-gray-950 dark:text-gray-400 dark:ring-white/10 dark:group-data-[state=active]:text-indigo-400 dark:group-data-[state=active]:shadow-indigo-600/50">
              <RiTeamLine aria-hidden="true" className="size-5" />
            </div>
            <p className="font-semibold tracking-tight text-gray-700 transition-all group-data-[state=active]:text-indigo-600 sm:text-lg dark:text-gray-400 dark:group-data-[state=active]:text-indigo-400">
              Collaborate & Implement
            </p>
          </div>
          <p className="mt-4 leading-7 text-gray-600 dark:text-gray-400">
            Encourage teamwork, track feasibility, and support implementation. Align projects with strategic goals and transform ideas into real-world impact.
          </p>
        </Tabs.Trigger>
      </Tabs.List>
      <div className="col-span-full md:col-span-7">
        <Tabs.Content value="tab1">{tab1}</Tabs.Content>
        <Tabs.Content value="tab2">{tab2}</Tabs.Content>
      </div>
    </Tabs.Root>
  )
}

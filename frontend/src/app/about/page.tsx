import { Badge } from "@/components/Badge"
import { Button } from "@/components/Button"
import Benefits from "@/components/ui/Benefits"
import TeamGallery from "@/components/ui/TeamGallery"
import { cx } from "@/lib/utils"
import Balancer from "react-wrap-balancer"

export default function About() {
  return (
    <div className="mt-36 flex flex-col overflow-hidden px-3">
      <section
        aria-labelledby="about-overview"
        className="animate-slide-up-fade"
        style={{
          animationDuration: "600ms",
          animationFillMode: "bac333442kwards",
        }}
      >
        <Badge>about nexa</Badge>
        <h1
          id="about-overview"
          className="mt-2 inline-block bg-gradient-to-br from-gray-900 to-gray-800 bg-clip-text py-2 text-4xl font-bold tracking-tighter text-transparent sm:text-6xl md:text-6xl dark:from-gray-50 dark:to-gray-300"
        >
          <Balancer>
            We are builders, creating the innovation platform we always wished existed
          </Balancer>
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-gray-700 dark:text-gray-400">
          Innovation is no longer optional — it’s survival. <br /> 
          Nexa is here to take ideas from messy whiteboards to real-world impact, 
          giving teams the clarity, structure, and speed to make their best work happen.
        </p>
      </section>
      <TeamGallery />
      <Benefits />
      <section aria-labelledby="vision-title" className="mx-auto mt-40">
        <h2
          id="vision-title"
          className="inline-block bg-gradient-to-t from-gray-900 to-gray-800 bg-clip-text py-2 text-4xl font-bold tracking-tighter text-transparent md:text-5xl dark:from-gray-50 dark:to-gray-300"
        >
          Our Vision
        </h2>
        <div className="mt-6 max-w-prose space-y-4 text-gray-600 dark:text-gray-400">
          <p className="text-lg leading-8">
            We imagine a world where innovation isn’t locked in spreadsheets, 
            lost in email threads, or slowed by endless meetings. 
            A world where every idea, from the spark in your head to the product in your customer’s hands, 
            flows through one powerful system.
          </p>
          <p className="text-lg leading-8">
            That’s what Nexa is all about — making innovation not just manageable, 
            but exciting, scalable, and fun. 
            We want to turn the chaos of creativity into momentum that teams can actually use, 
            so the next big thing doesn’t get buried, it gets built.
          </p>
          <p
            className={cx(
              "w-fit rotate-3 font-handwriting text-3xl text-indigo-600 dark:text-indigo-400",
            )}
          >
            – The Nexa Crew 🚀
          </p>
        </div>
        <Button className="mt-32 h-10 w-full shadow-xl shadow-indigo-500/20">
          Join the mission
        </Button>
      </section>
    </div>
  )
}

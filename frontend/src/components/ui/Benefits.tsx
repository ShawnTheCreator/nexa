const benefits = [
  {
    title: "Work in Johannesburg",
    description:
      "Our HQ is in Midrand and yes, it’s as amazing as it sounds — coffee, views, and ideas everywhere.",
  },
  {
    title: "Competitive salary & equity",
    description:
      "We pay well and give options because your brilliance deserves a stake in the future.",
  },
  {
    title: "Health, dental, vision",
    description:
      "Stay healthy, smile often, and see the big picture — we cover it all.",
  },
  {
    title: "Yearly off-sites",
    description:
      "Adventure + strategy = epic off-sites where we dream big and laugh bigger.",
  },
  {
    title: "Book budget",
    description:
      "R750 every year to feed your brain — novels, tech, or even weird manuals welcome.",
  },
  {
    title: "Tasty snacks",
    description:
      "Snack heaven: stocked fridge, pantry, and yes, dinner is on us (even weekends).",
  },
  {
    title: "20 PTO days per year",
    description:
      "Recharge, travel, binge-watch, or just nap — we want you back full of energy.",
  },
  {
    title: "Spotify Premium",
    description:
      "Music makes everything better. Your ears get the premium treatment too.",
  },
]

export default function Benefits() {
  return (
    <section aria-labelledby="benefits-title" className="mx-auto mt-44">
      <h2
        id="benefits-title"
        className="inline-block bg-gradient-to-t from-gray-900 to-gray-800 bg-clip-text py-2 text-4xl font-bold tracking-tighter text-transparent md:text-5xl dark:from-gray-50 dark:to-gray-300"
      >
        What&rsquo;s in it for you
      </h2>
      <dl className="mt-8 grid grid-cols-4 gap-x-10 gap-y-8 sm:mt-12 sm:gap-y-10">
        {benefits.map((benefit, index) => (
          <div key={index} className="col-span-4 sm:col-span-2 lg:col-span-1">
            <dt className="font-semibold text-gray-900 dark:text-gray-50">
              {benefit.title}
            </dt>
            <dd className="mt-2 leading-7 text-gray-600 dark:text-gray-400">
              {benefit.description}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  )
}

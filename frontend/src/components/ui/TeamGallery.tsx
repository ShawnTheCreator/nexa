import { InstaxImage } from "./InstaxImage"

export default function TeamGallery() {
  return (
    <section
      aria-labelledby="teamwork-title"
      className="mx-auto mt-5 max-w-4xl animate-slide-up-fade"
      style={{
        animationDuration: "600ms",
        animationDelay: "200ms",
        animationFillMode: "backwards",
      }}
    >
      <div className="mt-20">
        <div className="flex w-full flex-col items-center justify-between md:flex-row">
          <InstaxImage
            className="w-[25rem] -rotate-6 sm:-ml-10"
            src="/images/ideas.jpg"
            alt="Two teammates brainstorming with laptops"
            width={640}
            height={427}
            caption="Ideas don’t build themselves — but we get close."
          />
          <InstaxImage
            className="w-[15rem] rotate-3"
            src="/images/workspace.jpg"
            alt="Creative workspace with colorful vibes"
            width={640}
            height={853}
            caption="Our workspace = controlled chaos (with coffee)."
          />
          <InstaxImage
            className="-mr-10 w-[15rem] rotate-1"
            src="/images/break.jpeg"
            alt="Relaxed corner of the office"
            width={640}
            height={960}
            caption="Every innovation lab needs a recharge zone."
          />
        </div>
        <div className="mt-8 hidden w-full justify-between gap-4 md:flex">
          <InstaxImage
            className="-ml-16 w-[25rem] rotate-1"
            src="/images/office.jpg"
            alt="Team taking a break"
            width={640}
            height={360}
            caption="Breaks fuel breakthroughs."
          />
          <InstaxImage
            className="-mt-10 w-[15rem] -rotate-3"
            src="/images/bandile.jpg"
            alt="Person with headphones curating music"
            width={640}
            height={965}
            caption="Bandile loves teamwork and team success... and we will win this hackathon"
          />
          <InstaxImage
            className="-mr-20 -mt-2 w-[30rem] rotate-[8deg]"
            src="/images/campus.jpg"
            alt="Celebrating a new release"
            width={1920}
            height={1281}
            caption="Launch parties = confetti + bad dance moves."
          />
        </div>
      </div>
      <div className="mt-28">
        <div className="flex w-full flex-col items-center justify-between md:flex-row">
          <InstaxImage
            className="w-full rotate-1"
            src="/images/eduvos.png"
            alt="The Nexa crew being themselves"
            width={1819}
            height={998}
            caption="At Nexa, you don’t just join a team — you join a movement."
          />
        </div>
      </div>
    </section>
  )
}

import { Divider } from "@/components/dashboard/Divider"
import { Card } from "@/components/dashboard/Card"

const ideas = [
  {
    name: "Campus Smart Waste System",
    description: "AI-powered bins that sort and track recycling performance.",
    problem:
      "Low recycling rates due to lack of sorting and engagement.",
    solution:
      "Smart sensors detect material types, gamify participation with leaderboards.",
    techStack: {
      AI: "TensorFlow",
      Hardware: "Raspberry Pi",
      Frontend: "Next.js",
    },
    rating: 4,
    votes: 7,
  },
  {
    name: "Accessible Navigation App",
    description:
      "Mobile app providing audio navigation for visually impaired users.",
    problem:
      "Navigating campus safely and independently is challenging.",
    solution:
      "GPS + computer vision + voice guidance for obstacles and intersections.",
    techStack: {
      AI: "Computer Vision",
      Backend: "Node.js",
      Frontend: "React Native",
    },
    rating: 5,
    votes: 12,
  },
]

export default function OverviewPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">
        Overview
      </h1>
      <p className="mt-2 text-gray-600 dark:text-gray-400">
        Explore recent ideas and their impact across the community.
      </p>
      <Divider />

      <div className="grid gap-6 sm:grid-cols-2">
        {ideas.map((item) => (
          <Card key={item.name}>
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-50">
                  {item.name}
                </h3>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  {item.description}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500 dark:text-gray-500">Rating</p>
                <p className="font-semibold text-indigo-600 dark:text-indigo-400">
                  {item.rating}/5
                </p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-4">
              {Object.entries(item.techStack).map(([k, v]) => (
                <div key={k}>
                  <p className="text-xs text-gray-500 dark:text-gray-500">{k}</p>
                  <p className="text-sm text-gray-800 dark:text-gray-200">{v}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 text-sm text-gray-500 dark:text-gray-500">
              Votes: <span className="font-medium">{item.votes}</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
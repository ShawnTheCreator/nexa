import { Divider } from "@/components/dashboard/Divider"

export default function VotingPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">
        Voting
      </h1>
      <p className="mt-2 text-gray-600 dark:text-gray-400">
        Review ideas and cast votes to prioritize what matters most.
      </p>
      <Divider />
      <p className="text-sm text-gray-500 dark:text-gray-500">
        Coming soon: voting mechanics and ratings integration.
      </p>
    </div>
  )
}
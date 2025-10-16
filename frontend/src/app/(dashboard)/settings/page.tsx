import { Divider } from "@/components/dashboard/Divider"

export default function SettingsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">
        Settings
      </h1>
      <p className="mt-2 text-gray-600 dark:text-gray-400">
        Manage your account, preferences, and profile details.
      </p>
      <Divider />
      <p className="text-sm text-gray-500 dark:text-gray-500">
        Coming soon: account table, preferences, and notification settings.
      </p>
    </div>
  )
}
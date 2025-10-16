"use client"

import React from "react"
import { Divider } from "@/components/dashboard/Divider"
import { Button } from "@/components/Button"
import { TicketDrawer } from "@/components/ui/TicketDrawer"

export default function SupportPage() {
  const [isOpen, setIsOpen] = React.useState(false)

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">
            Support
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Create support tickets and manage issues.
          </p>
        </div>
        <Button onClick={() => setIsOpen(true)} className="flex items-center gap-2">
          Create Ticket
        </Button>
      </div>
      <Divider />

      <TicketDrawer open={isOpen} onOpenChange={setIsOpen} />
    </div>
  )
}
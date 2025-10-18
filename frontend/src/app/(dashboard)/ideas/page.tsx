"use client";

import React from "react";
import { Button } from "@/components/Button";
import { Divider } from "@/components/dashboard/Divider";
import { TicketDrawer } from "@/components/ui/TicketDrawer";
import { IdeaDrawer } from "@/components/ui/IdeaDrawer";
import { RiAddLine } from "@remixicon/react";
import { Input } from "@/components/Input";
import { API_BASE_URL } from "@/lib/api";
import { useDebounce } from "use-debounce";

export default function IdeasDashboard() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isIdeaOpen, setIsIdeaOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [debouncedSearch] = useDebounce(search, 400);
  const [ideas, setIdeas] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const url = new URL(`${API_BASE_URL}/api/ideas`);
        if (debouncedSearch) url.searchParams.set("q", debouncedSearch);
        const res = await fetch(url.toString(), { credentials: "include" });
        const json = await res.json();
        setIdeas(json.data || []);
      } catch (e) {
        // ignore errors in UI
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [debouncedSearch]);

  return (
    // ✅ Added horizontal padding: px-4 on mobile, px-6 on medium+
    <main className="pt-6 pb-20 px-4 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-50 truncate">
              Ideas Dashboard
            </h1>
            <p className="text-gray-500 sm:text-sm/6 dark:text-gray-500 truncate">
              Real-time monitoring of idea metrics with AI-powered insights
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={() => setIsIdeaOpen(true)}
              className="flex items-center gap-2 text-base sm:text-sm"
            >
              Submit Idea
              <RiAddLine className="-mr-0.5 size-5 shrink-0" aria-hidden="true" />
            </Button>
            <Button
              variant="secondary"
              onClick={() => setIsOpen(true)}
              className="flex items-center gap-2 text-base sm:text-sm"
            >
              Create Ticket
            </Button>
          </div>

          <TicketDrawer open={isOpen} onOpenChange={setIsOpen} />
          <IdeaDrawer open={isIdeaOpen} onOpenChange={setIsIdeaOpen} />
        </div>

        <Divider />

        <div className="mt-6 flex flex-wrap items-center gap-2">
          <div className="flex-1 min-w-[200px]">
            <Input
              placeholder="Search ideas"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          {loading ? (
            <span className="text-sm text-gray-500 whitespace-nowrap">Loading…</span>
          ) : null}
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          {ideas.map((idea) => (
            <div key={idea.id} className="rounded border p-4">
              <div className="flex items-start justify-between">
                <h3 className="font-medium text-gray-900 dark:text-gray-100 break-words">
                  {idea.title}
                </h3>
                <span className="text-xs text-gray-500 whitespace-nowrap">
                  {new Date(idea.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 break-words">
                {idea.description}
              </p>
              <div className="mt-3 text-xs text-gray-500">Status: {idea.status}</div>
            </div>
          ))}
          {ideas.length === 0 && !loading ? (
            <p className="col-span-full text-sm text-gray-500">No ideas found.</p>
          ) : null}
        </div>
      </div>
    </main>
  );
}
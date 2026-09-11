import { CalendarClock } from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"

import { auth } from "@clerk/nextjs/server"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { listScheduledWorkflows } from "@/features/workflows/data"
import {
  describeCron,
  timezoneLabel,
} from "@/features/workflows/lib/schedule-presets"

export const metadata = {
  title: "Scheduled workflows",
}

export default async function ScheduledPage() {
  const { orgId } = await auth()

  if (!orgId) {
    redirect("/organization")
  }

  const workflows = await listScheduledWorkflows(orgId)

  return (
    <main className="flex min-h-0 flex-1 flex-col gap-6 overflow-auto p-6 md:p-10">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">
          Scheduled workflows
        </h1>
        <p className="text-muted-foreground">
          Workflows that run automatically on a schedule.
        </p>
      </div>
      {workflows.length === 0 ? (
        <Empty className="flex-none rounded-xl border">
          <EmptyHeader>
            <EmptyMedia className="size-12 rounded-xl bg-muted">
              <CalendarClock className="size-5" aria-hidden="true" />
            </EmptyMedia>
            <EmptyTitle className="text-xl font-medium">
              No scheduled workflows
            </EmptyTitle>
            <EmptyDescription className="max-w-md text-base leading-7">
              Open a workflow and schedule it from the sidebar
              <br />
              to see it listed here.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Link
              href="/"
              className="text-sm text-primary underline-offset-4 hover:underline"
            >
              Go to workflows
            </Link>
          </EmptyContent>
        </Empty>
      ) : (
        <div className="w-full max-w-3xl rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-4">Workflow</TableHead>
                <TableHead>How often</TableHead>
                <TableHead>Timezone</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {workflows.map((workflow) => (
                <TableRow key={workflow.id}>
                  <TableCell className="pl-4 font-medium">
                    <Link
                      href={`/workflows/${workflow.id}`}
                      className="underline-offset-4 hover:underline"
                    >
                      {workflow.name}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {describeCron(workflow.scheduleCron)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {workflow.scheduleTimezone
                      ? timezoneLabel(workflow.scheduleTimezone)
                      : "UTC"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </main>
  )
}

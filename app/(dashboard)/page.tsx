
import { Plus, Workflow } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"

export default function Page() {
  return (
    <div className="flex min-h-0 flex-1">
      <Empty className="gap-7 rounded-none">
        <EmptyHeader className="max-w-lg gap-6">
          <EmptyMedia className="mb-5 size-12 rounded-xl bg-muted">
            <Workflow className="size-5" aria-hidden="true" />
          </EmptyMedia>
          <EmptyTitle className="text-xl font-medium">
            No workflow selected
          </EmptyTitle>
          <EmptyDescription className="max-w-md text-base leading-7">
            Select a workflow from the sidebar
            <br />
            or create a new one to get started.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button size="lg" className="h-11 gap-3 px-5 text-base">
            <Plus className="size-5" aria-hidden="true" />
            New workflow
          </Button>
        </EmptyContent>
      </Empty>
    </div>
  )
}

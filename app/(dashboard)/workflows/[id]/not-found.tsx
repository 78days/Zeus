import { Workflow } from "lucide-react"

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"

export default function NotFound() {
  return (
    <div className="flex min-h-0 flex-1">
      <Empty className="rounded-none">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Workflow aria-hidden="true" />
          </EmptyMedia>
          <EmptyTitle>Workflow not found</EmptyTitle>
          <EmptyDescription>
            The requested workflow does not exist or is no longer available.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    </div>
  )
}

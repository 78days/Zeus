"use client"

import { AlertTriangle } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"

export default function Error({
  unstable_retry,
}: {
  error: Error & { digest?: string }
  unstable_retry: () => void
}) {
  return (
    <div className="flex min-h-0 flex-1">
      <Empty className="rounded-none">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <AlertTriangle aria-hidden="true" />
          </EmptyMedia>
          <EmptyTitle>Unable to load workflow</EmptyTitle>
          <EmptyDescription>
            Something went wrong while loading this workflow.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button onClick={unstable_retry}>Try again</Button>
        </EmptyContent>
      </Empty>
    </div>
  )
}

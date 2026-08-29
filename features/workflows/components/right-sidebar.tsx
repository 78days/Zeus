import { PlayIcon } from "lucide-react"

import { Button } from "@/components/ui/button"

export function RightSidebar() {
  return (
    <div className="flex size-full items-center justify-center">
      <Button>
        <PlayIcon data-icon="inline-start" />
        Run
      </Button>
    </div>
  )
}

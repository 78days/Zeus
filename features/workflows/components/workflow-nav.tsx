"use client"

import { CalendarClock, LockKeyhole, Plus, Workflow } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTransition } from "react"

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { useOrgPro } from "@/features/workflows/hooks/use-org-pro"
import { generateSlug } from "@/features/workflows/lib/generate-slug"
import type { Workflow as WorkflowRecord } from "@/lib/db/schema"

type WorkflownavProps = {
  workflows: WorkflowRecord[]
  createWorkflowAction: (name: string) => Promise<void>
}

export function Workflownav({
  workflows,
  createWorkflowAction,
}: WorkflownavProps) {
  const { isMobile, state } = useSidebar()
  const pathname = usePathname()
  const [isCreating, startTransition] = useTransition()
  const isCollapsed = state === "collapsed" && !isMobile
  const { isLoaded, isPro, upgrade } = useOrgPro()
  const isLocked = isLoaded && !isPro
  const handleCreateWorkflow = () => {
    if (!isLoaded) return

    if (!isPro) {
      upgrade()
      return
    }

    startTransition(async () => {
      await createWorkflowAction(generateSlug())
    })
  }

  if (isCollapsed) {
    return (
      <SidebarGroup>
        <Popover>
          <PopoverTrigger asChild>
            <SidebarMenuButton tooltip="Workflows" aria-label="Workflows">
              <Workflow />
            </SidebarMenuButton>
          </PopoverTrigger>
          <PopoverContent side="right" align="start" className="w-72 p-2">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  disabled={isCreating || !isLoaded}
                  onClick={handleCreateWorkflow}
                  aria-label={
                    isLocked ? "Upgrade to create a workflow" : "New workflow"
                  }
                >
                  <Plus />
                  <span>New workflow</span>
                  {isLocked && <LockKeyhole aria-hidden="true" />}
                </SidebarMenuButton>
              </SidebarMenuItem>
              <div className="my-1 border-t" />
              {workflows.map((workflow) => (
                <SidebarMenuItem key={workflow.id}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === `/workflows/${workflow.id}`}
                  >
                    <Link href={`/workflows/${workflow.id}`}>
                      <Workflow />
                      <span>{workflow.name}</span>
                      {workflow.scheduleActive && (
                        <CalendarClock className="ml-auto size-3.5" />
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </PopoverContent>
        </Popover>
      </SidebarGroup>
    )
  }

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Workflows</SidebarGroupLabel>
      <SidebarGroupAction
        aria-label={
          isLocked ? "Upgrade to create a workflow" : "Create workflow"
        }
        disabled={isCreating || !isLoaded}
        title={isLocked ? "Upgrade to create a workflow" : "Create workflow"}
        onClick={handleCreateWorkflow}
      >
        <Plus />
        {isLocked && <LockKeyhole aria-hidden="true" />}
      </SidebarGroupAction>
      <SidebarGroupContent>
        <SidebarMenu>
          {workflows.map((workflow) => (
            <SidebarMenuItem key={workflow.id}>
              <SidebarMenuButton
                asChild
                isActive={pathname === `/workflows/${workflow.id}`}
              >
                <Link href={`/workflows/${workflow.id}`}>
                  <Workflow />
                  <span>{workflow.name}</span>
                  {workflow.scheduleActive && (
                    <CalendarClock className="ml-auto size-3.5" />
                  )}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}

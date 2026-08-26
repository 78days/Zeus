"use client"

import { Plus, Workflow } from "lucide-react"

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
import { generateSlug } from "@/features/workflows/lib/generate-slug"
import type { workflow as WorkflowRecord } from "@/lib/db/schema"

type WorkflownavProps = {
  workflows: WorkflowRecord[]
  createWorkflowAction: (name: string) => Promise<void>
}

export function Workflownav({
  workflows,
  createWorkflowAction,
}: WorkflownavProps) {
  const { isMobile, state } = useSidebar()
  const isCollapsed = state === "collapsed" && !isMobile
  const handleCreateWorkflow = () => createWorkflowAction(generateSlug())

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
                <SidebarMenuButton onClick={handleCreateWorkflow}>
                  <Plus />
                  <span>New workflow</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <div className="my-1 border-t" />
              {workflows.map((workflow) => (
                <SidebarMenuItem key={workflow.id}>
                  <SidebarMenuButton>
                    <Workflow />
                    <span>{workflow.name}</span>
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
        aria-label="Create workflow"
        title="Create workflow"
        onClick={handleCreateWorkflow}
      >
        <Plus />
      </SidebarGroupAction>
      <SidebarGroupContent>
        <SidebarMenu>
          {workflows.map((workflow) => (
            <SidebarMenuItem key={workflow.id}>
              <SidebarMenuButton>
                <Workflow />
                <span>{workflow.name}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}

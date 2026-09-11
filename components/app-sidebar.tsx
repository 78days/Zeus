import { OrganizationSwitcher, UserButton } from "@clerk/nextjs"
import { auth } from "@clerk/nextjs/server"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { createWorkflowAction } from "@/features/workflows/actions"
import { Workflownav } from "@/features/workflows/components/workflow-nav"
import { ScheduledNav } from "@/features/workflows/components/scheduled-nav"
import { listWorkflows } from "@/features/workflows/data"

export async function AppSidebar() {
  const { orgId } = await auth()
  const workflows = orgId ? await listWorkflows(orgId) : []

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="gap-3 border-b border-sidebar-border p-3">
        <div className="flex h-8 items-center gap-2">
          <div className="min-w-0 flex-1 overflow-hidden group-data-[collapsible=icon]:hidden">
            <OrganizationSwitcher
              afterCreateOrganizationUrl="/"
              afterSelectOrganizationUrl="/"
              afterLeaveOrganizationUrl="/"
              hidePersonal
              appearance={{
                elements: {
                  rootBox: "w-full",
                  organizationSwitcherTrigger:
                    "w-full justify-start px-1 shadow-none",
                },
              }}
            />
          </div>
          <SidebarTrigger className="shrink-0" />
        </div>
      </SidebarHeader>

      <SidebarContent>
        <Workflownav
          workflows={workflows}
          createWorkflowAction={createWorkflowAction}
        />
        <ScheduledNav />
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-3">
        <div className="flex h-8 items-center group-data-[collapsible=icon]:justify-center">
          <UserButton showName />
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}

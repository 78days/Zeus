import { Room } from "@/features/workflows/components/room"
import { WorkflowShell } from "@/features/workflows/components/workflow-shell"
import { WorkflowRunsProvider } from "@/features/workflows/components/workflow-runs-provider"
import { getWorkflow } from "@/features/workflows/data"
import { liveblocks } from "@/lib/liveblocks"

import { auth } from "@clerk/nextjs/server"
import { auth as triggerAuth } from "@trigger.dev/sdk"
import { notFound } from "next/navigation"
import { ReactFlowProvider } from "@xyflow/react"
export default async function WorkflowPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const { orgId } = await auth()
  if (!orgId) return notFound()

  const workflow = await getWorkflow(orgId, id)
  if (!workflow) return notFound()

  const publicAccessToken = await triggerAuth.createPublicToken({
    expirationTime: "1h",
    scopes: {
      read: {
        tags: [`workflow:${id}`],
      },
    },
  })

  await liveblocks.getOrCreateRoom(id, {
    organizationId: orgId,
    defaultAccesses: [],
    groupsAccesses: {
      [orgId]: ["room:write"],
    },
    metadata: {
      title: workflow.name,
    },
  })

  return (
    <Room roomId={id}>
      <WorkflowRunsProvider
        workflowId={id}
        publicAccessToken={publicAccessToken}
      >
        <ReactFlowProvider>
          <WorkflowShell
            workflowId={id}
            schedule={{
              cron: workflow.scheduleCron,
              timezone: workflow.scheduleTimezone,
              active: workflow.scheduleActive,
            }}
          />
        </ReactFlowProvider>
      </WorkflowRunsProvider>
    </Room>
  )
}

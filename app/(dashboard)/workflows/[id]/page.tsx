import { Room } from "@/features/workflows/components/room"
import { WorkflowShell } from "@/features/workflows/components/workflow-shell"
import { getWorkflow } from "@/features/workflows/data"
import { liveblocks } from "@/lib/liveblocks"

import { auth } from "@clerk/nextjs/server"
import { notFound } from "next/navigation"
export default async function WorkflowPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const { orgId } = await auth()
  if(!orgId) return notFound()


  const workflow = await getWorkflow(orgId, id)
  if(!workflow) return notFound()

  await liveblocks.getOrCreateRoom(id, {
    defaultAccesses: [],
    groupsAccesses: {
      [orgId]: ["room:write"],
    },
    organizationId: orgId,
  })

  return (

    <Room roomId = {id}>
    <WorkflowShell  workflowId={id}/>
    </Room>
  )
}

"use server";

import { auth } from "@clerk/nextjs/server";
import { tasks } from "@trigger.dev/sdk";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createWorkflow, deleteWorkflow } from "@/features/workflows/data";
import { liveblocks } from "@/lib/liveblocks";
import type { exampleTask } from "@/src/trigger/example";

export const createWorkflowAction = async (name: string) => {
  const { orgId } = await auth();

  if (!orgId) {
    throw new Error("An active organization is required to create a workflow");
  }

  const workflow = await createWorkflow(orgId, name);

  revalidatePath("/", "layout");
  redirect(`/workflows/${workflow.id}`);
};

export const runWorkflowAction = async (workflowId: string) => {
  const { orgId } = await auth();

  if (!orgId) {
    throw new Error("An active organization is required to run a workflow");
  }

  return tasks.trigger<typeof exampleTask>("example", { workflowId, orgId });
};

export const deleteWorkflowAction = async (workflowId: string) => {
  const { orgId } = await auth()

  if (!orgId) {
    throw new Error("An active organization is required to delete a workflow")
  }

  const deleted = await deleteWorkflow(orgId, workflowId)

  if (deleted.length > 0) {
    await liveblocks.deleteRoom(workflowId)
  }

  revalidatePath("/", "layout")
  redirect("/")
}

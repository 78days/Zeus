import { task } from "@trigger.dev/sdk";

export const exampleTask = task({
  id: "example",
  run: async (payload: { workflowId: string; orgId: string }) => {
    console.log("Running workflow", payload.workflowId, "for organization", payload.orgId);

    return {
      workflowId: payload.workflowId,
      orgId: payload.orgId,
    };
  },
});

import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { workflows } from "@/lib/db/schema";

export const listworkflows = async (orgId: string) => {
  const data = await db
    .select()
    .from(workflows)
    .where(eq(workflows.orgId, orgId))
    .orderBy(desc(workflows.createdAt));
  return data;
}

export const createWorkflow = async (orgId: string, name: string) => {
  const [workflow] = await db
    .insert(workflows)
    .values({ orgId, name, graph: {} })
    .returning();

  return workflow;
}

import {
  boolean,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core"

import type { Edge } from "@xyflow/react"

import type { StepNodeType } from "@/features/workflows/nodes/node-registry"

export type WorkflowGraph = {
  nodes: StepNodeType[]
  edges: Edge[]
}

export const workflows = pgTable("workflows", {
  id: uuid("id").defaultRandom().primaryKey(),
  orgId: text("org_id").notNull(),
  name: text("name").notNull(),
  graph: jsonb("graph").$type<WorkflowGraph>().notNull(),
  scheduleId: text("schedule_id"),
  scheduleCron: text("schedule_cron"),
  scheduleTimezone: text("schedule_timezone"),
  scheduleActive: boolean("schedule_active").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

export type Workflow = typeof workflows.$inferSelect
export type NewWorkflow = typeof workflows.$inferInsert

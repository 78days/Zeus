

import { pgTable , jsonb , text , timestamp, uuid } from "drizzle-orm/pg-core"

export const workflows = pgTable("workflows", {
    id : uuid("id").primaryKey().defaultRandom(),
    orgId : text("org_id").notNull(),
    name : text("name").notNull(),
    graph : jsonb("graph").notNull(),
    createdAt : timestamp("created_at").defaultNow().notNull(),
    updatedAt : timestamp("updated_at").defaultNow().notNull(),
})
export type workflow = typeof workflows.$inferSelect


import type { Stagehand } from "@browserbasehq/stagehand"

import type {
  ActionNodeType,
  NodeType,
} from "@/features/workflows/nodes/node-registry"
import { agent } from "./agent"
import { act } from "./act"
import { extract } from "./extract"
import { openUrl } from "./open-url"
import { observe } from "./observe"

export type NodeContext = {
  values: Record<string, string>
  getStagehand: () => Promise<Stagehand>
}

export type NodeExecutor = (ctx: NodeContext) => Promise<unknown>

export const nodeExecutors: Partial<Record<NodeType, NodeExecutor>> = {
  agent: async ({ values, getStagehand }) =>
    agent({ stagehand: await getStagehand(), instruction: values.instruction }),
  act: async ({ values, getStagehand }) =>
    act({ stagehand: await getStagehand(), instruction: values.instruction }),
  extract: async ({ values, getStagehand }) =>
    extract({ stagehand: await getStagehand(), instruction: values.instruction }),
  observe: async ({ values, getStagehand }) =>
    observe({ stagehand: await getStagehand(), instruction: values.instruction }),
  "open-url": async ({ values, getStagehand }) => 
    openUrl({ stagehand: await getStagehand(), url: values.url }),
} satisfies Record<ActionNodeType, NodeExecutor>

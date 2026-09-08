import type { Edge } from "@xyflow/react"

import type { StepNodeType } from "@/features/workflows/nodes/node-registry"

export function validateGraph({
  nodes,
}: {
  nodes: StepNodeType[]
  edges: Edge[]
}) {
  if (nodes.length === 0) return ["Add at least one node."]
  if (!nodes.some((node) => node.data.kind === "trigger")) {
    return ["Add a trigger node."]
  }

  return []
}

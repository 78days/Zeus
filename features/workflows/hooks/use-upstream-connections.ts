"use client"

import { useEdges, useNodes } from "@xyflow/react"

import {
  nodeRegistry,
  type NodeType,
  type StepNodeType,
} from "@/features/workflows/nodes/node-registry"

export type UpstreamConnection = {
  token: string
  label: string
  type: NodeType
}

export function useUpstreamConnections(
  selectedNode: StepNodeType | undefined
): UpstreamConnection[] {
  const nodes = useNodes<StepNodeType>()
  const edges = useEdges()

  if (!selectedNode) return []

  const nodesById = new Map(nodes.map((node) => [node.id, node]))
  const parentsById = new Map<string, string[]>()

  for (const edge of edges) {
    const parents = parentsById.get(edge.target) ?? []
    parents.push(edge.source)
    parentsById.set(edge.target, parents)
  }

  const upstreamNodes: StepNodeType[] = []
  const visited = new Set<string>([selectedNode.id])
  const pending = [...(parentsById.get(selectedNode.id) ?? [])]

  while (pending.length > 0) {
    const nodeId = pending.shift()
    if (!nodeId || visited.has(nodeId)) continue

    visited.add(nodeId)
    const node = nodesById.get(nodeId)
    if (!node) continue

    upstreamNodes.push(node)
    pending.push(...(parentsById.get(node.id) ?? []))
  }

  return upstreamNodes.flatMap((node) => {
    const outputs = nodeRegistry[node.data.type].outputs ?? []

    return outputs.map((output) => ({
      token: `{{ ${node.id}.${output.path} }}`,
      label: `${node.data.title} · ${output.label}`,
      type: node.data.type,
    }))
  })
}

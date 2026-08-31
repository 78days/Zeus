"use client"

import React, { useSyncExternalStore } from "react"
import {
  ConnectionLineType,
  Panel,
  ReactFlow,
  type Edge,
} from "@xyflow/react"
import { useLiveblocksFlow  , Cursors} from "@liveblocks/react-flow"
import { MoonIcon, SunIcon } from "lucide-react"
import { useTheme } from "next-themes"
import { AvatarStack } from "@liveblocks/react-ui"

import { Button } from "@/components/ui/button"

import { StepNode } from "./step-node"
import { nodeRegistry, StepNodeType } from "../nodes/node-registry"

import "@xyflow/react/dist/style.css"
import "@liveblocks/react-ui/styles.css"
import "@liveblocks/react-flow/styles.css"

const nodeTypes = {
  step: StepNode,
}

const initialNodes: StepNodeType[] = [
  {
    id: "start",
    type: "step",
    position: { x: 0, y: 0 },
    data: {
      type: "start",
      kind: nodeRegistry.start.kind,
      title: nodeRegistry.start.label,
      values: {},
    },
  },
  {
    id: "open-url",
    type: "step",
    position: { x: 300, y: 0 },
    data: {
      type: "open-url",
      kind: nodeRegistry["open-url"].kind,
      title: nodeRegistry["open-url"].label,
      values: {},
    },
  },
]
const initialEdges: Edge[] = []



const emptySubscribe = () => () => {}

export function WorkflowCanvas() {
  const { resolvedTheme, setTheme } = useTheme()
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  )
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect } =
    useLiveblocksFlow({
      suspense: true,
      nodes: { initial: initialNodes },
      edges: { initial: initialEdges },
    })

  return (
    <div className="size-full">
      <ReactFlow
      nodeTypes={nodeTypes}
        colorMode={mounted && resolvedTheme === "dark" ? "dark" : "light"}
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        connectionLineType={ConnectionLineType.SmoothStep}
        connectionLineStyle={{stroke: "var(--border)"}}
        defaultEdgeOptions={{
          type: "smoothstep",
          style: {
            stroke: "var(--border)",
          },
        }}
        style={
          {
            "--xy-background-color" : "var(--background)",
            "--xy-edge-stoke-width" : 2,
            "--xy-connectionline-stroke-width" : 2,
          } as React.CSSProperties
        }
        fitView
      >
        <Panel position="top-right">
          <Button
            aria-label="Toggle theme"
            onClick={() =>
              setTheme(resolvedTheme === "dark" ? "light" : "dark")
            }
            size="icon"
            type="button"
            variant="outline"
          >
            {mounted && resolvedTheme === "dark" ? <SunIcon /> : <MoonIcon />}
          </Button>
        </Panel>
        <Panel position="top-right">
            <AvatarStack/>

        </Panel>
        <Cursors/>
      </ReactFlow>
    </div>
  )
}

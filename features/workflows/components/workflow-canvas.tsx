"use client"

import React, { useCallback, useState, useSyncExternalStore } from "react"
import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  ConnectionLineType,
  Panel,
  ReactFlow,
  type Connection,
  type Edge,
  type EdgeChange,
  type NodeChange,
  NodeTypes,
} from "@xyflow/react"
import { MoonIcon, SunIcon } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"

import { StepNode } from "./step-node"
import { StepNodeType } from "../nodes/node-registry"

const nodeTypes = {
  step: StepNode,
}

const initialNodes: StepNodeType[] = [
  { 
    id: "start", 
    type: "step" , 
    position: { x:0, y:0}, 
     data : { type : "start" , kind: "trigger", title: "Start", values: {}}}
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
  const [nodes, setNodes] = useState(initialNodes)
  const [edges, setEdges] = useState(initialEdges)

  const onNodesChange = useCallback((changes: NodeChange[]) => {
    setNodes((nodesSnapshot) => applyNodeChanges(changes, nodesSnapshot))
  }, [])

  const onEdgesChange = useCallback((changes: EdgeChange[]) => {
    setEdges((edgesSnapshot) => applyEdgeChanges(changes, edgesSnapshot))
  }, [])

  const onConnect = useCallback((connection: Connection) => {
    setEdges((edgesSnapshot) => addEdge(connection, edgesSnapshot))
  }, [])

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
      </ReactFlow>
    </div>
  )
}

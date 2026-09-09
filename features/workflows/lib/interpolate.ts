type NodeOutputs = Record<string, unknown>

function getByPath(value: unknown, path: string) {
  const segments = path.replace(/\[(\d+)\]/g, ".$1").split(".")
  let current = value

  for (const segment of segments) {
    if (!segment || current === null || current === undefined) {
      return undefined
    }

    if (
      (typeof current !== "object" && typeof current !== "function") ||
      !Object.prototype.hasOwnProperty.call(current, segment)
    ) {
      return undefined
    }

    current = (current as Record<string, unknown>)[segment]
  }

  return current
}

function formatValue(value: unknown) {
  if (value === null || value === undefined) return ""
  if (typeof value === "object") return JSON.stringify(value) ?? ""
  return String(value)
}

export function interpolate(text: string, outputs: NodeOutputs) {
  return text.replace(/{{\s*([^{}]+?)\s*}}/g, (_, path: string) => {
    const [nodeId, ...pathSegments] = path.trim().split(".")
    const value = pathSegments.length
      ? getByPath(outputs[nodeId], pathSegments.join("."))
      : outputs[nodeId]
    return formatValue(value)
  })
}

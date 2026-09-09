import type { Stagehand } from "@browserbasehq/stagehand"
import { z } from "zod/v4"

export async function extract({
  stagehand,
  instruction,
}: {
  stagehand: Stagehand
  instruction: string
}) {
  // Stagehand bundles its own Zod version, so the runtime-compatible schema
  // needs a cast across the duplicate package types.
  const result = await stagehand.extract(instruction, z.json() as never)

  return result.data
}

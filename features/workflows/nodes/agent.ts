import type { Stagehand } from "@browserbasehq/stagehand"

export async function agent({
  stagehand,
  instruction,
}: {
  stagehand: Stagehand
  instruction: string
}) {
  const { data: actions } = await stagehand.observe(instruction)

  for (const action of actions) {
    await stagehand.act(action)
  }

  return {
    success: true,
    message: actions.length
      ? `Completed ${actions.length} action${actions.length === 1 ? "" : "s"}.`
      : "No actionable elements were found.",
    completed: actions.length > 0,
  }
}

import * as Sentry from "@sentry/node"
import { tasks } from "@trigger.dev/sdk"

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment:
    process.env.NODE_ENV === "production" ? "production" : "development",
  defaultIntegrations: false,
})

tasks.onFailure(async ({ ctx, error }) => {
  Sentry.withScope((scope) => {
    scope.setTag("trigger.task", ctx.task.id)
    scope.setTag("trigger.run", ctx.run.id)
    scope.setExtra("attempt", ctx.attempt.number)
    Sentry.captureException(error)
  })

  await Sentry.flush(2_000)
})

import * as Sentry from "@sentry/nextjs"

type ErrorContext = {
  operation: string
  [key: string]: unknown
}

export function reportError(error: unknown, context: ErrorContext) {
  Sentry.withScope((scope) => {
    scope.setTag("operation", context.operation)

    scope.setExtras(
      Object.fromEntries(
        Object.entries(context).filter(([key]) => key !== "operation")
      )
    )
    Sentry.captureException(error)
  })
}

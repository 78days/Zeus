"use client"

import { ReactNode } from "react"
import * as Sentry from "@sentry/nextjs"
import {
  LiveblocksProvider,
  RoomProvider,
  ClientSideSuspense,
} from "@liveblocks/react/suspense"

import { Spinner } from "@/components/ui/spinner"

export function Room({
  roomId,
  children,
}: {
  roomId: string
  children: ReactNode
}) {
  return (
    <LiveblocksProvider
      authEndpoint="/api/liveblocks/auth"
      resolveUsers={async ({ userIds }) => {
        try {
          const response = await fetch("/api/liveblocks/users", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userIds }),
          })

          if (!response.ok) return undefined

          return await response.json()
        } catch (error) {
          Sentry.withScope((scope) => {
            scope.setTag("operation", "liveblocks.resolve-users-client")
            scope.setExtra("userCount", userIds.length)
            Sentry.captureException(error)
          })
          return undefined
        }
      }}
    >
      <RoomProvider id={roomId}>
        <ClientSideSuspense
          fallback={
            <div className="flex min-h-0 flex-1 items-center justify-center">
              <Spinner className="size-6" />
            </div>
          }
        >
          {children}
        </ClientSideSuspense>
      </RoomProvider>
    </LiveblocksProvider>
  )
}

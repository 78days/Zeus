"use client"

import { ReactNode } from "react";
import {
  LiveblocksProvider,
  RoomProvider,
  ClientSideSuspense,
} from "@liveblocks/react/suspense";

import { Spinner } from "@/components/ui/spinner"

export function Room({ 
    roomId,
    children
 }: { roomId : string, children: ReactNode }) {
  return (
    <LiveblocksProvider authEndpoint="/api/liveblocks/auth">
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
  );
}

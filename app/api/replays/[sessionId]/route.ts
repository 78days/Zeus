import { auth } from "@clerk/nextjs/server"
import Browserbase from "@browserbasehq/sdk"

import { reportError } from "@/lib/sentry"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const { userId, orgId } = await auth()
  if (!userId || !orgId) {
    return new Response("Unauthorized", { status: 401 })
  }

  const { sessionId } = await params
  const apiKey = process.env.BROWSERBASE_API_KEY
  if (!apiKey) {
    return new Response("Browserbase is not configured", { status: 503 })
  }

  const browserbase = new Browserbase({ apiKey })

  let session
  try {
    session = await browserbase.sessions.retrieve(sessionId)
  } catch (error) {
    if (getStatus(error) === 404)
      return new Response("Not found", { status: 404 })
    reportError(error, {
      operation: "replays.retrieve-session",
      sessionId,
      orgId,
    })
    return new Response("Failed to retrieve replay", { status: 502 })
  }

  if (session.userMetadata?.orgId !== orgId) {
    return new Response("Not found", { status: 404 })
  }

  try {
    const replay = await browserbase.sessions.replays.retrieve(sessionId)
    const page = replay.pages[0]
    if (!page) return notReady()

    const playlist = await browserbase.sessions.replays.retrievePage(
      sessionId,
      page.pageId
    )

    return new Response(await playlist.text(), {
      headers: {
        "Cache-Control": "no-store",
        "Content-Type": "application/vnd.apple.mpegurl",
      },
    })
  } catch (error) {
    const status = getStatus(error)
    if (status === 404 || status === 409 || status === 425) return notReady()

    reportError(error, {
      operation: "replays.retrieve-playlist",
      sessionId,
      orgId,
    })
    return new Response("Failed to retrieve replay", { status: 502 })
  }
}

function notReady() {
  return new Response("Replay not ready", {
    status: 202,
    headers: { "Cache-Control": "no-store" },
  })
}

function getStatus(error: unknown) {
  return typeof error === "object" && error !== null && "status" in error
    ? (error as { status?: unknown }).status
    : undefined
}

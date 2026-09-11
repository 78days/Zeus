import { auth, currentUser } from "@clerk/nextjs/server"

import { liveblocks } from "@/lib/liveblocks"
import { reportError } from "@/lib/sentry"

export async function POST() {
  const { userId, orgId } = await auth()

  if (!userId || !orgId) {
    return new Response("Unauthorized", { status: 401 })
  }

  const user = await currentUser()

  if (!user) {
    return new Response("Unauthorized", { status: 401 })
  }

  try {
    const { status, body } = await liveblocks.identifyUser(
      {
        userId,
        groupIds: [orgId],
        organizationId: orgId,
      },
      {
        userInfo: {
          name:
            user.fullName ??
            user.username ??
            user.primaryEmailAddress?.emailAddress ??
            "Anonymous",
          avatar: user.imageUrl,
        },
      }
    )

    return new Response(body, { status })
  } catch (error) {
    reportError(error, { operation: "liveblocks.identify-user", orgId, userId })
    return new Response("Failed to authenticate with Liveblocks", {
      status: 502,
    })
  }
}

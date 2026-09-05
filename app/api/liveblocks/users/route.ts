import { auth, clerkClient } from "@clerk/nextjs/server"

export async function POST(request: Request) {
  const { userId, orgId } = await auth()

  if (!userId || !orgId) {
    return new Response("Unauthorized", { status: 401 })
  }

  const { userIds } = (await request.json()) as { userIds?: unknown }

  if (!Array.isArray(userIds) || !userIds.every((id) => typeof id === "string")) {
    return Response.json({ error: "Invalid userIds" }, { status: 400 })
  }

  if (userIds.length === 0) {
    return Response.json([])
  }

  const users = await (await clerkClient()).users.getUserList({
    userId: userIds,
    organizationId: [orgId],
    limit: userIds.length,
  })
  const usersById = new Map(users.data.map((user) => [user.id, user]))

  return Response.json(
    userIds.map((id) => {
      const user = usersById.get(id)

      if (!user) return null

      return {
        name:
          [user.firstName, user.lastName].filter(Boolean).join(" ") ||
          user.username ||
          user.id,
        avatar: user.imageUrl,
      }
    }),
  )
}

"use client"

import { useAuth } from "@clerk/nextjs"
import { useRouter } from "next/navigation"

const BILLING_PATH = "/billing"

export function useOrgPro() {
  const { has, isLoaded, orgId } = useAuth()
  const router = useRouter()

  return {
    isLoaded,
    isPro: Boolean(isLoaded && orgId && has?.({ plan: "org:pro" })),
    upgrade: () => router.push(BILLING_PATH),
  }
}

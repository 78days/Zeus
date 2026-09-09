import { PricingTable } from "@clerk/nextjs"
import { redirect } from "next/navigation"

import { auth } from "@clerk/nextjs/server"

export default async function BillingPage() {
  const { orgId } = await auth()

  if (!orgId) {
    redirect("/organization")
  }

  return (
    <main className="flex min-h-0 flex-1 flex-col items-center gap-8 overflow-auto p-6 md:p-10">
      <div className="w-full max-w-3xl space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Plans</h1>
        <p className="text-muted-foreground">
          Choose the plan that fits your organization.
        </p>
      </div>
      <div className="w-full max-w-3xl">
        <PricingTable for="organization" />
      </div>
    </main>
  )
}

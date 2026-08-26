
import { OrganizationSwitcher, UserButton } from "@clerk/nextjs"

export default function Page() {
  return (
    <main className="flex flex-col items-start gap-4 p-6">
      <UserButton />
      <OrganizationSwitcher hidePersonal />
    </main>
  )
}

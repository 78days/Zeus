import { OrganizationList } from "@clerk/nextjs"

export default function OrganizationPage() {
  return (
    <main className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center px-4 py-10 sm:px-6">
      <OrganizationList
        hidePersonal
        afterCreateOrganizationUrl="/"
        afterSelectOrganizationUrl="/"
      />
    </main>
  )
}

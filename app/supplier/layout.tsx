import { Sidebar } from "@/components/dashboard/Sidebar"
import { signOut } from "next-auth/react"
import type { ReactNode } from "react"

const handleLogout = async () => {
  try {
    await signOut({ callbackUrl: "/" }) // redirects automatically
  } catch (error) {
    console.error("Logout failed:", error)
  }
}

export default function SupplierLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Sidebar onLogout={handleLogout} />
        {children}
      </body>
    </html>
  )
}

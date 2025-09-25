import { Sidebar } from "@/components/ownerdashboard/Sidebar"
import type { ReactNode } from "react"

export default function SupplierLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Sidebar  />
        {children}
      </body>
    </html>
  )
}

import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"

export default function ProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="relative z-10 flex-1 min-w-0">{children}</main>
    </SidebarProvider>
  )
}

import { AppSidebar } from "@/components/layout/app-sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"

export default function ProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <SidebarProvider defaultOpen={false} className="relative">
      <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(60%_72%_at_54%_84%,rgba(16,185,129,0.14),transparent_66%),radial-gradient(46%_52%_at_66%_16%,rgba(59,130,246,0.12),transparent_70%)]" />
      <AppSidebar />
      <main className="relative z-10 flex-1 min-w-0 md:-ml-px">{children}</main>
    </SidebarProvider>
  )
}

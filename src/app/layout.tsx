import type { Metadata, Viewport } from "next";

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@/lib/utils"
import { TooltipProvider } from "@/components/ui/tooltip"

export const metadata: Metadata = {
  title: "Bảng điều khiển | Weather Intelligence",
  description: "Bảng điều khiển theo dõi trạm thông tin thời tiết thời gian thực và dự báo.",
  icons: {
    icon: "/favicon.ico",
  },
}
export const viewport: Viewport = {
  themeColor: "#050505",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="vi"
      suppressHydrationWarning
      className={cn("antialiased dark", "font-sans")}
    >
      <body className="bg-[#0f172a] relative">
        {/* Global Background Glows */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px]" />
          <div className="absolute top-[20%] -right-[10%] w-[30%] h-[30%] bg-purple-500/10 rounded-full blur-[120px]" />
          <div className="absolute -bottom-[10%] left-[20%] w-[50%] h-[50%] bg-emerald-500/10 rounded-full blur-[120px]" />
        </div>
        
        <ThemeProvider>
          <TooltipProvider>
            {children}
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

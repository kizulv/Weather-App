"use client"

import * as React from "react"
import {
  LayoutDashboard,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  Thermometer,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  CloudRain,
  Settings,
  HelpCircle,
  Bell,
  LogOut,
  ChevronUp,
  User2,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { useRouter, usePathname } from "next/navigation"

const navMain = [
  {
    title: "Dashboard",
    url: "/",
    icon: LayoutDashboard,
    isActive: true,
  },
]

const navSecondary = [
  {
    title: "Cài đặt",
    url: "#",
    icon: Settings,
  },
  {
    title: "Trợ giúp",
    url: "#",
    icon: HelpCircle,
  },
]



export function AppSidebar() {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = React.useState<{ name: string; role: string } | null>(null)

  React.useEffect(() => {
    if (pathname === "/login") return

    // Đọc cookie user_info (non-httpOnly) chứa thông tin hiển thị
    try {
      const cookieStr = document.cookie
      const userCookie = cookieStr.split("; ").find(c => c.startsWith("user_info="))
      if (userCookie) {
        const value = decodeURIComponent(userCookie.split("=").slice(1).join("="))
        const info = JSON.parse(value)
        setUser({ name: info.name, role: info.role })
      }
    } catch (error) {
      console.error("Lỗi khi đọc thông tin người dùng:", error)
    }
  }, [pathname])

  if (pathname === "/login") {
    return null
  }

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      })

      if (response.ok) {
        router.push("/login")
        router.refresh()
      }
    } catch (error) {
      console.error("Lỗi khi đăng xuất:", error)
    }
  }

  return (
    <Sidebar className="border-r border-white/5 bg-[#0a0f1d]/60 backdrop-blur-3xl">
      <SidebarHeader className="p-8 pb-4">
        <div className="flex items-center gap-3.5 group cursor-default">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-linear-to-br from-blue-500/20 to-emerald-500/20 text-white border border-white/10 shadow-2xl transition-all duration-500 group-hover:scale-105 group-hover:border-blue-500/30">
            <LayoutDashboard className="h-5 w-5 text-blue-400" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-black tracking-tight text-white uppercase leading-tight">Weather <span className="text-blue-400">AI</span></span>
            <span className="text-[10px] font-bold text-white/30 tracking-[0.2em] uppercase leading-none">Intelligence</span>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent className="px-4 py-4 space-y-6 no-scrollbar relative overflow-hidden">
        {/* Subtle glow inside content */}
        <div className="absolute top-0 left-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <SidebarGroup>
          <SidebarGroupLabel className="text-white/30 text-[10px] uppercase tracking-[0.2em] font-bold px-3 mb-2">Tổng quan</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-2">
              {navMain.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={item.isActive} 
                    tooltip={item.title} 
                    className={cn(
                      "h-11 px-3 rounded-xl transition-all duration-200 group",
                      item.isActive 
                        ? "bg-white/10 text-white shadow-sm" 
                        : "hover:bg-white/5 text-white/40 hover:text-white"
                    )}
                  >
                    <a href={item.url} className="flex items-center gap-3">
                      <item.icon className={cn("h-4 w-4", item.isActive ? "text-blue-400" : "text-white/40 group-hover:text-white/70")} />
                      <span className="font-semibold tracking-tight text-sm">{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        <SidebarGroup>
          <SidebarGroupLabel className="text-white/30 text-[10px] uppercase tracking-[0.2em] font-bold px-3 mb-2">Hỗ trợ</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-2">
              {navSecondary.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    size="default" 
                    tooltip={item.title} 
                    className="h-11 px-3 rounded-xl hover:bg-white/5 text-white/40 hover:text-white transition-all duration-200 group"
                  >
                    <a href={item.url} className="flex items-center gap-3">
                      <item.icon className="h-4 w-4 transition-transform duration-200 group-hover:scale-105" />
                      <span className="font-semibold text-sm tracking-tight">{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="px-4 h-15 p-0 flex items-center justify-center bg-white/5 backdrop-blur-xl border-t border-white/5">
        <SidebarMenu className="w-full">
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="h-14 rounded-xl px-2 justify-center hover:bg-white/5 active:bg-white/10 transition-all duration-200 group data-[state=open]:bg-white/10"
                >
                  <Avatar className="h-9 w-9 rounded-lg border border-white/10 shadow-lg flex-none">
                    <AvatarImage src="https://github.com/shadcn.png" alt="User" />
                    <AvatarFallback className="bg-blue-500/20 text-blue-400 font-bold text-xs">
                      {user?.name ? user.name.substring(0, 2).toUpperCase() : "..."}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid text-left text-sm leading-tight ml-3 flex-none">
                    <span className="truncate font-bold text-white/90 tracking-tight text-xs">{user?.name || "Đang tải..."}</span>
                    <span className="truncate text-[10px] text-white/30 font-medium tracking-wide">{user?.role || "..."}</span>
                  </div>
                  <ChevronUp className="h-3.5 w-3.5 text-white/20 group-hover:text-white/40 transition-colors ml-2 flex-none" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="top"
                className="w-[--radix-dropdown-menu-trigger-width] min-w-64 rounded-3xl bg-[#0f172a]/90 backdrop-blur-2xl border-white/10 text-white shadow-[0_20px_50px_rgba(0,0,0,0.5)] p-2 mb-2"
              >
                <div className="px-4 py-3 border-b border-white/5 mb-2">
                  <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">Tài khoản</p>
                </div>
                <DropdownMenuItem className="rounded-2xl focus:bg-blue-500/10 focus:text-blue-400 transition-all duration-300 cursor-pointer py-3 px-4">
                  <User2 className="mr-3 h-4 w-4" />
                  <span className="font-bold text-sm tracking-tight">Hồ sơ cá nhân</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="rounded-2xl focus:bg-amber-500/10 focus:text-amber-400 transition-all duration-300 cursor-pointer py-3 px-4">
                  <Bell className="mr-3 h-4 w-4" />
                  <span className="font-bold text-sm tracking-tight">Trung tâm thông báo</span>
                </DropdownMenuItem>
                <div className="h-px bg-white/5 my-2 mx-2" />
                <DropdownMenuItem 
                  className="rounded-2xl focus:bg-red-500/20 focus:text-red-400 text-red-400/80 transition-all duration-300 cursor-pointer py-3 px-4"
                  onClick={handleLogout}
                >
                  <LogOut className="mr-3 h-4 w-4" />
                  <span className="font-black text-sm tracking-tight uppercase">Đăng xuất</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}

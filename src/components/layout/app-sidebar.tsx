"use client"

import * as React from "react"
import { logoutAction } from "@/features/auth/auth.actions"
import {
  Bell,
  LogOut,
  ChevronUp,
  User2,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
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
import { SettingsDialog } from "@/features/setting/components/SettingsDialog"
import {
  sidebarMainNav,
  sidebarSecondaryNav,
  type SidebarNavItem,
} from "@/components/layout/sidebar-nav"

export function AppSidebar() {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = React.useState<{ name: string; role: string } | null>(null)

  React.useEffect(() => {
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
  }, [])

  const isNavItemActive = (item: SidebarNavItem) => {
    if (item.matchMode === "exact") {
      return pathname === item.url
    }
    return pathname === item.url || pathname.startsWith(`${item.url}/`)
  }

  const handleLogout = async () => {
    try {
      const result = await logoutAction();

      if (result.success) {
        router.push("/login");
        router.refresh();
      }
    } catch (error) {
      console.error("Lỗi khi đăng xuất:", error);
    }
  };

  return (
<Sidebar collapsible="icon" className="z-40">
      <SidebarHeader className="px-4 pt-4 group-data-[collapsible=icon]:px-0">
        <SidebarMenu className="w-full group-data-[collapsible=icon]:items-center">
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="h-14 rounded-xl px-2 justify-center hover:bg-white/5 active:bg-white/10 transition-all duration-200 group data-[state=open]:bg-white/10"
                >
                  <Avatar className="h-9 w-9 group-data-[collapsible=icon]:h-8 group-data-[collapsible=icon]:w-8 rounded-lg border border-white/10 shadow-lg shrink-0">
                    <AvatarImage src="https://github.com/shadcn.png" alt="User" />
                    <AvatarFallback className="bg-blue-500/20 text-blue-400 font-bold text-xs">
                      {user?.name ? user.name.substring(0, 2).toUpperCase() : "..."}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid text-left text-sm leading-tight ml-3 shrink-0 group-data-[collapsible=icon]:hidden">
                    <span className="truncate font-bold text-white/90 tracking-tight text-xs">{user?.name || "Đang tải..."}</span>
                    <span className="truncate text-[10px] text-white/30 font-medium tracking-wide">{user?.role || "..."}</span>
                  </div>
                  <ChevronUp className="h-3.5 w-3.5 text-white/20 group-hover:text-white/40 transition-colors ml-2 shrink-0 group-data-[collapsible=icon]:hidden" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="right"
                align="start"
                className="w-64 rounded-3xl bg-[#0f172a]/90 backdrop-blur-2xl border-white/10 text-white shadow-[0_20px_50px_rgba(0,0,0,0.5)] p-2 ml-2"
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
      </SidebarHeader>
      
      <SidebarContent className="px-4 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:py-4 no-scrollbar relative overflow-hidden">
        {/* Subtle glow inside content */}
        <div className="absolute top-0 left-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <SidebarGroup className="group-data-[collapsible=icon]:p-0">
          <SidebarGroupLabel className="text-white/30 text-[10px] uppercase tracking-[0.2em] font-bold px-3 mb-2 group-data-[collapsible=icon]:hidden">Tổng quan</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-2 group-data-[collapsible=icon]:items-center">
              {sidebarMainNav.map((item) => {
                const isActive = isNavItemActive(item)
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.title}
                      className={cn(
                        "h-11 px-3 rounded-xl transition-all duration-200 group",
                        isActive
                          ? "bg-white/10 text-white shadow-sm"
                          : "hover:bg-white/5 text-white/40 hover:text-white"
                      )}
                    >
                      <a href={item.url} className="flex items-center gap-3">
                        <item.icon className={cn("h-4 w-4 shrink-0", isActive ? "text-white" : "text-white/40 group-hover:text-white/70")} />
                        <span className="font-semibold tracking-tight text-sm group-data-[collapsible=icon]:hidden">{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        <SidebarGroup className="group-data-[collapsible=icon]:p-0">
          <SidebarGroupLabel className="text-white/30 text-[10px] uppercase tracking-[0.2em] font-bold px-3 mb-2 group-data-[collapsible=icon]:hidden">Hỗ trợ</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-2 group-data-[collapsible=icon]:items-center">
              {sidebarSecondaryNav.map((item) => (
                <SidebarMenuItem key={item.title}>
                  {item.key === "settings" ? (
                    <SettingsDialog>
                      <SidebarMenuButton 
                        size="default" 
                        tooltip={item.title} 
                        className="h-11 px-3 rounded-xl hover:bg-white/5 text-white/40 hover:text-white transition-all duration-200 group w-full"
                      >
                        <div className="flex items-center gap-3 w-full group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:gap-0">
                          <item.icon className="h-4 w-4 shrink-0 transition-transform duration-200 group-hover:scale-105" />
                          <span className="font-semibold text-sm tracking-tight group-data-[collapsible=icon]:hidden">{item.title}</span>
                        </div>
                      </SidebarMenuButton>
                    </SettingsDialog>
                  ) : (
                    <SidebarMenuButton 
                      asChild 
                      size="default" 
                      tooltip={item.title} 
                      className="h-11 px-3 rounded-xl hover:bg-white/5 text-white/40 hover:text-white transition-all duration-200 group"
                    >
                      <a href={item.url} className="flex items-center gap-3 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:gap-0">
                        <item.icon className="h-4 w-4 shrink-0 transition-transform duration-200 group-hover:scale-105" />
                        <span className="font-semibold text-sm tracking-tight group-data-[collapsible=icon]:hidden">{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

    </Sidebar>
  )
}

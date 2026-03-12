"use client"

import * as React from "react"
import {
  LayoutDashboard,
  Thermometer,
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

const navMain = [
  {
    title: "Dashboard",
    url: "/",
    icon: LayoutDashboard,
    isActive: true,
  },
  {
    title: "Nhiệt độ",
    url: "#",
    icon: Thermometer,
  },
  {
    title: "Lượng mưa",
    url: "#",
    icon: CloudRain,
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
  return (
    <Sidebar className="border-r border-white/5 bg-white/5 backdrop-blur-2xl">
      <SidebarHeader className="border-b border-white/5 p-6 bg-black/10">
        <div className="flex items-center gap-3 group cursor-default">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-linear-to-br from-blue-500/30 to-emerald-500/30 text-white border border-white/20 shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-transform duration-500 group-hover:rotate-12">
            <LayoutDashboard className="h-6 w-6" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-black tracking-tighter text-white uppercase">Weather <span className="text-blue-400">AI</span></span>
            <span className="text-[9px] font-bold text-blue-400/60 tracking-[0.2em] uppercase leading-none">Intelligence</span>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent className="px-3 py-6 space-y-8 no-scrollbar relative overflow-hidden">
        {/* Subtle glow inside content */}
        <div className="absolute top-0 left-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <SidebarGroup>
          <SidebarGroupLabel className="text-white/20 text-[10px] uppercase tracking-[0.3em] font-black px-4 mb-4">Tổng quan</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-2">
              {navMain.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={item.isActive} 
                    tooltip={item.title} 
                    className={cn(
                      "h-12 px-4 rounded-2xl transition-all duration-300 border border-transparent group",
                      item.isActive 
                        ? "bg-blue-500/20 text-white border-white/10 shadow-[0_4px_15px_rgba(59,130,246,0.1)] backdrop-blur-md" 
                        : "hover:bg-white/5 text-white/50 hover:text-white hover:border-white/5"
                    )}
                  >
                    <a href={item.url} className="flex items-center gap-4">
                      <div className={cn(
                        "p-2 rounded-xl transition-all duration-300",
                        item.isActive ? "bg-blue-500/20 shadow-[0_0_10px_rgba(59,130,246,0.3)]" : "bg-white/5"
                      )}>
                        <item.icon className={cn("h-4.5 w-4.5", item.isActive ? "text-blue-400" : "text-white/40")} />
                      </div>
                      <span className="font-bold tracking-tight text-sm">{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        <SidebarGroup>
          <SidebarGroupLabel className="text-white/20 text-[10px] uppercase tracking-[0.3em] font-black px-4 mb-4">Hỗ trợ</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-2">
              {navSecondary.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    size="sm" 
                    tooltip={item.title} 
                    className="h-11 px-4 rounded-2xl hover:bg-white/5 text-white/40 hover:text-white/80 transition-all duration-300 border border-transparent hover:border-white/5 group"
                  >
                    <a href={item.url} className="flex items-center gap-4">
                      <item.icon className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
                      <span className="font-semibold text-xs uppercase tracking-wider">{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 bg-black/20 backdrop-blur-xl border-t border-white/5">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="h-16 rounded-2xl px-4 hover:bg-white/5 active:bg-white/10 transition-all duration-300 border border-transparent hover:border-white/10 group data-[state=open]:bg-white/10"
                >
                  <div className="relative">
                    <div className="absolute inset-0 bg-blue-500/20 rounded-2xl blur-sm animate-pulse" />
                    <Avatar className="h-10 w-10 rounded-2xl border border-white/20 relative z-10">
                      <AvatarImage src="https://github.com/shadcn.png" alt="User" />
                      <AvatarFallback className="bg-linear-to-br from-blue-500/40 to-blue-600/40 text-white font-black">KT</AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight ml-3">
                    <span className="truncate font-black text-white tracking-tight uppercase text-xs">Kizu Thanh</span>
                    <span className="truncate text-[9px] text-blue-400 font-bold tracking-widest uppercase">Admin Premium</span>
                  </div>
                  <ChevronUp className="ml-auto h-4 w-4 text-white/20 group-hover:text-white/50 transition-colors" />
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
                <DropdownMenuItem className="rounded-2xl focus:bg-red-500/20 focus:text-red-400 text-red-400/80 transition-all duration-300 cursor-pointer py-3 px-4">
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

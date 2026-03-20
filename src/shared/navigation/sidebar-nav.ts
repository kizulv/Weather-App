import {
  HelpCircle,
  LayoutDashboard,
  Settings,
  type LucideIcon,
} from "lucide-react"
import { APP_ROUTES } from "@/shared/constants/routes"

export type SidebarMatchMode = "exact" | "prefix"

export interface SidebarNavItem {
  key: string
  title: string
  url: string
  icon: LucideIcon
  matchMode?: SidebarMatchMode
}

export const sidebarMainNav: SidebarNavItem[] = [
  {
    key: "weather",
    title: "Thời tiết",
    url: APP_ROUTES.weather,
    icon: LayoutDashboard,
    matchMode: "prefix",
  },
]

export const sidebarSecondaryNav: SidebarNavItem[] = [
  {
    key: "settings",
    title: "Cài đặt",
    url: "#",
    icon: Settings,
    matchMode: "exact",
  },
  {
    key: "help",
    title: "Trợ giúp",
    url: "#",
    icon: HelpCircle,
    matchMode: "exact",
  },
]

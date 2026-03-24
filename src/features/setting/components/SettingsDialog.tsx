"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { Home, Globe, Shield } from "lucide-react";
import { HomeAssistantTab } from "./HomeAssistantTab";
import { GeneralTab } from "./GeneralTab";
import { SecurityTab } from "./SecurityTab";

interface SettingsDialogProps {
  children: React.ReactNode;
}

export function SettingsDialog({ children }: SettingsDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-200 bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 text-white rounded-2xl p-0 overflow-hidden shadow-2xl focus:outline-none text-xs">
        {/* Decorative glow */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
        <DialogTitle className="sr-only">Cài đặt ứng dụng</DialogTitle>
        <DialogDescription className="sr-only">Quản lý các thiết lập cơ bản của ứng dụng.</DialogDescription>
        <div className="flex h-125">
          {/* Sidebar Tabs */}
          <TabsPrimitive.Root defaultValue="home-assistant" className="flex w-full">
            <div className="w-45 bg-slate-800/10 border-r border-slate-800/30 p-4 flex flex-col gap-2 relative z-10 sm:min-w-60">
              <div className="px-2 py-4 mb-2">
                <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Cài đặt</h2>
              </div>
              <TabsPrimitive.List className="flex flex-col gap-1">
                <TabsPrimitive.Trigger 
                  value="general" 
                  className="flex items-center gap-3 px-3 py-2.5 rounded-sm text-xs font-bold text-slate-500 data-[state=active]:bg-slate-800/40 data-[state=active]:text-slate-200 transition-all hover:text-slate-300"
                >
                  <Globe className="h-4 w-4" />
                  Chung
                </TabsPrimitive.Trigger>
                <TabsPrimitive.Trigger 
                  value="home-assistant" 
                  className="flex items-center gap-3 px-3 py-2.5 rounded-sm text-xs font-bold text-slate-500 data-[state=active]:bg-emerald-500/10 data-[state=active]:text-emerald-400 transition-all hover:text-slate-300"
                >
                  <Home className="h-4 w-4" />
                  Home Assistant
                </TabsPrimitive.Trigger>
                <TabsPrimitive.Trigger 
                  value="security" 
                  className="flex items-center gap-3 px-3 py-2.5 rounded-sm text-xs font-bold text-slate-500 data-[state=active]:bg-slate-800/40 data-[state=active]:text-slate-200 transition-all hover:text-slate-300"
                >
                  <Shield className="h-4 w-4" />
                  Bảo mật
                </TabsPrimitive.Trigger>
              </TabsPrimitive.List>
            </div>

            {/* Content Area */}
            <div className="flex-1 p-8 overflow-y-auto min-w-0">
              <HomeAssistantTab />
              <GeneralTab />
              <SecurityTab />
            </div>
          </TabsPrimitive.Root>
        </div>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { Shield } from "lucide-react";
import * as TabsPrimitive from "@radix-ui/react-tabs";

export function SecurityTab() {
  return (
    <TabsPrimitive.Content value="security" className="space-y-6 focus:outline-none data-[state=inactive]:hidden">
      <div className="space-y-1">
        <h3 className="text-lg font-bold">Bảo mật</h3>
        <p className="text-xs text-slate-500 font-medium">Bảo vệ tài khoản và dữ liệu của bạn.</p>
      </div>
      <div className="p-12 border border-dashed border-slate-700/50 rounded-2xl flex flex-col items-center justify-center text-center bg-slate-800/10">
        <Shield className="h-8 w-8 text-slate-700 mb-4" />
        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Đang phát triển</p>
      </div>
    </TabsPrimitive.Content>
  );
}

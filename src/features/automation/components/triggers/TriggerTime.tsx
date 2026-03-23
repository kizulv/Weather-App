"use client"

import { Input } from "@/components/ui/input"

interface TriggerTimeProps {
  value: string
  onChange: (value: string) => void
}

export function TriggerTime({ value, onChange }: TriggerTimeProps) {
  return (
    <Input
      type="time"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="bg-slate-800/40 border-slate-700/50 rounded-sm h-9! font-semibold text-xs! w-full text-white px-3 py-0 appearance-none [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:cursor-pointer"
    />
  )
}

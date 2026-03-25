import { Suspense } from "react"
export const dynamic = "force-dynamic"
import { WeatherDashboard } from "@/features/weather/components/WeatherDashboard"
import { getWeatherDataFromCookies } from "@/features/weather/server/weather-fetch"
import { getAutomationsFromDB, getDevicesFromDB } from "@/features/automation/server/automation-fetch"
import { SidebarTrigger } from "@/components/ui/sidebar"

function WeatherSkeleton() {
  return (
    <div className="flex-1 min-h-svh text-slate-200">
      <div className="relative z-10 flex flex-col min-h-svh">
        <div className="p-4 flex items-center justify-between">
          <SidebarTrigger className="text-white/60 hover:text-white" />
        </div>
        <main className="flex-1 p-4 md:p-8 md:pt-0 space-y-8 max-w-8xl mx-auto w-full pt-0 min-w-0">
          <div className="h-44 w-full rounded-3xl border border-white/10 bg-black/20 animate-pulse" />

          <section className="flex flex-col lg:flex-row gap-8 items-stretch">
            <div className="flex-1 flex flex-col gap-8 min-w-0">
              <div className="h-87.5 w-full rounded-2xl border border-white/10 bg-black/20 animate-pulse" />
              <div className="h-32 w-full rounded-2xl border border-white/10 bg-black/20 animate-pulse" />
            </div>
            <div className="w-full lg:w-95 lg:min-w-95 shrink-0">
              <div className="h-96 w-full rounded-2xl border border-white/10 bg-black/20 animate-pulse" />
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}

async function WeatherContent() {
  const [weatherData, automations, devices] = await Promise.all([
    getWeatherDataFromCookies(),
    getAutomationsFromDB(),
    getDevicesFromDB(),
  ])

  return (
    <WeatherDashboard
      initialData={weatherData ? {
        realtime: weatherData.realtime,
        past24h: weatherData.past24h,
        daily: weatherData.daily,
      } : null}
      initialAutomations={automations}
      initialDevices={devices}
    />
  )
}

export default function WeatherDashboardPage() {
  return (
    <Suspense fallback={<WeatherSkeleton />}>
      <WeatherContent />
    </Suspense>
  )
}

import { SidebarTrigger } from "@/components/ui/sidebar";

export default function Loading() {
  return (
    <div className="flex-1 min-h-svh text-slate-200">
      <div className="relative z-10 flex flex-col min-h-svh">
        <div className="p-4 flex items-center justify-between">
          <SidebarTrigger className="text-white/60 hover:text-white" />
        </div>
        <main className="flex-1 p-4 md:p-8 md:pt-0 space-y-8 max-w-8xl mx-auto w-full pt-0 min-w-0">
          {/* Current Weather skeleton */}
          <div className="h-44 w-full rounded-3xl border border-white/10 bg-black/20 animate-pulse" />

          <section className="flex flex-col lg:flex-row gap-8 items-stretch">
            <div className="flex-1 flex flex-col gap-8 min-w-0">
              {/* Chart skeleton */}
              <div className="h-87.5 w-full rounded-2xl border border-white/10 bg-black/20 animate-pulse" />
              {/* Hourly skeleton */}
              <div className="h-32 w-full rounded-2xl border border-white/10 bg-black/20 animate-pulse" />
            </div>
            {/* Daily forecast skeleton */}
            <div className="w-full lg:w-95 lg:min-w-95 shrink-0">
              <div className="h-96 w-full rounded-2xl border border-white/10 bg-black/20 animate-pulse" />
            </div>
          </section>

          {/* Automation skeleton */}
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="h-6 w-32 rounded bg-white/10 animate-pulse" />
              <div className="h-10 w-28 rounded-xl bg-white/10 animate-pulse" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              <div className="h-40 rounded-2xl border border-white/10 bg-black/20 animate-pulse" />
              <div className="h-40 rounded-2xl border border-white/10 bg-black/20 animate-pulse" />
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

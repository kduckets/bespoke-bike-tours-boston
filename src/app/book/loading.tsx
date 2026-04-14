// src/app/book/loading.tsx
export default function BookingLoading() {
  return (
    <div className="pt-[70px] min-h-screen">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <div className="h-3 w-32 bg-white/5 rounded mx-auto mb-4 animate-pulse" />
          <div className="h-12 w-64 bg-white/5 rounded mx-auto animate-pulse" />
        </div>
        {/* Step indicator skeleton */}
        <div className="flex items-center mb-10">
          {[1, 2, 3, 4].map((n, i) => (
            <div key={n} className="flex items-center flex-1 last:flex-none">
              <div className="w-8 h-8 rounded-full bg-white/[0.08] animate-pulse flex-shrink-0" />
              {i < 3 && <div className="flex-1 h-px bg-white/[0.08] mx-3" />}
            </div>
          ))}
        </div>
        {/* Card skeleton */}
        <div className="card p-10">
          <div className="h-8 w-48 bg-white/5 rounded mb-6 animate-pulse" />
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="h-24 bg-white/[0.03] rounded-lg border border-white/[0.06] animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

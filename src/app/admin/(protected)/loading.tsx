// src/app/admin/loading.tsx
export default function AdminLoading() {
  return (
    <div className="p-10">
      <div className="h-10 w-48 bg-white/5 rounded mb-8 animate-pulse" />
      <div className="grid grid-cols-4 gap-4 mb-8">
        {[1, 2, 3, 4].map((n) => (
          <div key={n} className="card p-6">
            <div className="h-3 w-24 bg-white/5 rounded mb-3 animate-pulse" />
            <div className="h-10 w-20 bg-white/5 rounded animate-pulse" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-6">
        <div className="card p-6 h-80 animate-pulse" />
        <div className="card p-6 h-80 animate-pulse" />
      </div>
    </div>
  )
}

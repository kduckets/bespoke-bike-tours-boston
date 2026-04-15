// src/app/admin/layout.tsx
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { AdminSidebar } from '@/components/admin/AdminSidebar'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/admin/login')

  return (
    <div className="min-h-screen flex pt-0">
      <AdminSidebar />
      <main className="flex-1 p-10 overflow-y-auto bg-navy min-h-screen">
        {children}
      </main>
    </div>
  )
}

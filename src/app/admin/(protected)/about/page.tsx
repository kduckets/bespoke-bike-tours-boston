import { prisma } from '@/lib/prisma'
import { getSiteContent } from '@/lib/site-content'
import { AboutHeroEditor } from '@/components/admin/AboutHeroEditor'
import { AboutTeamEditor } from '@/components/admin/AboutTeamEditor'
import { AboutValuesEditor } from '@/components/admin/AboutValuesEditor'

const ABOUT_KEYS = ['about_quote', 'about_body']

export default async function AboutAdminPage() {
  const [heroContent, members, values] = await Promise.all([
    getSiteContent(ABOUT_KEYS),
    prisma.teamMember.findMany({ orderBy: { sortOrder: 'asc' } }).catch(() => []),
    prisma.aboutValue.findMany({ orderBy: { sortOrder: 'asc' } }).catch(() => []),
  ])

  return (
    <div className="p-8 max-w-4xl space-y-8">
      <div>
        <div className="text-[9px] tracking-[3px] uppercase text-gold mb-1">Admin</div>
        <h1 className="font-display text-5xl tracking-widest">ABOUT</h1>
        <p className="text-muted text-sm mt-1">Manage the About page hero copy, team members, and company values.</p>
      </div>

      <AboutHeroEditor initial={{ about_quote: heroContent.about_quote, about_body: heroContent.about_body }} />
      <AboutTeamEditor initial={members} />
      <AboutValuesEditor initial={values} />
    </div>
  )
}

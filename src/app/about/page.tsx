// src/app/about/page.tsx
import type { Metadata } from 'next'
import { Footer } from '@/components/layout/Footer'
import { buildMetadata } from '@/lib/metadata'

export const metadata: Metadata = buildMetadata({
  title: 'About Us',
  description: 'Meet the Boston locals behind the best bike tour in the city. No khaki shirts, no monotone history lectures. Just great routes and unforgettable experiences.',
  path: '/about',
})

const TEAM = [
  {
    initials: 'MR',
    name: 'Marcus Rivera',
    role: 'Founder & Head Guide',
    bio: 'Former cycling instructor turned Boston obsessive. Marcus has logged 10,000+ miles on these streets and still finds new corners to love.',
    color: 'bg-purple-2/30 text-iris-2',
  },
  {
    initials: 'AK',
    name: 'Aisha Kim',
    role: 'Lead Guide & Operations',
    bio: 'Aisha runs the show behind the scenes and in front of your group. Certified instructor, marathon runner, and the source of our best Spotify playlists.',
    color: 'bg-gold/15 text-gold',
  },
  {
    initials: 'JP',
    name: 'Jake Parisi',
    role: 'Guide & Events Lead',
    bio: 'Jake handles all private events and group bookings. His bachelorette routes are locally famous. He also makes a mean playlist.',
    color: 'bg-iris/20 text-iris-2',
  },
]

const VALUES = [
  { num: '01', title: 'Fun First', desc: 'We\'re not a history class. We\'re the best part of your trip. Every ride is designed to make you smile, laugh, and probably want to come back.' },
  { num: '02', title: 'Welcoming to All', desc: 'Expert rider or first-timer — our guides meet you where you are. No judgment, no elitism. Boston\'s streets are for everyone.' },
  { num: '03', title: 'Authentically Local', desc: 'Our guides aren\'t reading from a script. They live here. They\'ll show you the spots the guidebooks miss and tell you where to eat after.' },
  { num: '04', title: 'Safety Always', desc: 'All bikes are inspected daily, helmets are mandatory, and our guides are certified in first aid. The party never comes at the expense of your safety.' },
]

export default function AboutPage() {
  return (
    <>
      <div className="pt-[70px]">
        {/* Hero */}
        <div className="bg-navy-2 border-b border-gold/15 py-20 px-10 text-center">
          <div className="section-label">Our Story</div>
          <h1 className="font-display text-7xl tracking-widest mb-8">ABOUT US</h1>
          <blockquote className="font-serif italic text-4xl leading-snug text-white
                                  max-w-2xl mx-auto mb-8">
            "We built the tour we always{' '}
            <span className="text-gold">wanted to take</span> — and Boston
            has never been the same."
          </blockquote>
          <p className="text-muted text-base leading-relaxed max-w-xl mx-auto">
            Bespoke Bike Tours Boston was born from a simple idea: this city is one of the most
            beautiful, walkable — and rideable — cities in America, and nobody was showing it off
            in style. So we did something about it. No khaki shirts, no monotone history lectures.
            Just great routes, great energy, and genuinely unforgettable experiences.
          </p>
        </div>

        <div className="max-w-5xl mx-auto px-10 py-20">
          {/* Team */}
          <div className="section-label">The Team</div>
          <h2 className="font-display text-5xl tracking-wide mb-2">YOUR GUIDES</h2>
          <p className="text-muted text-sm mb-12">
            Born and raised in Boston. Obsessed with bikes. Slightly too enthusiastic about good playlists.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
            {TEAM.map((member) => (
              <div key={member.name} className="card p-8 text-center">
                <div className={`w-20 h-20 rounded-full mx-auto mb-4 flex items-center
                                  justify-content-center font-display text-3xl tracking-widest
                                  flex justify-center items-center ${member.color}`}>
                  {member.initials}
                </div>
                <div className="font-bold text-base mb-1">{member.name}</div>
                <div className="text-[11px] tracking-[2px] uppercase text-gold mb-3">{member.role}</div>
                <p className="text-sm text-muted leading-relaxed">{member.bio}</p>
              </div>
            ))}
          </div>

          {/* Values */}
          <div className="section-label">Our Values</div>
          <h2 className="font-display text-5xl tracking-wide mb-12">WHAT WE STAND FOR</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
            {VALUES.map((v) => (
              <div key={v.num} className="pl-8 pr-6 py-8 border-l-[3px] border-gold mb-6">
                <div className="font-display text-6xl text-gold/20 mb-2">{v.num}</div>
                <div className="text-lg font-bold mb-2">{v.title}</div>
                <p className="text-sm text-muted leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </>
  )
}

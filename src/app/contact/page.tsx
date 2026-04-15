// src/app/contact/page.tsx
import type { Metadata } from 'next'
import { Footer } from '@/components/layout/Footer'
import { buildMetadata } from '@/lib/metadata'
import { ContactForm } from '@/components/ui/ContactForm'
import { getSiteContent } from '@/lib/site-content'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = buildMetadata({
  title: 'Contact Us',
  description: 'Questions about our tours? Group booking inquiry? Get in touch with the Bespoke Bike Tours Boston team.',
  path: '/contact',
})

const FAQ = [
  {
    q: 'What if it rains?',
    a: 'We ride in light rain — Boston weather is part of the charm. If there\'s a severe weather warning we\'ll contact you at least 2 hours before your ride to reschedule or refund.',
  },
  {
    q: 'Do I need to bring my own bike?',
    a: 'Nope — all bikes and helmets are included. We have a range of sizes. Just show up.',
  },
  {
    q: 'What\'s the fitness level required?',
    a: 'Our routes are designed for all fitness levels. We keep a relaxed pace and take breaks. If you can walk, you can ride with us.',
  },
  {
    q: 'Can I book for a large group?',
    a: 'Absolutely — our Private Group experience handles 6–20 riders and is fully customizable. Email us or fill in the form and we\'ll get back to you same day.',
  },
  {
    q: 'What is your cancellation policy?',
    a: 'Free cancellation up to 48 hours before your ride for a full refund. Within 48 hours we can offer a credit toward a future tour.',
  },
  {
    q: 'Where do tours start?',
    a: 'All tours meet at the Esplanade near the Hatch Shell — 100 Embankment Rd, Boston. Parking is available nearby and it\'s a short walk from the Charles/MGH Red Line stop.',
  },
]

export default async function ContactPage() {
  const contact = await getSiteContent([
    'contact_email',
    'contact_phone',
    'contact_location',
    'contact_hours',
    'contact_instagram_handle',
    'contact_instagram_url',
  ])

  const contactRows = [
    { label: 'Email',     value: contact.contact_email,            href: `mailto:${contact.contact_email}` },
    { label: 'Phone',     value: contact.contact_phone,            href: `tel:${contact.contact_phone.replace(/\D/g, '')}` },
    { label: 'Meet Up',   value: contact.contact_location,         href: `https://maps.google.com/?q=${encodeURIComponent(contact.contact_location + ' Boston')}` },
    { label: 'Hours',     value: contact.contact_hours,            href: null },
    { label: 'Instagram', value: contact.contact_instagram_handle, href: contact.contact_instagram_url },
  ]

  return (
    <>
      <div className="pt-[70px]">
        {/* Hero */}
        <div className="bg-navy-2 border-b border-gold/15 py-16 px-10 text-center">
          <div className="section-label">Get In Touch</div>
          <h1 className="font-display text-7xl tracking-widest">CONTACT US</h1>
          <p className="text-muted mt-2 text-base max-w-sm mx-auto">
            Questions, group inquiries, or just want to say hi — we reply fast.
          </p>
        </div>

        <div className="max-w-5xl mx-auto px-10 py-16 grid grid-cols-1 lg:grid-cols-2 gap-16">

          {/* Contact form */}
          <div>
            <div className="section-label">Send a Message</div>
            <h2 className="font-display text-4xl tracking-wide mb-8">LET'S TALK</h2>
            <ContactForm />
          </div>

          {/* Info + FAQ */}
          <div>
            <div className="section-label mb-4">Find Us</div>
            <div className="card p-6 mb-8">
              {contactRows.map(({ label, value, href }) => (
                <div key={label} className="flex justify-between py-3 text-sm border-b border-white/[0.05] last:border-0">
                  <span className="text-muted">{label}</span>
                  {href ? (
                    <a href={href} target={href.startsWith('http') ? '_blank' : undefined}
                       rel="noopener noreferrer"
                       className="font-medium text-gold hover:underline">{value}</a>
                  ) : (
                    <span className="font-medium">{value}</span>
                  )}
                </div>
              ))}
            </div>

            <div className="section-label mb-4">FAQ</div>
            <div className="space-y-4">
              {FAQ.map(({ q, a }) => (
                <details key={q} className="card group">
                  <summary className="flex items-center justify-between p-5 cursor-pointer
                                      list-none font-semibold text-sm hover:text-gold transition-colors">
                    {q}
                    <span className="text-gold text-lg group-open:rotate-45 transition-transform origin-center">+</span>
                  </summary>
                  <div className="px-5 pb-5 text-sm text-muted leading-relaxed border-t border-white/[0.05] pt-4">
                    {a}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}

// src/components/layout/Footer.tsx
import Link from 'next/link'
import Image from 'next/image'

export function Footer() {
  return (
    <footer className="bg-[#08091E] border-t border-gold/15 pt-16 pb-10 px-10 mt-0">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <Image
              src="/logo.jpg"
              alt="Bespoke Bike Tours Boston"
              width={80}
              height={80}
              className="rounded-full mb-4"
            />
            <p className="text-sm text-muted leading-relaxed max-w-xs">
              A little bit of Vegas on two wheels. We&rsquo;re not your history class — we&rsquo;re the best
              afternoon (or night) you&rsquo;ll have in this city.
            </p>
          </div>

          {/* Company */}
          <div>
            <div className="section-label">Company</div>
            {[['About Us', '/about'], ['Contact', '/contact']].map(([label, href]) => (
              <Link key={label} href={href} className="block text-sm text-muted mb-2.5 hover:text-white transition-colors">
                {label}
              </Link>
            ))}
          </div>

          {/* Contact */}
          <div>
            <div className="section-label">Contact</div>
            <a href="mailto:hello@bespokebikeboston.com" className="block text-sm text-muted mb-2.5 hover:text-white transition-colors">
              hello@bespokebikeboston.com
            </a>
            <a href="tel:6175550190" className="block text-sm text-muted mb-2.5 hover:text-white transition-colors">
              (617) 555-0190
            </a>
            <div className="flex gap-4 mt-4">
              {['Instagram', 'TikTok'].map((s) => (
                <a key={s} href="#" className="text-xs tracking-widest uppercase text-muted hover:text-gold transition-colors">
                  {s}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="gold-divider mb-8" />

        <div className="flex flex-col md:flex-row justify-between items-center gap-4
                        text-xs text-muted">
          <span>© {new Date().getFullYear()} Bespoke Bike Tours Boston. All rights reserved.</span>
          <span className="font-serif italic text-iris-2">
            Guided Rides. Iconic Sights. Unforgettable Boston.
          </span>
        </div>
      </div>
    </footer>
  )
}

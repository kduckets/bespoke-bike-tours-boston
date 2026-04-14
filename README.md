# Bespoke Bike Tours Boston

> Guided Rides. Iconic Sights. Unforgettable Boston.

## Tech Stack

| Layer        | Choice                              |
|--------------|-------------------------------------|
| Framework    | Next.js 14 (App Router)             |
| Database     | PostgreSQL via Prisma ORM           |
| Auth         | NextAuth.js (credentials)           |
| Payments     | Stripe (PaymentIntents + Webhooks)  |
| Email        | Resend                              |
| Styling      | Tailwind CSS                        |
| Hosting      | Vercel (recommended)                |
| DB Hosting   | Neon / Supabase / Railway           |

---

## Quick Start

### 1. Clone & install

```bash
git clone <your-repo>
cd bespoke-bike-tours-boston
npm install
```

### 2. Environment variables

```bash
cp .env.example .env.local
```

Fill in all values in `.env.local`:

| Variable                           | Where to get it                                         |
|------------------------------------|---------------------------------------------------------|
| `DATABASE_URL`                     | Neon / Supabase / Railway dashboard                     |
| `NEXTAUTH_SECRET`                  | `openssl rand -base64 32`                               |
| `STRIPE_SECRET_KEY`                | [stripe.com/dashboard](https://dashboard.stripe.com)   |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe dashboard                                      |
| `STRIPE_WEBHOOK_SECRET`            | Stripe → Webhooks (after running `stripe listen`)       |
| `RESEND_API_KEY`                   | [resend.com](https://resend.com)                        |

### 3. Database setup

```bash
# Push schema to your database
npm run db:push

# Seed with tours, time slots, promo codes & admin user
npm run db:seed
```

Default admin credentials (set `ADMIN_SEED_PASSWORD` in `.env.local` before seeding):
- Email: `admin@bespokebikeboston.com`
- Password: whatever you set in `ADMIN_SEED_PASSWORD`

### 4. Stripe webhook (local dev)

Install the Stripe CLI and run:

```bash
stripe login
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Copy the webhook signing secret into `STRIPE_WEBHOOK_SECRET`.

### 5. Run dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)  
Admin panel: [http://localhost:3000/admin](http://localhost:3000/admin)

---

## Project Structure

```
src/
├── app/
│   ├── page.tsx                    # Home (hero, services, booking widget, testimonials)
│   ├── tours/page.tsx              # All tours with full detail cards
│   ├── about/page.tsx              # Team, story, values
│   ├── book/page.tsx               # Multi-step booking flow
│   └── admin/
│       ├── page.tsx                # Dashboard (stats, recent bookings, capacity)
│       ├── bookings/page.tsx       # All bookings with filter + refund modal
│       ├── availability/page.tsx   # Slot manager (add/edit capacity/delete)
│       ├── discounts/page.tsx      # Promo codes + recent refunds
│       └── login/page.tsx          # Admin login
├── api/
│   ├── availability/               # GET available slots grouped by date
│   ├── bookings/                   # POST create booking + PaymentIntent
│   ├── bookings/validate-promo/    # POST validate promo code
│   ├── stripe/webhook/             # Confirms booking + sends email on payment
│   └── admin/
│       ├── stats/                  # Revenue, bookings, riders, capacity
│       ├── bookings/               # List + refund endpoints
│       ├── slots/                  # CRUD time slots
│       └── promos/                 # CRUD promo codes
├── components/
│   ├── booking/
│   │   ├── BookingFlow.tsx         # 5-step wizard (tour → date → info → pay → confirm)
│   │   ├── AvailabilityCalendar.tsx # react-day-picker wired to /api/availability
│   │   └── InlineBookingWidget.tsx  # Homepage quick-book widget
│   ├── admin/
│   │   ├── AdminSidebar.tsx
│   │   ├── RefundModal.tsx         # Full/partial/credit refunds
│   │   ├── AddSlotForm.tsx
│   │   ├── SlotRow.tsx             # Inline capacity editing
│   │   ├── CreatePromoForm.tsx
│   │   ├── PromoToggle.tsx
│   │   └── BookingsFilter.tsx
│   ├── layout/
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   └── Providers.tsx
│   └── ui/
│       └── HeroParticles.tsx
├── lib/
│   ├── prisma.ts                   # Singleton Prisma client
│   ├── stripe.ts                   # PaymentIntent, refunds, formatCents
│   ├── bookings.ts                 # Core business logic
│   ├── email.ts                    # Confirmation + refund emails
│   ├── auth.ts                     # NextAuth config
│   └── utils.ts                    # cn(), formatPrice(), formatTime(), generateReference()
└── middleware.ts                   # Admin route protection
```

---

## Fonts

The app uses **Bebas Neue** (display), **Playfair Display** (serif accent), and **DM Sans** (body).

Bebas Neue requires a local font file. Download it from [Google Fonts](https://fonts.google.com/specimen/Bebas+Neue) and place it at:

```
src/fonts/BebasNeue-Regular.ttf
```

---

## Deployment (Vercel)

1. Push to GitHub
2. Import to [vercel.com](https://vercel.com)
3. Add all environment variables from `.env.example`
4. Add a Stripe webhook endpoint pointing to `https://yourdomain.com/api/stripe/webhook`
   - Events to listen for: `payment_intent.succeeded`, `payment_intent.payment_failed`
5. Deploy

---

## Admin Access

Navigate to `/admin` — you'll be redirected to `/admin/login` if not authenticated.

The admin panel lets you:
- View revenue, booking counts, and capacity at a glance
- Filter and manage all bookings
- Issue full, partial, or store-credit refunds (processed through Stripe)
- Add, edit capacity, and remove time slots
- Create and toggle promo codes (% off or $ off, with use limits and expiry)

---

## Extending

**Add a new tour type:**
1. Add a record in the `Tour` table (via Prisma Studio or seed script)
2. Add it to the `TOURS` array in `BookingFlow.tsx` and `tours/page.tsx`

**Change pricing:**
- Update `pricePerPerson` in the database (in cents)
- The booking engine picks it up automatically from the slot's associated tour

**Add Google/Apple Sign-In for admin:**
- Add OAuth providers to `src/lib/auth.ts`

**Add a waitlist:**
- Add a `Waitlist` model to the Prisma schema
- Call `PATCH /api/admin/slots/:id` with `{ capacity: newCap }` to release spots

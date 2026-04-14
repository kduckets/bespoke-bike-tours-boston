// prisma/seed.ts
import { PrismaClient, PromoType } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { addDays, startOfDay } from 'date-fns'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Tours
  const mainEvent = await prisma.tour.upsert({
    where: { slug: 'main-event' },
    update: {},
    create: {
      slug: 'main-event',
      name: 'The Main Event',
      description: '2.5-hour guided group ride hitting Boston\'s greatest hits — the Esplanade, Back Bay, Beacon Hill & beyond.',
      duration: '2.5 hours',
      maxCapacity: 12,
      pricePerPerson: 7500, // $75.00
    },
  })

  const sunsetRide = await prisma.tour.upsert({
    where: { slug: 'sunset-ride' },
    update: {},
    create: {
      slug: 'sunset-ride',
      name: 'The Sunset Ride',
      description: 'Chase golden hour through Boston\'s most scenic waterfront corridors.',
      duration: '2 hours',
      maxCapacity: 10,
      pricePerPerson: 8500, // $85.00
    },
  })

  const bikeLessons = await prisma.tour.upsert({
    where: { slug: 'bike-lessons' },
    update: {},
    create: {
      slug: 'bike-lessons',
      name: 'Bike Lessons',
      description: 'Private and semi-private sessions. Patient, fun, zero judgment.',
      duration: '1 hour',
      maxCapacity: 4,
      pricePerPerson: 5500, // $55.00
    },
  })

  const privateGroup = await prisma.tour.upsert({
    where: { slug: 'private-group' },
    update: {},
    create: {
      slug: 'private-group',
      name: 'Private Group',
      description: 'Bachelorettes, birthdays, corporate outings. Your crew, your route, your vibe.',
      duration: '2–4 hours',
      maxCapacity: 20,
      pricePerPerson: 4500,  // $45/person
      groupBasePrice: 45000, // $450 base
    },
  })

  // Time slots for the next 30 days
  const today = startOfDay(new Date())
  const times = ['10:00', '14:00', '17:00']
  const weekendOnly = ['17:00'] // sunset only on weekends

  for (let i = 1; i <= 30; i++) {
    const date = addDays(today, i)
    const dayOfWeek = date.getDay() // 0=Sun, 6=Sat
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 5 || dayOfWeek === 6

    // Main event: daily at 10AM and 2PM; also 5PM on weekends
    const mainTimes = isWeekend ? ['10:00', '14:00', '17:00'] : ['10:00', '14:00']
    for (const t of mainTimes) {
      await prisma.timeSlot.upsert({
        where: { tourId_date_startTime: { tourId: mainEvent.id, date, startTime: t } },
        update: {},
        create: { tourId: mainEvent.id, date, startTime: t, capacity: 12 },
      })
    }

    // Sunset ride: Fri–Sun only
    if (isWeekend) {
      await prisma.timeSlot.upsert({
        where: { tourId_date_startTime: { tourId: sunsetRide.id, date, startTime: '17:00' } },
        update: {},
        create: { tourId: sunsetRide.id, date, startTime: '17:00', capacity: 10 },
      })
    }
  }

  // Promo codes
  await prisma.promoCode.upsert({
    where: { code: 'SUMMER20' },
    update: {},
    create: { code: 'SUMMER20', type: PromoType.PERCENTAGE, value: 20, maxUses: 100 },
  })
  await prisma.promoCode.upsert({
    where: { code: 'FIRSTRIDE' },
    update: {},
    create: { code: 'FIRSTRIDE', type: PromoType.PERCENTAGE, value: 10 },
  })
  await prisma.promoCode.upsert({
    where: { code: 'BACHELORETTE' },
    update: {},
    create: { code: 'BACHELORETTE', type: PromoType.FIXED_AMOUNT, value: 2500, maxUses: 50 },
  })

  // Admin user
  const hashedPassword = await bcrypt.hash(process.env.ADMIN_SEED_PASSWORD || 'changeme123', 12)
  await prisma.adminUser.upsert({
    where: { email: 'admin@bespokebikeboston.com' },
    update: {},
    create: {
      email: 'admin@bespokebikeboston.com',
      password: hashedPassword,
      name: 'Admin',
    },
  })

  console.log('✅ Seed complete')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())

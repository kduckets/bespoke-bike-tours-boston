// src/types/env.d.ts
// Extends ProcessEnv so process.env.STRIPE_SECRET_KEY etc. are typed strings.
// Variables marked optional (?) may not be present in all environments (e.g. test).

declare namespace NodeJS {
  interface ProcessEnv {
    // Database
    DATABASE_URL: string

    // NextAuth
    NEXTAUTH_URL:    string
    NEXTAUTH_SECRET: string

    // Stripe
    STRIPE_SECRET_KEY:                   string
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY:  string
    STRIPE_WEBHOOK_SECRET:               string

    // Email
    RESEND_API_KEY: string
    EMAIL_FROM?:    string

    // App
    NEXT_PUBLIC_APP_URL?: string

    // Seed
    ADMIN_SEED_PASSWORD?: string
  }
}

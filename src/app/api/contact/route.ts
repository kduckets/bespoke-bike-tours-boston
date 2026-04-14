// src/app/api/contact/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { z } from 'zod'

const resend = new Resend(process.env.RESEND_API_KEY)

const ContactSchema = z.object({
  name:    z.string().min(1).max(100),
  email:   z.string().email(),
  subject: z.string().min(1).max(200),
  message: z.string().min(10).max(2000),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, email, subject, message } = ContactSchema.parse(body)

    await resend.emails.send({
      from:    process.env.EMAIL_FROM ?? 'hello@bespokebikeboston.com',
      to:      'hello@bespokebikeboston.com',
      reply_to: email,
      subject: `[Contact] ${subject} — ${name}`,
      html: `
        <p><strong>From:</strong> ${name} &lt;${email}&gt;</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <hr />
        <p>${message.replace(/\n/g, '<br>')}</p>
      `,
    })

    // Auto-reply to sender
    await resend.emails.send({
      from:    process.env.EMAIL_FROM ?? 'hello@bespokebikeboston.com',
      to:      email,
      subject: 'We got your message — Bespoke Bike Tours Boston',
      html: `
        <p>Hi ${name},</p>
        <p>Thanks for reaching out! We'll get back to you within a few hours.</p>
        <p>In the meantime, feel free to browse our tours at <a href="${process.env.NEXT_PUBLIC_APP_URL}/tours">bespokebikeboston.com/tours</a>.</p>
        <p>— The Bespoke Bike Tours Team</p>
      `,
    })

    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid form data' }, { status: 400 })
    }
    console.error('[POST /api/contact]', err)
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
  }
}

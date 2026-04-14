// src/lib/email.ts
import { Resend } from 'resend'
import { format } from 'date-fns'
import { formatCents } from './stripe'
import type { BookingWithDetails } from '@/types'

const resend = new Resend(process.env.RESEND_API_KEY ?? 're_placeholder')
const FROM = process.env.EMAIL_FROM ?? 'hello@bespokebikeboston.com'

// ─── Booking Confirmation ──────────────────────────────────────────────────────

export async function sendBookingConfirmation(booking: BookingWithDetails) {
  const { slot, firstName, email, reference, totalCents, guestCount } = booking
  const dateStr = format(new Date(slot.date), 'EEEE, MMMM d, yyyy')

  await resend.emails.send({
    from: FROM,
    to: email,
    subject: `You're booked! ${slot.tour.name} on ${dateStr} — ${reference}`,
    html: confirmationEmailHtml({ firstName, reference, tourName: slot.tour.name, dateStr, startTime: slot.startTime, guestCount, totalCents }),
  })
}

// ─── Refund Confirmation ───────────────────────────────────────────────────────

export async function sendRefundConfirmation(booking: BookingWithDetails, refundCents: number) {
  await resend.emails.send({
    from: FROM,
    to: booking.email,
    subject: `Refund processed — ${booking.reference}`,
    html: `
      <p>Hi ${booking.firstName},</p>
      <p>Your refund of <strong>${formatCents(refundCents)}</strong> for booking <strong>${booking.reference}</strong> has been processed. 
      Please allow 5–10 business days for the amount to appear on your statement.</p>
      <p>We hope to see you on the road again soon!</p>
      <p>— The Bespoke Bike Tours Team</p>
    `,
  })
}

// ─── HTML Template ─────────────────────────────────────────────────────────────

function confirmationEmailHtml(data: {
  firstName: string
  reference: string
  tourName: string
  dateStr: string
  startTime: string
  guestCount: number
  totalCents: number
}) {
  const { firstName, reference, tourName, dateStr, startTime, guestCount, totalCents } = data
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Booking Confirmed</title></head>
<body style="font-family:sans-serif;background:#0D0E2C;color:#ffffff;margin:0;padding:40px 20px;">
  <div style="max-width:600px;margin:0 auto;background:#16173D;border-radius:12px;overflow:hidden;">
    <div style="background:#1E1F52;padding:32px 40px;border-bottom:2px solid #F5C842;">
      <div style="font-size:28px;font-weight:900;letter-spacing:2px;">BESPOKE BIKE TOURS</div>
      <div style="font-size:11px;letter-spacing:3px;color:#F5C842;margin-top:4px;">BOSTON</div>
    </div>
    <div style="padding:40px;">
      <h1 style="font-size:32px;margin:0 0 8px;">You're booked, ${firstName}! 🎉</h1>
      <p style="color:#8B88B8;margin:0 0 32px;">Here are your ride details. We can't wait to see you.</p>

      <div style="background:#1E1F52;border-radius:8px;padding:24px;margin-bottom:24px;">
        <div style="font-size:11px;letter-spacing:2px;color:#F5C842;margin-bottom:16px;text-transform:uppercase;">Your Booking</div>
        <table style="width:100%;border-collapse:collapse;">
          <tr><td style="padding:8px 0;color:#8B88B8;border-bottom:1px solid rgba(255,255,255,0.06);">Booking Ref</td><td style="text-align:right;font-weight:700;border-bottom:1px solid rgba(255,255,255,0.06);">${reference}</td></tr>
          <tr><td style="padding:8px 0;color:#8B88B8;border-bottom:1px solid rgba(255,255,255,0.06);">Tour</td><td style="text-align:right;border-bottom:1px solid rgba(255,255,255,0.06);">${tourName}</td></tr>
          <tr><td style="padding:8px 0;color:#8B88B8;border-bottom:1px solid rgba(255,255,255,0.06);">Date</td><td style="text-align:right;border-bottom:1px solid rgba(255,255,255,0.06);">${dateStr}</td></tr>
          <tr><td style="padding:8px 0;color:#8B88B8;border-bottom:1px solid rgba(255,255,255,0.06);">Time</td><td style="text-align:right;border-bottom:1px solid rgba(255,255,255,0.06);">${startTime}</td></tr>
          <tr><td style="padding:8px 0;color:#8B88B8;border-bottom:1px solid rgba(255,255,255,0.06);">Guests</td><td style="text-align:right;border-bottom:1px solid rgba(255,255,255,0.06);">${guestCount}</td></tr>
          <tr><td style="padding:8px 0;color:#8B88B8;">Total Paid</td><td style="text-align:right;color:#F5C842;font-weight:700;font-size:18px;">${formatCents(totalCents)}</td></tr>
        </table>
      </div>

      <div style="background:rgba(245,200,66,0.08);border:1px solid rgba(245,200,66,0.3);border-radius:8px;padding:24px;margin-bottom:32px;">
        <div style="font-size:11px;letter-spacing:2px;color:#F5C842;margin-bottom:12px;text-transform:uppercase;">Meet Up</div>
        <p style="margin:0;color:rgba(255,255,255,0.8);">The Esplanade near the Hatch Shell<br>100 Embankment Rd, Boston, MA 02114<br><br>Please arrive 10 minutes early.</p>
      </div>

      <div style="font-size:13px;color:#8B88B8;line-height:1.8;">
        <strong style="color:#fff;">What to bring:</strong> Comfortable clothes, closed-toe shoes, water, and good vibes.<br><br>
        Need to cancel or modify? Email us at <a href="mailto:hello@bespokebikeboston.com" style="color:#F5C842;">hello@bespokebikeboston.com</a> at least 48 hours before your ride for a full refund.
      </div>
    </div>
    <div style="padding:24px 40px;border-top:1px solid rgba(255,255,255,0.06);text-align:center;color:#8B88B8;font-size:12px;">
      Guided Rides. Iconic Sights. Unforgettable Boston.<br>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}" style="color:#F5C842;text-decoration:none;">bespokebikeboston.com</a>
    </div>
  </div>
</body>
</html>
  `.trim()
}

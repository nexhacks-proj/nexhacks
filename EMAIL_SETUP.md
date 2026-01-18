# Email Setup Guide

## Automatic Email Sending on Swipe Right ✉️

When you swipe right (mark as interested), the app automatically sends an interview invitation email to the candidate!

## Setup Options

### Option 1: Resend (Recommended for Hackathon)

Resend is easy to set up and has a generous free tier (3,000 emails/month).

1. **Sign up**: Go to https://resend.com and create a free account
2. **Get API Key**: 
   - Go to API Keys section
   - Create a new API key
   - Copy the key
3. **Add to `.env.local`**:
   ```
   RESEND_API_KEY=re_xxxxxxxxxxxxx
   ```
4. **Verify Domain** (optional for production):
   - Add your domain in Resend dashboard
   - Add DNS records to verify

### Option 2: Demo Mode (Default)

If `RESEND_API_KEY` is not set, the app will:
- ✅ Still trigger email sending logic
- ✅ Log the email to console (check your dev server terminal)
- ✅ Show "Email sent" in UI
- ✅ Use this for demos/presentations

**To see emails in demo mode:**
- Check your terminal where `npm run dev` is running
- Look for `📧 EMAIL WOULD BE SENT:` logs

## How It Works

1. **User swipes right** → Candidate marked as "interested"
2. **Email automatically generated** → Personalized interview invitation
3. **Email sent via Resend API** → (or logged in demo mode)
4. **Confetti celebration** → Visual feedback for success! 🎉

## Email Template

The email includes:
- ✅ Personalized greeting with candidate name
- ✅ Reference to their standout project/strength
- ✅ Job title and company name
- ✅ Scheduling link (if provided) or request for availability
- ✅ Professional but friendly tone

## Customization

You can customize the email in two ways:

### 1. In Code (Developer)
Edit `src/lib/email.ts` to modify the email template.

### 2. Founder Info (Coming Soon)
Future update will allow setting:
- Founder name
- Company name
- Email address
- Scheduling link (Cal.com, Calendly, etc.)

## Troubleshooting

**"Email logged (RESEND_API_KEY not configured)"**
→ This is normal in demo mode! Check your terminal to see the email.

**"Failed to send email"**
→ Check that your `RESEND_API_KEY` is correct in `.env.local`
→ Make sure you restarted the dev server after adding the key

**Email not appearing**
→ Check spam folder
→ Verify the email address in candidate data
→ Check Resend dashboard for delivery status

---

**Need help?** Check Resend docs: https://resend.com/docs

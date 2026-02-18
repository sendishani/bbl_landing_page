import type { APIRoute } from 'astro';
import { Resend } from 'resend';

export const prerender = false;

const resend = new Resend(import.meta.env.RESEND_API_KEY);

export const POST: APIRoute = async ({ request }) => {
  let email: string;

  try {
    const body = await request.json();
    email = (body.email ?? '').trim().toLowerCase();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid request body.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return new Response(JSON.stringify({ error: 'Please enter a valid email address.' }), {
      status: 422,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    // Add contact to Resend audience
    if (import.meta.env.RESEND_AUDIENCE_ID) {
      await resend.contacts.create({
        email,
        audienceId: import.meta.env.RESEND_AUDIENCE_ID,
        unsubscribed: false,
      });
    }

    // Send welcome email
    await resend.emails.send({
      from: 'Brokenbox Labs <hello@brokenboxlab.com>',
      to: email,
      subject: "You're on the list — Brokenbox Labs",
      html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Welcome to Brokenbox Labs</title>
</head>
<body style="margin:0;padding:0;background:#ffffff;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;color:#000000;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#ffffff;">
    <tr>
      <td align="center" style="padding:48px 24px;">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;">

          <!-- Logo mark -->
          <tr>
            <td style="padding-bottom:40px;">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding-right:10px;vertical-align:middle;">
                    <svg width="14" height="14" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M13 1.5H1.5V16.5H16.5V5" stroke="#000000" stroke-width="1.75" stroke-linecap="square" stroke-linejoin="miter"/>
                    </svg>
                  </td>
                  <td style="vertical-align:middle;font-size:14px;font-weight:500;letter-spacing:-0.02em;color:#000000;">
                    Brokenbox Labs
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding-bottom:32px;">
              <div style="width:40px;height:1px;background:#e5e5e5;"></div>
            </td>
          </tr>

          <!-- Heading -->
          <tr>
            <td style="padding-bottom:20px;">
              <p style="margin:0;font-size:32px;font-weight:300;letter-spacing:-0.03em;line-height:1.1;color:#000000;">
                You're on the list.
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding-bottom:40px;">
              <p style="margin:0 0 16px 0;font-size:15px;font-weight:300;color:rgba(0,0,0,0.55);line-height:1.7;">
                AI changed the job market. We're building the tools to make sure you stay ahead of it.
              </p>
              <p style="margin:0;font-size:15px;font-weight:300;color:rgba(0,0,0,0.55);line-height:1.7;">
                We'll let you know when we launch new features and products. Until then, check out <a href="https://www.texresume.com/" style="color:#000000;text-decoration:underline;text-underline-offset:3px;">TexResume</a> — our AI-powered resume tool that's live today.
              </p>
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td style="padding-bottom:48px;">
              <a href="https://www.texresume.com/" style="display:inline-block;background:#000000;color:#ffffff;text-decoration:none;font-size:13px;font-weight:500;letter-spacing:0.02em;padding:12px 24px;">
                Try TexResume →
              </a>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding-bottom:20px;border-top:1px solid #f0f0f0;"></td>
          </tr>

          <!-- Footer -->
          <tr>
            <td>
              <p style="margin:0;font-size:11px;color:rgba(0,0,0,0.3);line-height:1.7;">
                © 2026 Brokenbox Labs LLC &nbsp;·&nbsp;
                <a href="https://brokenboxlab.com/privacy" style="color:rgba(0,0,0,0.3);text-decoration:underline;">Privacy Policy</a>
                &nbsp;·&nbsp;
                <a href="mailto:hello@brokenboxlab.com" style="color:rgba(0,0,0,0.3);text-decoration:underline;">hello@brokenboxlab.com</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `,
    });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('[subscribe] Resend error:', err);
    return new Response(JSON.stringify({ error: 'Something went wrong. Please try again.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

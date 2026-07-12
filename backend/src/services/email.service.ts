// 📂 src/services/email.service.ts
// Resend-powered email notifications for Swapifhy
// Setup: npm install resend
// Add to your .env: RESEND_API_KEY=re_xxxxxxxxxxxx
// Get your free API key at https://resend.com

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = 'Swapifhy <notifications@swapifhy.com>';
const APP_URL = 'https://swapifhy.com';

// ── Email template ────────────────────────────────────────────────────────────
const buildMessageEmail = (
    senderName: string,
    recipientName: string,
    messagePreview: string, // already truncated before passing in
) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>New message on Swapifhy</title>
</head>
<body style="margin:0;padding:0;background:#09090b;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">

  <!-- Wrapper -->
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#09090b;padding:48px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;">

          <!-- Logo / Brand -->
          <tr>
            <td style="padding-bottom:32px;text-align:center;">
              <span style="font-size:22px;font-weight:900;color:#ffffff;letter-spacing:-0.5px;">
                swap<span style="color:#6366f1;">ifhy</span>
              </span>
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td style="background:#0f0f14;border:1px solid #1e1e2e;border-radius:20px;padding:40px 36px;">

              <!-- Avatar placeholder + sender -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                <tr>
                  <td style="vertical-align:middle;">
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="vertical-align:middle;">
                          <!-- Initials avatar -->
                          <div style="width:44px;height:44px;border-radius:12px;background:#1e1b4b;border:1px solid #312e81;display:inline-flex;align-items:center;justify-content:center;font-size:18px;font-weight:900;color:#818cf8;text-align:center;line-height:44px;">
                            ${senderName.charAt(0).toUpperCase()}
                          </div>
                        </td>
                        <td style="vertical-align:middle;padding-left:14px;">
                          <p style="margin:0;font-size:13px;font-weight:700;color:#ffffff;">${senderName}</p>
                          <p style="margin:4px 0 0;font-size:11px;font-weight:600;color:#6366f1;text-transform:uppercase;letter-spacing:0.1em;">sent you a message</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Divider -->
              <div style="height:1px;background:#1e1e2e;margin-bottom:28px;"></div>

              <!-- Hi line -->
              <p style="margin:0 0 12px;font-size:15px;font-weight:700;color:#ffffff;">
                Hey ${recipientName} 👋
              </p>
              <p style="margin:0 0 24px;font-size:14px;color:#71717a;line-height:1.6;">
                You have a new message waiting for you on Swapifhy.
              </p>

              <!-- Message preview bubble -->
              <div style="background:#0b0f1a;border:1px solid #1e1e2e;border-left:3px solid #6366f1;border-radius:12px;padding:16px 20px;margin-bottom:32px;">
                <p style="margin:0;font-size:14px;color:#a1a1aa;line-height:1.6;font-style:italic;">
                  "${messagePreview}..."
                </p>
              </div>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="${APP_URL}/matches"
                       style="display:inline-block;background:#6366f1;color:#ffffff;font-size:14px;font-weight:700;text-decoration:none;padding:14px 36px;border-radius:12px;letter-spacing:0.02em;">
                      Reply on Swapifhy →
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Sub note -->
              <p style="margin:28px 0 0;font-size:11px;color:#3f3f46;text-align:center;line-height:1.6;">
                You're receiving this because you have an active swap on Swapifhy.<br/>
                <a href="${APP_URL}/settings" style="color:#6366f1;text-decoration:none;">Manage notification preferences</a>
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding-top:24px;text-align:center;">
              <p style="margin:0;font-size:10px;font-weight:700;color:#27272a;text-transform:uppercase;letter-spacing:0.15em;">
                Swapifhy · Peer-to-Peer Skill Exchange
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>
`;

// ── Public function called from chat controller ────────────────────────────────
export const sendMessageNotification = async ({
    recipientEmail,
    recipientName,
    senderName,
    messageContent,
}: {
    recipientEmail: string;
    recipientName: string;
    senderName: string;
    messageContent: string;
}): Promise<void> => {
    if (!process.env.RESEND_API_KEY) {
        console.warn('[email] RESEND_API_KEY not set — skipping notification');
        return;
    }

    // Truncate to 60 chars for the preview
    const preview = messageContent.length > 60
        ? messageContent.slice(0, 60)
        : messageContent;

    try {
        await resend.emails.send({
            from: FROM_EMAIL,
            to: recipientEmail,
            subject: `${senderName} sent you a message on Swapifhy`,
            html: buildMessageEmail(senderName, recipientName, preview),
        });
        console.log(`[email] Notification sent to ${recipientEmail}`);
    } catch (err) {
        // Never throw — email failure should never break message sending
        console.error('[email] Failed to send notification:', err);
    }
};

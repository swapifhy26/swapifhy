/**
 * Email each user their temporary login (Swapifhy beta invite) via Gmail SMTP.
 * Reads credentials.csv (email,"name",tempPassword) and sends a personalized HTML email.
 *
 * Setup (in backend/.env):
 *   GMAIL_USER=swapifhy.official@gmail.com
 *   GMAIL_APP_PASSWORD=xxxxxxxxxxxxxxxx
 *   FRONTEND_URL=https://swapifhy.com
 *   TERMS_URL=https://docs.google.com/document/d/.../edit?usp=sharing
 *   BANNER_URL=https://swapifhy.com/images/launch-banner.jpg
 *
 * Usage:
 *   npx tsx scripts/send-credentials.ts <credentials.csv> --dry-run
 *   npx tsx scripts/send-credentials.ts <credentials.csv> --limit=3
 *   npx tsx scripts/send-credentials.ts <credentials.csv>
 */
import * as dotenv from 'dotenv'; dotenv.config();
import fs from 'fs';
import nodemailer from 'nodemailer';

const LOGIN_BASE = (process.env.FRONTEND_URL || 'https://swapifhy.com').split(',')[0].trim();
const LOGIN_URL = `${LOGIN_BASE}/auth`;
const BETA_FORM_URL = 'https://tally.so/r/GxbXkk';
const TERMS_URL = process.env.TERMS_URL || '';
const BANNER_URL = process.env.BANNER_URL || '';
const SUBJECT = 'Welcome to the New Swapifhy — Your Founding Access & Updates Inside 🚀';

function esc(s: string) { return (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

function buildText(name: string, email: string, passcode: string) {
    return `Hi ${name || 'there'},

Welcome to the Next Era of Swapifhy! 🚀
You are one of our 415 exclusive founding members. We've completely overhauled the platform with massive upgrades:

⚡ 10x Faster Speeds: Sub-second page loads across Network, Matches, and Feed.
📱 1-Tap Mobile Onboarding: Pick what you teach & learn in seconds with skill chips.
🎯 Smart AI Matchmaking: Accurate pairings to learn what you want from real experts.
🔔 Real-Time Live Alerts: Instant notifications for messages and swap proposals.
🌍 Countdown to Launch: Preparing for an inaugural community of over 100,000+ members.

YOUR LOGIN CREDENTIALS:
  Email:    ${email}
  Passcode: ${passcode}
  Log in:   ${LOGIN_URL}

For security, you can change your password anytime under Settings -> Update Password.

Log in today, pick your skills, and make your first swap:
${LOGIN_URL}

See you inside,
The Swapifhy Team
https://swapifhy.com`;
}

function buildHtml(name: string, email: string, passcode: string) {
    const displayName = esc(name) || 'there';
    const displayEmail = esc(email);
    const displayPass = esc(passcode);

    return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
  <title>Welcome to the New Swapifhy — Your Founding Access &amp; Updates</title>
  <style>
    html, body {
      margin: 0 auto !important;
      padding: 0 !important;
      height: 100% !important;
      width: 100% !important;
      background-color: #F5F5F7 !important;
      font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Helvetica Neue', Helvetica, Arial, sans-serif;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      color: #1D1D1F;
    }
    * {
      -ms-text-size-adjust: 100%;
      -webkit-text-size-adjust: 100%;
      box-sizing: border-box;
    }
    table, td {
      mso-table-lspace: 0pt !important;
      mso-table-rspace: 0pt !important;
      border-collapse: collapse !important;
    }
    img {
      -ms-interpolation-mode: bicubic;
      border: 0;
      height: auto;
      line-height: 100%;
      outline: none;
      text-decoration: none;
    }
    a {
      text-decoration: none;
    }
    @media only screen and (max-width: 620px) {
      .email-container {
        width: 100% !important;
        max-width: 100% !important;
      }
      .mobile-padding {
        padding-left: 20px !important;
        padding-right: 20px !important;
      }
      .mobile-card-padding {
        padding: 24px 18px !important;
      }
      .mobile-bento {
        display: block !important;
        width: 100% !important;
        max-width: 100% !important;
        padding-left: 0 !important;
        padding-right: 0 !important;
        padding-bottom: 12px !important;
      }
      .mobile-btn {
        width: 100% !important;
        display: block !important;
        text-align: center !important;
      }
      .mobile-hero-title {
        font-size: 30px !important;
        line-height: 36px !important;
        letter-spacing: -0.5px !important;
      }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #F5F5F7; color: #1D1D1F;">

  <div style="display: none; font-size: 1px; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden; mso-hide: all; font-family: sans-serif;">
    Major updates are live on Swapifhy! ⚡ 10x faster speed, 1-tap mobile onboarding, AI matchmaking &amp; your founding credentials inside...
    &zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;
  </div>

  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #F5F5F7; table-layout: fixed;">
    <tr>
      <td align="center" style="padding: 40px 14px 60px 14px;">
        
        <table role="presentation" class="email-container" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #FFFFFF; border-radius: 28px; border: 1px solid #E5E5EA; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.04), 0 1px 3px rgba(0, 0, 0, 0.02); overflow: hidden;">
          
          <tr>
            <td height="4" style="background: linear-gradient(90deg, #F07060 0%, #4F46E5 50%, #5BC4C0 100%); font-size: 0px; line-height: 0px;">&nbsp;</td>
          </tr>

          <tr>
            <td align="center" style="padding: 36px 40px 20px 40px;" class="mobile-padding">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="left" valign="middle">
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                      <tr>
                        <td valign="middle" style="padding-right: 12px;">
                          <img src="https://swapifhy.com/images/features/swapifhy-logo-DPxPDdg-.png" alt="Swapifhy Logo" width="38" height="38" style="display: block; width: 38px; height: 38px; border-radius: 10px; object-fit: contain;" />
                        </td>
                        <td valign="middle">
                          <span style="font-size: 21px; font-weight: 700; color: #1D1D1F; letter-spacing: -0.5px; font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif;">
                            Swap<span style="color: #4F46E5;">ifhy</span>
                          </span>
                        </td>
                      </tr>
                    </table>
                  </td>
                  <td align="right" valign="middle">
                    <span style="display: inline-block; padding: 6px 14px; border-radius: 999px; background-color: #F5F5F7; border: 1px solid #E5E5EA; color: #1D1D1F; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em;">
                      ★ Founding 415
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td align="center" style="padding: 16px 40px 28px 40px;" class="mobile-padding">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center">
                    
                    <div style="display: inline-block; padding: 5px 14px; border-radius: 999px; background-color: #EEF2FF; border: 1px solid #E0E7FF; color: #4F46E5; font-size: 12px; font-weight: 600; margin-bottom: 18px;">
                      Major Platform Evolution • v2.0 Live
                    </div>

                    <h1 class="mobile-hero-title" style="margin: 0 0 14px 0; font-size: 34px; line-height: 40px; font-weight: 800; color: #1D1D1F; letter-spacing: -0.8px;">
                      Welcome to the new <span style="color: #4F46E5;">Swapifhy.</span>
                    </h1>

                    <p style="margin: 0; font-size: 15px; line-height: 24px; color: #6E6E73; max-width: 480px;">
                      Hi <strong style="color: #1D1D1F;">${displayName}</strong>, you are one of our <strong>415 exclusive founding pioneers</strong>. We have completely re-engineered Swapifhy from the ground up to bring you the fastest, cleanest, and smartest skill exchange experience yet.
                    </p>

                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding: 0 40px 32px 40px;" class="mobile-padding">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #FBFBFC; border: 1px solid #E5E5EA; border-radius: 22px; padding: 26px 28px; box-shadow: 0 4px 16px rgba(0, 0, 0, 0.02);" class="mobile-card-padding">
                <tr>
                  <td>
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 20px;">
                      <tr>
                        <td align="left" valign="middle">
                          <span style="font-size: 11px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: #86868B;">
                            YOUR FOUNDING LOGIN CREDENTIALS
                          </span>
                        </td>
                        <td align="right" valign="middle">
                          <span style="font-size: 11px; color: #059669; font-weight: 600; background-color: #ECFDF5; border: 1px solid #D1FAE5; padding: 3px 9px; border-radius: 999px;">
                            ● Active
                          </span>
                        </td>
                      </tr>
                    </table>

                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 10px; background-color: #FFFFFF; border: 1px solid #E5E5EA; border-radius: 14px; padding: 12px 18px;">
                      <tr>
                        <td width="36%" style="font-size: 13px; color: #6E6E73; font-weight: 500;">Login Email</td>
                        <td align="right" style="font-size: 14px; color: #1D1D1F; font-weight: 600; font-family: -apple-system, BlinkMacSystemFont, monospace;">${displayEmail}</td>
                      </tr>
                    </table>

                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 22px; background-color: #FFFFFF; border: 1px solid #E5E5EA; border-radius: 14px; padding: 12px 18px;">
                      <tr>
                        <td width="36%" style="font-size: 13px; color: #6E6E73; font-weight: 500;">Temporary Passcode</td>
                        <td align="right">
                          <span style="display: inline-block; background-color: #F5F5F7; border: 1px solid #E5E5EA; padding: 4px 10px; border-radius: 8px; font-size: 14px; color: #4F46E5; font-weight: 700; font-family: monospace; letter-spacing: 0.5px;">
                            ${displayPass}
                          </span>
                        </td>
                      </tr>
                    </table>

                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td align="center">
                          <a href="${LOGIN_URL}" class="mobile-btn" target="_blank" style="display: block; width: 100%; background-color: #1D1D1F; color: #FFFFFF; font-size: 15px; font-weight: 600; text-align: center; text-decoration: none; padding: 15px 28px; border-radius: 980px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12); letter-spacing: -0.2px;">
                            Log In &amp; Claim Your Profile &rarr;
                          </a>
                        </td>
                      </tr>
                    </table>

                    <p style="margin: 14px 0 0 0; font-size: 12px; line-height: 18px; color: #86868B; text-align: center;">
                      For your privacy, update your passcode anytime in <em>Settings &rarr; Update Password</em>.
                    </p>

                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding: 0 40px;" class="mobile-padding">
              <div style="height: 1px; background-color: #E5E5EA; width: 100%;"></div>
            </td>
          </tr>

          <tr>
            <td style="padding: 36px 40px 18px 40px;" class="mobile-padding">
              <h2 style="margin: 0 0 6px 0; font-size: 21px; font-weight: 700; color: #1D1D1F; letter-spacing: -0.4px;">
                Designed for progress. Built for you.
              </h2>
              <p style="margin: 0; font-size: 14px; color: #6E6E73; line-height: 20px;">
                Here is what’s new in our latest release, crafted directly from community feedback:
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding: 0 40px 30px 40px;" class="mobile-padding">
              
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 12px;">
                <tr>
                  <td class="mobile-bento" width="48%" valign="top" style="background-color: #F5F5F7; border: 1px solid #EBEBF0; border-radius: 18px; padding: 22px 20px;">
                    <div style="font-size: 22px; margin-bottom: 10px;">⚡</div>
                    <h3 style="margin: 0 0 6px 0; font-size: 15px; font-weight: 700; color: #1D1D1F; letter-spacing: -0.2px;">
                      10x Faster Speeds
                    </h3>
                    <p style="margin: 0; font-size: 13px; line-height: 19px; color: #6E6E73;">
                      Engineered with database query caching. Network, Feed, and Matches now load with sub-second responsiveness.
                    </p>
                  </td>
                  
                  <td width="4%" class="mobile-bento" style="font-size: 0px; line-height: 0px;">&nbsp;</td>

                  <td class="mobile-bento" width="48%" valign="top" style="background-color: #F5F5F7; border: 1px solid #EBEBF0; border-radius: 18px; padding: 22px 20px;">
                    <div style="font-size: 22px; margin-bottom: 10px;">📱</div>
                    <h3 style="margin: 0 0 6px 0; font-size: 15px; font-weight: 700; color: #1D1D1F; letter-spacing: -0.2px;">
                      1-Tap Skill Selection
                    </h3>
                    <p style="margin: 0; font-size: 13px; line-height: 19px; color: #6E6E73;">
                      Mobile-first onboarding: Tap popular skill chips (Python, UI/UX, AI, Music) to complete your profile in under 30 seconds.
                    </p>
                  </td>
                </tr>
              </table>

              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td class="mobile-bento" width="48%" valign="top" style="background-color: #F5F5F7; border: 1px solid #EBEBF0; border-radius: 18px; padding: 22px 20px;">
                    <div style="font-size: 22px; margin-bottom: 10px;">🎯</div>
                    <h3 style="margin: 0 0 6px 0; font-size: 15px; font-weight: 700; color: #1D1D1F; letter-spacing: -0.2px;">
                      Smart AI Matchmaking
                    </h3>
                    <p style="margin: 0; font-size: 13px; line-height: 19px; color: #6E6E73;">
                      Our algorithm pairs you with mentors and peers based on real skill complement: learn what you want from who can teach it.
                    </p>
                  </td>
                  
                  <td width="4%" class="mobile-bento" style="font-size: 0px; line-height: 0px;">&nbsp;</td>

                  <td class="mobile-bento" width="48%" valign="top" style="background-color: #F5F5F7; border: 1px solid #EBEBF0; border-radius: 18px; padding: 22px 20px;">
                    <div style="font-size: 22px; margin-bottom: 10px;">🔔</div>
                    <h3 style="margin: 0 0 6px 0; font-size: 15px; font-weight: 700; color: #1D1D1F; letter-spacing: -0.2px;">
                      Live Notifications
                    </h3>
                    <p style="margin: 0; font-size: 13px; line-height: 19px; color: #6E6E73;">
                      Never miss a message, swap proposal, or scheduled class with instant real-time alerts on mobile and desktop.
                    </p>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <tr>
            <td style="padding: 0 40px 32px 40px;" class="mobile-padding">
              <div style="background-color: #EEF2FF; border: 1px solid #E0E7FF; border-radius: 20px; padding: 24px 26px; text-align: center;">
                <p style="margin: 0 0 6px 0; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #4F46E5;">
                  THE ROAD TO OFFICIAL LAUNCH
                </p>
                <h3 style="margin: 0 0 8px 0; font-size: 18px; font-weight: 700; color: #1D1D1F; letter-spacing: -0.3px;">
                  Gearing up for 100,000+ (1 Lakh+) Learners
                </h3>
                <p style="margin: 0; font-size: 13px; line-height: 20px; color: #4B5563;">
                  Our hardware and servers are currently being scaled to support our public launch. As one of our <strong>415 Founding Cohort</strong>, you enjoy lifetime Pioneer recognition, priority match indexing, and early feature access.
                </p>
              </div>
            </td>
          </tr>

          <tr>
            <td style="padding: 0 40px 34px 40px;" class="mobile-padding">
              <h3 style="margin: 0 0 16px 0; font-size: 16px; font-weight: 700; color: #1D1D1F; letter-spacing: -0.2px;">
                Get started in 3 simple steps:
              </h3>
              
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td valign="top" width="32" style="padding-bottom: 14px;">
                    <span style="display: inline-block; width: 24px; height: 24px; line-height: 24px; text-align: center; border-radius: 50%; background-color: #1D1D1F; color: #FFFFFF; font-size: 12px; font-weight: 700;">1</span>
                  </td>
                  <td valign="top" style="font-size: 14px; line-height: 22px; color: #4B5563; padding-bottom: 14px;">
                    <strong style="color: #1D1D1F;">Sign In:</strong> Use your registered email and temporary passcode above.
                  </td>
                </tr>
                <tr>
                  <td valign="top" width="32" style="padding-bottom: 14px;">
                    <span style="display: inline-block; width: 24px; height: 24px; line-height: 24px; text-align: center; border-radius: 50%; background-color: #1D1D1F; color: #FFFFFF; font-size: 12px; font-weight: 700;">2</span>
                  </td>
                  <td valign="top" style="font-size: 14px; line-height: 22px; color: #4B5563; padding-bottom: 14px;">
                    <strong style="color: #1D1D1F;">Pick Your Skills:</strong> Tap 1 skill you can share and 1 you want to master.
                  </td>
                </tr>
                <tr>
                  <td valign="top" width="32">
                    <span style="display: inline-block; width: 24px; height: 24px; line-height: 24px; text-align: center; border-radius: 50%; background-color: #4F46E5; color: #FFFFFF; font-size: 12px; font-weight: 700;">3</span>
                  </td>
                  <td valign="top" style="font-size: 14px; line-height: 22px; color: #4B5563;">
                    <strong style="color: #1D1D1F;">Swap &amp; Grow:</strong> Connect with your first partner and start learning.
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td align="center" style="padding: 0 40px 40px 40px;" class="mobile-padding">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center">
                    <a href="${LOGIN_URL}" class="mobile-btn" target="_blank" style="display: inline-block; background-color: #4F46E5; color: #FFFFFF; font-size: 15px; font-weight: 600; text-align: center; text-decoration: none; padding: 15px 36px; border-radius: 980px; box-shadow: 0 6px 18px rgba(79, 70, 229, 0.28); letter-spacing: -0.2px;">
                      Jump into Swapifhy Now &rarr;
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="background-color: #FBFBFC; border-top: 1px solid #E5E5EA; padding: 30px 40px; text-align: center;" class="mobile-padding">
              <p style="margin: 0 0 10px 0; font-size: 13px; font-weight: 600; color: #1D1D1F;">
                Swapifhy &bull; The Modern Skill Exchange Network
              </p>
              <p style="margin: 0 0 14px 0; font-size: 12px; line-height: 18px; color: #86868B;">
                You received this priority invitation because you are one of the 415 founding members on the Swapifhy waitlist.<br>
                Questions, thoughts, or ideas? Reply directly to this email—our team reads and responds to every message.
              </p>
              <p style="margin: 0; font-size: 12px; color: #86868B;">
                <a href="https://swapifhy.com" style="color: #4F46E5; text-decoration: none; margin: 0 8px; font-weight: 500;">Website</a> &bull;
                <a href="https://swapifhy.com/help" style="color: #4F46E5; text-decoration: none; margin: 0 8px; font-weight: 500;">Help Center</a> &bull;
                <a href="https://tally.so/r/GxbXkk" style="color: #4F46E5; text-decoration: none; margin: 0 8px; font-weight: 500;">Feedback Form</a>
              </p>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>`;
}

function parseRows(csvPath: string) {
    const lines = fs.readFileSync(csvPath, 'utf8').split(/\r?\n/).filter(l => l.trim() !== '');
    lines.shift();
    return lines.map(line => {
        const m = line.match(/^([^,]+),"(.*)",([^,]+)$/);
        if (m) return { email: m[1].trim(), name: m[2].trim(), password: m[3].trim() };
        const p = line.split(',');
        return { email: (p[0] || '').trim(), name: (p[1] || '').trim(), password: (p[2] || '').trim() };
    }).filter(r => r.email && r.password);
}

const sleep = (ms: number) => new Promise(res => setTimeout(res, ms));

async function sendWithRetry(transporter: any, mail: any, attempts = 3): Promise<void> {
    let lastErr: any;
    for (let i = 1; i <= attempts; i++) {
        try { await transporter.sendMail(mail); return; }
        catch (e: any) { lastErr = e; if (i < attempts) await sleep(1500 * i); }
    }
    throw lastErr;
}

async function main() {
    const args = process.argv.slice(2);
    const dryRun = args.includes('--dry-run');
    const limitArg = args.find(a => a.startsWith('--limit='));
    const limit = limitArg ? parseInt(limitArg.split('=')[1], 10) : Infinity;
    const csvPath = args.find(a => !a.startsWith('--'));

    if (!csvPath || !fs.existsSync(csvPath)) {
        console.error('Usage: npx tsx scripts/send-credentials.ts <credentials.csv> [--dry-run] [--limit=N]');
        process.exit(1);
    }

    const user = process.env.GMAIL_USER;
    const pass = (process.env.GMAIL_APP_PASSWORD || '').replace(/\s+/g, '');
    if (!dryRun && (!user || !pass)) {
        console.error('Set GMAIL_USER and GMAIL_APP_PASSWORD in backend/.env first.');
        process.exit(1);
    }

    const rows = parseRows(csvPath).slice(0, limit);
    console.log(`${dryRun ? '[DRY RUN] ' : ''}Will send to ${rows.length} recipient(s). Login: ${LOGIN_URL}`);
    if (!TERMS_URL) console.log('  NOTE: TERMS_URL not set — terms link will read "(no link)".');
    if (!BANNER_URL) console.log('  NOTE: BANNER_URL not set — sending without the banner image.');

    const transporter = dryRun ? null : nodemailer.createTransport({ service: 'gmail', auth: { user, pass } });
    const failures: string[] = [];
    let sent = 0;

    for (const r of rows) {
        if (dryRun) { console.log(`  [dry] would email ${r.email}`); sent++; continue; }
        try {
            await sendWithRetry(transporter, {
                from: `Swapifhy <${user}>`,
                to: r.email,
                subject: SUBJECT,
                text: buildText(r.name, r.email, r.password),
                html: buildHtml(r.name, r.email, r.password),
            });
            sent++;
            if (sent % 25 === 0) console.log(`  sent ${sent}/${rows.length}...`);
            await sleep(700);
        } catch (e: any) {
            failures.push(`${r.email},"${r.name}",${r.password}`);
            console.error(`  FAIL ${r.email}: ${e.message}`);
        }
    }

    if (failures.length) {
        const failPath = csvPath.replace(/\.csv$/, '') + '.failures.csv';
        fs.writeFileSync(failPath, 'email,name,tempPassword\n' + failures.join('\n'));
        console.log(`\n  ${failures.length} failed — written to ${failPath} (re-run the script on that file to retry just those).`);
    }
    console.log(`\n${dryRun ? '[DRY RUN] ' : ''}Done. Sent: ${sent}, Failed: ${failures.length}`);
}

main().catch(e => { console.error(e); process.exit(1); });

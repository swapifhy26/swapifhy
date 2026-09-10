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
  <title>Welcome to the New Era of Swapifhy</title>
  
  <!-- Apple / Modern Silicon Valley Typography -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;600;700;800&display=swap" rel="stylesheet">

  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->

  <style>
    /* Reset & Base Rules */
    html, body {
      margin: 0 auto !important;
      padding: 0 !important;
      height: 100% !important;
      width: 100% !important;
      background-color: #F6F8FC !important;
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      color: #0B0F19;
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

    /* Mobile Responsive Rules */
    @media only screen and (max-width: 620px) {
      .email-wrapper {
        padding: 12px 6px 32px 6px !important;
      }
      .email-container {
        width: 100% !important;
        max-width: 100% !important;
        border-radius: 24px !important;
      }
      .mobile-padding {
        padding-left: 18px !important;
        padding-right: 18px !important;
      }
      .mobile-pass-padding {
        padding: 20px 16px !important;
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
        padding: 16px 20px !important;
      }
      .mobile-hero-title {
        font-size: 30px !important;
        line-height: 36px !important;
        letter-spacing: -0.8px !important;
      }
      .mobile-hero-sub {
        font-size: 14.5px !important;
        line-height: 23px !important;
      }
      .mobile-stat-col {
        display: block !important;
        width: 100% !important;
        padding-bottom: 14px !important;
        border-right: none !important;
        border-bottom: 1px solid #E2E8F0 !important;
      }
      .mobile-stat-col:last-child {
        border-bottom: none !important;
        padding-bottom: 0 !important;
      }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #F6F8FC; color: #0B0F19;">

  <!-- Preheader Preview Text -->
  <div style="display: none; font-size: 1px; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden; mso-hide: all; font-family: sans-serif;">
    Major upgrades are live on Swapifhy! ⚡ 10x faster speeds, 1-tap skill selection, AI matchmaking &amp; your VIP Founding Credentials inside...
    &zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;
  </div>

  <!-- Ambient Outer Canvas with Subtle Gradient -->
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" class="email-wrapper" style="background: linear-gradient(180deg, #EDF2F9 0%, #F6F8FC 25%, #F8FAFC 100%); table-layout: fixed;">
    <tr>
      <td align="center" style="padding: 40px 12px 60px 12px;">
        
        <!-- Apple Ultra-Card Container (600px Max Width) -->
        <table role="presentation" class="email-container" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #FFFFFF; border-radius: 32px; border: 1px solid #E2E8F0; box-shadow: 0 30px 70px -15px rgba(15, 23, 42, 0.08), 0 2px 8px rgba(15, 23, 42, 0.02); overflow: hidden;">
          
          <!-- Apple Intelligence / Holographic Glow Beam Header -->
          <tr>
            <td height="6" style="background: linear-gradient(90deg, #F43F5E 0%, #8B5CF6 28%, #4F46E5 50%, #06B6D4 78%, #10B981 100%); font-size: 0px; line-height: 0px;">&nbsp;</td>
          </tr>

          <!-- Top Brand Bar -->
          <tr>
            <td align="center" style="padding: 34px 40px 16px 40px;" class="mobile-padding">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <!-- Official Logo & Wordmark -->
                  <td align="left" valign="middle">
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                      <tr>
                        <td valign="middle" style="padding-right: 12px;">
                          <!-- Real High-DPI Swapifhy Logo in Glass Pod -->
                          <div style="width: 44px; height: 44px; border-radius: 14px; background: linear-gradient(145deg, #FFFFFF 0%, #F1F5F9 100%); border: 1px solid #E2E8F0; padding: 4px; box-shadow: 0 4px 12px rgba(15, 23, 42, 0.06); display: block;">
                            <img src="https://swapifhy.com/images/features/swapifhy-logo-DPxPDdg-.png" alt="Swapifhy Logo" width="34" height="34" style="display: block; width: 34px; height: 34px; border-radius: 10px; object-fit: contain;" />
                          </div>
                        </td>
                        <td valign="middle">
                          <span style="font-size: 24px; font-weight: 800; color: #0B0F19; letter-spacing: -0.8px; font-family: 'Plus Jakarta Sans', -apple-system, sans-serif; display: inline-block;">
                            Swap<span style="color: #4F46E5;">ifhy</span>
                          </span>
                        </td>
                      </tr>
                    </table>
                  </td>

                  <!-- VIP Cohort Badge -->
                  <td align="right" valign="middle">
                    <div style="display: inline-block; padding: 6px 14px; border-radius: 999px; background: linear-gradient(135deg, #FAF5FF 0%, #EEF2FF 100%); border: 1px solid #DDD6FE; box-shadow: 0 2px 6px rgba(124, 58, 237, 0.06);">
                      <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                        <tr>
                          <td style="font-size: 10.5px; font-weight: 800; letter-spacing: 0.09em; text-transform: uppercase; color: #6D28D9;">
                            ✦ FOUNDING 415
                          </td>
                        </tr>
                      </table>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Hero Announcement Section -->
          <tr>
            <td align="center" style="padding: 16px 40px 28px 40px;" class="mobile-padding">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center">
                    
                    <!-- Luminous Category Capsule -->
                    <div style="display: inline-block; padding: 5px 14px; border-radius: 999px; background: rgba(79, 70, 229, 0.08); border: 1px solid rgba(79, 70, 229, 0.2); margin-bottom: 18px;">
                      <span style="font-size: 11px; font-weight: 700; color: #4338CA; letter-spacing: 0.08em; text-transform: uppercase;">
                        ⚡ MAJOR SYSTEM UPGRADE &bull; v2.0 LIVE
                      </span>
                    </div>

                    <!-- Main Apple Headline -->
                    <h1 class="mobile-hero-title" style="margin: 0 0 16px 0; font-size: 38px; line-height: 44px; font-weight: 800; color: #0B0F19; letter-spacing: -1.2px; font-family: 'Plus Jakarta Sans', -apple-system, sans-serif;">
                      The Future of Skill Exchange <br/>
                      <span style="background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 50%, #2563EB 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; color: #4F46E5;">Has Just Landed.</span>
                    </h1>

                    <!-- Hero Subtitle -->
                    <p class="mobile-hero-sub" style="margin: 0 auto; font-size: 15.5px; line-height: 25px; color: #475569; max-width: 480px; font-weight: 500;">
                      Hi <strong style="color: #0F172A; font-weight: 700;">${displayName}</strong>, as one of our <strong>415 founding pioneers</strong>, we’ve rebuilt Swapifhy from the ground up for you: 10x faster speeds, instant 1-tap mobile skills, and smart AI matching.
                    </p>

                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Apple Wallet / Digital Pass Card (VIP Access Pass) -->
          <tr>
            <td style="padding: 0 40px 32px 40px;" class="mobile-padding">
              
              <!-- Pass Outer Frame with Apple-Style Depth & Border -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background: linear-gradient(180deg, #0F172A 0%, #1E1B4B 100%); border: 1px solid #334155; border-radius: 26px; box-shadow: 0 20px 45px -10px rgba(15, 23, 42, 0.35); overflow: hidden;">
                
                <!-- Card Top Accent Header -->
                <tr>
                  <td style="padding: 24px 28px 18px 28px;" class="mobile-pass-padding">
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td align="left" valign="middle">
                          <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                            <tr>
                              <td valign="middle" style="padding-right: 8px;">
                                <div style="width: 8px; height: 8px; border-radius: 50%; background-color: #10B981; box-shadow: 0 0 10px #10B981;"></div>
                              </td>
                              <td valign="middle">
                                <span style="font-size: 10.5px; font-weight: 800; letter-spacing: 0.12em; text-transform: uppercase; color: #94A3B8; font-family: 'Plus Jakarta Sans', -apple-system, sans-serif;">
                                  VIP FOUNDING ACCESS PASS &bull; COHORT #1
                                </span>
                              </td>
                            </tr>
                          </table>
                        </td>
                        <td align="right" valign="middle">
                          <span style="font-size: 11px; font-weight: 700; color: #38BDF8; font-family: 'JetBrains Mono', monospace; letter-spacing: 0.5px;">
                            PRIORITY TIER
                          </span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Hairline Card Divider -->
                <tr>
                  <td style="padding: 0 28px;" class="mobile-pass-padding">
                    <div style="height: 1px; background: linear-gradient(90deg, rgba(255,255,255,0.05), rgba(255,255,255,0.2), rgba(255,255,255,0.05)); width: 100%;"></div>
                  </td>
                </tr>

                <!-- Credential Values Area -->
                <tr>
                  <td style="padding: 22px 28px 26px 28px;" class="mobile-pass-padding">
                    
                    <!-- Member Name Badge -->
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 16px;">
                      <tr>
                        <td>
                          <div style="font-size: 10.5px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #94A3B8; margin-bottom: 4px;">
                            FOUNDING CITIZEN
                          </div>
                          <div style="font-size: 20px; font-weight: 800; color: #FFFFFF; letter-spacing: -0.4px;">
                            ${displayName}
                          </div>
                        </td>
                      </tr>
                    </table>

                    <!-- Glass Sub-Cards for Email and Password -->
                    <!-- Email Sub-Card -->
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 10px; background: rgba(255, 255, 255, 0.07); border: 1px solid rgba(255, 255, 255, 0.12); border-radius: 14px; padding: 12px 16px;">
                      <tr>
                        <td width="38%" style="font-size: 12px; color: #94A3B8; font-weight: 600;">Registered Email</td>
                        <td align="right" style="font-size: 13.5px; color: #FFFFFF; font-weight: 600; font-family: 'JetBrains Mono', monospace;">${displayEmail}</td>
                      </tr>
                    </table>

                    <!-- Temp Password Sub-Card -->
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 22px; background: rgba(255, 255, 255, 0.07); border: 1px solid rgba(255, 255, 255, 0.12); border-radius: 14px; padding: 12px 16px;">
                      <tr>
                        <td width="38%" style="font-size: 12px; color: #94A3B8; font-weight: 600;">One-Time Passcode</td>
                        <td align="right">
                          <span style="display: inline-block; background: linear-gradient(135deg, #4F46E5 0%, #6366F1 100%); border: 1px solid #818CF8; padding: 5px 14px; border-radius: 8px; font-size: 14px; color: #FFFFFF; font-weight: 800; font-family: 'JetBrains Mono', monospace; letter-spacing: 1.5px; box-shadow: 0 2px 8px rgba(79, 70, 229, 0.4);">
                            ${displayPass}
                          </span>
                        </td>
                      </tr>
                    </table>

                    <!-- Apple Luminescent Access Button -->
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td align="center">
                          <a href="https://swapifhy.com/auth" class="mobile-btn" target="_blank" style="display: block; width: 100%; background: #FFFFFF; color: #0F172A; font-size: 15px; font-weight: 800; text-align: center; text-decoration: none; padding: 16px 28px; border-radius: 14px; box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25); letter-spacing: -0.2px; font-family: 'Plus Jakarta Sans', -apple-system, sans-serif;">
                            ✦ Log In &amp; Claim Founding Account &rarr;
                          </a>
                        </td>
                      </tr>
                    </table>

                    <!-- Micro Security Label -->
                    <div style="margin-top: 14px; text-align: center; font-size: 11.5px; color: #94A3B8; font-weight: 500;">
                      🔒 Instant 1-click activation &bull; Update password anytime in Settings
                    </div>

                  </td>
                </tr>

              </table>
            </td>
          </tr>

          <!-- Subtle Divider -->
          <tr>
            <td style="padding: 0 40px;" class="mobile-padding">
              <div style="height: 1px; background-color: #E2E8F0; width: 100%;"></div>
            </td>
          </tr>

          <!-- What's New Title -->
          <tr>
            <td style="padding: 34px 40px 18px 40px;" class="mobile-padding">
              <div style="display: inline-block; padding: 4px 10px; border-radius: 6px; background-color: #F1F5F9; color: #475569; font-size: 10.5px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 8px;">
                ENGINEERED WITH DIRECT TESTER FEEDBACK
              </div>
              <h2 style="margin: 0 0 6px 0; font-size: 23px; font-weight: 800; color: #0B0F19; letter-spacing: -0.6px; font-family: 'Plus Jakarta Sans', -apple-system, sans-serif;">
                Built for speed. Designed for mastery.
              </h2>
              <p style="margin: 0; font-size: 14px; color: #64748B; line-height: 22px; font-weight: 500;">
                Every interaction was rebuilt to give you an effortless, instant experience:
              </p>
            </td>
          </tr>

          <!-- Apple Bento Grid 2.0 (2x2 Cards) -->
          <tr>
            <td style="padding: 0 40px 30px 40px;" class="mobile-padding">
              
              <!-- Bento Row 1 -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 12px;">
                <tr>
                  <!-- Card 1: 10x Faster Speeds -->
                  <td class="mobile-bento" width="48%" valign="top" style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 20px; padding: 22px 20px; box-shadow: 0 2px 6px rgba(15, 23, 42, 0.02);">
                    <div style="width: 36px; height: 36px; border-radius: 11px; background: linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%); text-align: center; line-height: 36px; font-size: 18px; margin-bottom: 12px; box-shadow: 0 3px 8px rgba(245, 158, 11, 0.15);">
                      ⚡
                    </div>
                    <h3 style="margin: 0 0 6px 0; font-size: 15.5px; font-weight: 800; color: #0F172A; letter-spacing: -0.3px;">
                      10x Faster Speeds
                    </h3>
                    <p style="margin: 0; font-size: 13px; line-height: 20px; color: #64748B; font-weight: 500;">
                      Database caching &amp; hardware acceleration. Network, Feed, and Matches now load with sub-second, zero-lag response.
                    </p>
                  </td>
                  
                  <td width="4%" class="mobile-bento" style="font-size: 0px; line-height: 0px;">&nbsp;</td>

                  <!-- Card 2: 1-Tap Mobile Selection -->
                  <td class="mobile-bento" width="48%" valign="top" style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 20px; padding: 22px 20px; box-shadow: 0 2px 6px rgba(15, 23, 42, 0.02);">
                    <div style="width: 36px; height: 36px; border-radius: 11px; background: linear-gradient(135deg, #E0E7FF 0%, #C7D2FE 100%); text-align: center; line-height: 36px; font-size: 18px; margin-bottom: 12px; box-shadow: 0 3px 8px rgba(79, 70, 229, 0.15);">
                      📱
                    </div>
                    <h3 style="margin: 0 0 6px 0; font-size: 15.5px; font-weight: 800; color: #0F172A; letter-spacing: -0.3px;">
                      1-Tap Skill Selection
                    </h3>
                    <p style="margin: 0; font-size: 13px; line-height: 20px; color: #64748B; font-weight: 500;">
                      Redesigned mobile onboarding: Tap curated skill chips (Python, UI/UX, AI, Music) to complete setup in under 30 seconds.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Bento Row 2 -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <!-- Card 3: Smart AI Matchmaking -->
                  <td class="mobile-bento" width="48%" valign="top" style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 20px; padding: 22px 20px; box-shadow: 0 2px 6px rgba(15, 23, 42, 0.02);">
                    <div style="width: 36px; height: 36px; border-radius: 11px; background: linear-gradient(135deg, #FCE7F3 0%, #FBCFE8 100%); text-align: center; line-height: 36px; font-size: 18px; margin-bottom: 12px; box-shadow: 0 3px 8px rgba(236, 72, 153, 0.15);">
                      🎯
                    </div>
                    <h3 style="margin: 0 0 6px 0; font-size: 15.5px; font-weight: 800; color: #0F172A; letter-spacing: -0.3px;">
                      Smart AI Matchmaking
                    </h3>
                    <p style="margin: 0; font-size: 13px; line-height: 20px; color: #64748B; font-weight: 500;">
                      Our recommendation algorithm pairs you with peers based on genuine skill synergy: learn what you want from vetted creators.
                    </p>
                  </td>
                  
                  <td width="4%" class="mobile-bento" style="font-size: 0px; line-height: 0px;">&nbsp;</td>

                  <!-- Card 4: Live Push Notifications -->
                  <td class="mobile-bento" width="48%" valign="top" style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 20px; padding: 22px 20px; box-shadow: 0 2px 6px rgba(15, 23, 42, 0.02);">
                    <div style="width: 36px; height: 36px; border-radius: 11px; background: linear-gradient(135deg, #D1FAE5 0%, #A7F3D0 100%); text-align: center; line-height: 36px; font-size: 18px; margin-bottom: 12px; box-shadow: 0 3px 8px rgba(16, 185, 129, 0.15);">
                      🔔
                    </div>
                    <h3 style="margin: 0 0 6px 0; font-size: 15.5px; font-weight: 800; color: #0F172A; letter-spacing: -0.3px;">
                      Live Notifications
                    </h3>
                    <p style="margin: 0; font-size: 13px; line-height: 20px; color: #64748B; font-weight: 500;">
                      Never miss a message, swap proposal, or scheduled session with instant real-time socket alerts on mobile and desktop.
                    </p>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Modern Stats / 100,000 Milestone Banner -->
          <tr>
            <td style="padding: 0 40px 32px 40px;" class="mobile-padding">
              <div style="background: linear-gradient(135deg, #F8FAFC 0%, #EFF6FF 100%); border: 1.5px dashed #BFDBFE; border-radius: 22px; padding: 24px 26px; text-align: center;">
                <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; color: #2563EB; margin-bottom: 6px;">
                  🚀 THE ROAD TO PUBLIC LAUNCH
                </div>
                <h3 style="margin: 0 0 8px 0; font-size: 19px; font-weight: 800; color: #0F172A; letter-spacing: -0.4px;">
                  Gearing up for 100,000+ (1 Lakh+) Members
                </h3>
                <p style="margin: 0 0 16px 0; font-size: 13.5px; line-height: 22px; color: #475569; font-weight: 500;">
                  Our servers are being scaled for public rollout. As a member of our <strong>415 Founding Cohort</strong>, you enjoy lifetime VIP status, highest match priority, and exclusive early feature drops.
                </p>

                <!-- Stats 3-Column Pill Strip -->
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 14px; padding: 12px 6px;">
                  <tr>
                    <td class="mobile-stat-col" width="33.33%" align="center" style="border-right: 1px solid #F1F5F9; padding: 6px 10px;">
                      <div style="font-size: 18px; font-weight: 800; color: #4F46E5; font-family: 'JetBrains Mono', monospace;">415</div>
                      <div style="font-size: 11px; color: #64748B; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">Founding VIPs</div>
                    </td>
                    <td class="mobile-stat-col" width="33.33%" align="center" style="border-right: 1px solid #F1F5F9; padding: 6px 10px;">
                      <div style="font-size: 18px; font-weight: 800; color: #0F172A; font-family: 'JetBrains Mono', monospace;">&lt; 30s</div>
                      <div style="font-size: 11px; color: #64748B; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">Setup Time</div>
                    </td>
                    <td class="mobile-stat-col" width="33.33%" align="center" style="padding: 6px 10px;">
                      <div style="font-size: 18px; font-weight: 800; color: #10B981; font-family: 'JetBrains Mono', monospace;">FREE</div>
                      <div style="font-size: 11px; color: #64748B; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">Lifetime VIP</div>
                    </td>
                  </tr>
                </table>
              </div>
            </td>
          </tr>

          <!-- 3-Step Simple Flow -->
          <tr>
            <td style="padding: 0 40px 34px 40px;" class="mobile-padding">
              <h3 style="margin: 0 0 16px 0; font-size: 16.5px; font-weight: 800; color: #0F172A; letter-spacing: -0.3px;">
                Get started in 3 simple steps:
              </h3>
              
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td valign="top" width="34" style="padding-bottom: 12px;">
                    <span style="display: inline-block; width: 24px; height: 24px; line-height: 24px; text-align: center; border-radius: 50%; background-color: #0F172A; color: #FFFFFF; font-size: 11.5px; font-weight: 800;">1</span>
                  </td>
                  <td valign="top" style="font-size: 14px; line-height: 22px; color: #475569; padding-bottom: 12px; font-weight: 500;">
                    <strong style="color: #0F172A; font-weight: 700;">Sign In:</strong> Log in with your registered email and temporary passcode above.
                  </td>
                </tr>
                <tr>
                  <td valign="top" width="34" style="padding-bottom: 12px;">
                    <span style="display: inline-block; width: 24px; height: 24px; line-height: 24px; text-align: center; border-radius: 50%; background-color: #0F172A; color: #FFFFFF; font-size: 11.5px; font-weight: 800;">2</span>
                  </td>
                  <td valign="top" style="font-size: 14px; line-height: 22px; color: #475569; padding-bottom: 12px; font-weight: 500;">
                    <strong style="color: #0F172A; font-weight: 700;">Pick Skills:</strong> Tap 1 skill you can share and 1 skill you want to learn.
                  </td>
                </tr>
                <tr>
                  <td valign="top" width="34">
                    <span style="display: inline-block; width: 24px; height: 24px; line-height: 24px; text-align: center; border-radius: 50%; background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%); color: #FFFFFF; font-size: 11.5px; font-weight: 800;">3</span>
                  </td>
                  <td valign="top" style="font-size: 14px; line-height: 22px; color: #475569; font-weight: 500;">
                    <strong style="color: #0F172A; font-weight: 700;">Connect &amp; Learn:</strong> Chat with matched creators and schedule your first swap.
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Big Primary Call to Action Button -->
          <tr>
            <td align="center" style="padding: 0 40px 40px 40px;" class="mobile-padding">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center">
                    <a href="https://swapifhy.com/auth" class="mobile-btn" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #4F46E5 0%, #6366F1 100%); color: #FFFFFF; font-size: 16px; font-weight: 800; text-align: center; text-decoration: none; padding: 16px 42px; border-radius: 999px; box-shadow: 0 10px 25px rgba(79, 70, 229, 0.35); letter-spacing: -0.2px; font-family: 'Plus Jakarta Sans', -apple-system, sans-serif;">
                      🚀 Enter Swapifhy Now &rarr;
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Minimalist Apple Footer -->
          <tr>
            <td style="background-color: #FAFAFC; border-top: 1px solid #EDEEF2; padding: 30px 40px; text-align: center;" class="mobile-padding">
              <p style="margin: 0 0 8px 0; font-size: 13px; font-weight: 700; color: #0F172A;">
                Swapifhy &bull; The Modern Skill Exchange Network
              </p>
              <p style="margin: 0 0 14px 0; font-size: 12px; line-height: 19px; color: #64748B; font-weight: 500;">
                You received this exclusive invitation because you are one of the 415 founding members on the Swapifhy waitlist.<br>
                Questions or feedback? Reply directly to this email—our core team reads every single note.
              </p>
              <p style="margin: 0; font-size: 12px; color: #64748B;">
                <a href="https://swapifhy.com" style="color: #4F46E5; text-decoration: none; margin: 0 8px; font-weight: 600;">Website</a> &bull;
                <a href="https://swapifhy.com/help" style="color: #4F46E5; text-decoration: none; margin: 0 8px; font-weight: 600;">Help Center</a> &bull;
                <a href="https://tally.so/r/GxbXkk" style="color: #4F46E5; text-decoration: none; margin: 0 8px; font-weight: 600;">Feedback Form</a>
              </p>
            </td>
          </tr>

        </table>
        <!-- End Main Container -->

      </td>
    </tr>
  </table>

</body>
</html>
`;
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

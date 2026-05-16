export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';

// ============================================================
// ENV VARIABLESAC
// ============================================================

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID!;

const SMTP_USER = process.env.SMTP_USER!;
const SMTP_PASS = process.env.SMTP_PASS!;
const EMAIL_TO = process.env.EMAIL_TO!;

// ============================================================
// TELEGRAM NOTIFICATION
// ============================================================

async function sendTelegram(data: Record<string, string>) {
    try {
        const message = `
🚀 NEW ENHANZERS CONTACT FORM

👤 Name: ${data.name}
📧 Email: ${data.email}
📞 Phone: ${data.phone || 'Not provided'}

💬 Message:
${data.message}

⏰ Time: ${data.timestamp}

Immediate follow-up recommended!
        `.trim();

        const response = await fetch(
            `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    chat_id: CHAT_ID,
                    text: message,
                }),
            }
        );

        if (!response.ok) {
            console.error(
                '❌ Telegram API Error:',
                await response.text()
            );
        } else {
            console.log('✅ Telegram notification sent');
        }
    } catch (error) {
        console.error('❌ Telegram send error:', error);
    }
}

// ============================================================
// EMAIL NOTIFICATION
// ============================================================

async function sendEmail(data: Record<string, string>) {
    try {
        const nodemailer = await import('nodemailer');

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: SMTP_USER,
                pass: SMTP_PASS,
            },
        });

        const subject = `✨ New Enhanzers Contact: ${data.name}`;

        const body = `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        ENHANZERS CONTACT FORM
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

👤 Name:
${data.name}

📧 Email:
${data.email}

📞 Phone:
${data.phone || 'Not provided'}

⏰ Time:
${data.timestamp}

💬 Message:
${data.message}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Source: enhanzers.com
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        `.trim();

        await transporter.sendMail({
            from: `"Enhanzers Website" <${SMTP_USER}>`,
            to: EMAIL_TO,
            subject,
            text: body,
            replyTo: data.email,
        });

        console.log('✅ Email notification sent');
    } catch (error) {
        console.error('❌ Email send error:', error);
    }
}

// ============================================================
// MAIN POST HANDLER
// ============================================================

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const name = (body.name || '').trim();
        const email = (body.email || '').trim();
        const message = (body.message || '').trim();
        const phone = (body.phone || '').trim();

        // ====================================================
        // VALIDATION
        // ====================================================

        if (!name || !email || !message) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        'Please fill all required fields.',
                },
                { status: 400 }
            );
        }

        const emailRegex =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email)) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        'Please enter a valid email address.',
                },
                { status: 400 }
            );
        }

        // ====================================================
        // CONTACT DATA
        // ====================================================

        const contactData = {
            timestamp: new Date().toLocaleString(
                'en-IN',
                {
                    timeZone: 'Asia/Kolkata',
                }
            ),
            name,
            email,
            phone,
            message,
        };

        // ====================================================
        // FIRE & FORGET NOTIFICATIONS
        // ====================================================

        await Promise.all([
     sendTelegram(contactData),
     sendEmail(contactData),
        ]);

        console.log(
            `✅ New submission from ${name} (${email})`
        );

        return NextResponse.json(
            {
                success: true,
                message:
                    "Thank you for reaching out! We'll get back to you soon.",
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('❌ API Route Error:', error);

        return NextResponse.json(
            {
                success: false,
                message:
                    'Server error. Please try again later.',
            },
            { status: 500 }
        );
    }
}

// ============================================================
// OPTIONS HANDLER
// ============================================================

export async function OPTIONS() {
    return new NextResponse(null, {
        status: 204,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods':
                'POST, OPTIONS',
            'Access-Control-Allow-Headers':
                'Content-Type',
        },
    });
}
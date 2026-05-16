import { NextRequest, NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';

// ============================================================
// CONFIGURATION
// ============================================================
const BOT_TOKEN = '8197066589:AAF8z4Q_cCzwYq6E6_k7KXYRA5Y0pHF5Cs4';
const CHAT_ID = '1308376680';

const SMTP_USER = 'enhanzers.devuse@gmail.com';
const SMTP_PASS = 'gnnwlxxmmgegrblg';
const EMAIL_TO = 'yogeshsenthil142@gmail.com';

// ============================================================
// HELPER FUNCTIONS
// ============================================================

/**
 * Sends a Telegram notification
 */
async function sendTelegram(data: Record<string, string>) {
    try {
        const message = `
🚀 NEW ENHANZERS CONTACT FORM

👤 Name: ${data.name}
📧 Email: ${data.email}
📞 Phone: ${data.phone || 'Not provided'}
💬 Message: ${data.message}
⏰ Time: ${data.timestamp}

Immediate follow-up recommended!
        `.trim();

        const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: CHAT_ID,
                text: message,
                parse_mode: 'HTML'
            }),
        });

        if (!response.ok) {
            console.error('Telegram API error:', await response.text());
        } else {
            console.log('✅ Telegram notification sent');
        }
    } catch (error) {
        console.error('❌ Telegram send error:', error);
    }
}

/**
 * Sends an email notification using Nodemailer
 */
async function sendEmail(data: Record<string, string>) {
    try {
        // Dynamic import for nodemailer (works in Next.js edge/lambda)
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
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                    ENHANZERS CONTACT FORM
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 SUBMISSION DETAILS:
───────────────────────────────────────────────────────────
👤 Name:     ${data.name}
📧 Email:    ${data.email}
📞 Phone:    ${data.phone || 'Not provided'}
⏰ Time:     ${data.timestamp}
───────────────────────────────────────────────────────────

💬 MESSAGE:
───────────────────────────────────────────────────────────
${data.message}
───────────────────────────────────────────────────────────

🌐 Source: Enhanzers Agency Website (enhanzers.com)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Team Enhanzers - Where vision meets precision.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        `.trim();

        await transporter.sendMail({
            from: `"Enhanzers Website" <${SMTP_USER}>`,
            to: EMAIL_TO,
            subject: subject,
            text: body,
            replyTo: data.email,
        });

        console.log('✅ Email notification sent');
    } catch (error) {
        console.error('❌ Email send error:', error);
    }
}

/**
 * Saves form data to a JSON file in the data directory
 */
function saveToFile(data: Record<string, string>) {
    try {
        const now = new Date();
        const year = now.getFullYear().toString();
        const monthNum = String(now.getMonth() + 1).padStart(2, '0');
        const monthName = now.toLocaleString('default', { month: 'long' });

        // Create directory: data/YYYY/
        const dir = path.join(process.cwd(), 'data', year);
        fs.mkdirSync(dir, { recursive: true });

        // File: data/YYYY/MM_Month.json
        const filepath = path.join(dir, `${monthNum}_${monthName}.json`);
        
        // Create entry with metadata
        const entry = {
            id: Date.now().toString(),
            timestamp: data.timestamp,
            name: data.name,
            email: data.email,
            phone: data.phone || '',
            message: data.message,
            source: 'enhanzers_website',
            userAgent: data.userAgent || 'unknown',
            ipHash: data.ipHash || 'unknown',
        };

        // Append as JSON line
        fs.appendFileSync(filepath, JSON.stringify(entry) + '\n', 'utf-8');
        console.log(`✅ Data saved to ${filepath}`);
    } catch (error) {
        console.error('❌ File save error:', error);
    }
}

/**
 * Simple hash for IP address (privacy-friendly)
 */
function simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return Math.abs(hash).toString(16);
}

// ============================================================
// MAIN POST HANDLER
// ============================================================

export async function POST(request: NextRequest) {
    try {
        // Parse request body
        const body = await request.json();

        // Validate required fields
        const name = (body.name || '').trim();
        const email = (body.email || '').trim();
        const message = (body.message || '').trim();
        const phone = (body.phone || '').trim();

        if (!name || !email || !message) {
            return NextResponse.json(
                { 
                    success: false, 
                    message: 'Please fill all required fields (Name, Email, Message).' 
                },
                { status: 400 }
            );
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { success: false, message: 'Please enter a valid email address.' },
                { status: 400 }
            );
        }

        // Get client IP (for logging, hashed for privacy)
        const forwardedFor = request.headers.get('x-forwarded-for');
        const clientIp = forwardedFor ? forwardedFor.split(',')[0] : 'unknown';
        const ipHash = simpleHash(clientIp);

        // Prepare data object
        const contactData = {
            timestamp: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
            name,
            email,
            phone,
            message,
            ipHash,
            userAgent: request.headers.get('user-agent') || 'unknown',
        };

        // 1. Save to file (synchronous, fast)
        saveToFile(contactData);

        // 2. Fire-and-forget notifications (don't block response)
        Promise.all([
            sendTelegram(contactData),
            sendEmail(contactData),
        ]).catch(err => console.error('Notification error:', err));

        // 3. Return success immediately
        console.log(`✅ New submission from ${name} (${email})`);
        
        return NextResponse.json(
            { 
                success: true, 
                message: "Thank you for reaching out! We'll get back to you within 24 hours." 
            },
            { status: 200 }
        );

    } catch (error) {
        console.error('❌ API route error:', error);
        return NextResponse.json(
            { 
                success: false, 
                message: 'Server error. Please try again or contact us directly.' 
            },
            { status: 500 }
        );
    }
}

// ============================================================
// OPTIONS HANDLER (for CORS preflight)
// ============================================================

export async function OPTIONS() {
    return new NextResponse(null, {
        status: 204,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        },
    });
}
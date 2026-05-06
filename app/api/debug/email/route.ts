import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function GET() {
    // Manually read from env to see what's being picked up
    const config = {
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS ? '********' : 'MISSING',
        url: process.env.NEXT_PUBLIC_APP_URL
    };

    try {
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: parseInt(process.env.SMTP_PORT || '587'),
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
            // Increase timeout for diagnostic
            connectionTimeout: 10000, 
            greetingTimeout: 10000,
        });

        // 1. Test Connection
        console.log('Testing SMTP connection...');
        await transporter.verify();
        
        // 2. Try sending a test email to the configured user
        if (process.env.SMTP_USER) {
            await transporter.sendMail({
                from: `"StayUniKL Debug" <${process.env.SMTP_USER}>`,
                to: process.env.SMTP_USER,
                subject: 'StayUniKL SMTP Connection Test',
                text: 'This is a test email to verify your SMTP settings. If you received this, your email configuration is working!',
                html: '<b>SMTP Test Successful!</b><p>Your StayUniKL system can now send emails.</p>'
            });
        }

        return NextResponse.json({
            success: true,
            message: 'SMTP connection verified and test email sent to yourself!',
            config
        });

    } catch (error: any) {
        console.error('SMTP Diagnostic Error:', error);
        return NextResponse.json({
            success: false,
            error: error.message,
            code: error.code,
            command: error.command,
            config
        }, { status: 500 });
    }
}

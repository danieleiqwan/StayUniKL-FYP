import nodemailer from 'nodemailer';

// You will need to add these to your .env.local file:
// SMTP_HOST=smtp.gmail.com
// SMTP_PORT=587
// SMTP_USER=your_email@gmail.com
// SMTP_PASS=your_app_password
// ADMIN_EMAIL=admin@stayunikl.com
// 
// Note for Gmail: You must generate an "App Password" in your Google Account Security settings.
// Do not use your regular Gmail password.

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

/**
 * Sends an urgent alert email to the administrator when a critical system error occurs.
 */
export const sendCriticalErrorAlert = async (error: any, context: { path: string; userId?: string; details?: any }) => {
    const adminEmail = process.env.ADMIN_EMAIL;
    
    if (!adminEmail || !process.env.SMTP_USER) {
        console.warn('⚠️ ALERT SYSTEM: ADMIN_EMAIL or SMTP_USER not set. Alert logged to console instead:');
        console.error(`[CRITICAL ERROR ALERT] Path: ${context.path}`, error);
        return;
    }

    const errorStack = error instanceof Error ? error.stack : 'No stack trace available';
    const errorMessage = error instanceof Error ? error.message : String(error);

    const mailOptions = {
        from: `"StayUniKL System Monitor" <${process.env.SMTP_USER}>`,
        to: adminEmail,
        subject: `🚨 CRITICAL ERROR: StayUniKL Production (${context.path})`,
        priority: 'high' as const,
        html: `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 20px; background-color: #fff1f2; border: 2px solid #e11d48; border-radius: 12px;">
                <h2 style="color: #be123c; margin-top: 0; display: flex; align-items: center;">
                    <span style="font-size: 24px; margin-right: 10px;">🚨</span> 
                    Critical System Error Detected
                </h2>
                <div style="background-color: white; padding: 20px; border-radius: 8px; box-shadow: 0 4px 6px rgba(190, 18, 60, 0.1);">
                    <p style="margin: 0 0 10px 0;"><strong>Error Message:</strong> <span style="color: #e11d48; font-family: monospace;">${errorMessage}</span></p>
                    <p style="margin: 0 0 10px 0;"><strong>Timestamp:</strong> ${new Date().toLocaleString()}</p>
                    <p style="margin: 0 0 10px 0;"><strong>Impacted Path:</strong> <code>${context.path}</code></p>
                    <p style="margin: 0 0 10px 0;"><strong>User ID:</strong> ${context.userId || 'Guest/System'}</p>
                    
                    <h4 style="color: #475569; margin: 20px 0 10px 0; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px;">Error Details / Stack Trace</h4>
                    <pre style="background-color: #1e293b; color: #f1f5f9; padding: 15px; border-radius: 6px; font-size: 11px; overflow-x: auto; line-height: 1.4;">${errorStack}</pre>
                    
                    ${context.details ? `
                        <h4 style="color: #475569; margin: 20px 0 10px 0; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px;">Contextual Data</h4>
                        <pre style="background-color: #f8fafc; color: #334155; padding: 15px; border-radius: 6px; font-size: 11px; border: 1px solid #e2e8f0;">${JSON.stringify(context.details, null, 2)}</pre>
                    ` : ''}
                </div>
                <p style="color: #9f1239; font-size: 11px; margin-top: 15px; text-align: center;">
                    This is an automated alert from the StayUniKL monitoring system. Please investigate immediately.
                </p>
            </div>
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`[Alert System] Critical error alert sent to ${adminEmail}`);
    } catch (alertError) {
        console.error('[Alert System] Failed to send email alert:', alertError);
    }
};

export const sendPasswordResetEmail = async (to: string, resetLink: string) => {
    // If SMTP_USER is not configured, we just log a warning instead of crashing
    if (!process.env.SMTP_USER) {
        console.warn('\n⚠️ SMTP_USER is not set in .env. Email will not be sent over network.');
        console.warn('⚠️ Logged link to console instead for development:\n');
        console.log(`=== PASSWORD RESET LINK ===\nTo reset password for ${to}, go to:\n${resetLink}\n===========================\n`);
        return;
    }

    const mailOptions = {
        from: `"StayUniKL Support" <${process.env.SMTP_USER}>`,
        to,
        subject: 'StayUniKL - Password Reset Request',
        text: `You requested a password reset for your StayUniKL account.\n\nPlease click the following link to securely reset your password:\n\n${resetLink}\n\nIf you did not request this, please ignore this email. This link will expire in 15 minutes.`,
        html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; background-color: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0;">
                <h2 style="color: #0f172a; text-align: center;">Stay<span style="color: #F26C22;">UniKL</span></h2>
                <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                    <h3 style="color: #1e293b; margin-top: 0;">Password Reset Request</h3>
                    <p style="color: #475569; line-height: 1.6;">You recently requested to reset the password for your StayUniKL account. Click the button below to securely set a new password.</p>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${resetLink}" style="background-color: #F26C22; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Reset Password</a>
                    </div>
                    
                    <p style="color: #64748b; font-size: 14px; line-height: 1.5;">If you're having trouble clicking the button, copy and paste this URL into your browser:</p>
                    <p style="word-break: break-all; color: #3b82f6; font-size: 13px;">${resetLink}</p>
                    
                    <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0 20px;" />
                    <p style="color: #94a3b8; font-size: 12px; text-align: center;">If you did not request this email, you can safely ignore it. This link will expire in 15 minutes.</p>
                </div>
            </div>
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Password reset email successfully sent to ${to}`);
    } catch (error) {
        console.error('Error sending password reset email:', error);
        throw error;
    }
};

export const sendPaymentReminderEmail = async (to: string, name: string, invoiceId: string, amount: number, dueDate: string) => {
    if (!process.env.SMTP_USER) {
        console.warn('⚠️ SMTP_USER is not set. Email will not be sent over network.');
        return { success: false, error: 'SMTP not configured' };
    }

    const formattedAmount = new Intl.NumberFormat('en-MY', { style: 'currency', currency: 'MYR' }).format(amount);
    
    const htmlContent = `
    <div style="font-family: 'Inter', Arial, sans-serif; max-w-2xl mx-auto p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
        <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="color: #F26C22; margin: 0; font-size: 24px; font-weight: 900; letter-spacing: -0.5px;">StayUniKL</h1>
            <p style="color: #64748B; margin-top: 4px; font-size: 14px; font-weight: 500; text-transform: uppercase; letter-spacing: 1px;">Hostel Management System</p>
        </div>
        
        <div style="background-color: #FFFBEB; border-left: 4px solid #F59E0B; padding: 16px; margin-bottom: 24px; border-radius: 0 8px 8px 0;">
            <h2 style="color: #B45309; margin: 0 0 8px 0; font-size: 18px;">Payment Reminder</h2>
            <p style="color: #92400E; margin: 0; font-size: 14px;">This is an automated reminder regarding an outstanding invoice on your account.</p>
        </div>

        <p style="color: #334155; font-size: 16px; line-height: 1.5;">Dear <strong>${name}</strong>,</p>
        
        <p style="color: #334155; font-size: 16px; line-height: 1.5;">Please be advised that invoice <strong>#${invoiceId}</strong> for the amount of <strong style="color: #E11D48;">${formattedAmount}</strong> was due on <strong>${new Date(dueDate).toLocaleDateString()}</strong>.</p>
        
        <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; padding: 20px; border-radius: 8px; margin: 24px 0; text-align: center;">
            <p style="margin: 0 0 16px 0; color: #475569; font-size: 14px;">To avoid any disruption to your hostel services, please settle this payment as soon as possible.</p>
            <a href="https://stayunikl.vercel.app/dashboard" style="display: inline-block; background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 14px;">Pay Now via Portal</a>
        </div>
        
        <p style="color: #64748B; font-size: 14px; line-height: 1.5;">If you have already made this payment, please disregard this email or contact the administration office if the payment is not reflected in your account.</p>
        
        <hr style="border: none; border-top: 1px solid #E2E8F0; margin: 24px 0;" />
        
        <p style="color: #94A3B8; font-size: 12px; text-align: center;">
            This is an automated message generated by the StayUniKL system. Please do not reply directly to this email.
        </p>
    </div>
    `;

    try {
        const info = await transporter.sendMail({
            from: `"StayUniKL Administration" <${process.env.SMTP_USER}>`,
            to,
            subject: `Action Required: Payment Reminder for Invoice #${invoiceId}`,
            html: htmlContent,
        });
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('[Email Error] Failed to send payment reminder:', error);
        return { success: false, error };
    }
};

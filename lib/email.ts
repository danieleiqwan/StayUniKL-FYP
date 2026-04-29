import nodemailer from 'nodemailer';

// You will need to add these to your .env.local file:
// SMTP_HOST=smtp.gmail.com
// SMTP_PORT=587
// SMTP_USER=your_email@gmail.com
// SMTP_PASS=your_app_password
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

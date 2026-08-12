import { BrevoClient } from "@getbrevo/brevo";
import ApiError from "../utils/ApiError.js";

import verificationEmailTemplate from "../templates/emails/verification-email.template.js";
import loginOTPTemplate from "../templates/emails/login-otp.template.js";
import resetPasswordTemplate from "../templates/emails/reset-password.template.js";

const brevo = new BrevoClient({
    apiKey: process.env.BREVO_API_KEY,
});

const sendEmail = async ({ to, name, subject, htmlContent }) => {
    const emailData = {
        sender: {
            name: process.env.EMAIL_FROM_NAME,
            email: process.env.EMAIL_FROM_EMAIL
        },

        to: [
            {
                email: to,
                name: name,
            }
        ],

        subject,

        htmlContent,
    }

    try {
        await brevo.transactionalEmails.sendTransacEmail(emailData);
    } catch (error) {

        throw new ApiError(500, "Failed to send email")
    }
}

export const sendVerificationOTP = async (email, otp, fullname) => {
    const subject = "Verify Your Email"
    const htmlContent = verificationEmailTemplate(fullname, otp)
    await sendEmail({
        to: email,
        name: fullname,
        subject,
        htmlContent
    })
}


export const sendLoginOTP = async (email, otp, fullname) => {
    const subject = "Your NeuAspire Login Code"
    const htmlContent = loginOTPTemplate(fullname, otp)
    await sendEmail({
        to: email,
        name: fullname,
        subject,
        htmlContent
    })
}
export const sendPasswordResetOTP = async (email, otp, fullname) => {
    const subject = "Reset Your NeuAspire Password"
    const htmlContent = resetPasswordTemplate(fullname, otp)
    await sendEmail({
        to: email,
        name: fullname,
        subject,
        htmlContent
    })
}
import emailLayout from "./layout.template.js";

const loginOTPTemplate = (fullname, otp) => {
    return emailLayout({
        title: "Login Verification",
        subtitle: "Use the OTP below to securely sign in to your account.",
        fullname,
        otp,
    });
};

export default loginOTPTemplate;
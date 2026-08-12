import emailLayout from "./layout.template.js";

const resetPasswordTemplate = (fullname, otp) => {
    return emailLayout({
        title: "Reset Your Password",
        subtitle: "Use the OTP below to reset your account password.",
        fullname,
        otp,
    });
};

export default resetPasswordTemplate;
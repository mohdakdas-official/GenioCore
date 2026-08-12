import emailLayout from "./layout.template.js";

const verificationEmailTemplate = (fullname, otp) => {
    return emailLayout({
        title: "Verify Your Email",
        subtitle: "Use the code below to verify your account.",
        fullname,
        otp,
    });
};

export default verificationEmailTemplate;
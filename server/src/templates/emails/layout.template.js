const emailLayout = ({
  title,
  subtitle,
  fullname,
  otp,
}) => {
  return `
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${title}</title>
    <style>
      /* Core Reset */
      body {
        margin: 0;
        padding: 0;
        background-color: #f8fafc;
        font-family:
          -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica,
          Arial, sans-serif;
        color: #0f172a;
        -webkit-font-smoothing: antialiased;
      }
      table {
        border-collapse: collapse;
        width: 100%;
      }

      /* Container */
      .email-wrapper {
        width: 100%;
        background-color: #f8fafc;
        padding: 40px 16px;
      }
      .email-card {
        max-width: 560px;
        margin: 0 auto;
        background-color: #ffffff;
        border-radius: 12px;
        border: 1px solid #e2e8f0;
        box-shadow:
          0 4px 6px -1px rgba(0, 0, 0, 0.05),
          0 2px 4px -2px rgba(0, 0, 0, 0.05);
        overflow: hidden;
      }

      /* Top Accent Line */
      .top-bar {
        height: 4px;
        background: linear-gradient(90deg, #2563eb, #3b82f6);
      }

      /* Header Section */
      .header {
        padding: 32px 32px 16px 32px;
        text-align: left;
      }

      /* Hero / Title Section */
      .hero {
        padding: 0 32px 16px 32px;
      }
      .hero-title {
        font-size: 22px;
        font-weight: 700;
        color: #0f172a;
        margin: 0 0 6px 0;
        letter-spacing: -0.3px;
      }
      .hero-subtitle {
        font-size: 14px;
        color: #64748b;
        margin: 0;
        line-height: 1.5;
      }

      /* Divider */
      .divider {
        height: 1px;
        background-color: #f1f5f9;
        margin: 16px 32px;
      }

      /* Content Body */
      .content {
        padding: 8px 32px 32px 32px;
      }
      .greeting {
        font-size: 15px;
        font-weight: 600;
        color: #1e293b;
        margin-bottom: 12px;
      }
      .text {
        font-size: 14px;
        line-height: 1.6;
        color: #334155;
        margin: 0 0 24px 0;
      }

      /* Premium OTP Box */
      .otp-card {
        background-color: #f8fafc;
        border: 1px solid #e2e8f0;
        border-left: 4px solid #2563eb;
        border-radius: 8px;
        padding: 20px 24px;
        margin: 24px 0;
      }
      .otp-header {
        font-size: 11px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.8px;
        color: #2563eb;
        margin-bottom: 8px;
      }
      .otp-number {
        font-family:
          ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
        font-size: 32px;
        font-weight: 800;
        letter-spacing: 10px;
        color: #0f172a;
        margin: 0;
      }
      .otp-footer {
        font-size: 12px;
        color: #64748b;
        margin-top: 8px;
        display: flex;
        align-items: center;
      }

      /* Security Note */
      .security-notice {
        background-color: #fefce8;
        border: 1px solid #fef08a;
        border-radius: 6px;
        padding: 12px 16px;
        font-size: 12px;
        color: #854d0e;
        line-height: 1.5;
        margin-bottom: 24px;
      }

      /* Footer */
      .footer {
        background-color: #f8fafc;
        border-top: 1px solid #e2e8f0;
        padding: 24px 32px;
        text-align: left;
      }
      .footer-text {
        font-size: 12px;
        color: #94a3b8;
        line-height: 1.6;
        margin: 0 0 12px 0;
      }
      .footer-links a {
        color: #64748b;
        text-decoration: underline;
        font-size: 12px;
        margin-right: 12px;
      }
    </style>
  </head>
  <body>
    <div class="email-wrapper">
      <div class="email-card">
        <!-- Top Gradient Bar -->
        <div class="top-bar"></div>

        <!-- Header with Vector SVG Logo -->
        <div class="header">
          <table role="presentation" style="width: auto">
            <tr>
              <td style="vertical-align: middle; background-color: #0f172a">
                <img
                  src=${"../assets/logos-favicons/neuaspire-temp-sitelogo1.svg"}
                  alt="NeuAspire Logo"
                  width="auto"
                  height="30"
                />
              </td>
            </tr>
          </table>
        </div>

        <!-- Dynamic Title & Subtitle -->
        <div class="hero">
          <h1 class="hero-title">${title}</h1>
        </div>

        <div class="divider"></div>

        <!-- Email Body -->
        <div class="content">
          <div class="greeting">Hello ${fullname},</div>

          <p class="hero-subtitle">${subtitle}</p>

          <!-- Professional OTP Container -->
          <div class="otp-card">
            <div class="otp-header">Verification Code</div>
            <div class="otp-number">${otp}</div>
            <div class="otp-footer">
              ⏱️ Valid for 5 minutes &nbsp;|&nbsp; 🔒 Do not share this code
            </div>
          </div>

          <!-- Security Caution -->
          <div class="security-notice">
            <strong>Security Alert:</strong> If you did not request this OTP,
            change your password immediately and inform our support team.
          </div>

          <p class="text" style="margin-bottom: 0">
            Regards,<br />
            <strong>Security Team</strong>
          </p>
        </div>

        <!-- Clean Footer -->
        <div class="footer">
          <p class="footer-text">
            This is an automated system message. Please do not reply directly to
            this email.<br />
            © 2026 NeuAspire Inc. All rights reserved.
          </p>
          <div class="footer-links">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
            <a href="#">Help Center</a>
          </div>
        </div>
      </div>
    </div>
  </body>
</html>
`;
};

export default emailLayout;
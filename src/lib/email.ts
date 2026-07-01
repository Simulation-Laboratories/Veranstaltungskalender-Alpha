import { getSystemSetting } from "./config";

export async function sendEmail({ to, subject, html }: { to: string, subject: string, html: string }) {
  const config = await getSystemSetting('email_config', { enableEmails: false, resendApiKey: '', fromEmail: 'noreply@example.com' });

  if (!config.enableEmails) {
    console.log(`[EMAIL DISABLED] Would send email to: ${to}`);
    console.log(`[EMAIL DISABLED] Subject: ${subject}`);
    return { success: true, simulated: true };
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.resendApiKey}`
      },
      body: JSON.stringify({
        from: `EventHub <${config.fromEmail}>`,
        to,
        subject,
        html,
      })
    });
    if (!res.ok) throw new Error("Failed to send email");
    
    console.log(`[EMAIL SENT] to: ${to} | Subject: ${subject}`);
    return { success: true };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, error };
  }
}

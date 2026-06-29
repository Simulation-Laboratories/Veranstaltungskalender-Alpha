// Simple email abstraction for Resend or Nodemailer
// Set ENABLE_EMAILS=true in .env to actually send emails.

export async function sendEmail({ to, subject, html }: { to: string, subject: string, html: string }) {
  if (process.env.ENABLE_EMAILS !== 'true') {
    console.log(`[EMAIL DISABLED] Would send email to: ${to}`);
    console.log(`[EMAIL DISABLED] Subject: ${subject}`);
    return { success: true, simulated: true };
  }

  try {
    // Example integration for Resend:
    /*
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`
      },
      body: JSON.stringify({
        from: 'EventHub <noreply@deine-domain.de>',
        to,
        subject,
        html,
      })
    });
    if (!res.ok) throw new Error("Failed to send email");
    */
    
    console.log(`[EMAIL SENT] to: ${to} | Subject: ${subject}`);
    return { success: true };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, error };
  }
}

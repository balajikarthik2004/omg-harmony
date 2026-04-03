export type CampaignEmailRecipient = {
  name: string;
  email: string;
};

export type CampaignEmailResult = {
  attempted: number;
  sent: number;
  failed: number;
  skipped: number;
  errors: string[];
};

type CampaignEmailPayload = {
  subject: string;
  message: string;
  recipients: CampaignEmailRecipient[];
};

const EMAILJS_API_URL = "https://api.emailjs.com/api/v1.0/email/send";

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function toHtmlParagraphs(text: string) {
  return text
    .split(/\n\s*\n/g)
    .map((paragraph) => `<p style="margin:0 0 16px 0;line-height:1.75;color:#1f2937;font-size:16px;">${escapeHtml(paragraph).replace(/\n/g, "<br/>")}</p>`)
    .join("");
}

function buildProfessionalEmailHtml(recipientName: string, subject: string, contentHtml: string) {
  const safeName = escapeHtml(recipientName);
  const safeSubject = escapeHtml(subject);

  return `
<div style="margin:0;padding:0;background:#eef3fb;font-family:'Segoe UI',Arial,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding:24px 12px;background:#eef3fb;">
    <tr>
      <td align="center">
        <table role="presentation" width="680" cellspacing="0" cellpadding="0" style="max-width:680px;background:#ffffff;border:1px solid #e5e7eb;border-radius:16px;overflow:hidden;box-shadow:0 10px 30px rgba(15,23,42,0.08);">
          <tr>
            <td style="padding:22px 26px;background:linear-gradient(135deg,#1e3a8a 0%,#1d4ed8 45%,#0ea5e9 100%);color:#ffffff;">
              <div style="font-size:12px;letter-spacing:1.4px;text-transform:uppercase;opacity:0.9;font-weight:600;">OMG Temple Governance System</div>
              <h1 style="margin:8px 0 0 0;font-size:22px;line-height:1.35;font-weight:700;">${safeSubject}</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 26px 10px 26px;">
              <p style="margin:0 0 16px 0;color:#111827;font-size:16px;font-weight:600;">Dear ${safeName},</p>
              ${contentHtml}
            </td>
          </tr>
          <tr>
            <td style="padding:10px 26px 26px 26px;">
              <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:12px 14px;color:#475569;font-size:12px;line-height:1.6;">
                You are receiving this communication because you are registered with OMG Temple Governance System.<br/>
                Please do not reply to this automated campaign email.
              </div>
              <p style="margin:14px 0 0 0;color:#6b7280;font-size:12px;">With prayers and regards,<br/>Temple Communications Desk</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</div>`.trim();
}

function getEmailJsConfig() {
  const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID as string | undefined;
  const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID as string | undefined;
  const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY as string | undefined;

  if (!serviceId || !templateId || !publicKey) {
    throw new Error(
      "Email is not configured. Set VITE_EMAILJS_SERVICE_ID, VITE_EMAILJS_TEMPLATE_ID, and VITE_EMAILJS_PUBLIC_KEY in your .env file.",
    );
  }

  return { serviceId, templateId, publicKey };
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

async function sendOneEmail(
  config: { serviceId: string; templateId: string; publicKey: string },
  recipient: CampaignEmailRecipient,
  subject: string,
  message: string,
) {
  const cleanEmail = recipient.email.trim();
  const safeMessage = message.trim();
  const previewText = safeMessage.slice(0, 120);
  const htmlContent = toHtmlParagraphs(safeMessage);
  const fullEmailHtml = buildProfessionalEmailHtml(recipient.name, subject, htmlContent);

  const response = await fetch(EMAILJS_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      service_id: config.serviceId,
      template_id: config.templateId,
      user_id: config.publicKey,
      template_params: {
        // Support both common EmailJS template variable styles.
        name: recipient.name,
        email: cleanEmail,
        to: cleanEmail,
        recipient_email: cleanEmail,
        to_name: recipient.name,
        to_email: cleanEmail,
        reply_to: cleanEmail,
        from_name: "Temple Harmony ERP",
        brand_name: "OMG Temple Governance System",
        preview_text: previewText,
        message_html: fullEmailHtml,
        email_body_html: fullEmailHtml,
        html_content: fullEmailHtml,
        current_year: new Date().getFullYear(),
        subject,
        message: safeMessage,
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`EmailJS failed for ${recipient.email}: ${errorText}`);
  }
}

export async function sendCampaignEmails(payload: CampaignEmailPayload): Promise<CampaignEmailResult> {
  const config = getEmailJsConfig();

  const normalizedRecipients = payload.recipients.filter(
    (recipient) => recipient.email && isValidEmail(recipient.email),
  );

  const skipped = payload.recipients.length - normalizedRecipients.length;

  if (normalizedRecipients.length === 0) {
    return {
      attempted: 0,
      sent: 0,
      failed: 0,
      skipped,
      errors: [],
    };
  }

  const settled = await Promise.allSettled(
    normalizedRecipients.map((recipient) =>
      sendOneEmail(config, recipient, payload.subject, payload.message),
    ),
  );

  const sent = settled.filter((result) => result.status === "fulfilled").length;
  const errors = settled
    .filter((result): result is PromiseRejectedResult => result.status === "rejected")
    .map((result) => (result.reason instanceof Error ? result.reason.message : String(result.reason)));

  return {
    attempted: normalizedRecipients.length,
    sent,
    failed: normalizedRecipients.length - sent,
    skipped,
    errors,
  };
}

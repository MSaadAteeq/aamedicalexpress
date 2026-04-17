const { Resend } = require("resend");

const DEFAULT_ADMIN_EMAIL = "saadateeq456@gmail.com";
let missingConfigLogged = false;

const parseRecipients = () => {
  const configured =
    process.env.ADMIN_ACTIVITY_EMAILS ||
    process.env.ADMIN_ALERT_EMAILS ||
    process.env.ADMIN_EMAILS ||
    DEFAULT_ADMIN_EMAIL;

  return configured
    .split(",")
    .map((email) => email.trim())
    .filter(Boolean);
};

const eventTitles = {
  emergency_ride_request: "Emergency Ride Request",
  ride_request_created: "Ride Request Created",
  ride_status_updated: "Ride Status Updated",
  user_registered: "New User Registration",
  user_login: "User Login",
  user_profile_updated: "Profile Updated",
  system_activity: "System Activity",
};

const escapeHtml = (value) =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");

const prettifyKey = (key) =>
  key
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

const normalizeDetails = (details = {}) =>
  Object.entries(details).filter(([, value]) => value !== undefined && value !== null && value !== "");

const formatDetailsHtml = (details = {}) => {
  const rows = normalizeDetails(details);
  if (!rows.length) {
    return `<tr><td style="padding: 10px 0; color: #64748b;">No additional details.</td></tr>`;
  }

  return rows
    .map(
      ([key, value]) => `
        <tr>
          <td style="padding: 8px 0; color: #64748b; font-size: 13px; text-transform: uppercase; letter-spacing: 0.4px;">
            ${escapeHtml(prettifyKey(key))}
          </td>
        </tr>
        <tr>
          <td style="padding: 0 0 10px; color: #0f172a; font-size: 15px; font-weight: 600;">
            ${escapeHtml(value)}
          </td>
        </tr>
      `
    )
    .join("");
};

const formatDetailsText = (details = {}) => {
  const rows = normalizeDetails(details);
  if (!rows.length) return "- No additional details.";
  return rows.map(([key, value]) => `- ${prettifyKey(key)}: ${value}`).join("\n");
};

const sendAdminNotification = async ({ subject, eventType, details = {} }) => {
  const apiKey = process.env.RESEND_API_KEY;
  const recipients = parseRecipients();

  if (!apiKey || !recipients.length) {
    if (!missingConfigLogged && process.env.NODE_ENV !== "test") {
      console.warn("Admin notifications are disabled. Set RESEND_API_KEY and admin recipient env vars.");
      missingConfigLogged = true;
    }
    return;
  }

  const resend = new Resend(apiKey);
  const fromAddress = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
  const timestamp = new Date().toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
  });
  const eventLabel = eventType || "system_activity";
  const eventTitle = eventTitles[eventLabel] || eventTitles.system_activity;
  const detailsHtml = formatDetailsHtml(details);
  const detailsText = formatDetailsText(details);

  await resend.emails.send({
    from: fromAddress,
    to: recipients,
    subject,
    html: `
      <div style="margin: 0; background: #f8fafc; padding: 24px 12px; font-family: Inter, Arial, sans-serif;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 0 auto; border-collapse: collapse;">
          <tr>
            <td style="background: linear-gradient(135deg, #0f172a 0%, #1d4ed8 100%); color: #ffffff; padding: 20px 24px; border-radius: 14px 14px 0 0;">
              <div style="font-size: 12px; letter-spacing: 0.6px; text-transform: uppercase; opacity: 0.9;">PMT Admin Alert</div>
              <h1 style="margin: 8px 0 4px; font-size: 22px; line-height: 1.3;">${escapeHtml(eventTitle)}</h1>
              <p style="margin: 0; font-size: 13px; opacity: 0.9;">${escapeHtml(timestamp)} UTC</p>
            </td>
          </tr>
          <tr>
            <td style="background: #ffffff; border: 1px solid #e2e8f0; border-top: 0; border-radius: 0 0 14px 14px; padding: 20px 24px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse: collapse;">
                ${detailsHtml}
              </table>
            </td>
          </tr>
        </table>
      </div>
    `,
    text: `${eventTitle}\nTime: ${timestamp} UTC\n\n${detailsText}`,
  });
};

module.exports = { sendAdminNotification };

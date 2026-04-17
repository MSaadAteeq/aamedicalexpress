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

const formatDetailsHtml = (details = {}) =>
  Object.entries(details)
    .map(
      ([key, value]) =>
        `<li><strong>${key}:</strong> ${String(value ?? "")
          .replaceAll("&", "&amp;")
          .replaceAll("<", "&lt;")
          .replaceAll(">", "&gt;")}</li>`
    )
    .join("");

const formatDetailsText = (details = {}) =>
  Object.entries(details)
    .map(([key, value]) => `- ${key}: ${value ?? ""}`)
    .join("\n");

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
  const timestamp = new Date().toISOString();
  const eventLabel = eventType || "system_activity";
  const detailsHtml = formatDetailsHtml(details);
  const detailsText = formatDetailsText(details);

  await resend.emails.send({
    from: fromAddress,
    to: recipients,
    subject,
    html: `
      <h2>${subject}</h2>
      <p><strong>Event:</strong> ${eventLabel}</p>
      <p><strong>Timestamp:</strong> ${timestamp}</p>
      <ul>${detailsHtml}</ul>
    `,
    text: `${subject}\nEvent: ${eventLabel}\nTimestamp: ${timestamp}\n${detailsText}`,
  });
};

module.exports = { sendAdminNotification };

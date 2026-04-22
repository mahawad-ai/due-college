/** Shared email shell used by every due.college template */
export function emailShell({
  title,
  accentColor = '#1a1f36',
  content,
  footerText,
  unsubscribeUrl = 'https://due.college/settings',
}: {
  title: string;
  accentColor?: string;
  content: string;
  footerText?: string;
  unsubscribeUrl?: string;
}): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="color-scheme" content="light">
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#f0f0f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI','Helvetica Neue',Arial,sans-serif;-webkit-font-smoothing:antialiased">

  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#f0f0f5">
    <tr>
      <td align="center" style="padding:40px 16px 48px">

        <!-- Logo -->
        <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width:560px">
          <tr>
            <td align="center" style="padding-bottom:24px">
              <a href="https://due.college" style="text-decoration:none;display:inline-block">
                <span style="font-size:18px;font-weight:800;color:#1a1f36;letter-spacing:-0.5px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">due.college</span>
              </a>
            </td>
          </tr>
        </table>

        <!-- Card -->
        <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width:560px;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.07)">
          <!-- Accent bar -->
          <tr>
            <td style="height:5px;background:${accentColor};line-height:5px;font-size:5px">&nbsp;</td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:36px 36px 32px">
              ${content}
            </td>
          </tr>
        </table>

        <!-- Footer -->
        <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width:560px">
          <tr>
            <td align="center" style="padding-top:20px">
              <p style="margin:0;font-size:12px;color:#aeaeb2;line-height:1.6">
                ${footerText ? footerText + ' &middot; ' : ''}
                <a href="https://due.college/settings" style="color:#aeaeb2;text-decoration:none">Manage notifications</a>
                &nbsp;&middot;&nbsp;
                <a href="${unsubscribeUrl}" style="color:#aeaeb2;text-decoration:none">Unsubscribe</a>
              </p>
            </td>
          </tr>
        </table>

      </td>
    </tr>
  </table>

</body>
</html>`;
}

/** Reusable CTA button */
export function ctaButton(label: string, url: string, color = '#1a1f36'): string {
  return `<table width="100%" cellpadding="0" cellspacing="0" role="presentation">
    <tr>
      <td align="center" style="padding-top:8px">
        <a href="${url}" style="display:inline-block;background:${color};color:#ffffff;padding:15px 36px;border-radius:12px;font-weight:700;text-decoration:none;font-size:15px;letter-spacing:-0.1px">
          ${label}
        </a>
      </td>
    </tr>
  </table>`;
}

/** Reusable info pill / badge */
export function badge(label: string, bg: string, color: string): string {
  return `<span style="display:inline-block;background:${bg};color:${color};font-size:11px;font-weight:700;padding:3px 10px;border-radius:100px;letter-spacing:0.3px">${label}</span>`;
}

/** Divider line */
export const divider = `<div style="height:1px;background:#f0f0f5;margin:24px 0"></div>`;

/** Section label */
export function sectionLabel(text: string): string {
  return `<p style="margin:0 0 8px;font-size:11px;font-weight:700;color:#aeaeb2;text-transform:uppercase;letter-spacing:0.8px">${text}</p>`;
}

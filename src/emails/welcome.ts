import { emailShell, ctaButton, divider } from './base';

interface WelcomeEmailProps {
  studentName: string;
  colleges: string[];
  nextDeadline?: { college: string; type: string; date: string; daysRemaining: number };
  unsubscribeUrl: string;
}

export function renderWelcomeEmail({
  studentName,
  colleges,
  nextDeadline,
  unsubscribeUrl,
}: WelcomeEmailProps): string {
  const firstName = studentName.split(' ')[0];

  const collegeRows = colleges
    .slice(0, 8)
    .map(
      (name) => `
    <tr>
      <td style="padding:8px 0;vertical-align:top;width:24px">
        <div style="width:18px;height:18px;background:#1a1f36;border-radius:50%;text-align:center;line-height:18px;font-size:10px;color:#fff;font-weight:800">✓</div>
      </td>
      <td style="padding:8px 0 8px 10px;font-size:14px;color:#374151;font-weight:500">${name}</td>
    </tr>`
    )
    .join('');

  const moreRow =
    colleges.length > 8
      ? `<tr><td></td><td style="padding:6px 0 0 10px;font-size:13px;color:#aeaeb2">+ ${colleges.length - 8} more school${colleges.length - 8 !== 1 ? 's' : ''}</td></tr>`
      : '';

  const nextDeadlineBlock = nextDeadline
    ? `
    <div style="background:#fff5f5;border:1px solid #fecaca;border-radius:14px;padding:18px;margin-bottom:24px">
      <p style="margin:0 0 2px;font-size:11px;font-weight:700;color:#aeaeb2;text-transform:uppercase;letter-spacing:0.8px">First deadline coming up</p>
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:6px">
        <tr>
          <td>
            <p style="margin:0;font-size:15px;font-weight:700;color:#1a1f36">${nextDeadline.college}</p>
            <p style="margin:3px 0 0;font-size:13px;color:#6b7280">${nextDeadline.type} &middot; ${nextDeadline.date}</p>
          </td>
          <td style="text-align:right;vertical-align:middle">
            <div style="display:inline-block;background:#ff3b30;color:#fff;font-size:20px;font-weight:800;padding:7px 14px;border-radius:10px;letter-spacing:-0.5px;line-height:1">
              ${nextDeadline.daysRemaining}d
            </div>
          </td>
        </tr>
      </table>
    </div>`
    : '';

  const content = `
    <!-- Headline -->
    <h1 style="font-size:26px;font-weight:800;color:#1a1f36;margin:0 0 10px;letter-spacing:-0.5px">
      You're all set, ${firstName}!
    </h1>
    <p style="margin:0 0 24px;font-size:15px;color:#6b7280;line-height:1.6">
      We're now tracking deadlines for ${colleges.length} school${colleges.length !== 1 ? 's' : ''}.
      You'll get reminders at 30, 14, 7, 3, and 1 day before every deadline.
    </p>

    ${nextDeadlineBlock}

    <!-- Schools list -->
    <p style="margin:0 0 12px;font-size:14px;font-weight:700;color:#1a1f36">Your schools</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px">
      ${collegeRows}
      ${moreRow}
    </table>

    ${divider}

    <!-- Parent invite nudge -->
    <div style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:14px;padding:18px;margin-bottom:24px">
      <p style="margin:0 0 4px;font-size:13px;font-weight:700;color:#0369a1">Keep your parents in the loop</p>
      <p style="margin:0 0 10px;font-size:13px;color:#6b7280">Invite them to view your deadlines — they'll thank you later.</p>
      <a href="https://due.college/invite" style="font-size:13px;color:#0284c7;font-weight:700;text-decoration:none">Invite a Parent →</a>
    </div>

    <!-- CTA -->
    ${ctaButton('View My Deadlines →', 'https://due.college/deadlines')}

    <!-- Sign-off -->
    <p style="margin:20px 0 0;font-size:13px;color:#aeaeb2;text-align:center">
      Welcome to due.college, ${firstName}. Free forever.
    </p>
  `;

  return emailShell({
    title: `Welcome to due.college, ${firstName}!`,
    accentColor: '#1a1f36',
    content,
    unsubscribeUrl,
  });
}

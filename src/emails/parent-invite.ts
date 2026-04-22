import { emailShell, ctaButton, divider } from './base';

interface ParentInviteEmailProps {
  parentName: string;
  studentName: string;
  colleges: string[];
  accessToken: string;
}

export function renderParentInviteEmail({
  parentName,
  studentName,
  colleges,
  accessToken,
}: ParentInviteEmailProps): string {
  const dashboardUrl = `https://due.college/parent/${accessToken}`;
  const parentFirst = parentName.split(' ')[0];
  const studentFirst = studentName.split(' ')[0];

  const collegeRows = colleges
    .slice(0, 8)
    .map(
      (name) => `
    <tr>
      <td style="padding:7px 0;vertical-align:top;width:22px">
        <div style="width:16px;height:16px;background:#166534;border-radius:50%;text-align:center;line-height:16px;font-size:9px;color:#fff;font-weight:800">✓</div>
      </td>
      <td style="padding:7px 0 7px 10px;font-size:14px;color:#374151">${name}</td>
    </tr>`
    )
    .join('');

  const moreRow =
    colleges.length > 8
      ? `<tr><td></td><td style="padding:4px 0 0 10px;font-size:13px;color:#aeaeb2">+ ${colleges.length - 8} more</td></tr>`
      : '';

  const content = `
    <!-- Headline -->
    <h1 style="font-size:26px;font-weight:800;color:#1a1f36;margin:0 0 12px;letter-spacing:-0.5px">
      Hi ${parentFirst} 👋
    </h1>
    <p style="margin:0 0 24px;font-size:15px;color:#374151;line-height:1.6">
      <strong>${studentName}</strong> added you to their college deadline tracker on due.college.
      You'll have a read-only view of every upcoming application deadline, color-coded by urgency.
    </p>

    <!-- Schools card -->
    <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:14px;padding:18px;margin-bottom:24px">
      <p style="margin:0 0 12px;font-size:13px;font-weight:700;color:#166534">
        ${studentFirst} is applying to ${colleges.length} school${colleges.length !== 1 ? 's' : ''}:
      </p>
      <table width="100%" cellpadding="0" cellspacing="0">
        ${collegeRows}
        ${moreRow}
      </table>
    </div>

    <!-- CTA -->
    ${ctaButton(`View ${studentFirst}'s Deadlines →`, dashboardUrl, '#166534')}

    ${divider}

    <!-- SMS nudge -->
    <div style="background:#fffbf0;border:1px solid #fed7aa;border-radius:14px;padding:16px">
      <p style="margin:0 0 4px;font-size:13px;font-weight:700;color:#92400e">Enable SMS reminders</p>
      <p style="margin:0;font-size:13px;color:#6b7280;line-height:1.5">
        Get a text every time a deadline is approaching — so you never have to wonder where things stand.
        Turn it on in the dashboard.
      </p>
    </div>

    <!-- What is due.college -->
    <div style="margin-top:20px;padding:16px;background:#f5f5f7;border-radius:14px">
      <p style="margin:0 0 4px;font-size:12px;font-weight:700;color:#374151">What is due.college?</p>
      <p style="margin:0;font-size:12px;color:#6b7280;line-height:1.5">
        A free deadline tracker for high school students applying to college. It tracks ED1, EA, RD, FAFSA, and other critical deadlines — and sends reminders before every one of them.
      </p>
    </div>

    <!-- Sign-off -->
    <p style="margin:20px 0 0;font-size:13px;color:#aeaeb2;text-align:center">
      You were invited by ${studentName} &middot; <a href="https://due.college/unsubscribe" style="color:#aeaeb2;text-decoration:none">Unsubscribe</a>
    </p>
  `;

  return emailShell({
    title: `${studentName} invited you to view their college deadlines`,
    accentColor: '#166534',
    content,
    unsubscribeUrl: 'https://due.college/unsubscribe',
  });
}

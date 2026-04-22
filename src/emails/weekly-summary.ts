import { emailShell, ctaButton } from './base';

interface WeeklySummaryDeadline {
  college: string;
  type: string;
  date: string;
  daysRemaining: number;
}

interface WeeklySummaryEmailProps {
  studentName: string;
  deadlines: WeeklySummaryDeadline[];
  unsubscribeUrl: string;
}

export function renderWeeklySummaryEmail({
  studentName,
  deadlines,
  unsubscribeUrl,
}: WeeklySummaryEmailProps): string {
  const firstName = studentName.split(' ')[0];
  const urgentCount = deadlines.filter((d) => d.daysRemaining <= 7).length;
  const upcomingCount = deadlines.filter((d) => d.daysRemaining > 7 && d.daysRemaining <= 14).length;

  const accentColor = urgentCount > 0 ? '#ff3b30' : upcomingCount > 0 ? '#ff9f0a' : '#1a1f36';

  const alertBanner = urgentCount > 0
    ? `<div style="background:#fff5f5;border:1px solid #fecaca;border-radius:12px;padding:14px 18px;margin-bottom:20px">
        <p style="margin:0;font-size:13px;font-weight:700;color:#991b1b">
          🔴 ${urgentCount} deadline${urgentCount !== 1 ? 's' : ''} within 7 days — act now
        </p>
      </div>`
    : upcomingCount > 0
    ? `<div style="background:#fffbf0;border:1px solid #fed7aa;border-radius:12px;padding:14px 18px;margin-bottom:20px">
        <p style="margin:0;font-size:13px;font-weight:700;color:#92400e">
          🟡 ${upcomingCount} deadline${upcomingCount !== 1 ? 's' : ''} coming up this week
        </p>
      </div>`
    : '';

  const deadlineRows = deadlines
    .map((d) => {
      const pillColor = d.daysRemaining <= 7 ? '#ff3b30' : d.daysRemaining <= 14 ? '#ff9f0a' : '#6b7280';
      return `
      <tr>
        <td style="padding:11px 0;border-bottom:1px solid #f0f0f5;vertical-align:middle">
          <p style="margin:0;font-size:14px;font-weight:700;color:#1a1f36">${d.college}</p>
          <p style="margin:2px 0 0;font-size:12px;color:#aeaeb2">${d.type}</p>
        </td>
        <td style="padding:11px 0;border-bottom:1px solid #f0f0f5;font-size:13px;color:#6b7280;white-space:nowrap;padding-left:12px">
          ${d.date}
        </td>
        <td style="padding:11px 0;border-bottom:1px solid #f0f0f5;text-align:right;vertical-align:middle">
          <div style="display:inline-block;background:${pillColor};color:#fff;font-size:12px;font-weight:800;padding:3px 10px;border-radius:100px;white-space:nowrap">
            ${d.daysRemaining}d
          </div>
        </td>
      </tr>`;
    })
    .join('');

  const content = `
    <!-- Label -->
    <p style="margin:0 0 6px;font-size:11px;font-weight:700;color:#aeaeb2;text-transform:uppercase;letter-spacing:0.8px">
      Weekly summary
    </p>

    <!-- Headline -->
    <h1 style="font-size:26px;font-weight:800;color:#1a1f36;margin:0 0 6px;letter-spacing:-0.5px">
      ${firstName}'s upcoming deadlines
    </h1>
    <p style="margin:0 0 24px;font-size:14px;color:#6b7280">
      ${deadlines.length} deadline${deadlines.length !== 1 ? 's' : ''} in the next 30 days
    </p>

    ${alertBanner}

    <!-- Deadline table -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px">
      ${deadlineRows}
    </table>

    <!-- CTA -->
    ${ctaButton('Open My Dashboard →', 'https://due.college/dashboard', accentColor)}

    <!-- Sign-off -->
    <p style="margin:20px 0 0;font-size:13px;color:#aeaeb2;text-align:center">
      Hi ${studentName} — this summary arrives every week from due.college.
    </p>
  `;

  return emailShell({
    title: `${firstName}'s weekly deadline summary`,
    accentColor,
    content,
    unsubscribeUrl,
  });
}

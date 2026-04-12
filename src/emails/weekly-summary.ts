interface WeeklySummaryDeadline {
  college: string;
  type: string;
  date: string;
  daysRemaining: number;
}

interface WeeklySummaryEmailProps {
  studentName: string;
  deadlines: WeeklySummaryDeadline[];
}

export function renderWeeklySummaryEmail({ studentName, deadlines }: WeeklySummaryEmailProps): string {
  const deadlineRows = deadlines
    .map((d) => {
      const color = d.daysRemaining <= 7 ? '#ff6b6b' : d.daysRemaining <= 14 ? '#ffd93d' : '#6bcb77';
      const textColor = d.daysRemaining <= 14 && d.daysRemaining > 7 ? '#1a1f36' : '#fff';
      return `
      <tr style="border-bottom:1px solid #f3f4f6">
        <td style="padding:12px 16px">
          <p style="margin:0;font-size:14px;font-weight:700;color:#1a1f36">${d.college}</p>
        </td>
        <td style="padding:12px 8px">
          <span style="background:#f3f4f6;color:#374151;font-size:12px;font-weight:700;padding:3px 8px;border-radius:100px">${d.type}</span>
        </td>
        <td style="padding:12px 8px;font-size:13px;color:#6b7280">${d.date}</td>
        <td style="padding:12px 16px;text-align:right">
          <span style="background:${color};color:${textColor};font-size:12px;font-weight:800;padding:4px 10px;border-radius:100px;white-space:nowrap">
            ${d.daysRemaining}d
          </span>
        </td>
      </tr>`;
    })
    .join('');

  const urgentCount = deadlines.filter((d) => d.daysRemaining <= 7).length;
  const upcomingCount = deadlines.filter((d) => d.daysRemaining > 7 && d.daysRemaining <= 14).length;

  const alertBanner =
    urgentCount > 0
      ? `<div style="background:#fef3f2;border:1px solid #fecaca;border-radius:12px;padding:14px 18px;margin-bottom:20px">
          <p style="margin:0;font-size:14px;color:#991b1b;font-weight:600">
            🔴 ${urgentCount} deadline${urgentCount !== 1 ? 's' : ''} in the next 7 days — act now
          </p>
        </div>`
      : upcomingCount > 0
      ? `<div style="background:#fffbeb;border:1px solid #fde68a;border-radius:12px;padding:14px 18px;margin-bottom:20px">
          <p style="margin:0;font-size:14px;color:#92400e;font-weight:600">
            🟡 ${upcomingCount} deadline${upcomingCount !== 1 ? 's' : ''} coming up this week
          </p>
        </div>`
      : '';

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:Inter,system-ui,-apple-system,sans-serif">
  <div style="max-width:600px;margin:0 auto;padding:40px 20px">

    <div style="text-align:center;margin-bottom:32px">
      <span style="font-size:22px;font-weight:800;color:#1a1f36">due.college</span>
    </div>

    <div style="background:#fff;border-radius:24px;border:1px solid #e5e7eb;padding:32px">
      <h1 style="font-size:22px;font-weight:800;color:#1a1f36;margin:0 0 4px">
        📅 ${studentName}'s weekly summary
      </h1>
      <p style="color:#6b7280;font-size:14px;margin:0 0 24px">
        ${deadlines.length} deadline${deadlines.length !== 1 ? 's' : ''} in the next 30 days
      </p>

      ${alertBanner}

      <div style="border:1px solid #e5e7eb;border-radius:16px;overflow:hidden">
        <table width="100%" cellpadding="0" cellspacing="0">
          <thead>
            <tr style="background:#f9fafb">
              <th style="padding:10px 16px;text-align:left;font-size:11px;color:#9ca3af;font-weight:600;text-transform:uppercase;letter-spacing:0.5px">School</th>
              <th style="padding:10px 8px;text-align:left;font-size:11px;color:#9ca3af;font-weight:600;text-transform:uppercase;letter-spacing:0.5px">Type</th>
              <th style="padding:10px 8px;text-align:left;font-size:11px;color:#9ca3af;font-weight:600;text-transform:uppercase;letter-spacing:0.5px">Date</th>
              <th style="padding:10px 16px;text-align:right;font-size:11px;color:#9ca3af;font-weight:600;text-transform:uppercase;letter-spacing:0.5px">Left</th>
            </tr>
          </thead>
          <tbody>
            ${deadlineRows}
          </tbody>
        </table>
      </div>

      <a href="https://due.college/dashboard" style="display:block;text-align:center;background:#1a1f36;color:#fff;padding:14px 24px;border-radius:12px;font-weight:700;text-decoration:none;font-size:15px;margin-top:24px">
        Open Dashboard →
      </a>
    </div>

    <p style="text-align:center;font-size:12px;color:#9ca3af;margin-top:24px">
      Weekly summary from due.college ·
      <a href="https://due.college/settings" style="color:#9ca3af">Manage notifications</a>
    </p>
  </div>
</body>
</html>`;
}

interface DeadlineReminderEmailProps {
  studentName: string;
  collegeName: string;
  deadlineType: string;
  deadlineDate: string;
  daysRemaining: number;
  checklist: string[];
  urgencyColor: string;
}

export function renderDeadlineReminderEmail({
  studentName,
  collegeName,
  deadlineType,
  deadlineDate,
  daysRemaining,
  checklist,
  urgencyColor,
}: DeadlineReminderEmailProps): string {
  const checklistItems = checklist
    .map(
      (item) =>
        `<tr>
          <td style="padding:6px 0;vertical-align:top;width:24px">
            <span style="display:inline-block;width:20px;height:20px;background:${urgencyColor}20;border-radius:50%;text-align:center;line-height:20px;font-size:11px;color:${urgencyColor};font-weight:700">✓</span>
          </td>
          <td style="padding:6px 0 6px 8px;font-size:14px;color:#374151">${item}</td>
        </tr>`
    )
    .join('');

  const affiliateSection =
    daysRemaining <= 7
      ? `<div style="background:#fef3f2;border:1px solid #fecaca;border-radius:12px;padding:16px;margin-top:16px">
          <p style="margin:0;font-size:13px;color:#991b1b;font-weight:600">Last-minute essay review?</p>
          <p style="margin:4px 0 8px;font-size:13px;color:#6b7280">Get free peer feedback on your essays.</p>
          <a href="https://collegevine.com" style="font-size:13px;color:#ff6b6b;font-weight:700;text-decoration:none">CollegeVine →</a>
        </div>`
      : daysRemaining <= 14
      ? `<div style="background:#fefce8;border:1px solid #fde047;border-radius:12px;padding:16px;margin-top:16px">
          <p style="margin:0;font-size:13px;color:#854d0e;font-weight:600">Need essay coaching?</p>
          <p style="margin:4px 0 8px;font-size:13px;color:#6b7280">Expert college essay coaches at Prompt.</p>
          <a href="https://prompt.com" style="font-size:13px;color:#ff6b6b;font-weight:700;text-decoration:none">Try Prompt.com →</a>
        </div>`
      : `<div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:16px;margin-top:16px">
          <p style="margin:0;font-size:13px;color:#166534;font-weight:600">Still need SAT/ACT prep?</p>
          <p style="margin:4px 0 8px;font-size:13px;color:#6b7280">Affordable online test prep that actually works.</p>
          <a href="https://magoosh.com" style="font-size:13px;color:#ff6b6b;font-weight:700;text-decoration:none">Try Magoosh →</a>
        </div>`;

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Deadline Reminder</title>
</head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:Inter,system-ui,-apple-system,sans-serif;-webkit-font-smoothing:antialiased">
  <div style="max-width:600px;margin:0 auto;padding:40px 20px">

    <!-- Header -->
    <div style="text-align:center;margin-bottom:32px">
      <a href="https://due.college" style="text-decoration:none">
        <span style="font-size:22px;font-weight:800;color:#1a1f36;letter-spacing:-0.5px">due.college</span>
      </a>
    </div>

    <!-- Card -->
    <div style="background:#fff;border-radius:24px;border:1px solid #e5e7eb;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.05)">

      <!-- Top accent -->
      <div style="height:4px;background:${urgencyColor}"></div>

      <div style="padding:32px">
        <p style="color:#6b7280;margin:0 0 6px;font-size:14px">Hi ${studentName},</p>
        <h1 style="font-size:24px;font-weight:800;color:#1a1f36;margin:0 0 24px;line-height:1.2">
          ⏰ ${collegeName} ${deadlineType}<br>is in <span style="color:${urgencyColor}">${daysRemaining} day${daysRemaining !== 1 ? 's' : ''}</span>
        </h1>

        <!-- Deadline box -->
        <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:16px;padding:20px;margin-bottom:24px">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td>
                <p style="margin:0;font-size:13px;color:#9ca3af;font-weight:500;text-transform:uppercase;letter-spacing:0.5px">School</p>
                <p style="margin:2px 0 0;font-size:16px;font-weight:700;color:#1a1f36">${collegeName}</p>
              </td>
              <td style="text-align:right">
                <span style="display:inline-block;background:${urgencyColor};color:${daysRemaining <= 30 && daysRemaining > 7 ? '#1a1f36' : '#fff'};font-size:13px;font-weight:800;padding:6px 14px;border-radius:100px">
                  ${daysRemaining} day${daysRemaining !== 1 ? 's' : ''} left
                </span>
              </td>
            </tr>
            <tr>
              <td style="padding-top:12px">
                <p style="margin:0;font-size:13px;color:#9ca3af;font-weight:500;text-transform:uppercase;letter-spacing:0.5px">Deadline Type</p>
                <p style="margin:2px 0 0;font-size:15px;font-weight:600;color:#374151">${deadlineType}</p>
              </td>
              <td style="text-align:right;padding-top:12px;vertical-align:bottom">
                <p style="margin:0;font-size:14px;color:#6b7280">${deadlineDate}</p>
              </td>
            </tr>
          </table>
        </div>

        <!-- Checklist -->
        <h2 style="font-size:15px;font-weight:700;color:#1a1f36;margin:0 0 12px">Your ${daysRemaining}-day checklist</h2>
        <table width="100%" cellpadding="0" cellspacing="0">
          ${checklistItems}
        </table>

        ${affiliateSection}

        <!-- CTA -->
        <div style="text-align:center;margin-top:28px">
          <a href="https://due.college/dashboard" style="display:inline-block;background:#1a1f36;color:#fff;padding:14px 32px;border-radius:12px;font-weight:700;text-decoration:none;font-size:15px">
            Open My Dashboard →
          </a>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div style="text-align:center;margin-top:24px">
      <p style="font-size:12px;color:#9ca3af;margin:0">
        You're getting this because you use <a href="https://due.college" style="color:#9ca3af">due.college</a>.
        <a href="https://due.college/settings" style="color:#9ca3af">Manage notifications</a> ·
        <a href="https://due.college/unsubscribe" style="color:#9ca3af">Unsubscribe</a>
      </p>
    </div>
  </div>
</body>
</html>`;
}

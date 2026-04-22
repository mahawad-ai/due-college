import { emailShell, ctaButton } from './base';

interface DeadlineReminderEmailProps {
  studentName: string;
  collegeName: string;
  deadlineType: string;
  deadlineDate: string;
  daysRemaining: number;
  checklist: string[];
  urgencyColor: string;
  unsubscribeUrl: string;
}

export function renderDeadlineReminderEmail({
  studentName,
  collegeName,
  deadlineType,
  deadlineDate,
  daysRemaining,
  checklist,
  urgencyColor,
  unsubscribeUrl,
}: DeadlineReminderEmailProps): string {
  const isUrgent = daysRemaining <= 7;
  const isUpcoming = daysRemaining <= 14;
  const accentColor = isUrgent ? '#ff3b30' : isUpcoming ? '#ff9f0a' : '#1a1f36';
  const bgTint = isUrgent ? '#fff5f5' : isUpcoming ? '#fffbf0' : '#f5f5f7';
  const labelColor = isUrgent ? '#ff3b30' : isUpcoming ? '#c77500' : '#6b7280';

  const checklistRows = checklist.map((item) => `
    <tr>
      <td style="padding:9px 0;vertical-align:top;width:28px">
        <div style="width:22px;height:22px;background:${accentColor};border-radius:50%;text-align:center;line-height:22px;font-size:12px;color:#fff;font-weight:800">✓</div>
      </td>
      <td style="padding:9px 0 9px 10px;font-size:14px;color:#374151;line-height:1.5">${item}</td>
    </tr>`).join('');

  const affiliateBlock = daysRemaining <= 7
    ? `<div style="background:#fff5f5;border:1px solid #fecaca;border-radius:14px;padding:18px;margin-top:20px">
        <p style="margin:0 0 4px;font-size:13px;font-weight:700;color:#991b1b">Need a last-minute essay review?</p>
        <p style="margin:0 0 10px;font-size:13px;color:#6b7280">Get free peer feedback before you submit.</p>
        <a href="https://collegevine.com" style="font-size:13px;color:#ff3b30;font-weight:700;text-decoration:none">Try CollegeVine →</a>
      </div>`
    : daysRemaining <= 14
    ? `<div style="background:#fffbf0;border:1px solid #fed7aa;border-radius:14px;padding:18px;margin-top:20px">
        <p style="margin:0 0 4px;font-size:13px;font-weight:700;color:#92400e">Want expert essay coaching?</p>
        <p style="margin:0 0 10px;font-size:13px;color:#6b7280">Work with college coaches who've seen it all.</p>
        <a href="https://prompt.com" style="font-size:13px;color:#ff9f0a;font-weight:700;text-decoration:none">Try Prompt.com →</a>
      </div>`
    : `<div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:14px;padding:18px;margin-top:20px">
        <p style="margin:0 0 4px;font-size:13px;font-weight:700;color:#166534">Still need SAT / ACT prep?</p>
        <p style="margin:0 0 10px;font-size:13px;color:#6b7280">Affordable online prep that actually works.</p>
        <a href="https://magoosh.com" style="font-size:13px;color:#1a9e4e;font-weight:700;text-decoration:none">Try Magoosh →</a>
      </div>`;

  const content = `
    <!-- Label -->
    <p style="margin:0 0 6px;font-size:11px;font-weight:700;color:${labelColor};text-transform:uppercase;letter-spacing:0.8px">
      ${isUrgent ? '🔴 Act now' : isUpcoming ? '🟡 Coming up soon' : '📅 Upcoming deadline'}
    </p>

    <!-- Headline -->
    <h1 style="font-size:26px;font-weight:800;color:#1a1f36;margin:0 0 24px;line-height:1.2;letter-spacing:-0.5px">
      ${collegeName}<br>
      <span style="color:${accentColor}">${deadlineType}</span> is in ${daysRemaining} day${daysRemaining !== 1 ? 's' : ''}
    </h1>

    <!-- Deadline card -->
    <div style="background:${bgTint};border-radius:16px;padding:20px;margin-bottom:28px">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td>
            <p style="margin:0 0 2px;font-size:11px;font-weight:700;color:#aeaeb2;text-transform:uppercase;letter-spacing:0.6px">School</p>
            <p style="margin:0;font-size:16px;font-weight:700;color:#1a1f36">${collegeName}</p>
          </td>
          <td style="text-align:right;vertical-align:top">
            <div style="display:inline-block;background:${accentColor};color:#fff;font-size:22px;font-weight:800;padding:8px 16px;border-radius:12px;letter-spacing:-0.5px;line-height:1">
              ${daysRemaining}d
            </div>
          </td>
        </tr>
        <tr>
          <td style="padding-top:14px">
            <p style="margin:0 0 2px;font-size:11px;font-weight:700;color:#aeaeb2;text-transform:uppercase;letter-spacing:0.6px">Deadline</p>
            <p style="margin:0;font-size:15px;font-weight:600;color:#374151">${deadlineType} &middot; ${deadlineDate}</p>
          </td>
        </tr>
      </table>
    </div>

    <!-- Checklist -->
    <p style="margin:0 0 14px;font-size:14px;font-weight:700;color:#1a1f36">Your ${daysRemaining}-day checklist</p>
    <table width="100%" cellpadding="0" cellspacing="0">
      ${checklistRows}
    </table>

    ${affiliateBlock}

    <!-- CTA -->
    <div style="margin-top:28px">
      ${ctaButton('Open My Dashboard →', 'https://due.college/dashboard', accentColor)}
    </div>

    <!-- Sign-off -->
    <p style="margin:20px 0 0;font-size:13px;color:#aeaeb2;text-align:center">
      Hi ${studentName} — this reminder was scheduled when you added ${collegeName}.
    </p>
  `;

  return emailShell({
    title: `${collegeName} ${deadlineType} — ${daysRemaining} days left`,
    accentColor,
    content,
    unsubscribeUrl,
  });
}

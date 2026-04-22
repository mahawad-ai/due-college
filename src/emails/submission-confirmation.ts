import { emailShell, ctaButton, divider } from './base';

interface SubmissionConfirmationEmailProps {
  studentName: string;
  collegeName: string;
  deadlineType: string;
  nextDeadline?: { college: string; type: string; date: string; daysRemaining: number };
  unsubscribeUrl: string;
}

export function renderSubmissionConfirmationEmail({
  studentName,
  collegeName,
  deadlineType,
  nextDeadline,
  unsubscribeUrl,
}: SubmissionConfirmationEmailProps): string {
  const motivationalLines = [
    'One down. Keep the momentum going.',
    'That took courage. The rest will come easier.',
    "You're officially in the running.",
    "Every application submitted is a door that might open.",
    "That's one more school that gets to say yes.",
  ];
  const motivationalLine = motivationalLines[Math.floor(Math.random() * motivationalLines.length)];

  const nextDeadlineBlock = nextDeadline
    ? `
    ${divider}
    <p style="margin:0 0 10px;font-size:11px;font-weight:700;color:#aeaeb2;text-transform:uppercase;letter-spacing:0.8px">Up Next</p>
    <div style="background:#fff5f5;border:1px solid #fecaca;border-radius:14px;padding:18px">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td>
            <p style="margin:0;font-size:16px;font-weight:800;color:#1a1f36">${nextDeadline.college}</p>
            <p style="margin:4px 0 0;font-size:13px;color:#6b7280">${nextDeadline.type} &middot; ${nextDeadline.date}</p>
          </td>
          <td style="text-align:right;vertical-align:middle">
            <div style="display:inline-block;background:#ff3b30;color:#fff;font-size:20px;font-weight:800;padding:7px 14px;border-radius:10px;letter-spacing:-0.5px;line-height:1">
              ${nextDeadline.daysRemaining}d
            </div>
          </td>
        </tr>
      </table>
    </div>`
    : `
    ${divider}
    <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:14px;padding:18px;text-align:center">
      <p style="margin:0;font-size:15px;font-weight:700;color:#166534">All caught up — no urgent deadlines remaining.</p>
    </div>`;

  const content = `
    <!-- Success mark -->
    <div style="text-align:center;margin-bottom:24px">
      <div style="display:inline-block;width:64px;height:64px;background:#f0fdf4;border-radius:50%;line-height:64px;font-size:32px">✅</div>
    </div>

    <!-- Headline -->
    <h1 style="font-size:26px;font-weight:800;color:#1a1f36;margin:0 0 6px;text-align:center;letter-spacing:-0.5px">
      Submitted!
    </h1>
    <p style="margin:0 0 4px;font-size:16px;color:#374151;text-align:center;font-weight:600">
      ${collegeName} &mdash; ${deadlineType}
    </p>
    <p style="margin:0 0 28px;font-size:14px;color:#22c55e;text-align:center;font-weight:600">
      ${motivationalLine}
    </p>

    ${nextDeadlineBlock}

    <!-- CTA -->
    <div style="margin-top:28px">
      ${ctaButton('Back to Dashboard →', 'https://due.college/dashboard')}
    </div>

    <!-- Sign-off -->
    <p style="margin:20px 0 0;font-size:13px;color:#aeaeb2;text-align:center">
      Hi ${studentName} — we logged this when you marked the deadline complete.
    </p>
  `;

  return emailShell({
    title: `${collegeName} ${deadlineType} submitted`,
    accentColor: '#22c55e',
    content,
    unsubscribeUrl,
  });
}

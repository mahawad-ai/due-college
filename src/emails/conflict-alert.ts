import { emailShell, ctaButton } from './base';

interface ConflictDeadline {
  college: string;
  type: string;
  date: string;
  daysRemaining: number;
}

interface ConflictAlertEmailProps {
  studentName: string;
  conflicts: { week: string; count: number; deadlines: ConflictDeadline[] }[];
  unsubscribeUrl: string;
}

export function renderConflictAlertEmail({
  studentName,
  conflicts,
  unsubscribeUrl,
}: ConflictAlertEmailProps): string {
  const firstName = studentName.split(' ')[0];

  const conflictBlocks = conflicts
    .map((c) => {
      const deadlineRows = c.deadlines
        .sort((a, b) => a.daysRemaining - b.daysRemaining)
        .map(
          (d, i) => `
          <tr style="background:${i % 2 === 0 ? '#ffffff' : '#fffbf0'}">
            <td style="padding:10px 14px;font-size:14px;font-weight:600;color:#1a1f36;border-bottom:1px solid #fef3c7">
              ${d.college}
            </td>
            <td style="padding:10px 8px;border-bottom:1px solid #fef3c7">
              <span style="background:#fef3c7;color:#92400e;font-size:11px;font-weight:700;padding:3px 9px;border-radius:100px;letter-spacing:0.2px">${d.type}</span>
            </td>
            <td style="padding:10px 14px;font-size:13px;color:#6b7280;border-bottom:1px solid #fef3c7;text-align:right;white-space:nowrap">
              ${d.date}
            </td>
          </tr>`
        )
        .join('');

      return `
      <div style="border:1px solid #fde68a;border-radius:14px;overflow:hidden;margin-bottom:16px">
        <div style="background:#fffbeb;padding:12px 16px;border-bottom:1px solid #fde68a">
          <p style="margin:0;font-weight:800;color:#92400e;font-size:14px;letter-spacing:-0.2px">
            Week of ${c.week} &mdash; ${c.count} deadlines overlap
          </p>
        </div>
        <table width="100%" cellpadding="0" cellspacing="0">
          ${deadlineRows}
        </table>
      </div>`;
    })
    .join('');

  const content = `
    <!-- Label -->
    <p style="margin:0 0 6px;font-size:11px;font-weight:700;color:#c77500;text-transform:uppercase;letter-spacing:0.8px">
      Conflict detected
    </p>

    <!-- Headline -->
    <h1 style="font-size:26px;font-weight:800;color:#1a1f36;margin:0 0 12px;letter-spacing:-0.5px">
      Heads up, ${firstName} &mdash;<br>
      <span style="color:#ff9f0a">deadlines are stacking up</span>
    </h1>
    <p style="margin:0 0 24px;font-size:14px;color:#6b7280;line-height:1.6">
      You have multiple deadlines falling in the same week. Getting ahead now is the difference between a polished application and a rushed one.
    </p>

    ${conflictBlocks}

    <!-- Tip box -->
    <div style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:14px;padding:16px;margin-bottom:24px">
      <p style="margin:0 0 4px;font-size:13px;font-weight:700;color:#0369a1">Suggested approach</p>
      <p style="margin:0;font-size:13px;color:#6b7280;line-height:1.5">
        Prioritize binding decisions (ED) first, then EA schools, then RD. Draft essays for all schools simultaneously so you're never starting from scratch.
      </p>
    </div>

    <!-- CTA -->
    ${ctaButton('Open My Dashboard →', 'https://due.college/dashboard', '#ff9f0a')}

    <!-- Sign-off -->
    <p style="margin:20px 0 0;font-size:13px;color:#aeaeb2;text-align:center">
      Hi ${studentName} — this alert was generated automatically from your deadline list.
    </p>
  `;

  return emailShell({
    title: `Deadline conflict detected — ${conflicts.length} week${conflicts.length !== 1 ? 's' : ''} affected`,
    accentColor: '#ff9f0a',
    content,
    unsubscribeUrl,
  });
}

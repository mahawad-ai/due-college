interface ConflictDeadline {
  college: string;
  type: string;
  date: string;
  daysRemaining: number;
}

interface ConflictAlertEmailProps {
  studentName: string;
  conflicts: { week: string; count: number; deadlines: ConflictDeadline[] }[];
}

export function renderConflictAlertEmail({ studentName, conflicts }: ConflictAlertEmailProps): string {
  const conflictBlocks = conflicts
    .map((c) => {
      const deadlineRows = c.deadlines
        .sort((a, b) => a.daysRemaining - b.daysRemaining)
        .map(
          (d, i) =>
            `<tr style="background:${i % 2 === 0 ? '#fff' : '#f9fafb'}">
              <td style="padding:10px 14px;font-size:14px;font-weight:600;color:#1a1f36">${i + 1}. ${d.college}</td>
              <td style="padding:10px 14px">
                <span style="background:#fef3c7;color:#92400e;font-size:12px;font-weight:700;padding:2px 8px;border-radius:100px">${d.type}</span>
              </td>
              <td style="padding:10px 14px;font-size:13px;color:#6b7280">${d.date}</td>
            </tr>`
        )
        .join('');

      return `
      <div style="border:1px solid #fde68a;border-radius:16px;overflow:hidden;margin-bottom:16px">
        <div style="background:#fffbeb;padding:14px 18px;border-bottom:1px solid #fde68a">
          <p style="margin:0;font-weight:800;color:#1a1f36;font-size:15px">
            ⚠️ Week of ${c.week} — ${c.count} deadlines
          </p>
        </div>
        <table width="100%" cellpadding="0" cellspacing="0">
          ${deadlineRows}
        </table>
      </div>`;
    })
    .join('');

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
      <h1 style="font-size:22px;font-weight:800;color:#1a1f36;margin:0 0 8px">
        ⚠️ Heads up, ${studentName}
      </h1>
      <p style="color:#6b7280;font-size:15px;margin:0 0 24px">
        You have multiple deadlines in the same week. Starting early is the key to not scrambling.
        Here's what's overlapping:
      </p>

      ${conflictBlocks}

      <div style="background:#f0f9ff;border-radius:12px;padding:16px;margin-bottom:24px">
        <p style="margin:0;font-size:13px;color:#1a1f36;font-weight:600">💡 Suggested approach</p>
        <p style="margin:6px 0 0;font-size:13px;color:#6b7280">
          Prioritize binding decisions (ED1) first, then EA schools, then Regular Decision.
          Work on essays for all schools simultaneously so you're not starting from scratch.
        </p>
      </div>

      <a href="https://due.college/dashboard" style="display:block;text-align:center;background:#1a1f36;color:#fff;padding:14px 24px;border-radius:12px;font-weight:700;text-decoration:none;font-size:15px">
        View My Full Dashboard →
      </a>
    </div>

    <p style="text-align:center;font-size:12px;color:#9ca3af;margin-top:24px">
      due.college · <a href="https://due.college/settings" style="color:#9ca3af">Manage notifications</a>
    </p>
  </div>
</body>
</html>`;
}

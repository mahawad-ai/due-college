interface WelcomeEmailProps {
  studentName: string;
  colleges: string[];
  nextDeadline?: { college: string; type: string; date: string; daysRemaining: number };
}

export function renderWelcomeEmail({ studentName, colleges, nextDeadline }: WelcomeEmailProps): string {
  const collegeList = colleges
    .map(
      (name) =>
        `<li style="padding:6px 0;color:#374151;font-size:14px;border-bottom:1px solid #f3f4f6">
          <span style="color:#6bcb77;font-weight:700;margin-right:8px">✓</span>${name}
        </li>`
    )
    .join('');

  const nextDeadlineBlock = nextDeadline
    ? `<div style="background:#fef3f2;border:1px solid #fecaca;border-radius:16px;padding:20px;margin:24px 0">
        <p style="margin:0 0 4px;font-size:13px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.5px;font-weight:600">Next Deadline</p>
        <p style="margin:0;font-size:18px;font-weight:800;color:#1a1f36">${nextDeadline.college} — ${nextDeadline.type}</p>
        <p style="margin:4px 0 0;font-size:14px;color:#ff6b6b;font-weight:600">${nextDeadline.date} · ${nextDeadline.daysRemaining} days away</p>
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
      <div style="text-align:center;margin-bottom:24px">
        <span style="font-size:48px">🎓</span>
      </div>
      <h1 style="font-size:24px;font-weight:800;color:#1a1f36;margin:0 0 8px;text-align:center">
        You're all set, ${studentName}!
      </h1>
      <p style="color:#6b7280;text-align:center;margin:0 0 28px">
        We're tracking deadlines for ${colleges.length} school${colleges.length !== 1 ? 's' : ''}.
        You'll get reminders before every one of them.
      </p>

      ${nextDeadlineBlock}

      <h2 style="font-size:15px;font-weight:700;color:#1a1f36;margin:0 0 8px">Your schools</h2>
      <ul style="list-style:none;margin:0 0 24px;padding:0">
        ${collegeList}
      </ul>

      <a href="https://due.college/dashboard" style="display:block;text-align:center;background:#1a1f36;color:#fff;padding:14px 24px;border-radius:12px;font-weight:700;text-decoration:none;font-size:15px">
        View My Deadlines →
      </a>

      <div style="background:#f0f9ff;border-radius:16px;padding:20px;margin-top:20px;text-align:center">
        <p style="margin:0 0 8px;font-size:14px;color:#1a1f36;font-weight:600">Keep your parents in the loop 👪</p>
        <p style="margin:0 0 12px;font-size:13px;color:#6b7280">Invite them to view your deadlines — they'll thank you later.</p>
        <a href="https://due.college/invite" style="font-size:14px;color:#ff6b6b;font-weight:700;text-decoration:none">Invite a Parent →</a>
      </div>
    </div>

    <p style="text-align:center;font-size:12px;color:#9ca3af;margin-top:24px">
      due.college · Free forever · <a href="https://due.college/settings" style="color:#9ca3af">Manage notifications</a>
    </p>
  </div>
</body>
</html>`;
}

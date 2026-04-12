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

  const collegeList = colleges
    .slice(0, 8)
    .map(
      (name) =>
        `<li style="padding:5px 0;color:#374151;font-size:14px">
          <span style="color:#6bcb77;margin-right:8px">•</span>${name}
        </li>`
    )
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
        Hi ${parentName} 👋
      </h1>
      <p style="color:#6b7280;font-size:15px;margin:0 0 24px">
        <strong>${studentName}</strong> added you to their college deadline tracker on due.college.
        You'll be able to see all their upcoming application deadlines in one place.
      </p>

      <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:16px;padding:20px;margin-bottom:24px">
        <p style="margin:0 0 10px;font-size:14px;font-weight:700;color:#166534">
          ${studentName} is applying to ${colleges.length} school${colleges.length !== 1 ? 's' : ''}:
        </p>
        <ul style="list-style:none;margin:0;padding:0">
          ${collegeList}
          ${colleges.length > 8 ? `<li style="padding:5px 0;color:#6b7280;font-size:13px">+ ${colleges.length - 8} more</li>` : ''}
        </ul>
      </div>

      <p style="color:#6b7280;font-size:14px;margin:0 0 20px">
        Your read-only dashboard shows every deadline, color-coded by urgency.
        You can also opt in for SMS reminders so you never have to wonder where things stand.
      </p>

      <a href="${dashboardUrl}" style="display:block;text-align:center;background:#ff6b6b;color:#fff;padding:16px 24px;border-radius:14px;font-weight:700;text-decoration:none;font-size:16px;margin-bottom:16px">
        View ${studentName}'s Deadlines →
      </a>

      <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:12px;padding:16px;margin-top:4px">
        <p style="margin:0;font-size:13px;color:#92400e">
          📱 <strong>Enable SMS reminders</strong> on the dashboard to get a text every time a deadline is approaching.
        </p>
      </div>
    </div>

    <div style="background:#f9fafb;border-radius:16px;padding:20px;margin-top:16px">
      <p style="margin:0 0 6px;font-size:13px;font-weight:700;color:#374151">What is due.college?</p>
      <p style="margin:0;font-size:13px;color:#6b7280">
        A free deadline tracker for high school students applying to college. It tracks ED1, EA, RD, FAFSA,
        and other critical deadlines — and sends reminders at 30, 14, 7, 3, and 1 day before each one.
      </p>
    </div>

    <p style="text-align:center;font-size:12px;color:#9ca3af;margin-top:20px">
      due.college · You were invited by ${studentName} ·
      <a href="https://due.college/unsubscribe" style="color:#9ca3af">Unsubscribe</a>
    </p>
  </div>
</body>
</html>`;
}

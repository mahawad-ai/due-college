interface NudgeEmailProps {
  studentName: string;
  parentName: string;
  message: string;
  deadlineContext: string; // e.g. "MIT ED1 — due January 1" or empty
}

export function renderNudgeEmail({
  studentName,
  parentName,
  message,
  deadlineContext,
}: NudgeEmailProps): string {
  const firstName = studentName.split(' ')[0];

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
        Hey ${firstName} 👋
      </h1>
      <p style="color:#6b7280;font-size:15px;margin:0 0 20px">
        <strong>${parentName}</strong> sent you a nudge:
      </p>

      <div style="background:#f0f4ff;border:1px solid #dbeafe;border-radius:16px;padding:20px;margin-bottom:20px">
        <p style="margin:0;font-size:16px;color:#1e40af;font-style:italic;line-height:1.5">
          "${message}"
        </p>
      </div>

      ${deadlineContext ? `
      <div style="background:#fff8f0;border:1px solid #fed7aa;border-radius:12px;padding:14px;margin-bottom:20px">
        <p style="margin:0;font-size:14px;color:#92400e">
          📅 <strong>${deadlineContext}</strong>
        </p>
      </div>
      ` : ''}

      <a href="https://due.college/deadlines" style="display:block;text-align:center;background:#ff3b30;color:#fff;padding:16px 24px;border-radius:14px;font-weight:700;text-decoration:none;font-size:16px;margin-bottom:8px">
        Open My Deadlines →
      </a>
      <p style="text-align:center;font-size:13px;color:#aeaeb2;margin:0">
        You've got this! 💪
      </p>
    </div>

    <p style="text-align:center;font-size:12px;color:#9ca3af;margin-top:20px">
      due.college · Sent on behalf of ${parentName} ·
      <a href="https://due.college/unsubscribe" style="color:#9ca3af">Unsubscribe</a>
    </p>
  </div>
</body>
</html>`;
}

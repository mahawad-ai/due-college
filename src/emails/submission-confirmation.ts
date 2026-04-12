interface SubmissionConfirmationEmailProps {
  studentName: string;
  collegeName: string;
  deadlineType: string;
  nextDeadline?: { college: string; type: string; date: string; daysRemaining: number };
}

export function renderSubmissionConfirmationEmail({
  studentName,
  collegeName,
  deadlineType,
  nextDeadline,
}: SubmissionConfirmationEmailProps): string {
  const motivationalLines = [
    'One down. Keep the momentum going.',
    'That took courage. The rest will come easier.',
    "You're officially in the running. Go celebrate (briefly).",
    "Every application submitted is a door that might open.",
    "That's one more school that gets to say yes.",
  ];
  const motivationalLine = motivationalLines[Math.floor(Math.random() * motivationalLines.length)];

  const nextDeadlineBlock = nextDeadline
    ? `<div style="background:#fef3f2;border:1px solid #fecaca;border-radius:16px;padding:20px;margin:24px 0">
        <p style="margin:0 0 4px;font-size:13px;color:#9ca3af;font-weight:600;text-transform:uppercase;letter-spacing:0.5px">Up Next</p>
        <p style="margin:0;font-size:16px;font-weight:800;color:#1a1f36">${nextDeadline.college} — ${nextDeadline.type}</p>
        <p style="margin:4px 0 0;font-size:14px;color:#ff6b6b;font-weight:600">${nextDeadline.date} · ${nextDeadline.daysRemaining} days away</p>
      </div>`
    : `<div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:16px;padding:20px;margin:24px 0;text-align:center">
        <p style="margin:0;font-size:15px;font-weight:700;color:#166534">🎉 All caught up! No urgent deadlines.</p>
      </div>`;

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

    <div style="background:#fff;border-radius:24px;border:1px solid #e5e7eb;padding:32px;text-align:center">
      <div style="font-size:56px;margin-bottom:16px">✅</div>
      <h1 style="font-size:24px;font-weight:800;color:#1a1f36;margin:0 0 8px">
        ${collegeName} ${deadlineType} submitted!
      </h1>
      <p style="color:#6b7280;font-size:15px;margin:0 0 4px">
        Nice work, ${studentName}.
      </p>
      <p style="color:#6bcb77;font-size:15px;font-weight:600;margin:0">
        ${motivationalLine}
      </p>

      ${nextDeadlineBlock}

      <a href="https://due.college/dashboard" style="display:inline-block;background:#1a1f36;color:#fff;padding:14px 32px;border-radius:12px;font-weight:700;text-decoration:none;font-size:15px">
        Back to Dashboard
      </a>
    </div>

    <p style="text-align:center;font-size:12px;color:#9ca3af;margin-top:24px">
      due.college · <a href="https://due.college/settings" style="color:#9ca3af">Settings</a>
    </p>
  </div>
</body>
</html>`;
}

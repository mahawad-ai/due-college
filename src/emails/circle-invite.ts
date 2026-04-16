interface CircleInviteEmailProps {
  senderName: string;
  inviteUrl: string;
}

export function renderCircleInviteEmail({
  senderName,
  inviteUrl,
}: CircleInviteEmailProps): string {
  const firstName = senderName.split(' ')[0];

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
      <h1 style="font-size:22px;font-weight:800;color:#1a1f36;margin:0 0 8px;text-align:center">
        ${firstName} wants you in their Circle 🎯
      </h1>
      <p style="color:#6b7280;font-size:15px;margin:0 0 24px;text-align:center">
        <strong>${senderName}</strong> invited you to join their accountability circle on due.college.
        Track college deadlines together and keep each other on track.
      </p>

      <div style="background:#f5f5f7;border-radius:16px;padding:20px;margin-bottom:24px">
        <p style="margin:0 0 12px;font-size:14px;font-weight:700;color:#1a1f36">
          What you get in a Circle:
        </p>
        <table style="width:100%;border-collapse:collapse">
          <tr>
            <td style="padding:6px 0;font-size:14px;color:#374151;vertical-align:top;width:28px">🎯</td>
            <td style="padding:6px 0;font-size:14px;color:#374151">See each other's deadline progress</td>
          </tr>
          <tr>
            <td style="padding:6px 0;font-size:14px;color:#374151;vertical-align:top">🔥</td>
            <td style="padding:6px 0;font-size:14px;color:#374151">Streak tracking & friendly competition</td>
          </tr>
          <tr>
            <td style="padding:6px 0;font-size:14px;color:#374151;vertical-align:top">💬</td>
            <td style="padding:6px 0;font-size:14px;color:#374151">React to milestones & cheer each other on</td>
          </tr>
          <tr>
            <td style="padding:6px 0;font-size:14px;color:#374151;vertical-align:top">📋</td>
            <td style="padding:6px 0;font-size:14px;color:#374151">Group challenges to stay on track</td>
          </tr>
        </table>
      </div>

      <a href="${inviteUrl}" style="display:block;text-align:center;background:#ff3b30;color:#fff;padding:16px 24px;border-radius:14px;font-weight:700;text-decoration:none;font-size:16px;margin-bottom:8px">
        Join ${firstName}'s Circle →
      </a>
      <p style="text-align:center;font-size:13px;color:#aeaeb2;margin:0">
        Free · Takes 30 seconds to set up
      </p>
    </div>

    <div style="background:#f9fafb;border-radius:16px;padding:20px;margin-top:16px">
      <p style="margin:0 0 6px;font-size:13px;font-weight:700;color:#374151">What is due.college?</p>
      <p style="margin:0;font-size:13px;color:#6b7280">
        A free deadline tracker for high school students applying to college. It tracks ED1, EA, RD, FAFSA,
        and other critical deadlines — and sends reminders before each one.
      </p>
    </div>

    <p style="text-align:center;font-size:12px;color:#9ca3af;margin-top:20px">
      due.college · Invited by ${senderName} ·
      <a href="https://due.college/unsubscribe" style="color:#9ca3af">Unsubscribe</a>
    </p>
  </div>
</body>
</html>`;
}

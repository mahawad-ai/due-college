import { emailShell, ctaButton } from './base';

interface CircleInviteEmailProps {
  senderName: string;
  inviteUrl: string;
}

export function renderCircleInviteEmail({
  senderName,
  inviteUrl,
}: CircleInviteEmailProps): string {
  const firstName = senderName.split(' ')[0];

  const features = [
    { icon: '🎯', text: 'See each other\'s deadline progress' },
    { icon: '🔥', text: 'Streak tracking & friendly competition' },
    { icon: '💬', text: 'React to milestones & cheer each other on' },
    { icon: '📋', text: 'Group challenges to stay on track' },
  ];

  const featureRows = features
    .map(
      (f) => `
    <tr>
      <td style="padding:7px 0;vertical-align:top;width:28px;font-size:16px">${f.icon}</td>
      <td style="padding:7px 0 7px 8px;font-size:14px;color:#374151">${f.text}</td>
    </tr>`
    )
    .join('');

  const content = `
    <!-- Headline -->
    <h1 style="font-size:26px;font-weight:800;color:#1a1f36;margin:0 0 10px;text-align:center;letter-spacing:-0.5px">
      ${firstName} wants you in their Circle
    </h1>
    <p style="margin:0 0 28px;font-size:15px;color:#6b7280;text-align:center;line-height:1.6">
      <strong>${senderName}</strong> invited you to join their accountability circle on due.college.
      Track college deadlines together and keep each other on track.
    </p>

    <!-- Features card -->
    <div style="background:#f5f5f7;border-radius:14px;padding:20px;margin-bottom:24px">
      <p style="margin:0 0 14px;font-size:13px;font-weight:700;color:#1a1f36">What you get in a Circle:</p>
      <table width="100%" cellpadding="0" cellspacing="0">
        ${featureRows}
      </table>
    </div>

    <!-- CTA -->
    ${ctaButton(`Join ${firstName}'s Circle →`, inviteUrl, '#ff3b30')}

    <p style="margin:12px 0 0;font-size:13px;color:#aeaeb2;text-align:center">
      Free &middot; Takes 30 seconds to set up
    </p>

    <!-- What is due.college -->
    <div style="margin-top:24px;padding:16px;background:#f5f5f7;border-radius:14px">
      <p style="margin:0 0 4px;font-size:12px;font-weight:700;color:#374151">What is due.college?</p>
      <p style="margin:0;font-size:12px;color:#6b7280;line-height:1.5">
        A free deadline tracker for high school students applying to college. It tracks ED1, EA, RD, FAFSA, and other critical deadlines — and sends reminders before every one.
      </p>
    </div>

    <!-- Sign-off -->
    <p style="margin:20px 0 0;font-size:13px;color:#aeaeb2;text-align:center">
      Invited by ${senderName} &middot; <a href="https://due.college/unsubscribe" style="color:#aeaeb2;text-decoration:none">Unsubscribe</a>
    </p>
  `;

  return emailShell({
    title: `${senderName} invited you to their due.college Circle`,
    accentColor: '#ff3b30',
    content,
    unsubscribeUrl: 'https://due.college/unsubscribe',
  });
}

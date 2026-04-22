import { emailShell, ctaButton } from './base';

interface CircleJoinedEmailProps {
  ownerName: string;
  joinerName: string;
  joinerAvatar?: string;
  memberCount: number;
  circleUrl: string;
}

export function renderCircleJoinedEmail({
  ownerName,
  joinerName,
  joinerAvatar,
  memberCount,
  circleUrl,
}: CircleJoinedEmailProps): string {
  const ownerFirst = ownerName.split(' ')[0];
  const joinerFirst = joinerName.split(' ')[0];

  const content = `
    <!-- Headline -->
    <h1 style="font-size:26px;font-weight:800;color:#1a1f36;margin:0 0 6px;letter-spacing:-0.5px">
      ${joinerFirst} joined your Circle! 🎉
    </h1>
    <p style="margin:0 0 28px;font-size:15px;color:#6b7280">
      Hey ${ownerFirst} — your invite worked.
    </p>

    <!-- Member card -->
    <div style="background:#f5f5f7;border-radius:14px;padding:20px;margin-bottom:24px">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="vertical-align:middle;width:52px">
            <div style="width:44px;height:44px;border-radius:50%;background:linear-gradient(135deg,#ff3b30,#ff6b6b);text-align:center;line-height:44px;font-size:20px;font-weight:800;color:#fff">
              ${joinerName.charAt(0).toUpperCase()}
            </div>
          </td>
          <td style="padding-left:14px;vertical-align:middle">
            <p style="margin:0;font-size:16px;font-weight:700;color:#1a1f36">${joinerName}</p>
            <p style="margin:3px 0 0;font-size:13px;color:#aeaeb2">Just joined your Circle</p>
          </td>
          <td style="text-align:right;vertical-align:middle">
            <div style="display:inline-block;background:#1a1f36;color:#fff;font-size:12px;font-weight:700;padding:4px 12px;border-radius:100px">
              ${memberCount} member${memberCount !== 1 ? 's' : ''}
            </div>
          </td>
        </tr>
      </table>
    </div>

    <!-- What's next -->
    <div style="background:#fff5f5;border:1px solid #fecaca;border-radius:14px;padding:16px;margin-bottom:24px">
      <p style="margin:0 0 4px;font-size:13px;font-weight:700;color:#991b1b">Keep the momentum going</p>
      <p style="margin:0;font-size:13px;color:#6b7280;line-height:1.5">
        You can now see each other's deadline progress, react to milestones, and run group challenges together.
      </p>
    </div>

    <!-- CTA -->
    ${ctaButton('Open My Circle →', circleUrl, '#ff3b30')}

    <!-- Sign-off -->
    <p style="margin:20px 0 0;font-size:13px;color:#aeaeb2;text-align:center">
      due.college &mdash; your accountability circle
    </p>
  `;

  return emailShell({
    title: `${joinerName} joined your Circle on due.college`,
    accentColor: '#ff3b30',
    content,
    unsubscribeUrl: 'https://due.college/settings',
  });
}

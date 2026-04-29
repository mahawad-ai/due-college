import { emailShell, ctaButton } from './base';

interface WelcomeSignupEmailProps {
  firstName: string;
}

/**
 * Sent immediately when a new user creates an account.
 * At this point they haven't added any colleges yet — so we keep
 * it warm and action-oriented rather than listing schools.
 */
export function renderWelcomeSignupEmail({ firstName }: WelcomeSignupEmailProps): string {
  const name = firstName || 'there';

  const content = `
    <!-- Headline -->
    <h1 style="font-size:26px;font-weight:800;color:#1a1f36;margin:0 0 10px;letter-spacing:-0.5px">
      Welcome to due.college, ${name}! 🎉
    </h1>
    <p style="margin:0 0 24px;font-size:15px;color:#6b7280;line-height:1.6">
      You just joined thousands of students who never miss a college deadline.
      Here's what you can do right now to get set up.
    </p>

    <!-- Steps -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px">
      <tr>
        <td style="padding:10px 0;vertical-align:top;width:32px">
          <div style="width:24px;height:24px;background:#ff3b30;border-radius:50%;text-align:center;line-height:24px;font-size:12px;color:#fff;font-weight:800">1</div>
        </td>
        <td style="padding:10px 0 10px 12px">
          <p style="margin:0;font-size:14px;font-weight:700;color:#1a1f36">Add your colleges</p>
          <p style="margin:2px 0 0;font-size:13px;color:#6b7280">Search from 243 schools — deadlines auto-populate.</p>
        </td>
      </tr>
      <tr>
        <td style="padding:10px 0;vertical-align:top;width:32px">
          <div style="width:24px;height:24px;background:#ff3b30;border-radius:50%;text-align:center;line-height:24px;font-size:12px;color:#fff;font-weight:800">2</div>
        </td>
        <td style="padding:10px 0 10px 12px">
          <p style="margin:0;font-size:14px;font-weight:700;color:#1a1f36">Track essays &amp; recommendations</p>
          <p style="margin:2px 0 0;font-size:13px;color:#6b7280">Word counts, prompts, and recommender status in one place.</p>
        </td>
      </tr>
      <tr>
        <td style="padding:10px 0;vertical-align:top;width:32px">
          <div style="width:24px;height:24px;background:#ff3b30;border-radius:50%;text-align:center;line-height:24px;font-size:12px;color:#fff;font-weight:800">3</div>
        </td>
        <td style="padding:10px 0 10px 12px">
          <p style="margin:0;font-size:14px;font-weight:700;color:#1a1f36">Invite friends to your Circle</p>
          <p style="margin:2px 0 0;font-size:13px;color:#6b7280">Stay accountable together — share milestones and cheer each other on.</p>
        </td>
      </tr>
    </table>

    <!-- CTA -->
    ${ctaButton('Go to My Dashboard →', 'https://due.college/dashboard', '#ff3b30')}

    <!-- Sign-off -->
    <p style="margin:24px 0 0;font-size:13px;color:#aeaeb2;text-align:center;line-height:1.6">
      Questions? Reply to this email or reach us at
      <a href="mailto:hello@due.college" style="color:#aeaeb2">hello@due.college</a>.<br>
      We&apos;re rooting for you.
    </p>
  `;

  return emailShell({
    title: `Welcome to due.college, ${name}!`,
    accentColor: '#ff3b30',
    content,
    unsubscribeUrl: 'https://due.college/settings',
  });
}

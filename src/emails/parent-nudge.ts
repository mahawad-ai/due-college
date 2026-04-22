import { emailShell, ctaButton } from './base';

interface NudgeEmailProps {
  studentName: string;
  parentName: string;
  message: string;
  deadlineContext: string;
  unsubscribeUrl: string;
}

export function renderNudgeEmail({
  studentName,
  parentName,
  message,
  deadlineContext,
  unsubscribeUrl,
}: NudgeEmailProps): string {
  const firstName = studentName.split(' ')[0];

  const deadlineBlock = deadlineContext
    ? `<div style="background:#fffbf0;border:1px solid #fed7aa;border-radius:14px;padding:14px 16px;margin-bottom:24px">
        <p style="margin:0 0 2px;font-size:11px;font-weight:700;color:#aeaeb2;text-transform:uppercase;letter-spacing:0.8px">Related deadline</p>
        <p style="margin:4px 0 0;font-size:14px;font-weight:700;color:#92400e">${deadlineContext}</p>
      </div>`
    : '';

  const content = `
    <!-- Headline -->
    <h1 style="font-size:26px;font-weight:800;color:#1a1f36;margin:0 0 10px;letter-spacing:-0.5px">
      Hey ${firstName} 👋
    </h1>
    <p style="margin:0 0 20px;font-size:15px;color:#6b7280">
      <strong>${parentName}</strong> sent you a nudge:
    </p>

    <!-- Message bubble -->
    <div style="background:#f0f4ff;border:1px solid #dbeafe;border-radius:14px;padding:20px;margin-bottom:20px">
      <p style="margin:0;font-size:16px;color:#1e40af;font-style:italic;line-height:1.6">
        &ldquo;${message}&rdquo;
      </p>
    </div>

    ${deadlineBlock}

    <!-- CTA -->
    ${ctaButton('Open My Deadlines →', 'https://due.college/deadlines', '#ff3b30')}

    <!-- Sign-off -->
    <p style="margin:20px 0 0;font-size:13px;color:#aeaeb2;text-align:center">
      You've got this, ${firstName}. &mdash; due.college
    </p>
  `;

  return emailShell({
    title: `${parentName} sent you a nudge`,
    accentColor: '#ff3b30',
    content,
    unsubscribeUrl,
  });
}

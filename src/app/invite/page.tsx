'use client';

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import TopNav from '@/components/TopNav';
import MobileNav from '@/components/MobileNav';

export default function InvitePage() {
  const { user } = useUser();
  const [form, setForm] = useState({ name: '', email: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [accessToken, setAccessToken] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.email) {
      setError('Name and email are required.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/invite-parent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send invite');
      setEmailSent(data.emailSent ?? false);
      setAccessToken(data.accessToken || '');
      setSuccess(true);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    const parentUrl = accessToken ? `${typeof window !== 'undefined' ? window.location.origin : 'https://due.college'}/parent/${accessToken}` : '';

    return (
      <>
        <TopNav />
        <main className="min-h-screen bg-white flex flex-col items-center justify-center px-4 pb-24 pt-[52px]">
          <div className="max-w-container w-full">
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">{emailSent ? '🎉' : '⚠️'}</div>
              <h1 className="text-3xl font-extrabold text-navy mb-2">
                {emailSent ? 'Invite sent!' : 'Link ready — email may not have arrived'}
              </h1>
              {emailSent ? (
                <p className="text-gray-500">
                  <strong>{form.name}</strong> will receive an email with a link to your read-only deadline dashboard.
                </p>
              ) : (
                <p className="text-gray-500">
                  The parent connection was created, but the invite email may not have been delivered.
                  Share the link below with <strong>{form.name}</strong> directly.
                </p>
              )}
            </div>

            {/* Always show the shareable link */}
            {parentUrl && (
              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 mb-6">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                  Parent view link — share this directly
                </p>
                <div className="flex items-center gap-2">
                  <input
                    readOnly
                    value={parentUrl}
                    className="flex-1 text-sm text-gray-700 bg-white border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none"
                    onFocus={e => e.target.select()}
                  />
                  <button
                    onClick={() => navigator.clipboard.writeText(parentUrl)}
                    className="px-4 py-2.5 bg-navy text-white text-sm font-semibold rounded-xl hover:bg-navy/90 transition-colors whitespace-nowrap"
                  >
                    Copy
                  </button>
                </div>
                {form.phone && (
                  <p className="text-xs text-gray-400 mt-2">
                    {form.name} can also opt in for SMS reminders from the dashboard.
                  </p>
                )}
              </div>
            )}

            <Link
              href="/dashboard"
              className="w-full flex items-center justify-center gap-2 bg-navy text-white font-semibold px-6 py-3 rounded-xl hover:bg-navy/90 transition-colors"
            >
              Back to Dashboard
            </Link>
          </div>
        </main>
        <MobileNav />
      </>
    );
  }

  return (
    <>
      <TopNav />
      <main className="min-h-screen bg-white pb-24 pt-[52px]">
        <div className="max-w-container mx-auto px-4 py-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-gray-500 hover:text-navy text-sm font-medium mb-8 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </Link>

          <div className="text-center mb-8">
            <div className="text-4xl mb-3">👪</div>
            <h1 className="text-3xl font-extrabold text-navy mb-2">Invite a Parent</h1>
            <p className="text-gray-500">
              They&apos;ll get a read-only view of your deadlines and can opt in for SMS reminders.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-navy mb-1.5">Parent&apos;s Name *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Mom / Dad / Guardian"
                className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-navy transition-colors bg-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-navy mb-1.5">Parent&apos;s Email *</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="parent@email.com"
                className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-navy transition-colors bg-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-navy mb-1.5">
                Parent&apos;s Phone{' '}
                <span className="font-normal text-gray-400">(optional — for SMS reminders)</span>
              </label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+1 (555) 555-5555"
                className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-navy transition-colors bg-white"
              />
            </div>

            {error && (
              <div className="bg-red-50 text-red-700 rounded-xl p-3 text-sm">{error}</div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-coral text-white font-bold text-base rounded-xl hover:bg-coral/90 transition-colors shadow-lg shadow-coral/20 disabled:opacity-50"
            >
              {loading ? 'Sending invite...' : 'Send Invite Email'}
            </button>
          </form>

          <p className="text-xs text-gray-400 text-center mt-4">
            Your parent will only be able to view your deadlines, not edit them.
            SMS reminders require a Family plan subscription.
          </p>
        </div>
      </main>
      <MobileNav />
    </>
  );
}

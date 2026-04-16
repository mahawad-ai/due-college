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
      setSuccess(true);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <>
        <TopNav />
        <main className="min-h-screen bg-white flex flex-col items-center justify-center px-4 pb-24 pt-[52px]">
          <div className="max-w-container w-full text-center">
            <div className="text-6xl mb-6">🎉</div>
            <h1 className="text-3xl font-extrabold text-navy mb-3">Invite sent!</h1>
            <p className="text-gray-500 mb-2">
              <strong>{form.name}</strong> will receive an email with a link to your read-only deadline dashboard.
            </p>
            {form.phone && (
              <p className="text-gray-500 mb-6">
                They can also opt in for SMS reminders from that email.
              </p>
            )}
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 bg-navy text-white font-semibold px-6 py-3 rounded-xl hover:bg-navy/90 transition-colors"
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

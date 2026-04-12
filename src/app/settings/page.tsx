'use client';

import { useEffect, useState } from 'react';
import { useUser, UserButton } from '@clerk/nextjs';
import Link from 'next/link';
import MobileNav from '@/components/MobileNav';
import { NotificationPreferences, UserProfile } from '@/lib/types';

export default function SettingsPage() {
  const { user } = useUser();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [prefs, setPrefs] = useState<NotificationPreferences | null>(null);
  const [phone, setPhone] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function load() {
      const [profileRes, prefsRes] = await Promise.all([
        fetch('/api/user-profile'),
        fetch('/api/notification-preferences'),
      ]);
      const profileData = await profileRes.json();
      const prefsData = await prefsRes.json();
      setProfile(profileData);
      setPrefs(prefsData);
      setPhone(profileData.phone || '');
    }
    load();
  }, []);

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    try {
      await fetch('/api/user-profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });
      setSaved(true);
    } finally {
      setSaving(false);
    }
  }

  async function updatePref(key: keyof NotificationPreferences, value: boolean) {
    if (!prefs) return;
    const updated = { ...prefs, [key]: value };
    setPrefs(updated);
    await fetch('/api/notification-preferences', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [key]: value }),
    });
  }

  const tierLabels: Record<string, string> = {
    free: 'Free',
    plus: 'Plus ($4.99/mo)',
    family: 'Family ($7.99/mo)',
  };

  return (
    <>
      <main className="min-h-screen bg-gray-50 pb-24">
        <div className="max-w-container mx-auto px-4 py-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <Link href="/dashboard" className="text-sm text-gray-500 hover:text-navy mb-1 block">
                ← Dashboard
              </Link>
              <h1 className="text-2xl font-extrabold text-navy">Settings</h1>
            </div>
            <UserButton appearance={{ elements: { avatarBox: 'w-10 h-10' } }} afterSignOutUrl="/" />
          </div>

          {/* Profile */}
          <div className="bg-white rounded-3xl border border-gray-200 p-6 mb-4">
            <h2 className="font-bold text-navy mb-4">Profile</h2>
            <div className="space-y-3 mb-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Name</label>
                <p className="text-navy font-medium mt-0.5">{user?.fullName || '—'}</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Email</label>
                <p className="text-navy font-medium mt-0.5">{user?.primaryEmailAddress?.emailAddress || '—'}</p>
              </div>
            </div>

            <form onSubmit={saveProfile}>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                Phone Number
              </label>
              <div className="flex gap-3">
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 555-5555"
                  className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-navy text-sm"
                />
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-3 bg-navy text-white text-sm font-semibold rounded-xl hover:bg-navy/90 transition-colors"
                >
                  {saving ? '...' : 'Save'}
                </button>
              </div>
              {saved && <p className="text-green-600 text-xs mt-1.5">✓ Saved</p>}
            </form>
          </div>

          {/* Notifications */}
          {prefs && (
            <div className="bg-white rounded-3xl border border-gray-200 p-6 mb-4">
              <h2 className="font-bold text-navy mb-4">Notifications</h2>

              <div className="space-y-4">
                {/* Email */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-navy text-sm">Email reminders</p>
                    <p className="text-xs text-gray-400">Always enabled</p>
                  </div>
                  <div className="w-11 h-6 bg-green rounded-full opacity-50 cursor-not-allowed" />
                </div>

                {/* SMS */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-navy text-sm">SMS reminders</p>
                    <p className="text-xs text-gray-400">
                      {profile?.subscription_tier === 'free'
                        ? 'Requires Plus or Family plan'
                        : 'Requires phone number'}
                    </p>
                  </div>
                  <button
                    onClick={() => updatePref('sms_enabled', !prefs.sms_enabled)}
                    disabled={profile?.subscription_tier === 'free'}
                    className={`w-11 h-6 rounded-full transition-colors ${
                      prefs.sms_enabled ? 'bg-green' : 'bg-gray-300'
                    } ${profile?.subscription_tier === 'free' ? 'opacity-50 cursor-not-allowed' : ''}`}
                  />
                </div>

                <hr className="border-gray-100" />

                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Remind me...</p>

                {(
                  [
                    { key: 'remind_30_days', label: '30 days before' },
                    { key: 'remind_14_days', label: '14 days before' },
                    { key: 'remind_7_days', label: '7 days before' },
                    { key: 'remind_3_days', label: '3 days before' },
                    { key: 'remind_1_day', label: '1 day before' },
                  ] as const
                ).map(({ key, label }) => (
                  <div key={key} className="flex items-center justify-between">
                    <label className="text-sm text-navy">{label}</label>
                    <button
                      onClick={() => updatePref(key, !prefs[key])}
                      className={`w-11 h-6 rounded-full transition-colors ${
                        prefs[key] ? 'bg-navy' : 'bg-gray-200'
                      }`}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Subscription */}
          <div className="bg-white rounded-3xl border border-gray-200 p-6 mb-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-navy">Subscription</h2>
              <span className="text-sm font-semibold text-coral bg-coral-light px-3 py-1 rounded-full">
                {tierLabels[profile?.subscription_tier || 'free']}
              </span>
            </div>
            <Link
              href="/upgrade"
              className="block w-full text-center py-3 border-2 border-coral text-coral font-semibold rounded-xl hover:bg-coral-light transition-colors text-sm"
            >
              {profile?.subscription_tier === 'free' ? 'Upgrade plan' : 'Manage subscription'}
            </Link>
          </div>

          {/* Danger Zone */}
          <div className="bg-white rounded-3xl border border-red-100 p-6">
            <h2 className="font-bold text-navy mb-4">Account</h2>
            <button className="text-sm text-red-500 hover:text-red-700 font-medium">
              Delete account
            </button>
          </div>
        </div>
      </main>
      <MobileNav />
    </>
  );
}

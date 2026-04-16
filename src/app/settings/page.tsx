'use client';

import { useEffect, useState } from 'react';
import { useUser, UserButton } from '@clerk/nextjs';
import Link from 'next/link';
import TopNav from '@/components/TopNav';
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

  return (
    <>
      <TopNav />
      <main className="min-h-screen bg-white pt-[90px] pb-28">
        <div className="max-w-container mx-auto px-4 py-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <Link href="/dashboard" className="text-sm text-[#86868b] hover:text-[#1d1d1f] mb-1 block">
                ← Dashboard
              </Link>
              <h1 className="text-[40px] font-[800] tracking-[-2px] text-[#1d1d1f] leading-none">Settings</h1>
            </div>
            <UserButton appearance={{ elements: { avatarBox: 'w-10 h-10' } }} afterSignOutUrl="/" />
          </div>

          {/* Profile */}
          <div className="bg-[#f5f5f7] rounded-2xl p-6 mb-4">
            <h2 className="font-[800] text-[#1d1d1f] mb-4">Profile</h2>
            <div className="space-y-3 mb-4">
              <div>
                <label className="text-[11px] font-[700] uppercase tracking-[0.7px] text-[#86868b]">Name</label>
                <p className="text-[#1d1d1f] font-medium mt-0.5">{user?.fullName || '—'}</p>
              </div>
              <div>
                <label className="text-[11px] font-[700] uppercase tracking-[0.7px] text-[#86868b]">Email</label>
                <p className="text-[#1d1d1f] font-medium mt-0.5">{user?.primaryEmailAddress?.emailAddress || '—'}</p>
              </div>
            </div>

            <form onSubmit={saveProfile}>
              <label className="block text-[11px] font-[700] uppercase tracking-[0.7px] text-[#86868b] mb-1.5">
                Phone Number
              </label>
              <div className="flex gap-3">
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 555-5555"
                  className="flex-1 px-4 py-3 border-2 border-[#e8e8ed] rounded-xl focus:outline-none focus:border-[#1d1d1f] text-sm bg-white"
                />
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-3 bg-[#ff3b30] text-white text-sm font-[600] rounded-xl hover:opacity-85 transition-opacity"
                >
                  {saving ? '...' : 'Save'}
                </button>
              </div>
              {saved && <p className="text-[#34c759] text-xs mt-1.5">✓ Saved</p>}
            </form>
          </div>

          {/* Notifications */}
          {prefs && (
            <div className="bg-[#f5f5f7] rounded-2xl p-6 mb-4">
              <h2 className="font-[800] text-[#1d1d1f] mb-4">Notifications</h2>

              <div className="space-y-4">
                {/* Email */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-[#1d1d1f] text-sm">Email reminders</p>
                    <p className="text-xs text-[#86868b]">Always enabled</p>
                  </div>
                  <div className="w-11 h-6 bg-[#34c759] rounded-full opacity-50 cursor-not-allowed" />
                </div>

                {/* SMS */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-[#1d1d1f] text-sm">SMS reminders</p>
                    <p className="text-xs text-[#86868b]">Coming soon</p>
                  </div>
                  <div className="w-11 h-6 bg-[#e8e8ed] rounded-full opacity-50 cursor-not-allowed" />
                </div>

                <hr className="border-[#e8e8ed]" />

                <p className="text-[11px] font-[700] uppercase tracking-[0.7px] text-[#86868b]">Remind me...</p>

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
                    <label className="text-sm text-[#1d1d1f]">{label}</label>
                    <button
                      onClick={() => updatePref(key, !prefs[key])}
                      className={`w-11 h-6 rounded-full transition-colors ${
                        prefs[key] ? 'bg-[#1d1d1f]' : 'bg-[#e8e8ed]'
                      }`}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Danger Zone */}
          <div className="bg-[#f5f5f7] rounded-2xl border border-[#ff3b30]/20 p-6">
            <h2 className="font-[800] text-[#1d1d1f] mb-4">Account</h2>
            <button className="text-sm text-[#ff3b30] hover:opacity-70 font-medium">
              Delete account
            </button>
          </div>
        </div>
      </main>
      <MobileNav />
    </>
  );
}

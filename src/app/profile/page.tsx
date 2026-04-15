'use client';

import { useEffect, useState } from 'react';
import { useUser, UserButton } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import TopNav from '@/components/TopNav';
import MobileNav from '@/components/MobileNav';
import { cn } from '@/lib/utils';

const REGIONS = ['Northeast', 'South', 'Midwest', 'West', 'Southwest', 'Southeast'];
const SETTINGS = ['urban', 'suburban', 'rural', 'small_town'];
const MAJORS = [
  'Computer Science', 'Engineering', 'Business', 'Biology', 'Psychology', 'Economics',
  'Political Science', 'Communications', 'Nursing', 'Education', 'English', 'Math',
  'Chemistry', 'Physics', 'Sociology', 'History', 'Pre-Med', 'Pre-Law', 'Art & Design',
  'Film & Media', 'Music', 'Philosophy', 'Undecided',
];

const EMPTY = {
  gpa: '', gpa_scale: '4.0', weighted_gpa: '', class_rank: '', class_size: '',
  graduation_year: '', intended_major: '', intended_major_2: '',
  best_sat: '', best_act: '',
  preferred_regions: [] as string[],
  preferred_settings: [] as string[],
  preferred_size: 'any',
};

export default function ProfilePage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoaded) return;
    if (!user) { router.push('/login'); return; }
    fetch('/api/student-profile').then(r => r.json()).then(d => {
      if (d.profile) {
        const p = d.profile;
        setForm({
          gpa: p.gpa?.toString() || '',
          gpa_scale: p.gpa_scale?.toString() || '4.0',
          weighted_gpa: p.weighted_gpa?.toString() || '',
          class_rank: p.class_rank?.toString() || '',
          class_size: p.class_size?.toString() || '',
          graduation_year: p.graduation_year?.toString() || '',
          intended_major: p.intended_major || '',
          intended_major_2: p.intended_major_2 || '',
          best_sat: p.best_sat?.toString() || '',
          best_act: p.best_act?.toString() || '',
          preferred_regions: p.preferred_regions || [],
          preferred_settings: p.preferred_settings || [],
          preferred_size: p.preferred_size || 'any',
        });
      }
      setLoading(false);
    });
  }, [isLoaded, user, router]);

  function toggleArray(key: 'preferred_regions' | 'preferred_settings', value: string) {
    setForm(f => {
      const arr = f[key];
      return { ...f, [key]: arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value] };
    });
  }

  async function handleSave() {
    setSaving(true);
    const payload = {
      gpa: form.gpa ? parseFloat(form.gpa) : null,
      gpa_scale: form.gpa_scale ? parseFloat(form.gpa_scale) : 4.0,
      weighted_gpa: form.weighted_gpa ? parseFloat(form.weighted_gpa) : null,
      class_rank: form.class_rank ? parseInt(form.class_rank) : null,
      class_size: form.class_size ? parseInt(form.class_size) : null,
      graduation_year: form.graduation_year ? parseInt(form.graduation_year) : null,
      intended_major: form.intended_major || null,
      intended_major_2: form.intended_major_2 || null,
      best_sat: form.best_sat ? parseInt(form.best_sat) : null,
      best_act: form.best_act ? parseInt(form.best_act) : null,
      preferred_regions: form.preferred_regions.length ? form.preferred_regions : null,
      preferred_settings: form.preferred_settings.length ? form.preferred_settings : null,
      preferred_size: form.preferred_size !== 'any' ? form.preferred_size : null,
    };
    await fetch('/api/student-profile', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  if (!isLoaded || loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-[#1d1d1f] border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <>
      <TopNav />
      <main className="min-h-screen bg-white pt-[90px] pb-28">
        <div className="max-w-container mx-auto px-4 py-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <Link href="/more" className="text-sm text-[#86868b] hover:text-[#1d1d1f] font-medium mb-1 block">← More</Link>
              <h1 className="text-[40px] font-[800] tracking-[-2px] text-[#1d1d1f] leading-none">Academic Profile</h1>
              <p className="text-sm text-[#86868b] mt-2">Used for Reach / Match / Safety and AI suggestions</p>
            </div>
            <UserButton appearance={{ elements: { avatarBox: 'w-10 h-10' } }} afterSignOutUrl="/" />
          </div>

          <div className="space-y-5">
            {/* Academics */}
            <section className="bg-[#f5f5f7] rounded-2xl p-5">
              <h2 className="text-[11px] font-[700] uppercase tracking-[0.7px] text-[#86868b] mb-4">Academics</h2>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-[#1d1d1f] block mb-1.5">Unweighted GPA</label>
                  <input type="number" step="0.01" min="0" max="5" value={form.gpa} onChange={e => setForm(f => ({ ...f, gpa: e.target.value }))} placeholder="3.85" className="w-full px-3 py-2.5 border border-[#e8e8ed] rounded-xl text-sm focus:outline-none focus:border-[#1d1d1f] bg-white" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#1d1d1f] block mb-1.5">GPA Scale</label>
                  <select value={form.gpa_scale} onChange={e => setForm(f => ({ ...f, gpa_scale: e.target.value }))} className="w-full px-3 py-2.5 border border-[#e8e8ed] rounded-xl text-sm bg-white focus:outline-none focus:border-[#1d1d1f]">
                    <option value="4.0">4.0</option>
                    <option value="5.0">5.0 (weighted)</option>
                    <option value="100">100-point scale</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#1d1d1f] block mb-1.5">Weighted GPA</label>
                  <input type="number" step="0.01" min="0" max="5" value={form.weighted_gpa} onChange={e => setForm(f => ({ ...f, weighted_gpa: e.target.value }))} placeholder="4.2" className="w-full px-3 py-2.5 border border-[#e8e8ed] rounded-xl text-sm focus:outline-none focus:border-[#1d1d1f] bg-white" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#1d1d1f] block mb-1.5">Graduation Year</label>
                  <input type="number" value={form.graduation_year} onChange={e => setForm(f => ({ ...f, graduation_year: e.target.value }))} placeholder="2027" className="w-full px-3 py-2.5 border border-[#e8e8ed] rounded-xl text-sm focus:outline-none focus:border-[#1d1d1f] bg-white" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#1d1d1f] block mb-1.5">Class Rank</label>
                  <input type="number" value={form.class_rank} onChange={e => setForm(f => ({ ...f, class_rank: e.target.value }))} placeholder="15" className="w-full px-3 py-2.5 border border-[#e8e8ed] rounded-xl text-sm focus:outline-none focus:border-[#1d1d1f] bg-white" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#1d1d1f] block mb-1.5">Class Size</label>
                  <input type="number" value={form.class_size} onChange={e => setForm(f => ({ ...f, class_size: e.target.value }))} placeholder="350" className="w-full px-3 py-2.5 border border-[#e8e8ed] rounded-xl text-sm focus:outline-none focus:border-[#1d1d1f] bg-white" />
                </div>
              </div>
            </section>

            {/* Test scores */}
            <section className="bg-[#f5f5f7] rounded-2xl p-5">
              <h2 className="text-[11px] font-[700] uppercase tracking-[0.7px] text-[#86868b] mb-4">Best Test Scores</h2>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-[#1d1d1f] block mb-1.5">Best SAT (out of 1600)</label>
                  <input type="number" min="400" max="1600" value={form.best_sat} onChange={e => setForm(f => ({ ...f, best_sat: e.target.value }))} placeholder="1450" className="w-full px-3 py-2.5 border border-[#e8e8ed] rounded-xl text-sm focus:outline-none focus:border-[#1d1d1f] bg-white" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#1d1d1f] block mb-1.5">Best ACT (out of 36)</label>
                  <input type="number" min="1" max="36" value={form.best_act} onChange={e => setForm(f => ({ ...f, best_act: e.target.value }))} placeholder="32" className="w-full px-3 py-2.5 border border-[#e8e8ed] rounded-xl text-sm focus:outline-none focus:border-[#1d1d1f] bg-white" />
                </div>
              </div>
              <p className="text-xs text-[#86868b] mt-2">Used to show Reach / Match / Safety labels when you explore colleges</p>
            </section>

            {/* Intended major */}
            <section className="bg-[#f5f5f7] rounded-2xl p-5">
              <h2 className="text-[11px] font-[700] uppercase tracking-[0.7px] text-[#86868b] mb-4">Intended Major</h2>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-[#1d1d1f] block mb-1.5">First choice</label>
                  <select value={form.intended_major} onChange={e => setForm(f => ({ ...f, intended_major: e.target.value }))} className="w-full px-3 py-2.5 border border-[#e8e8ed] rounded-xl text-sm bg-white focus:outline-none focus:border-[#1d1d1f]">
                    <option value="">Select...</option>
                    {MAJORS.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#1d1d1f] block mb-1.5">Second choice</label>
                  <select value={form.intended_major_2} onChange={e => setForm(f => ({ ...f, intended_major_2: e.target.value }))} className="w-full px-3 py-2.5 border border-[#e8e8ed] rounded-xl text-sm bg-white focus:outline-none focus:border-[#1d1d1f]">
                    <option value="">Select...</option>
                    {MAJORS.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
              </div>
            </section>

            {/* Preferences */}
            <section className="bg-[#f5f5f7] rounded-2xl p-5">
              <h2 className="text-[11px] font-[700] uppercase tracking-[0.7px] text-[#86868b] mb-4">School Preferences</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-[#1d1d1f] block mb-2">Preferred regions</label>
                  <div className="flex flex-wrap gap-2">
                    {REGIONS.map(r => (
                      <button key={r} onClick={() => toggleArray('preferred_regions', r)} className={cn('text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors', form.preferred_regions.includes(r) ? 'bg-[#1d1d1f] text-white border-[#1d1d1f]' : 'bg-white text-[#86868b] border-[#e8e8ed] hover:border-[#1d1d1f]')}>
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#1d1d1f] block mb-2">Campus setting</label>
                  <div className="flex flex-wrap gap-2">
                    {SETTINGS.map(s => (
                      <button key={s} onClick={() => toggleArray('preferred_settings', s)} className={cn('text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors capitalize', form.preferred_settings.includes(s) ? 'bg-[#1d1d1f] text-white border-[#1d1d1f]' : 'bg-white text-[#86868b] border-[#e8e8ed] hover:border-[#1d1d1f]')}>
                        {s.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#1d1d1f] block mb-2">School size</label>
                  <div className="flex gap-2">
                    {[['small', 'Small (<5K)'], ['medium', 'Medium (5–15K)'], ['large', 'Large (15K+)'], ['any', 'Any']].map(([v, label]) => (
                      <button key={v} onClick={() => setForm(f => ({ ...f, preferred_size: v }))} className={cn('flex-1 text-xs font-semibold py-2 rounded-xl border transition-colors', form.preferred_size === v ? 'bg-[#1d1d1f] text-white border-[#1d1d1f]' : 'bg-white text-[#86868b] border-[#e8e8ed] hover:border-[#1d1d1f]')}>
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          </div>

          <button onClick={handleSave} disabled={saving} className="w-full mt-5 py-4 rounded-2xl bg-[#ff3b30] text-white font-[800] text-base hover:opacity-85 disabled:opacity-50 transition-opacity">
            {saving ? 'Saving...' : saved ? '✓ Saved!' : 'Save Profile'}
          </button>

          <div className="flex gap-3 mt-3">
            <Link href="/explore" className="flex-1 text-center py-3 rounded-xl bg-[#1d1d1f] text-white font-[600] text-sm hover:opacity-85">Explore Colleges →</Link>
            <Link href="/suggest" className="flex-1 text-center py-3 rounded-xl border border-[#d2d2d7] text-[#1d1d1f] font-[600] text-sm hover:bg-[#f5f5f7]">AI Suggestions →</Link>
          </div>
        </div>
      </main>
      <MobileNav />
    </>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import TopNav from '@/components/TopNav';
import MobileNav from '@/components/MobileNav';

const inputClass =
  'w-full border border-[#d2d2d7] rounded-xl px-4 py-2.5 text-[14px] text-[#1d1d1f] placeholder:text-[#86868b] focus:outline-none focus:border-[#ff3b30] transition-colors bg-white';

const labelClass = 'block text-[13px] font-[500] text-[#1d1d1f] mb-1.5';

export default function StudentProfilePage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    sat_score: '',
    act_score: '',
    gpa_weighted: '',
    gpa_unweighted: '',
    intended_majors: '',
    location_preference: 'any',
    budget_constraint: '',
    size_preference: 'any',
  });

  useEffect(() => {
    if (!isLoaded) return;
    if (!user) {
      router.push('/login');
      return;
    }

    // Load existing profile
    fetch('/api/student-profile')
      .then((res) => res.json())
      .then((data) => {
        if (data.profile) {
          setFormData({
            sat_score: data.profile.sat_score || '',
            act_score: data.profile.act_score || '',
            gpa_weighted: data.profile.gpa_weighted || '',
            gpa_unweighted: data.profile.gpa_unweighted || '',
            intended_majors: Array.isArray(data.profile.intended_majors)
              ? data.profile.intended_majors.join(', ')
              : '',
            location_preference: data.profile.location_preference || 'any',
            budget_constraint: data.profile.budget_constraint || '',
            size_preference: data.profile.size_preference || 'any',
          });
        }
      });
  }, [isLoaded, user, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess(false);

    try {
      const res = await fetch('/api/student-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sat_score: formData.sat_score ? parseInt(formData.sat_score) : null,
          act_score: formData.act_score ? parseInt(formData.act_score) : null,
          gpa_weighted: formData.gpa_weighted ? parseFloat(formData.gpa_weighted) : null,
          gpa_unweighted: formData.gpa_unweighted ? parseFloat(formData.gpa_unweighted) : null,
          intended_majors: formData.intended_majors
            ? formData.intended_majors.split(',').map((m) => m.trim())
            : [],
          location_preference: formData.location_preference,
          budget_constraint: formData.budget_constraint ? parseInt(formData.budget_constraint) : null,
          size_preference: formData.size_preference,
        }),
      });

      if (!res.ok) throw new Error('Failed to save profile');
      setSuccess(true);
      setTimeout(() => router.push('/discover/search'), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error saving profile');
    } finally {
      setSaving(false);
    }
  }

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#ff3b30] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      <TopNav />
      <main className="min-h-screen bg-white pt-[90px] pb-28">
        <div className="max-w-2xl mx-auto px-6">
          {/* Hero */}
          <div className="mb-8">
            <h1 className="text-[34px] font-[700] tracking-[-0.5px] text-[#1d1d1f] leading-tight">
              Build Your <span className="text-[#ff3b30]">Profile</span>
            </h1>
            <p className="text-[15px] text-[#86868b] mt-1">
              Tell us about yourself so we can find colleges that fit you.
            </p>
          </div>

          {error && (
            <div className="bg-[rgba(255,59,48,0.06)] border border-[#ff3b30]/20 text-[#ff3b30] rounded-2xl p-4 mb-6 text-[13px] font-[500]">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-[rgba(52,199,89,0.08)] border border-[#34c759]/30 text-[#34c759] rounded-2xl p-4 mb-6 text-[13px] font-[500]">
              Profile saved! Redirecting to college search...
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Test Scores */}
            <div className="bg-[#f5f5f7] rounded-2xl p-6">
              <h2 className="text-[13px] font-[600] text-[#86868b] uppercase tracking-wide mb-4">
                Test Scores
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>SAT Score (out of 1600)</label>
                  <input
                    type="number"
                    min="400"
                    max="1600"
                    value={formData.sat_score}
                    onChange={(e) => setFormData({ ...formData, sat_score: e.target.value })}
                    placeholder="1480"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>ACT Score (out of 36)</label>
                  <input
                    type="number"
                    min="1"
                    max="36"
                    value={formData.act_score}
                    onChange={(e) => setFormData({ ...formData, act_score: e.target.value })}
                    placeholder="34"
                    className={inputClass}
                  />
                </div>
              </div>
            </div>

            {/* GPA */}
            <div className="bg-[#f5f5f7] rounded-2xl p-6">
              <h2 className="text-[13px] font-[600] text-[#86868b] uppercase tracking-wide mb-4">
                GPA
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Unweighted GPA</label>
                  <input
                    type="number"
                    min="0"
                    max="4"
                    step="0.01"
                    value={formData.gpa_unweighted}
                    onChange={(e) => setFormData({ ...formData, gpa_unweighted: e.target.value })}
                    placeholder="3.95"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Weighted GPA (if applicable)</label>
                  <input
                    type="number"
                    min="0"
                    max="5"
                    step="0.01"
                    value={formData.gpa_weighted}
                    onChange={(e) => setFormData({ ...formData, gpa_weighted: e.target.value })}
                    placeholder="4.2"
                    className={inputClass}
                  />
                </div>
              </div>
            </div>

            {/* Academics */}
            <div className="bg-[#f5f5f7] rounded-2xl p-6">
              <h2 className="text-[13px] font-[600] text-[#86868b] uppercase tracking-wide mb-4">
                Academics
              </h2>
              <div>
                <label className={labelClass}>Intended Major(s) — separate with commas</label>
                <input
                  type="text"
                  value={formData.intended_majors}
                  onChange={(e) => setFormData({ ...formData, intended_majors: e.target.value })}
                  placeholder="Computer Science, Applied Mathematics"
                  className={inputClass}
                />
              </div>
            </div>

            {/* Preferences */}
            <div className="bg-[#f5f5f7] rounded-2xl p-6">
              <h2 className="text-[13px] font-[600] text-[#86868b] uppercase tracking-wide mb-4">
                Preferences
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>School Size</label>
                  <select
                    value={formData.size_preference}
                    onChange={(e) => setFormData({ ...formData, size_preference: e.target.value })}
                    className={inputClass}
                  >
                    <option value="any">Any size</option>
                    <option value="small">Small (&lt;5,000)</option>
                    <option value="medium">Medium (5,000–15,000)</option>
                    <option value="large">Large (&gt;15,000)</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Location Preference</label>
                  <input
                    type="text"
                    value={formData.location_preference}
                    onChange={(e) => setFormData({ ...formData, location_preference: e.target.value })}
                    placeholder="CA, NY, or 'any'"
                    className={inputClass}
                  />
                </div>
              </div>
            </div>

            {/* Budget */}
            <div className="bg-[#f5f5f7] rounded-2xl p-6">
              <h2 className="text-[13px] font-[600] text-[#86868b] uppercase tracking-wide mb-4">
                Budget
              </h2>
              <div>
                <label className={labelClass}>Max Annual Cost (tuition + room/board)</label>
                <input
                  type="number"
                  min="0"
                  value={formData.budget_constraint}
                  onChange={(e) => setFormData({ ...formData, budget_constraint: e.target.value })}
                  placeholder="70000"
                  className={inputClass}
                />
                <p className="text-[12px] text-[#86868b] mt-1.5">Leave blank for no preference</p>
              </div>
            </div>

            {/* Submit */}
            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 bg-[#ff3b30] hover:bg-[#e6352b] text-white font-[600] text-[15px] py-3 rounded-xl transition-colors disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Profile & Find Colleges'}
              </button>
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 border border-[#d2d2d7] hover:bg-[#f5f5f7] text-[#1d1d1f] font-[600] text-[15px] py-3 rounded-xl transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </main>
      <MobileNav />
    </>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import DashboardSidebar from '@/components/DashboardSidebar';

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
        <div className="w-8 h-8 border-2 border-navy border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      <DashboardSidebar />
      <main className="min-h-screen bg-gray-50 ml-64 py-12">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white rounded-2xl border border-gray-200 p-8">
            <h1 className="text-3xl font-bold text-navy mb-2">Build Your Profile</h1>
            <p className="text-gray-600 mb-8">
              Tell us about yourself so we can find colleges that fit YOU.
            </p>

            {error && (
              <div className="bg-red-50 text-red-700 rounded-lg p-4 mb-6">{error}</div>
            )}

            {success && (
              <div className="bg-green-50 text-green-700 rounded-lg p-4 mb-6">
                Profile saved! Redirecting to college search...
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Test Scores */}
              <div className="border-t pt-6">
                <h2 className="text-lg font-semibold text-navy mb-4">📝 Test Scores</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      SAT Score (out of 1600)
                    </label>
                    <input
                      type="number"
                      min="400"
                      max="1600"
                      value={formData.sat_score}
                      onChange={(e) => setFormData({ ...formData, sat_score: e.target.value })}
                      placeholder="1480"
                      className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-navy/20"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ACT Score (out of 36)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="36"
                      value={formData.act_score}
                      onChange={(e) => setFormData({ ...formData, act_score: e.target.value })}
                      placeholder="34"
                      className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-navy/20"
                    />
                  </div>
                </div>
              </div>

              {/* GPA */}
              <div className="border-t pt-6">
                <h2 className="text-lg font-semibold text-navy mb-4">📊 GPA</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Unweighted GPA
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="4"
                      step="0.01"
                      value={formData.gpa_unweighted}
                      onChange={(e) =>
                        setFormData({ ...formData, gpa_unweighted: e.target.value })
                      }
                      placeholder="3.95"
                      className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-navy/20"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Weighted GPA (if applicable)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="5"
                      step="0.01"
                      value={formData.gpa_weighted}
                      onChange={(e) => setFormData({ ...formData, gpa_weighted: e.target.value })}
                      placeholder="4.2"
                      className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-navy/20"
                    />
                  </div>
                </div>
              </div>

              {/* Academics */}
              <div className="border-t pt-6">
                <h2 className="text-lg font-semibold text-navy mb-4">🎓 Academics</h2>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Intended Major(s) — separate with commas
                  </label>
                  <input
                    type="text"
                    value={formData.intended_majors}
                    onChange={(e) =>
                      setFormData({ ...formData, intended_majors: e.target.value })
                    }
                    placeholder="Computer Science, Applied Mathematics"
                    className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-navy/20"
                  />
                </div>
              </div>

              {/* Preferences */}
              <div className="border-t pt-6">
                <h2 className="text-lg font-semibold text-navy mb-4">🎯 Preferences</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      School Size
                    </label>
                    <select
                      value={formData.size_preference}
                      onChange={(e) =>
                        setFormData({ ...formData, size_preference: e.target.value })
                      }
                      className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-navy/20"
                    >
                      <option value="any">Any size</option>
                      <option value="small">Small (&lt;5,000)</option>
                      <option value="medium">Medium (5,000-15,000)</option>
                      <option value="large">Large (&gt;15,000)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location Preference
                    </label>
                    <input
                      type="text"
                      value={formData.location_preference}
                      onChange={(e) =>
                        setFormData({ ...formData, location_preference: e.target.value })
                      }
                      placeholder="CA, NY, or 'any'"
                      className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-navy/20"
                    />
                  </div>
                </div>
              </div>

              {/* Budget */}
              <div className="border-t pt-6">
                <h2 className="text-lg font-semibold text-navy mb-4">💰 Budget</h2>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Annual Cost (tuition + room/board)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.budget_constraint}
                    onChange={(e) =>
                      setFormData({ ...formData, budget_constraint: e.target.value })
                    }
                    placeholder="70000"
                    className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-navy/20"
                  />
                  <p className="text-xs text-gray-500 mt-2">Leave blank for no preference</p>
                </div>
              </div>

              {/* Submit */}
              <div className="border-t pt-6 flex gap-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-coral hover:bg-coral/90 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Profile & Find Colleges'}
                </button>
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="flex-1 border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold py-3 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </>
  );
}

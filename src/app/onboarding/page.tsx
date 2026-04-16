'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import CollegeSearch from '@/components/CollegeSearch';
import { College } from '@/lib/types';

type Step = 1 | 2 | 3;

function ProgressDots({ step }: { step: Step }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {([1, 2, 3] as Step[]).map((s) => (
        <div
          key={s}
          className="w-2.5 h-2.5 rounded-full transition-colors duration-200"
          style={{
            backgroundColor: s === step ? '#1d1d1f' : '#d1d5db',
          }}
        />
      ))}
    </div>
  );
}

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);

  // Step 1 state
  const [selectedColleges, setSelectedColleges] = useState<College[]>([]);
  const [savingColleges, setSavingColleges] = useState(false);

  // Step 2 state
  const [gradYear, setGradYear] = useState('');
  const [gpa, setGpa] = useState('');
  const [sat, setSat] = useState('');
  const [act, setAct] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  function handleAddCollege(college: College) {
    if (selectedColleges.length >= 8) return;
    setSelectedColleges((prev) => [...prev, college]);
  }

  function handleRemoveCollege(id: string) {
    setSelectedColleges((prev) => prev.filter((c) => c.id !== id));
  }

  async function handleStep1Next() {
    setSavingColleges(true);
    try {
      await fetch('/api/user-colleges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ collegeIds: selectedColleges.map((c) => c.id) }),
      });
    } catch {
      // continue even if save fails
    } finally {
      setSavingColleges(false);
    }
    setStep(2);
  }

  async function handleStep2Next() {
    setSavingProfile(true);
    try {
      const body: Record<string, number> = {};
      if (gradYear.trim()) body.graduation_year = Number(gradYear);
      if (gpa.trim()) body.gpa = Number(gpa);
      if (sat.trim()) body.best_sat = Number(sat);
      if (act.trim()) body.best_act = Number(act);

      if (Object.keys(body).length > 0) {
        await fetch('/api/student-profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
      }
    } catch {
      // continue even if save fails
    } finally {
      setSavingProfile(false);
    }
    setStep(3);
  }

  function handleSkipStep2() {
    setStep(3);
  }

  function handleFinish() {
    localStorage.setItem('onboarding_done', 'true');
    router.push('/dashboard');
  }

  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center px-4 py-12"
      style={{ backgroundColor: '#ffffff', color: '#1d1d1f' }}
    >
      {/* Wordmark */}
      <a
        href="/"
        className="text-xl font-extrabold tracking-tight mb-10"
        style={{ color: '#1d1d1f' }}
      >
        due.college
      </a>

      {/* Card */}
      <div
        className="w-full max-w-lg"
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '20px',
          border: '1px solid #e5e7eb',
          padding: '2rem',
          boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
        }}
      >
        <ProgressDots step={step} />

        {/* ─── Step 1 ─── */}
        {step === 1 && (
          <div>
            <h1 className="text-2xl font-extrabold mb-1" style={{ color: '#1d1d1f' }}>
              Add your schools
            </h1>
            <p className="text-sm mb-6" style={{ color: '#6b7280' }}>
              Search and add up to 8 colleges you&apos;re applying to.
            </p>

            <CollegeSearch
              selectedColleges={selectedColleges}
              onAdd={handleAddCollege}
              onRemove={handleRemoveCollege}
            />

            <div className="mt-8 flex justify-end">
              <button
                onClick={handleStep1Next}
                disabled={selectedColleges.length === 0 || savingColleges}
                className="px-6 py-3 rounded-2xl font-semibold text-base transition-all duration-200"
                style={{
                  backgroundColor:
                    selectedColleges.length === 0 || savingColleges ? '#d1d5db' : '#1d1d1f',
                  color: selectedColleges.length === 0 || savingColleges ? '#9ca3af' : '#ffffff',
                  cursor:
                    selectedColleges.length === 0 || savingColleges ? 'not-allowed' : 'pointer',
                }}
              >
                {savingColleges ? 'Saving…' : 'Next →'}
              </button>
            </div>
          </div>
        )}

        {/* ─── Step 2 ─── */}
        {step === 2 && (
          <div>
            <h1 className="text-2xl font-extrabold mb-1" style={{ color: '#1d1d1f' }}>
              Quick profile
            </h1>
            <p className="text-sm mb-6" style={{ color: '#6b7280' }}>
              Helps us personalise your experience. All optional.
            </p>

            <div className="space-y-3">
              <input
                type="number"
                value={gradYear}
                onChange={(e) => setGradYear(e.target.value)}
                placeholder="Graduation year (e.g. 2026)"
                className="w-full px-4 py-3.5 text-base rounded-2xl border-2 focus:outline-none transition-colors"
                style={{ borderColor: '#e5e7eb', color: '#1d1d1f' }}
                onFocus={(e) => (e.target.style.borderColor = '#1d1d1f')}
                onBlur={(e) => (e.target.style.borderColor = '#e5e7eb')}
              />
              <input
                type="number"
                value={gpa}
                onChange={(e) => setGpa(e.target.value)}
                placeholder="Unweighted GPA (e.g. 3.8)"
                step="0.01"
                min="0"
                max="4"
                className="w-full px-4 py-3.5 text-base rounded-2xl border-2 focus:outline-none transition-colors"
                style={{ borderColor: '#e5e7eb', color: '#1d1d1f' }}
                onFocus={(e) => (e.target.style.borderColor = '#1d1d1f')}
                onBlur={(e) => (e.target.style.borderColor = '#e5e7eb')}
              />
              <input
                type="number"
                value={sat}
                onChange={(e) => setSat(e.target.value)}
                placeholder="Best SAT score (e.g. 1450) — optional"
                min="400"
                max="1600"
                className="w-full px-4 py-3.5 text-base rounded-2xl border-2 focus:outline-none transition-colors"
                style={{ borderColor: '#e5e7eb', color: '#1d1d1f' }}
                onFocus={(e) => (e.target.style.borderColor = '#1d1d1f')}
                onBlur={(e) => (e.target.style.borderColor = '#e5e7eb')}
              />
              <input
                type="number"
                value={act}
                onChange={(e) => setAct(e.target.value)}
                placeholder="Best ACT score (e.g. 32) — optional"
                min="1"
                max="36"
                className="w-full px-4 py-3.5 text-base rounded-2xl border-2 focus:outline-none transition-colors"
                style={{ borderColor: '#e5e7eb', color: '#1d1d1f' }}
                onFocus={(e) => (e.target.style.borderColor = '#1d1d1f')}
                onBlur={(e) => (e.target.style.borderColor = '#e5e7eb')}
              />
            </div>

            <div className="mt-8 flex items-center justify-between">
              <button
                onClick={handleSkipStep2}
                className="text-sm font-medium underline"
                style={{ color: '#6b7280' }}
              >
                Skip
              </button>
              <button
                onClick={handleStep2Next}
                disabled={savingProfile}
                className="px-6 py-3 rounded-2xl font-semibold text-base transition-all duration-200"
                style={{
                  backgroundColor: savingProfile ? '#d1d5db' : '#1d1d1f',
                  color: savingProfile ? '#9ca3af' : '#ffffff',
                  cursor: savingProfile ? 'not-allowed' : 'pointer',
                }}
              >
                {savingProfile ? 'Saving…' : 'Next →'}
              </button>
            </div>
          </div>
        )}

        {/* ─── Step 3 ─── */}
        {step === 3 && (
          <div className="text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h1 className="text-2xl font-extrabold mb-2" style={{ color: '#1d1d1f' }}>
              You&apos;re all set!
            </h1>
            <p className="text-base mb-8" style={{ color: '#6b7280' }}>
              Your deadlines are ready.
            </p>

            {/* Quick action cards */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <a
                href="/invite"
                className="flex flex-col items-center justify-center gap-2 p-5 rounded-[16px] border-2 font-semibold text-sm transition-colors hover:border-gray-400"
                style={{ borderColor: '#e5e7eb', color: '#1d1d1f', textDecoration: 'none' }}
              >
                <span className="text-2xl">👨‍👩‍👧</span>
                Invite a parent
              </a>
              <a
                href="/circle"
                className="flex flex-col items-center justify-center gap-2 p-5 rounded-[16px] border-2 font-semibold text-sm transition-colors hover:border-gray-400"
                style={{ borderColor: '#e5e7eb', color: '#1d1d1f', textDecoration: 'none' }}
              >
                <span className="text-2xl">🫂</span>
                Start your circle
              </a>
            </div>

            <button
              onClick={handleFinish}
              className="w-full py-4 rounded-2xl font-bold text-base transition-all duration-200 hover:opacity-90"
              style={{ backgroundColor: '#ff3b30', color: '#ffffff' }}
            >
              Go to my dashboard →
            </button>
          </div>
        )}
      </div>
    </main>
  );
}

'use client';

import { useState } from 'react';
import TopNav from '@/components/TopNav';
import MobileNav from '@/components/MobileNav';

type FeedbackResult = {
  overall_score: number;
  essay_feedback: string;
  activity_feedback: string;
  strengths: string[];
  improvements: string[];
};

const SAMPLE_COLLEGES = [
  'Harvard University',
  'MIT',
  'Stanford University',
  'Yale University',
  'Princeton University',
  'Columbia University',
  'University of Pennsylvania',
  'Duke University',
  'Johns Hopkins University',
  'Northwestern University',
  'Dartmouth College',
  'Brown University',
  'Cornell University',
  'Vanderbilt University',
  'University of Michigan',
  'UCLA',
  'UC Berkeley',
  'Georgetown University',
  'Carnegie Mellon University',
  'New York University',
];

export default function FeedbackPage() {
  const [essayText, setEssayText] = useState('');
  const [activitiesText, setActivitiesText] = useState('');
  const [satScore, setSatScore] = useState('');
  const [gpa, setGpa] = useState('');
  const [targetCollege, setTargetCollege] = useState('');
  const [customCollege, setCustomCollege] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<FeedbackResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    const essays = essayText.split('\n---\n').map((s) => s.trim()).filter(Boolean);
    const activities = activitiesText.split('\n').map((s) => s.trim()).filter(Boolean);
    const college = customCollege || targetCollege;

    if (!college) {
      setError('Please select or enter a target college.');
      setLoading(false);
      return;
    }
    if (essays.length === 0) {
      setError('Please paste at least one essay.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/application-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          essays,
          activities,
          sat_score: parseInt(satScore) || 0,
          gpa: parseFloat(gpa) || 0,
          target_college: college,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to get feedback');
      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const scoreColor =
    result?.overall_score != null
      ? result.overall_score >= 80
        ? 'text-green-600'
        : result.overall_score >= 60
        ? 'text-yellow-600'
        : 'text-[#ff3b30]'
      : '';

  return (
    <>
      <TopNav />
      <main className="min-h-screen bg-white pt-[90px] pb-28">
        <div className="max-w-[860px] mx-auto px-6 py-8 page-fade">
          {/* Eyebrow */}
          <p className="text-[11px] font-[700] uppercase tracking-[0.7px] text-[#86868b] mb-3">College Discovery</p>
          {/* Hero */}
          <h1 className="text-[40px] font-[800] tracking-[-2px] text-[#1d1d1f] mb-2">
            Application Feedback<br /><span className="text-[#ff3b30]">Know where you stand.</span>
          </h1>
          <p className="text-[16px] text-[#6e6e73] mb-10">Get AI-powered feedback on your application strength.</p>

          {!result && (
            <form onSubmit={handleSubmit} className="space-y-5 max-w-3xl">
              <div className="bg-[#f5f5f7] rounded-2xl p-6 space-y-4">
                <h2 className="text-[11px] font-[700] uppercase tracking-[0.7px] text-[#86868b]">Target College</h2>
                <div>
                  <label className="block text-sm font-[600] text-[#1d1d1f] mb-1.5">Select College</label>
                  <select
                    value={targetCollege}
                    onChange={(e) => setTargetCollege(e.target.value)}
                    className="w-full border border-[#d2d2d7] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#ff3b30] focus:ring-0 bg-white"
                  >
                    <option value="">-- Select a college --</option>
                    {SAMPLE_COLLEGES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-[600] text-[#1d1d1f] mb-1.5">Or enter college name</label>
                  <input
                    type="text"
                    value={customCollege}
                    onChange={(e) => setCustomCollege(e.target.value)}
                    placeholder="e.g. University of Texas at Austin"
                    className="w-full border border-[#d2d2d7] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#ff3b30] focus:ring-0 bg-white"
                  />
                </div>
              </div>

              <div className="bg-[#f5f5f7] rounded-2xl p-6 space-y-4">
                <h2 className="text-[11px] font-[700] uppercase tracking-[0.7px] text-[#86868b]">Academic Stats</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-[600] text-[#1d1d1f] mb-1.5">SAT Score</label>
                    <input
                      type="number"
                      value={satScore}
                      onChange={(e) => setSatScore(e.target.value)}
                      placeholder="e.g. 1450"
                      min={400}
                      max={1600}
                      className="w-full border border-[#d2d2d7] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#ff3b30] focus:ring-0 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-[600] text-[#1d1d1f] mb-1.5">GPA (Unweighted)</label>
                    <input
                      type="number"
                      value={gpa}
                      onChange={(e) => setGpa(e.target.value)}
                      placeholder="e.g. 3.8"
                      step={0.01}
                      min={0}
                      max={4}
                      className="w-full border border-[#d2d2d7] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#ff3b30] focus:ring-0 bg-white"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-[#f5f5f7] rounded-2xl p-6">
                <h2 className="text-[11px] font-[700] uppercase tracking-[0.7px] text-[#86868b] mb-1">Essays</h2>
                <p className="text-xs text-[#86868b] mb-3">Paste your essays below. Separate multiple essays with a line containing just: ---</p>
                <textarea
                  value={essayText}
                  onChange={(e) => setEssayText(e.target.value)}
                  rows={8}
                  placeholder="Paste your Common App essay here...

---

Paste your supplemental essay here..."
                  className="w-full border border-[#d2d2d7] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#ff3b30] focus:ring-0 bg-white resize-none"
                />
              </div>

              <div className="bg-[#f5f5f7] rounded-2xl p-6">
                <h2 className="text-[11px] font-[700] uppercase tracking-[0.7px] text-[#86868b] mb-1">Activities</h2>
                <p className="text-xs text-[#86868b] mb-3">List one activity per line</p>
                <textarea
                  value={activitiesText}
                  onChange={(e) => setActivitiesText(e.target.value)}
                  rows={5}
                  placeholder="Varsity Soccer Captain (4 years)&#10;Student Government President&#10;Math Olympiad competitor&#10;Hospital volunteer (200+ hours)"
                  className="w-full border border-[#d2d2d7] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#ff3b30] focus:ring-0 bg-white resize-none"
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-700 text-sm">{error}</div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#ff3b30] text-white py-3 rounded-xl font-[600] text-base hover:opacity-85 disabled:opacity-60 transition-opacity"
              >
                {loading ? 'Analyzing your application...' : 'Get AI Feedback'}
              </button>
            </form>
          )}

          {result && (
            <div className="space-y-6 max-w-3xl">
              <div className="bg-[#f5f5f7] rounded-2xl p-6 text-center">
                <div className={`text-6xl font-[800] ${scoreColor}`}>{result.overall_score}</div>
                <div className="text-[#86868b] text-sm mt-1">Overall Score / 100</div>
                <div className="mt-4 h-3 bg-[#e8e8ed] rounded-full overflow-hidden max-w-xs mx-auto">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${result.overall_score}%`,
                      backgroundColor: result.overall_score >= 80 ? '#22c55e' : result.overall_score >= 60 ? '#eab308' : '#ff3b30',
                    }}
                  />
                </div>
              </div>

              <div className="bg-[#f5f5f7] rounded-2xl p-6">
                <h2 className="text-[11px] font-[700] uppercase tracking-[0.7px] text-[#86868b] mb-3">Essay Feedback</h2>
                <p className="text-[#1d1d1f] text-sm leading-relaxed">{result.essay_feedback}</p>
              </div>

              <div className="bg-[#f5f5f7] rounded-2xl p-6">
                <h2 className="text-[11px] font-[700] uppercase tracking-[0.7px] text-[#86868b] mb-3">Activity Feedback</h2>
                <p className="text-[#1d1d1f] text-sm leading-relaxed">{result.activity_feedback}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-green-50 border border-green-200 rounded-2xl p-5">
                  <h2 className="text-[11px] font-[700] uppercase tracking-[0.7px] text-green-700 mb-3">Strengths</h2>
                  <ul className="space-y-2">
                    {result.strengths.map((s, i) => (
                      <li key={i} className="flex gap-2 text-sm text-[#1d1d1f]">
                        <span className="text-green-500 mt-0.5">&#10003;</span>
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5">
                  <h2 className="text-[11px] font-[700] uppercase tracking-[0.7px] text-orange-700 mb-3">Areas to Improve</h2>
                  <ul className="space-y-2">
                    {result.improvements.map((s, i) => (
                      <li key={i} className="flex gap-2 text-sm text-[#1d1d1f]">
                        <span className="text-orange-500 mt-0.5">&#8594;</span>
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <button
                onClick={() => setResult(null)}
                className="border border-[#d2d2d7] text-[#1d1d1f] px-6 py-2 rounded-xl font-[600] hover:bg-[#f5f5f7] transition-colors"
              >
                Analyze Another Application
              </button>
            </div>
          )}
        </div>
      </main>
      <MobileNav />
    </>
  );
}

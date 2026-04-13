'use client';

import { useState } from 'react';
import DashboardSidebar from '@/components/DashboardSidebar';

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
        : 'text-red-600'
      : '';

  return (
    <div className="flex min-h-screen bg-gray-50">
      <DashboardSidebar />
      <main className="ml-64 flex-1 p-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl font-bold text-navy mb-1">Application Feedback</h1>
          <p className="text-gray-500 text-sm mb-6">Get AI-powered feedback on your application strength</p>

          {!result && (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="bg-white rounded-xl shadow p-6 space-y-4">
                <h2 className="font-bold text-navy">Target College</h2>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Select College</label>
                  <select
                    value={targetCollege}
                    onChange={(e) => setTargetCollege(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy"
                  >
                    <option value="">-- Select a college --</option>
                    {SAMPLE_COLLEGES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Or enter college name</label>
                  <input
                    type="text"
                    value={customCollege}
                    onChange={(e) => setCustomCollege(e.target.value)}
                    placeholder="e.g. University of Texas at Austin"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy"
                  />
                </div>
              </div>

              <div className="bg-white rounded-xl shadow p-6 space-y-4">
                <h2 className="font-bold text-navy">Academic Stats</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">SAT Score</label>
                    <input
                      type="number"
                      value={satScore}
                      onChange={(e) => setSatScore(e.target.value)}
                      placeholder="e.g. 1450"
                      min={400}
                      max={1600}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">GPA (Unweighted)</label>
                    <input
                      type="number"
                      value={gpa}
                      onChange={(e) => setGpa(e.target.value)}
                      placeholder="e.g. 3.8"
                      step={0.01}
                      min={0}
                      max={4}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow p-6">
                <h2 className="font-bold text-navy mb-1">Essays</h2>
                <p className="text-xs text-gray-500 mb-3">Paste your essays below. Separate multiple essays with a line containing just: ---</p>
                <textarea
                  value={essayText}
                  onChange={(e) => setEssayText(e.target.value)}
                  rows={8}
                  placeholder="Paste your Common App essay here...

---

Paste your supplemental essay here..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy resize-none"
                />
              </div>

              <div className="bg-white rounded-xl shadow p-6">
                <h2 className="font-bold text-navy mb-1">Activities</h2>
                <p className="text-xs text-gray-500 mb-3">List one activity per line</p>
                <textarea
                  value={activitiesText}
                  onChange={(e) => setActivitiesText(e.target.value)}
                  rows={5}
                  placeholder="Varsity Soccer Captain (4 years)&#10;Student Government President&#10;Math Olympiad competitor&#10;Hospital volunteer (200+ hours)"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy resize-none"
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">{error}</div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-coral text-white py-3 rounded-xl font-semibold text-base hover:opacity-90 disabled:opacity-60"
              >
                {loading ? 'Analyzing your application...' : 'Get AI Feedback'}
              </button>
            </form>
          )}

          {result && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow p-6 text-center">
                <div className={`text-6xl font-bold ${scoreColor}`}>{result.overall_score}</div>
                <div className="text-gray-500 text-sm mt-1">Overall Score / 100</div>
                <div className="mt-4 h-3 bg-gray-200 rounded-full overflow-hidden max-w-xs mx-auto">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${result.overall_score}%`,
                      backgroundColor: result.overall_score >= 80 ? '#22c55e' : result.overall_score >= 60 ? '#eab308' : '#ef4444',
                    }}
                  />
                </div>
              </div>

              <div className="bg-white rounded-xl shadow p-6">
                <h2 className="font-bold text-navy mb-2">Essay Feedback</h2>
                <p className="text-gray-700 text-sm leading-relaxed">{result.essay_feedback}</p>
              </div>

              <div className="bg-white rounded-xl shadow p-6">
                <h2 className="font-bold text-navy mb-2">Activity Feedback</h2>
                <p className="text-gray-700 text-sm leading-relaxed">{result.activity_feedback}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-green-50 border border-green-200 rounded-xl p-5">
                  <h2 className="font-bold text-green-700 mb-3">Strengths</h2>
                  <ul className="space-y-2">
                    {result.strengths.map((s, i) => (
                      <li key={i} className="flex gap-2 text-sm text-gray-700">
                        <span className="text-green-500 mt-0.5">&#10003;</span>
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-orange-50 border border-orange-200 rounded-xl p-5">
                  <h2 className="font-bold text-orange-700 mb-3">Areas to Improve</h2>
                  <ul className="space-y-2">
                    {result.improvements.map((s, i) => (
                      <li key={i} className="flex gap-2 text-sm text-gray-700">
                        <span className="text-orange-500 mt-0.5">&#8594;</span>
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <button
                onClick={() => setResult(null)}
                className="bg-navy text-white px-6 py-2 rounded-lg font-semibold hover:opacity-90"
              >
                Analyze Another Application
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

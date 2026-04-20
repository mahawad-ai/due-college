'use client';

import { useEffect, useRef, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import TopNav from '@/components/TopNav';
import MobileNav from '@/components/MobileNav';

// ─── Types ────────────────────────────────────────────────────────────────────

type CollegeResult = {
  name: string;
  location: string;
  match: 'reach' | 'target' | 'likely';
  chance: number;
  why: string;
  pitch?: string;
  acceptance_rate?: number | null;
};

type Strategy = {
  verdict: string;
  headline: string;
  colleges: CollegeResult[];
  ed_pick: { school: string; match: string; reasoning: string };
  financial: { summary: string; highlights: string[] };
  essay: { angle: string; avoid: string };
  timeline: { when: string; action: string }[];
};

type Phase = 'questions' | 'generating' | 'results';

// ─── Constants ────────────────────────────────────────────────────────────────

const INCOME_OPTIONS = [
  { value: 'under_50k', label: 'Under $50k' },
  { value: '50_100k', label: '$50k – $100k' },
  { value: '100_150k', label: '$100k – $150k' },
  { value: 'over_150k', label: '$150k+' },
  { value: 'prefer_not', label: 'Prefer not to say' },
];

const DISTANCE_OPTIONS = [
  { value: 'close', label: '🏠 Stay close (< 3 hrs)' },
  { value: 'moderate', label: '✈️ Open to travel (< 8 hrs)' },
  { value: 'anywhere', label: '🌍 Anywhere' },
];

const LOADING_STEPS = [
  'Reading your profile…',
  'Scanning 250+ colleges…',
  'Calculating your chances…',
  'Mapping your financial aid…',
  'Writing your strategy…',
];

// Tailwind-safe color config — no dynamic class construction
const TIER = {
  reach: {
    sectionBg: 'bg-red-50',
    border: 'border-red-200',
    label: 'text-red-600',
    chip: 'bg-red-100 text-red-800',
    badge: 'bg-red-100 text-red-700',
    bar: 'bg-red-400',
  },
  target: {
    sectionBg: 'bg-yellow-50',
    border: 'border-yellow-200',
    label: 'text-yellow-700',
    chip: 'bg-yellow-100 text-yellow-800',
    badge: 'bg-yellow-100 text-yellow-700',
    bar: 'bg-yellow-400',
  },
  likely: {
    sectionBg: 'bg-green-50',
    border: 'border-green-200',
    label: 'text-green-700',
    chip: 'bg-green-100 text-green-800',
    badge: 'bg-green-100 text-green-700',
    bar: 'bg-green-400',
  },
} as const;

// ─── Sub-components ───────────────────────────────────────────────────────────

function PillOption({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-5 py-3 rounded-2xl border-2 text-[15px] font-[600] transition-all duration-200 ${
        selected
          ? 'bg-[#1d1d1f] border-[#1d1d1f] text-white scale-[1.03]'
          : 'bg-white border-[#e8e8ed] text-[#1d1d1f] hover:border-[#1d1d1f]'
      }`}
    >
      {children}
    </button>
  );
}

function TierMap({ colleges }: { colleges: CollegeResult[] }) {
  const groups: { match: 'reach' | 'target' | 'likely'; label: string }[] = [
    { match: 'reach', label: 'Reaches' },
    { match: 'target', label: 'Targets' },
    { match: 'likely', label: 'Likelies' },
  ];
  return (
    <div className="grid grid-cols-3 gap-3 mb-8">
      {groups.map(({ match, label }) => {
        const list = colleges.filter(c => c.match === match);
        const t = TIER[match];
        return (
          <div key={match} className={`rounded-2xl border ${t.border} ${t.sectionBg} p-4`}>
            <p className={`text-[10px] font-[800] uppercase tracking-[0.8px] ${t.label} mb-2.5`}>{label}</p>
            <div className="space-y-1.5">
              {list.map(c => (
                <div key={c.name} className={`text-[11px] font-[600] ${t.chip} rounded-lg px-2 py-1.5 leading-tight`}>
                  {c.name}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function CollegeCard({
  college,
  index,
  collegeIdMap,
}: {
  college: CollegeResult;
  index: number;
  collegeIdMap: Record<string, string>;
}) {
  const t = TIER[college.match];
  const [added, setAdded] = useState(false);
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState(false);

  const schoolLink = `https://www.google.com/search?q=${encodeURIComponent(college.name + ' undergraduate admissions')}`;

  async function handleAdd() {
    setAdding(true);
    setAddError(false);
    try {
      // 1. Try the pre-built ID map first (fast path)
      let collegeId: string | undefined = collegeIdMap[college.name];

      // 2. Fallback: name search if not in map (handles stale localStorage / name drift)
      if (!collegeId) {
        const res = await fetch(`/api/college-search?q=${encodeURIComponent(college.name)}`);
        const data = await res.json();
        const found = data.colleges?.[0];
        if (found?.id) collegeId = found.id;
      }

      if (collegeId) {
        const res = await fetch('/api/user-colleges', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ collegeIds: [collegeId] }),
        });
        if (res.ok) {
          setAdded(true);
        } else {
          setAddError(true);
        }
      } else {
        setAddError(true);
      }
    } catch {
      setAddError(true);
    }
    setAdding(false);
  }

  return (
    <div className={`rounded-2xl border ${t.sectionBg} ${t.border} p-5`} style={{ animationDelay: `${index * 60}ms` }}>
      {/* Header row */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0">
          <div className="font-[700] text-[#1d1d1f] text-[16px] leading-tight">{college.name}</div>
          <div className="text-[12px] text-[#86868b] mt-0.5">{college.location}</div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className={`px-3 py-1 rounded-full text-[11px] font-[800] uppercase tracking-wide ${t.badge}`}>
            {college.match}
          </span>
          <button
            onClick={handleAdd}
            disabled={adding || added}
            className={`px-3 py-1 rounded-full text-[11px] font-[700] transition-all ${
              added
                ? 'bg-green-100 text-green-700'
                : addError
                ? 'bg-red-100 text-red-700 border border-red-200'
                : 'bg-white border border-[#d2d2d7] text-[#1d1d1f] hover:border-[#1d1d1f]'
            }`}
          >
            {added ? '✓ Added' : adding ? '…' : addError ? '✗ Retry' : '+ Add'}
          </button>
        </div>
      </div>

      {/* Pitch line */}
      {college.pitch && (
        <p className="text-[13px] font-[600] text-[#1d1d1f] italic mb-3">"{college.pitch}"</p>
      )}

      {/* Stats */}
      <div className="mb-3">
        <div className="flex justify-between text-[11px] text-[#86868b] mb-1">
          <span>School accepts</span>
          <span className="font-[700] text-[#1d1d1f]">
            {college.acceptance_rate != null ? `${college.acceptance_rate}%` : '—'}
          </span>
        </div>
        <div className="flex justify-between text-[11px] text-[#86868b] mb-1.5">
          <span>Your estimated chance</span>
          <span className="font-[700] text-[#1d1d1f]">{college.chance}%</span>
        </div>
        <div className="h-1.5 bg-[#e8e8ed] rounded-full overflow-hidden">
          <div
            className={`h-full ${t.bar} rounded-full transition-all duration-700`}
            style={{ width: `${college.chance}%` }}
          />
        </div>
      </div>

      {/* Why */}
      <p className="text-[13px] text-[#424245] leading-relaxed mb-3">{college.why}</p>

      {/* Link */}
      <a
        href={schoolLink}
        target="_blank"
        rel="noopener noreferrer"
        className="text-[12px] text-[#86868b] hover:text-[#1d1d1f] transition-colors underline-offset-2 hover:underline"
      >
        View admissions info →
      </a>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function StrategyPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  const [phase, setPhase] = useState<Phase>('questions');
  const [question, setQuestion] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [strategy, setStrategy] = useState<Strategy | null>(null);
  const [collegeIdMap, setCollegeIdMap] = useState<Record<string, string>>({});
  const [error, setError] = useState('');
  const [edAdded, setEdAdded] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [sharing, setSharing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shareError, setShareError] = useState('');
  const [checkedItems, setCheckedItems] = useState<boolean[]>([]);

  // Form answers
  const [gpa, setGpa] = useState('');
  const [sat, setSat] = useState('');
  const [act, setAct] = useState('');
  const [major, setMajor] = useState('');
  const [income, setIncome] = useState('');
  const [distance, setDistance] = useState('');
  const [whatMatters, setWhatMatters] = useState('');
  const [homeState, setHomeState] = useState('');
  const [achievement, setAchievement] = useState('');

  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);

  // Bootstrap: load saved strategy or prefill from profile
  useEffect(() => {
    if (!isLoaded) return;
    if (!user) { router.push('/login'); return; }

    try {
      const saved = localStorage.getItem('due_strategy');
      const savedMap = localStorage.getItem('due_strategy_map');
      const savedChecklist = localStorage.getItem('due_strategy_checklist');
      if (saved) {
        const s = JSON.parse(saved);
        if (s?.colleges?.length) {
          setStrategy(s);
          if (savedMap) setCollegeIdMap(JSON.parse(savedMap));
          if (savedChecklist) setCheckedItems(JSON.parse(savedChecklist));
          setPhase('results');
          return;
        }
      }
    } catch { /* ignore */ }

    fetch('/api/student-profile')
      .then(r => r.json())
      .then(({ profile }) => {
        if (!profile) return;
        if (profile.gpa) setGpa(String(profile.gpa));
        if (profile.best_sat) setSat(String(profile.best_sat));
        if (profile.best_act) setAct(String(profile.best_act));
        if (profile.intended_major) setMajor(profile.intended_major);
      })
      .catch(() => {});
  }, [isLoaded, user, router]);

  useEffect(() => { setTimeout(() => inputRef.current?.focus(), 350); }, [question]);

  useEffect(() => {
    if (phase !== 'generating') return;
    const iv = setInterval(() => setLoadingStep(s => (s + 1) % LOADING_STEPS.length), 1400);
    return () => clearInterval(iv);
  }, [phase]);

  function toggleCheck(i: number) {
    setCheckedItems(prev => {
      const next = [...prev];
      while (next.length <= i) next.push(false);
      next[i] = !next[i];
      try { localStorage.setItem('due_strategy_checklist', JSON.stringify(next)); } catch {}
      return next;
    });
  }

  const questions = [
    {
      id: 'gpa',
      label: "What's your unweighted GPA?",
      sub: 'On a 4.0 scale. This is one of the most important inputs.',
      type: 'number' as const,
      value: gpa, set: setGpa,
      placeholder: 'e.g. 3.8',
      canSkip: false,
    },
    {
      id: 'sat',
      label: "What's your best SAT score?",
      sub: "If you haven't taken it or prefer ACT, leave blank.",
      type: 'number' as const,
      value: sat, set: setSat,
      placeholder: 'e.g. 1450 (leave blank if N/A)',
      canSkip: true,
    },
    {
      id: 'act',
      label: 'Best ACT score?',
      sub: 'Skip if you only have SAT.',
      type: 'number' as const,
      value: act, set: setAct,
      placeholder: 'e.g. 32 (leave blank if N/A)',
      canSkip: true,
    },
    {
      id: 'major',
      label: 'What are you hoping to study?',
      sub: "Even a broad area is helpful — 'engineering', 'business', 'undecided' all work.",
      type: 'text' as const,
      value: major, set: setMajor,
      placeholder: 'e.g. Computer Science, Pre-med, Undecided',
      canSkip: true,
    },
    {
      id: 'state',
      label: 'What state are you from?',
      sub: 'Affects in-state tuition and public university priorities.',
      type: 'text' as const,
      value: homeState, set: setHomeState,
      placeholder: 'e.g. Texas, California, New York',
      canSkip: true,
    },
    {
      id: 'income',
      label: "What's your family's approximate income?",
      sub: 'Helps us show which schools will be most affordable. We never store this.',
      type: 'pills' as const,
      options: INCOME_OPTIONS,
      value: income, set: setIncome,
      canSkip: true,
    },
    {
      id: 'distance',
      label: 'How far from home are you open to going?',
      sub: "There's no wrong answer — it's your adventure.",
      type: 'pills' as const,
      options: DISTANCE_OPTIONS,
      value: distance, set: setDistance,
      canSkip: true,
    },
    {
      id: 'achievement',
      label: "What's your biggest achievement outside the classroom?",
      sub: "A sport, an app, an award, a job — one sentence is enough. This shapes your essay angle.",
      type: 'textarea' as const,
      value: achievement, set: setAchievement,
      placeholder: 'e.g. "Built an app with 5,000 users" or "Captained varsity soccer for 3 years"',
      canSkip: true,
    },
    {
      id: 'matters',
      label: 'In one sentence — what matters most to you in a college?',
      sub: "Your AI counselor reads this carefully. Be specific.",
      type: 'textarea' as const,
      value: whatMatters, set: setWhatMatters,
      placeholder: 'e.g. "I want a city school where I can do research and actually get a job in tech after graduation."',
      canSkip: false,
    },
  ];

  const q = questions[question];
  const progress = (question / questions.length) * 100;
  const isLast = question === questions.length - 1;

  function advance() {
    if (animating) return;
    if (isLast) { generate(); return; }
    setAnimating(true);
    setTimeout(() => { setQuestion(n => n + 1); setAnimating(false); }, 260);
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && q.type !== 'textarea') advance();
  }

  async function generate() {
    setPhase('generating');
    setError('');
    try {
      const res = await fetch('/api/strategy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gpa: gpa ? parseFloat(gpa) : null,
          sat: sat ? parseInt(sat) : null,
          act: act ? parseInt(act) : null,
          intended_major: major || null,
          income_range: income || null,
          distance_pref: distance || null,
          what_matters: whatMatters || null,
          home_state: homeState || null,
          achievement: achievement || null,
        }),
      });
      const data = await res.json();
      if (data.error || !data.strategy) {
        setError(data.error || 'Something went wrong. Please try again.');
        setPhase('questions');
        return;
      }
      setStrategy(data.strategy);
      setCollegeIdMap(data.collegeIdMap || {});
      setCheckedItems([]);
      try {
        localStorage.setItem('due_strategy', JSON.stringify(data.strategy));
        localStorage.setItem('due_strategy_map', JSON.stringify(data.collegeIdMap || {}));
        localStorage.removeItem('due_strategy_checklist');
      } catch {}
      setPhase('results');
    } catch {
      setError('Network error — please try again.');
      setPhase('questions');
    }
  }

  async function handleShare() {
    setShareError('');

    // Already have a URL — just copy / re-share it
    if (shareUrl) {
      if (typeof navigator !== 'undefined' && 'share' in navigator) {
        try { await navigator.share({ title: strategy?.headline || 'My College Strategy', text: 'Check out my AI-powered college strategy on due.college!', url: shareUrl }); } catch { /* user cancelled */ }
      } else {
        try { await navigator.clipboard.writeText(shareUrl); setCopied(true); setTimeout(() => setCopied(false), 2500); } catch {}
      }
      return;
    }

    setSharing(true);
    try {
      const res = await fetch('/api/strategy/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ strategy }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setShareError(data.error || 'Could not create share link. Please try again.');
        setSharing(false);
        return;
      }
      if (data.url) {
        setShareUrl(data.url);
        if (typeof navigator !== 'undefined' && 'share' in navigator) {
          try { await navigator.share({ title: strategy?.headline || 'My College Strategy', text: 'Check out my AI-powered college strategy on due.college!', url: data.url }); } catch { /* user cancelled */ }
        } else {
          try { await navigator.clipboard.writeText(data.url); setCopied(true); setTimeout(() => setCopied(false), 2500); } catch {}
        }
      }
    } catch {
      setShareError('Network error — please try again.');
    }
    setSharing(false);
  }

  // ── Generating screen ──────────────────────────────────────────────────────
  if (phase === 'generating') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#1d1d1f] text-white px-6">
        <div className="text-center max-w-sm">
          <div className="relative w-24 h-24 mx-auto mb-8">
            <div className="absolute inset-0 rounded-full bg-[#ff3b30] opacity-20 animate-ping" />
            <div className="absolute inset-2 rounded-full bg-[#ff3b30] opacity-40 animate-pulse" />
            <div className="absolute inset-4 rounded-full bg-[#ff3b30] flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.347.347a3.75 3.75 0 01-5.303-5.303 5 5 0 015.303 5.303z" />
              </svg>
            </div>
          </div>
          <h2 className="text-[28px] font-[800] tracking-tight mb-3">Building your strategy</h2>
          <p className="text-[#aeaeb2] text-[15px] h-6 transition-all duration-500" key={loadingStep}>
            {LOADING_STEPS[loadingStep]}
          </p>
          <div className="flex justify-center gap-2 mt-8">
            {LOADING_STEPS.map((_, i) => (
              <div key={i} className={`rounded-full transition-all duration-500 ${i === loadingStep ? 'w-6 h-2 bg-[#ff3b30]' : 'w-2 h-2 bg-[#424245]'}`} />
            ))}
          </div>
          <p className="text-[12px] text-[#6e6e73] mt-10">Powered by Claude · Your data is never sold</p>
        </div>
      </div>
    );
  }

  // ── Results screen ─────────────────────────────────────────────────────────
  if (phase === 'results' && strategy) {
    const reaches = strategy.colleges.filter(c => c.match === 'reach');
    const targets = strategy.colleges.filter(c => c.match === 'target');
    const likelies = strategy.colleges.filter(c => c.match === 'likely');
    const doneCount = checkedItems.filter(Boolean).length;

    return (
      <>
        <TopNav />
        <main className="min-h-screen bg-white pt-[90px] pb-28">
          <div className="max-w-[720px] mx-auto px-4 py-8 page-fade">

            {/* ── Hero ────────────────────────────────────────────────── */}
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <p className="text-[11px] font-[700] uppercase tracking-[0.7px] text-[#86868b] mb-2">
                  Your AI College Strategy
                </p>
                <h1 className="text-[30px] font-[800] tracking-[-1.2px] text-[#1d1d1f] leading-tight mb-3">
                  {strategy.headline}
                </h1>
                <div className="flex flex-wrap gap-2 text-[13px] text-[#86868b]">
                  <span>{reaches.length} reach{reaches.length !== 1 ? 'es' : ''}</span>
                  <span>·</span>
                  <span>{targets.length} targets</span>
                  <span>·</span>
                  <span>{likelies.length} likelies</span>
                </div>
              </div>
              <div className="shrink-0 mt-1 flex flex-col items-end gap-1">
                <button
                  onClick={handleShare}
                  disabled={sharing}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-[13px] font-[700] transition-colors disabled:opacity-50 ${
                    shareError
                      ? 'bg-red-50 border border-red-200 text-red-600 hover:bg-red-100'
                      : 'bg-[#f5f5f7] border border-[#e8e8ed] text-[#1d1d1f] hover:bg-[#e8e8ed]'
                  }`}
                >
                  {sharing ? '…' : shareError ? '↗ Retry share' : '↗ Share'}
                </button>
                {shareError && (
                  <p className="text-[11px] text-red-500 text-right max-w-[160px] leading-tight">{shareError}</p>
                )}
              </div>
            </div>

            {/* ── Verdict ─────────────────────────────────────────────── */}
            <div className="bg-[#1d1d1f] rounded-3xl p-7 mb-8">
              <p className="text-[10px] font-[800] uppercase tracking-[0.8px] text-[#ff3b30] mb-3">
                Your Strategy Assessment
              </p>
              <p className="text-[17px] leading-relaxed text-white font-[500]">
                {strategy.verdict || strategy.headline}
              </p>
            </div>

            {/* ── 3-Move cards ─────────────────────────────────────────── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">

              {/* ED Pick */}
              <div className="bg-[#1d1d1f] text-white rounded-2xl p-5 flex flex-col">
                <p className="text-[10px] font-[800] uppercase tracking-wide text-[#ff3b30] mb-2">⚡ ED Pick</p>
                <div className="text-[20px] font-[800] mb-1">{strategy.ed_pick.school}</div>
                <span className={`self-start px-2.5 py-0.5 rounded-full text-[10px] font-[800] uppercase mb-3 ${
                  strategy.ed_pick.match === 'reach'
                    ? 'bg-red-900 text-red-300'
                    : strategy.ed_pick.match === 'target'
                    ? 'bg-yellow-900 text-yellow-300'
                    : 'bg-green-900 text-green-300'
                }`}>
                  {strategy.ed_pick.match}
                </span>
                <p className="text-[13px] text-[#aeaeb2] leading-relaxed flex-1 mb-4">
                  {strategy.ed_pick.reasoning}
                </p>
                <button
                  onClick={async () => {
                    try {
                      await fetch('/api/custom-deadlines', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          college_name: strategy.ed_pick.school,
                          type: 'ED1',
                          due_date: '2026-11-01',
                          notes: 'Added from AI Strategy — confirm exact date on school website',
                        }),
                      });
                      setEdAdded(true);
                    } catch {}
                  }}
                  disabled={edAdded}
                  className={`text-[12px] font-[700] px-3 py-2 rounded-xl transition-all ${
                    edAdded ? 'bg-green-800 text-green-300' : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  {edAdded ? '✓ Deadline added' : '+ Add ED deadline'}
                </button>
              </div>

              {/* Essay Angle */}
              <div className="bg-[#f5f5f7] rounded-2xl p-5 flex flex-col">
                <p className="text-[10px] font-[800] uppercase tracking-wide text-[#86868b] mb-2">✍️ Essay Angle</p>
                <p className="text-[14px] font-[600] text-[#1d1d1f] leading-relaxed flex-1 mb-3">
                  {strategy.essay.angle}
                </p>
                <div className="bg-red-50 border border-red-100 rounded-xl p-3">
                  <p className="text-[12px] text-red-700">
                    <span className="font-[700]">Avoid: </span>{strategy.essay.avoid}
                  </p>
                </div>
              </div>

              {/* Financial */}
              <div className="bg-[#f5f5f7] rounded-2xl p-5 flex flex-col">
                <p className="text-[10px] font-[800] uppercase tracking-wide text-[#86868b] mb-2">💰 Financial Picture</p>
                <p className="text-[13px] text-[#424245] leading-relaxed mb-3 flex-1">
                  {strategy.financial.summary}
                </p>
                <ul className="space-y-2">
                  {strategy.financial.highlights.map((h, i) => (
                    <li key={i} className="flex gap-2 text-[12px] text-[#1d1d1f]">
                      <span className="text-green-500 font-[700] shrink-0">✓</span>
                      {h}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* ── Tier map ─────────────────────────────────────────────── */}
            <TierMap colleges={strategy.colleges} />

            {/* ── College sections ──────────────────────────────────────── */}
            {[
              { label: 'Reaches', list: reaches },
              { label: 'Targets', list: targets },
              { label: 'Likelies', list: likelies },
            ].map(({ label, list }) =>
              list.length > 0 ? (
                <div key={label} className="mb-8">
                  <h2 className="text-[11px] font-[700] uppercase tracking-[0.7px] text-[#86868b] mb-3">
                    {label} — {list.length} school{list.length !== 1 ? 's' : ''}
                  </h2>
                  <div className="space-y-4">
                    {list.map((c, i) => (
                      <CollegeCard key={c.name} college={c} index={i} collegeIdMap={collegeIdMap} />
                    ))}
                  </div>
                </div>
              ) : null
            )}

            {/* ── Checklist ────────────────────────────────────────────── */}
            <div className="bg-[#f5f5f7] rounded-2xl p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-[11px] font-[700] uppercase tracking-[0.7px] text-[#86868b]">
                  📅 Your Action Checklist
                </h2>
                {doneCount > 0 && (
                  <span className="text-[12px] text-[#86868b] font-[600]">
                    {doneCount}/{strategy.timeline.length} done
                  </span>
                )}
              </div>
              <div className="space-y-4">
                {strategy.timeline.map((t, i) => {
                  const checked = !!checkedItems[i];
                  return (
                    <button
                      key={i}
                      onClick={() => toggleCheck(i)}
                      className="w-full flex items-start gap-3 text-left group"
                    >
                      <div className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                        checked
                          ? 'bg-[#ff3b30] border-[#ff3b30]'
                          : 'border-[#d2d2d7] group-hover:border-[#ff3b30]'
                      }`}>
                        {checked && (
                          <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <div>
                        <span className="text-[10px] font-[800] text-[#ff3b30] uppercase tracking-wide block mb-0.5">
                          {t.when}
                        </span>
                        <span className={`text-[14px] text-[#1d1d1f] transition-all ${
                          checked ? 'line-through text-[#aeaeb2]' : ''
                        }`}>
                          {t.action}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ── Share result card ─────────────────────────────────────── */}
            {shareUrl && (
              <div className="bg-[#f5f5f7] rounded-2xl p-5 mb-6">
                <h2 className="text-[11px] font-[700] uppercase tracking-[0.7px] text-[#86868b] mb-3">📤 Your Share Link</h2>
                <div className="bg-white border border-[#e8e8ed] rounded-xl px-3 py-2 text-[11px] text-[#424245] break-all font-mono leading-relaxed mb-3">
                  {shareUrl}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(shareUrl)
                        .then(() => { setCopied(true); setTimeout(() => setCopied(false), 2500); })
                        .catch(() => {});
                    }}
                    className="flex-1 py-2.5 rounded-xl bg-[#1d1d1f] text-white text-[13px] font-[700] hover:opacity-90 transition-opacity"
                  >
                    {copied ? '✓ Copied!' : '📋 Copy link'}
                  </button>
                  <button
                    onClick={handleShare}
                    className="flex-1 py-2.5 rounded-xl bg-[#ff3b30] text-white text-[13px] font-[700] hover:opacity-90 transition-opacity"
                  >
                    ↗ Share again
                  </button>
                </div>
                <p className="text-[11px] text-[#aeaeb2] text-center mt-2">
                  Anyone with this link can view your strategy
                </p>
              </div>
            )}

            {/* ── Bottom actions ────────────────────────────────────────── */}
            <div className="flex flex-col gap-3">
              <button
                onClick={() => {
                  try {
                    localStorage.removeItem('due_strategy');
                    localStorage.removeItem('due_strategy_map');
                    localStorage.removeItem('due_strategy_checklist');
                  } catch {}
                  setStrategy(null);
                  setCollegeIdMap({});
                  setPhase('questions');
                  setQuestion(0);
                  setEdAdded(false);
                  setShareUrl(null);
                  setCheckedItems([]);
                }}
                className="w-full py-3 rounded-2xl border-2 border-[#e8e8ed] text-[14px] font-[600] text-[#86868b] hover:border-[#1d1d1f] hover:text-[#1d1d1f] transition-colors"
              >
                ↺ Regenerate with different answers
              </button>
              <button
                onClick={() => router.push('/dashboard')}
                className="w-full py-3 rounded-2xl bg-[#ff3b30] text-white text-[14px] font-[700] hover:opacity-90 transition-opacity"
              >
                Go to dashboard →
              </button>
            </div>

          </div>
        </main>
        <MobileNav />
      </>
    );
  }

  // ── Question flow ──────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Progress bar */}
      <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-[#f5f5f7]">
        <div
          className="h-full bg-[#ff3b30] transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-16">
        <div className="text-[18px] font-[800] text-[#1d1d1f] mb-12 tracking-tight">due.college</div>

        <div className={`w-full max-w-lg transition-all duration-260 ${
          animating ? 'opacity-0 translate-y-3' : 'opacity-100 translate-y-0'
        }`}>
          <p className="text-[12px] font-[600] text-[#aeaeb2] mb-3 tracking-wide">
            {question + 1} / {questions.length}
          </p>
          <h2 className="text-[28px] font-[800] tracking-tight text-[#1d1d1f] mb-2 leading-snug">
            {q.label}
          </h2>
          <p className="text-[14px] text-[#86868b] mb-7">{q.sub}</p>

          {q.type === 'pills' && 'options' in q && (
            <div className="flex flex-wrap gap-3 mb-8">
              {q.options!.map(opt => (
                <PillOption key={opt.value} selected={q.value === opt.value} onClick={() => q.set(opt.value)}>
                  {opt.label}
                </PillOption>
              ))}
            </div>
          )}

          {q.type === 'textarea' && (
            <textarea
              ref={inputRef as React.RefObject<HTMLTextAreaElement>}
              value={q.value}
              onChange={e => q.set(e.target.value)}
              placeholder={q.placeholder}
              rows={3}
              className="w-full border-2 border-[#e8e8ed] rounded-2xl px-5 py-4 text-[16px] text-[#1d1d1f] placeholder:text-[#aeaeb2] focus:outline-none focus:border-[#ff3b30] transition-colors resize-none mb-6"
            />
          )}

          {(q.type === 'text' || q.type === 'number') && (
            <input
              ref={inputRef as React.RefObject<HTMLInputElement>}
              type={q.type}
              value={q.value}
              onChange={e => q.set(e.target.value)}
              onKeyDown={handleKey}
              placeholder={q.placeholder}
              step={q.type === 'number' ? '0.01' : undefined}
              className="w-full border-2 border-[#e8e8ed] rounded-2xl px-5 py-4 text-[18px] font-[600] text-[#1d1d1f] placeholder:text-[#aeaeb2] focus:outline-none focus:border-[#ff3b30] transition-colors mb-6"
            />
          )}

          {error && <p className="text-red-500 text-[13px] mb-4">{error}</p>}

          <div className="flex items-center justify-between">
            {q.canSkip && !isLast ? (
              <button
                onClick={advance}
                className="text-[13px] text-[#aeaeb2] hover:text-[#86868b] transition-colors font-[500]"
              >
                Skip →
              </button>
            ) : <div />}
            <button
              onClick={advance}
              disabled={!q.canSkip && !q.value.trim()}
              className={`px-8 py-3.5 rounded-2xl text-[15px] font-[700] transition-all duration-200 ${
                !q.canSkip && !q.value.trim()
                  ? 'bg-[#e8e8ed] text-[#aeaeb2] cursor-not-allowed'
                  : isLast
                  ? 'bg-[#ff3b30] text-white hover:opacity-90 shadow-lg shadow-red-200'
                  : 'bg-[#1d1d1f] text-white hover:opacity-90'
              }`}
            >
              {isLast ? '✨ Build my strategy' : 'Continue →'}
            </button>
          </div>
        </div>

        {q.type !== 'pills' && q.type !== 'textarea' && (
          <p className="text-[12px] text-[#d2d2d7] mt-8">
            Press <kbd className="bg-[#f5f5f7] px-2 py-0.5 rounded text-[#86868b] font-mono">Enter ↵</kbd> to continue
          </p>
        )}
      </div>
    </div>
  );
}

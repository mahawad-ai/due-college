import { Metadata } from 'next';
import Link from 'next/link';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export const metadata: Metadata = {
  title: 'College Application Deadlines 2026 — All 243 Schools | due.college',
  description:
    'Deadlines for every major US college and university — ED, EA, Regular Decision, FAFSA, and more. Track application deadlines for Harvard, MIT, Stanford, and 240+ schools. Free for every student.',
  openGraph: {
    title: 'College Application Deadlines 2026 — All 243 Schools | due.college',
    description:
      'Every application deadline for 243 US colleges. ED, EA, RD, FAFSA deadlines tracked automatically. Free for students.',
    url: 'https://www.due.college/colleges',
    siteName: 'due.college',
    type: 'website',
  },
  alternates: { canonical: 'https://www.due.college/colleges' },
};

interface College {
  id: string;
  name: string;
  city: string | null;
  state: string | null;
  acceptance_rate: number | null;
  common_app: boolean;
}

// Group colleges by state for organized display
function groupByState(colleges: College[]): Record<string, College[]> {
  const groups: Record<string, College[]> = {};
  for (const c of colleges) {
    const key = c.state || 'Other';
    if (!groups[key]) groups[key] = [];
    groups[key].push(c);
  }
  return groups;
}

export default async function CollegesPage() {
  const supabase = createServerSupabaseClient();
  const { data: colleges } = await supabase
    .from('colleges')
    .select('id, name, city, state, acceptance_rate, common_app')
    .order('name', { ascending: true });

  const allColleges: College[] = colleges || [];
  const byState = groupByState(allColleges);
  const states = Object.keys(byState).sort();

  // Highlighted top schools for the hero section
  const topSchools = allColleges.filter((c) =>
    ['Harvard University', 'Stanford University', 'Massachusetts Institute of Technology',
     'Yale University', 'Princeton University', 'Columbia University',
     'University of Pennsylvania', 'Duke University', 'Northwestern University',
     'Johns Hopkins University', 'University of California, Los Angeles',
     'University of California, Berkeley'].includes(c.name)
  ).slice(0, 12);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-[#e8e8ed]">
        <div className="max-w-[1080px] mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-[19px] font-[800] tracking-[-1px] text-[#1d1d1f] no-underline">
            due<span className="text-[#ff3b30]">.</span>college
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-[#6e6e73] hover:text-[#1d1d1f] font-medium no-underline">
              Sign in
            </Link>
            <Link
              href="/start"
              className="bg-[#ff3b30] text-white text-sm font-[700] px-4 py-2 rounded-[10px] hover:opacity-90 transition-opacity no-underline"
            >
              Get started free
            </Link>
          </div>
        </div>
      </div>

      {/* Hero */}
      <div className="bg-[#f5f5f7] border-b border-[#e8e8ed]">
        <div className="max-w-[1080px] mx-auto px-6 py-16 text-center">
          <p className="text-[12px] font-[700] text-[#ff3b30] tracking-[0.8px] uppercase mb-4">
            {allColleges.length} Colleges · Free for Every Student
          </p>
          <h1 className="text-[42px] md:text-[52px] font-[800] tracking-[-2px] text-[#1d1d1f] leading-[1.05] mb-4">
            College Application Deadlines
            <br />
            <span className="text-[#ff3b30]">2026 — All Schools</span>
          </h1>
          <p className="text-[18px] text-[#6e6e73] leading-relaxed max-w-[540px] mx-auto mb-8">
            Every ED, EA, Regular Decision, FAFSA, and scholarship deadline for {allColleges.length} US colleges.
            Track them all in one place — free.
          </p>
          <div className="flex items-center gap-3 justify-center">
            <Link
              href="/start"
              className="bg-[#ff3b30] text-white font-[700] px-7 py-3.5 rounded-[14px] hover:opacity-90 transition-opacity text-[15px] no-underline"
            >
              Track my deadlines free →
            </Link>
            <Link
              href="/"
              className="bg-white border border-[#d2d2d7] text-[#1d1d1f] font-[600] px-6 py-3.5 rounded-[14px] hover:border-[#1d1d1f] transition-colors text-[15px] no-underline"
            >
              Search colleges
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-[1080px] mx-auto px-6 py-12">

        {/* Top schools quick links */}
        {topSchools.length > 0 && (
          <section className="mb-14">
            <h2 className="text-[22px] font-[800] text-[#1d1d1f] tracking-tight mb-2">
              Most searched schools
            </h2>
            <p className="text-[14px] text-[#86868b] mb-6">
              Click any school to see their full application deadline calendar.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {topSchools.map((college) => (
                <Link
                  key={college.id}
                  href={`/school/${college.id}`}
                  className="flex items-center justify-between bg-[#f5f5f7] hover:bg-[#e8e8ed] rounded-[14px] px-4 py-3.5 no-underline group transition-colors"
                >
                  <div>
                    <p className="text-[14px] font-[700] text-[#1d1d1f] leading-snug">{college.name}</p>
                    {college.city && (
                      <p className="text-[12px] text-[#86868b] mt-0.5">{college.city}, {college.state}</p>
                    )}
                  </div>
                  <span className="text-[#ff3b30] text-[13px] font-[600] opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2">
                    Deadlines →
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Why track */}
        <section className="bg-[#1d1d1f] rounded-2xl px-8 py-10 mb-14 text-white">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="text-[32px] mb-2">📅</div>
              <h3 className="text-[16px] font-[700] mb-2">All deadline types</h3>
              <p className="text-[14px] text-white/60 leading-relaxed">
                ED1, ED2, EA, Regular Decision, FAFSA, CSS Profile, scholarship deadlines — all auto-populated.
              </p>
            </div>
            <div>
              <div className="text-[32px] mb-2">🔔</div>
              <h3 className="text-[16px] font-[700] mb-2">Reminders before every deadline</h3>
              <p className="text-[14px] text-white/60 leading-relaxed">
                Get notified at 30, 14, 7, 3, and 1 day before each deadline. Never miss a window again.
              </p>
            </div>
            <div>
              <div className="text-[32px] mb-2">✍️</div>
              <h3 className="text-[16px] font-[700] mb-2">Essays &amp; recommendations</h3>
              <p className="text-[14px] text-white/60 leading-relaxed">
                Track word counts, prompts, and recommender status for every school in one dashboard.
              </p>
            </div>
          </div>
        </section>

        {/* Full schools list by state */}
        <section>
          <h2 className="text-[22px] font-[800] text-[#1d1d1f] tracking-tight mb-2">
            All {allColleges.length} colleges — by state
          </h2>
          <p className="text-[14px] text-[#86868b] mb-8">
            Click any school to see their exact application deadlines for 2026.
          </p>

          <div className="space-y-10">
            {states.map((state) => (
              <div key={state}>
                <h3 className="text-[13px] font-[700] uppercase tracking-[0.8px] text-[#86868b] mb-3 border-b border-[#e8e8ed] pb-2">
                  {state}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                  {byState[state].map((college) => (
                    <Link
                      key={college.id}
                      href={`/school/${college.id}`}
                      className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-[#f5f5f7] no-underline group transition-colors"
                    >
                      <div className="min-w-0">
                        <p className="text-[14px] font-[600] text-[#1d1d1f] truncate">{college.name}</p>
                        {college.acceptance_rate != null && (
                          <p className="text-[11px] text-[#86868b]">{college.acceptance_rate}% acceptance</p>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0 ml-2">
                        {college.common_app && (
                          <span className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded font-medium hidden sm:block">
                            Common App
                          </span>
                        )}
                        <span className="text-[#ff3b30] text-[12px] font-[600] opacity-0 group-hover:opacity-100 transition-opacity">
                          →
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Bottom CTA */}
        <div className="mt-16 bg-[#f5f5f7] rounded-2xl p-10 text-center">
          <h2 className="text-[28px] font-[800] text-[#1d1d1f] tracking-tight mb-3">
            Track deadlines for your schools
          </h2>
          <p className="text-[15px] text-[#6e6e73] mb-7 max-w-[440px] mx-auto">
            Add any of these {allColleges.length} schools and we&apos;ll auto-load every deadline —
            ED, EA, RD, FAFSA, and more. Free for every student.
          </p>
          <Link
            href="/start"
            className="inline-block bg-[#ff3b30] text-white font-[700] px-8 py-4 rounded-[14px] hover:opacity-90 transition-opacity text-[15px] no-underline"
          >
            Get started free →
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-[#e8e8ed] py-8 mt-8">
        <div className="max-w-[1080px] mx-auto px-6 flex items-center justify-between flex-wrap gap-4">
          <p className="text-[13px] text-[#86868b]">
            due.college — Free for every student. No spam.
          </p>
          <div className="flex gap-4">
            <Link href="/privacy" className="text-[13px] text-[#86868b] hover:text-[#1d1d1f] no-underline">Privacy</Link>
            <a href="mailto:hello@due.college" className="text-[13px] text-[#86868b] hover:text-[#1d1d1f] no-underline">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

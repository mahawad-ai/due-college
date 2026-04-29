import { Metadata } from 'next';
import Link from 'next/link';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export const metadata: Metadata = {
  title: 'College Application Deadlines 2026 — All 243 Schools | due.college',
  description:
    'Deadlines for every major US college — ED, EA, Regular Decision, FAFSA, CSS Profile, and more. Track application deadlines for Harvard, MIT, Stanford, and 240+ schools. Free for every student.',
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

// FAQ data — drives both the rendered section and the JSON-LD schema
const FAQ_ITEMS = [
  {
    question: 'When are college applications due in 2026?',
    answer:
      'Most Early Decision and Early Action deadlines fall on November 1 or November 15, 2025. Regular Decision deadlines are typically January 1 or January 15, 2026. Rolling admissions schools accept applications year-round until spots fill. Always check each school\'s official admissions page for exact dates.',
  },
  {
    question: 'What is the difference between Early Decision and Early Action?',
    answer:
      'Early Decision (ED) is binding — if you are admitted, you must enroll and withdraw all other applications. Early Action (EA) is non-binding; you apply early and get a faster decision, but you can still compare offers and decide by May 1. Restrictive Early Action (REA) or Single-Choice Early Action (SCEA) is non-binding but restricts you from applying EA or ED elsewhere.',
  },
  {
    question: 'What is the Common App deadline for 2026?',
    answer:
      'The Common App does not have a single universal deadline — each college sets its own deadline for Common App submissions. Most schools using the Common App have EA/ED deadlines of November 1 or November 15, and Regular Decision deadlines of January 1 or January 15, 2026. A few schools use January 15 or February 1 for Regular Decision.',
  },
  {
    question: 'When is the FAFSA deadline for the 2026-2027 school year?',
    answer:
      'The federal FAFSA deadline is June 30, 2026, but most colleges and states have much earlier priority deadlines — often February 1 through March 1 — to be considered for maximum institutional aid. You should submit the FAFSA as early as possible after it opens in the fall.',
  },
  {
    question: 'When does the CSS Profile need to be submitted?',
    answer:
      'The CSS Profile deadline varies by school but is usually due at the same time as, or shortly after, the college application deadline. For Early Decision applicants, that is typically November 1 or November 15. For Regular Decision applicants, CSS Profile deadlines generally fall between January 1 and February 1. Submit it at the same time as your application.',
  },
  {
    question: 'What happens if you miss a college application deadline?',
    answer:
      'Missing a hard application deadline typically means your application will not be reviewed for that round. For Regular Decision, it usually means you cannot apply at all for that cycle. Some schools accept late applications with a fee or on a space-available basis — contact the admissions office directly. For financial aid deadlines, missing them can significantly reduce the aid you receive.',
  },
  {
    question: 'What is Early Decision 2 (ED2)?',
    answer:
      'Early Decision 2 is a second binding early round offered by many colleges, typically with a January 1 or January 15 deadline. Like ED1, it is a binding commitment — if admitted, you must enroll. ED2 is a good option if you did not apply ED1 to your top choice, or if you received a deferral from your ED1 school and want to demonstrate strong interest elsewhere.',
  },
  {
    question: 'Can you apply to college after the Regular Decision deadline?',
    answer:
      'Generally no — most colleges do not accept late applications after their Regular Decision deadline. However, some schools with rolling admissions review applications until their class is full. Additionally, some colleges open waitlists or late-admission rounds in spring. Check each school\'s website, and if you missed a deadline, call the admissions office — occasionally exceptions are made.',
  },
  {
    question: 'What is rolling admissions?',
    answer:
      'Rolling admissions means a college reviews applications as they are received and sends decisions on an ongoing basis rather than waiting for a fixed deadline. Applying earlier in rolling admissions is strongly advantageous because seats fill up — there is no benefit to waiting. Many large public universities, including many Big Ten schools, use rolling admissions.',
  },
  {
    question: 'How far in advance should I start my college applications?',
    answer:
      'You should begin preparing in the summer before senior year (June-August). Start your Common App essay, request recommendation letters, and research schools. Aim to submit EA/ED applications in October to beat the November 1 deadline. For Regular Decision schools, work through November and December to submit well before January deadlines.',
  },
];

interface College {
  id: string;
  name: string;
  city: string | null;
  state: string | null;
  acceptance_rate: number | null;
  common_app: boolean;
}

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

  const topSchools = allColleges.filter((c) =>
    ['Harvard University', 'Stanford University', 'Massachusetts Institute of Technology',
     'Yale University', 'Princeton University', 'Columbia University',
     'University of Pennsylvania', 'Duke University', 'Northwestern University',
     'Johns Hopkins University', 'University of California, Los Angeles',
     'University of California, Berkeley'].includes(c.name)
  ).slice(0, 12);

  // JSON-LD: FAQPage schema for rich snippets
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ_ITEMS.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };

  return (
    <div className="min-h-screen bg-white">
      {/* FAQ JSON-LD for Google rich snippets */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

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

        {/* ── GUIDE SECTION ── */}
        <section className="mb-14 prose-none">

          {/* Key dates quick reference */}
          <div className="mb-12">
            <h2 className="text-[22px] font-[800] text-[#1d1d1f] tracking-tight mb-2">
              Key college application dates for 2025–2026
            </h2>
            <p className="text-[14px] text-[#86868b] mb-6">
              These are the standard deadline windows used by most US colleges. Individual schools may differ — click any school below for their exact dates.
            </p>
            <div className="overflow-x-auto rounded-2xl border border-[#e8e8ed]">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#f5f5f7] border-b border-[#e8e8ed]">
                    <th className="text-left px-4 py-3 font-[700] text-[#1d1d1f] text-[13px]">Round</th>
                    <th className="text-left px-4 py-3 font-[700] text-[#1d1d1f] text-[13px]">Typical Deadline</th>
                    <th className="text-left px-4 py-3 font-[700] text-[#1d1d1f] text-[13px]">Decision By</th>
                    <th className="text-left px-4 py-3 font-[700] text-[#1d1d1f] text-[13px]">Binding?</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e8e8ed]">
                  <tr className="hover:bg-[#f9f9fb]">
                    <td className="px-4 py-3 font-[600] text-[#1d1d1f]">Early Decision I (ED1)</td>
                    <td className="px-4 py-3 text-[#3c3c43]">Nov 1 or Nov 15, 2025</td>
                    <td className="px-4 py-3 text-[#3c3c43]">Mid-December 2025</td>
                    <td className="px-4 py-3"><span className="text-[11px] bg-red-50 text-red-600 px-2 py-0.5 rounded font-[600]">Yes</span></td>
                  </tr>
                  <tr className="hover:bg-[#f9f9fb]">
                    <td className="px-4 py-3 font-[600] text-[#1d1d1f]">Early Action (EA)</td>
                    <td className="px-4 py-3 text-[#3c3c43]">Nov 1 or Nov 15, 2025</td>
                    <td className="px-4 py-3 text-[#3c3c43]">Mid-December 2025</td>
                    <td className="px-4 py-3"><span className="text-[11px] bg-green-50 text-green-700 px-2 py-0.5 rounded font-[600]">No</span></td>
                  </tr>
                  <tr className="hover:bg-[#f9f9fb]">
                    <td className="px-4 py-3 font-[600] text-[#1d1d1f]">Restrictive EA / SCEA</td>
                    <td className="px-4 py-3 text-[#3c3c43]">Nov 1, 2025</td>
                    <td className="px-4 py-3 text-[#3c3c43]">Mid-December 2025</td>
                    <td className="px-4 py-3"><span className="text-[11px] bg-green-50 text-green-700 px-2 py-0.5 rounded font-[600]">No</span></td>
                  </tr>
                  <tr className="hover:bg-[#f9f9fb]">
                    <td className="px-4 py-3 font-[600] text-[#1d1d1f]">Early Decision II (ED2)</td>
                    <td className="px-4 py-3 text-[#3c3c43]">Jan 1 or Jan 15, 2026</td>
                    <td className="px-4 py-3 text-[#3c3c43]">Mid-February 2026</td>
                    <td className="px-4 py-3"><span className="text-[11px] bg-red-50 text-red-600 px-2 py-0.5 rounded font-[600]">Yes</span></td>
                  </tr>
                  <tr className="hover:bg-[#f9f9fb]">
                    <td className="px-4 py-3 font-[600] text-[#1d1d1f]">Regular Decision (RD)</td>
                    <td className="px-4 py-3 text-[#3c3c43]">Jan 1 or Jan 15, 2026</td>
                    <td className="px-4 py-3 text-[#3c3c43]">Late March / April 2026</td>
                    <td className="px-4 py-3"><span className="text-[11px] bg-green-50 text-green-700 px-2 py-0.5 rounded font-[600]">No</span></td>
                  </tr>
                  <tr className="hover:bg-[#f9f9fb]">
                    <td className="px-4 py-3 font-[600] text-[#1d1d1f]">FAFSA</td>
                    <td className="px-4 py-3 text-[#3c3c43]">Opens Oct 2025 · Priority: Feb 2026</td>
                    <td className="px-4 py-3 text-[#3c3c43]">Aid offer with admission</td>
                    <td className="px-4 py-3 text-[#86868b]">—</td>
                  </tr>
                  <tr className="hover:bg-[#f9f9fb]">
                    <td className="px-4 py-3 font-[600] text-[#1d1d1f]">CSS Profile</td>
                    <td className="px-4 py-3 text-[#3c3c43]">Same as application deadline</td>
                    <td className="px-4 py-3 text-[#3c3c43]">Aid offer with admission</td>
                    <td className="px-4 py-3 text-[#86868b]">—</td>
                  </tr>
                  <tr className="hover:bg-[#f9f9fb]">
                    <td className="px-4 py-3 font-[600] text-[#1d1d1f]">National Decision Day</td>
                    <td className="px-4 py-3 text-[#3c3c43]">May 1, 2026</td>
                    <td className="px-4 py-3 text-[#3c3c43]">Your enrollment decision</td>
                    <td className="px-4 py-3 text-[#86868b]">—</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Types of deadlines guide */}
          <div className="mb-12">
            <h2 className="text-[22px] font-[800] text-[#1d1d1f] tracking-tight mb-6">
              Understanding college application deadlines
            </h2>

            <div className="space-y-8">
              <div>
                <h3 className="text-[17px] font-[700] text-[#1d1d1f] mb-2">
                  Early Decision (ED1 and ED2)
                </h3>
                <p className="text-[15px] text-[#3c3c43] leading-relaxed">
                  Early Decision is a <strong>binding</strong> commitment — if you are admitted, you are required to enroll and must immediately withdraw all other applications. ED1 deadlines are typically <strong>November 1 or November 15</strong>, with decisions released in mid-December. ED2 offers a second binding round with a <strong>January 1 or January 15</strong> deadline and decisions in mid-February.
                </p>
                <p className="text-[15px] text-[#3c3c43] leading-relaxed mt-2">
                  ED applicants often see modestly higher acceptance rates because colleges value demonstrated commitment. However, you should only apply ED if the school is truly your first choice <em>and</em> you are confident the financial aid offer will be workable — you have limited ability to compare packages.
                </p>
              </div>

              <div>
                <h3 className="text-[17px] font-[700] text-[#1d1d1f] mb-2">
                  Early Action (EA) and Restrictive Early Action (REA/SCEA)
                </h3>
                <p className="text-[15px] text-[#3c3c43] leading-relaxed">
                  Early Action is <strong>non-binding</strong>. You apply by the early deadline (usually November 1 or 15) and receive a decision in December, but you are free to apply to other schools and take until May 1 to make your final choice. Most schools with EA allow you to apply EA or ED to other schools simultaneously.
                </p>
                <p className="text-[15px] text-[#3c3c43] leading-relaxed mt-2">
                  Restrictive Early Action (REA) — also called Single-Choice Early Action (SCEA) — is used by Harvard, Yale, Princeton, and Stanford. It is non-binding but restricts you from applying early (ED or EA) to any other private university. You may still apply EA to public universities.
                </p>
              </div>

              <div>
                <h3 className="text-[17px] font-[700] text-[#1d1d1f] mb-2">
                  Regular Decision (RD)
                </h3>
                <p className="text-[15px] text-[#3c3c43] leading-relaxed">
                  Regular Decision is the standard application round. Most RD deadlines fall on <strong>January 1 or January 15, 2026</strong>, with a few schools using February 1. Decisions are typically released in late March or on April 1 (Ivy Day). Enrollment deposits are due by <strong>May 1, 2026</strong> (National Decision Day).
                </p>
              </div>

              <div>
                <h3 className="text-[17px] font-[700] text-[#1d1d1f] mb-2">
                  Rolling Admissions
                </h3>
                <p className="text-[15px] text-[#3c3c43] leading-relaxed">
                  Schools with rolling admissions review applications as they arrive and send decisions within a few weeks. There is no single deadline — but applying early is strongly advantageous because seats fill up. Many large state universities (Penn State, Indiana University, Michigan State) use rolling admissions. Apply as early as possible, ideally in August or September.
                </p>
              </div>

              <div>
                <h3 className="text-[17px] font-[700] text-[#1d1d1f] mb-2">
                  FAFSA and Financial Aid Deadlines
                </h3>
                <p className="text-[15px] text-[#3c3c43] leading-relaxed">
                  The Free Application for Federal Student Aid (FAFSA) opens in October and has a federal deadline of June 30, 2026. But most colleges have their own priority FAFSA deadline — often <strong>February 1 through March 1</strong> — to be considered for maximum institutional grants and scholarships. Submit FAFSA as soon as it opens to maximize your aid.
                </p>
                <p className="text-[15px] text-[#3c3c43] leading-relaxed mt-2">
                  The CSS Profile is required by about 400 private colleges and universities for institutional aid. Submit it at the same time as or shortly after your college application — for ED applicants, that means by November 1 or 15.
                </p>
              </div>
            </div>
          </div>

          {/* Application timeline */}
          <div className="mb-12 bg-[#f5f5f7] rounded-2xl px-8 py-8">
            <h2 className="text-[20px] font-[800] text-[#1d1d1f] tracking-tight mb-6">
              College application timeline: senior year
            </h2>
            <div className="space-y-4">
              {[
                { month: 'Summer (June–Aug)', tasks: 'Start Common App essay drafts. Request recommendation letters early. Finalize your college list. Research EA/ED options.' },
                { month: 'September', tasks: 'Finalize college list. Complete test prep or final SAT/ACT. Open Common App. Begin school-specific supplemental essays.' },
                { month: 'October', tasks: 'Submit EA/ED applications early — aim to be done by Oct 20 to avoid last-minute issues. Open FAFSA and CSS Profile when available.' },
                { month: 'November 1–15', tasks: 'EA, ED1, and REA/SCEA deadlines. Submit FAFSA and CSS Profile for applying schools.' },
                { month: 'December', tasks: 'Receive EA/ED decisions. If deferred or denied, finalize Regular Decision school list. Continue supplemental essays.' },
                { month: 'January 1–15', tasks: 'Regular Decision and ED2 deadlines. Most college applications are due this month.' },
                { month: 'March–April', tasks: 'Regular Decision notifications arrive. Compare financial aid packages. Visit admitted schools.' },
                { month: 'May 1', tasks: 'National Decision Day — submit enrollment deposit to your chosen school. Withdraw other acceptances.' },
              ].map((row) => (
                <div key={row.month} className="flex gap-4">
                  <div className="shrink-0 w-[160px] text-[13px] font-[700] text-[#ff3b30] pt-0.5">{row.month}</div>
                  <div className="text-[14px] text-[#3c3c43] leading-relaxed">{row.tasks}</div>
                </div>
              ))}
            </div>
          </div>

        </section>
        {/* ── END GUIDE SECTION ── */}

        {/* Why track */}
        <section className="bg-[#1d1d1f] rounded-2xl px-8 py-10 mb-14 text-white">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="text-[32px] mb-2">📅</div>
              <h3 className="text-[16px] font-[700] mb-2">All deadline types</h3>
              <p className="text-[14px] text-white/60 leading-relaxed">
                ED1, ED2, EA, Regular Decision, FAFSA, CSS Profile, scholarship deadlines — all auto-populated for {allColleges.length} schools.
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
        <section className="mb-14">
          <h2 className="text-[22px] font-[800] text-[#1d1d1f] tracking-tight mb-2">
            All {allColleges.length} colleges — by state
          </h2>
          <p className="text-[14px] text-[#86868b] mb-8">
            Click any school to see their exact application deadlines for 2025–2026.
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

        {/* FAQ Section */}
        <section className="mb-14">
          <h2 className="text-[22px] font-[800] text-[#1d1d1f] tracking-tight mb-2">
            Frequently asked questions
          </h2>
          <p className="text-[14px] text-[#86868b] mb-8">
            Common questions about college application deadlines and how to manage them.
          </p>
          <div className="space-y-0 divide-y divide-[#e8e8ed] border border-[#e8e8ed] rounded-2xl overflow-hidden">
            {FAQ_ITEMS.map((item) => (
              <details key={item.question} className="group">
                <summary className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-[#f5f5f7] transition-colors list-none">
                  <span className="text-[15px] font-[600] text-[#1d1d1f] pr-4">{item.question}</span>
                  <span className="shrink-0 text-[#86868b] group-open:rotate-180 transition-transform text-[18px]">›</span>
                </summary>
                <div className="px-5 pb-5 pt-1">
                  <p className="text-[14px] text-[#3c3c43] leading-relaxed">{item.answer}</p>
                </div>
              </details>
            ))}
          </div>
        </section>

        {/* Bottom CTA */}
        <div className="bg-[#f5f5f7] rounded-2xl p-10 text-center">
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

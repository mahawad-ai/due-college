import { Metadata } from 'next';
import { createServerSupabaseClient } from '@/lib/supabase-server';

interface Props {
  params: { id: string };
  children: React.ReactNode;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const supabase = createServerSupabaseClient();

  const { data: college } = await supabase
    .from('colleges')
    .select('name, city, state, acceptance_rate, sat_25, sat_75, act_25, act_75, website')
    .eq('id', params.id)
    .maybeSingle();

  if (!college) {
    return {
      title: 'College Not Found — due.college',
      description: 'This college is not in our database yet.',
    };
  }

  const location = college.city && college.state ? `${college.city}, ${college.state}` : '';
  const acceptance = college.acceptance_rate != null ? `${college.acceptance_rate}% acceptance rate. ` : '';
  const sat = college.sat_25 && college.sat_75 ? `SAT ${college.sat_25}–${college.sat_75}. ` : '';
  const act = college.act_25 && college.act_75 ? `ACT ${college.act_25}–${college.act_75}. ` : '';

  const title = `${college.name} Application Deadlines ${new Date().getFullYear()} — due.college`;
  const description =
    `Track ${college.name} application deadlines — ED, EA, RD, FAFSA, and more. ` +
    `${acceptance}${sat}${act}` +
    `Never miss a deadline with due.college. Free for every student.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://due.college/school/${params.id}`,
      siteName: 'due.college',
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
    alternates: {
      canonical: `https://due.college/school/${params.id}`,
    },
    other: {
      // Schema.org structured data for rich results
      'application/ld+json': JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'EducationalOrganization',
        name: college.name,
        ...(location && { address: { '@type': 'PostalAddress', addressLocality: college.city, addressRegion: college.state } }),
        ...(college.website && { url: college.website }),
        description: `Application deadlines and requirements for ${college.name}.`,
      }),
    },
  };
}

export default function SchoolLayout({ children }: Props) {
  return <>{children}</>;
}

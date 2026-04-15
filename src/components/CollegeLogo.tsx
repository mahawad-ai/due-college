'use client';

import { useState } from 'react';

interface CollegeLogoProps {
  name: string;
  website?: string | null;
  size?: 'sm' | 'md' | 'lg';
}

// Full domain map for all 243 colleges
const DOMAIN_MAP: Record<string, string> = {
  // 002_seed_data.sql schools (50)
  'Harvard University': 'college.harvard.edu',
  'Massachusetts Institute of Technology': 'mit.edu',
  'Stanford University': 'stanford.edu',
  'Yale University': 'yale.edu',
  'Princeton University': 'princeton.edu',
  'Columbia University': 'columbia.edu',
  'University of Pennsylvania': 'upenn.edu',
  'Dartmouth College': 'dartmouth.edu',
  'Brown University': 'brown.edu',
  'Cornell University': 'cornell.edu',
  'Northwestern University': 'northwestern.edu',
  'Vanderbilt University': 'vanderbilt.edu',
  'University of Notre Dame': 'nd.edu',
  'Georgetown University': 'georgetown.edu',
  'Emory University': 'emory.edu',
  'Tufts University': 'tufts.edu',
  'University of Southern California': 'usc.edu',
  'New York University': 'nyu.edu',
  'Rice University': 'rice.edu',
  'Williams College': 'williams.edu',
  'Amherst College': 'amherst.edu',
  'Swarthmore College': 'swarthmore.edu',
  'Wellesley College': 'wellesley.edu',
  'Bowdoin College': 'bowdoin.edu',
  'University of California, Los Angeles': 'ucla.edu',
  'University of California, Berkeley': 'berkeley.edu',
  'University of Michigan': 'umich.edu',
  'University of Texas at Austin': 'utexas.edu',
  'University of North Carolina at Chapel Hill': 'unc.edu',
  'University of Virginia': 'virginia.edu',
  'Georgia Institute of Technology': 'gatech.edu',
  'UC San Diego': 'ucsd.edu',
  'UC Davis': 'ucdavis.edu',
  'UC Santa Barbara': 'ucsb.edu',
  'University of Florida': 'ufl.edu',
  'Ohio State University': 'osu.edu',
  'Pennsylvania State University': 'psu.edu',
  'University of Wisconsin-Madison': 'wisc.edu',
  'University of Illinois Urbana-Champaign': 'illinois.edu',
  'Arizona State University': 'asu.edu',
  'Florida State University': 'fsu.edu',
  'Purdue University': 'purdue.edu',
  'Indiana University Bloomington': 'indiana.edu',
  'Michigan State University': 'msu.edu',
  'Texas A&M University': 'tamu.edu',
  'University of Washington': 'uw.edu',
  'University of Colorado Boulder': 'colorado.edu',
  'University of Oregon': 'uoregon.edu',
  'Rutgers University': 'rutgers.edu',
  'Duke University': 'duke.edu',
  // 009 & 010 schools
  'Wake Forest University': 'wfu.edu',
  'University of Rochester': 'rochester.edu',
  'Case Western Reserve University': 'case.edu',
  'Brandeis University': 'brandeis.edu',
  'Rensselaer Polytechnic Institute': 'rpi.edu',
  'Worcester Polytechnic Institute': 'wpi.edu',
  'University of Miami': 'miami.edu',
  'Fordham University': 'fordham.edu',
  'Villanova University': 'villanova.edu',
  'Lehigh University': 'lehigh.edu',
  'Washington University in St. Louis': 'wustl.edu',
  'Boston College': 'bc.edu',
  'George Washington University': 'gwu.edu',
  'American University': 'american.edu',
  'Syracuse University': 'syr.edu',
  'Pepperdine University': 'pepperdine.edu',
  'Santa Clara University': 'scu.edu',
  'Gonzaga University': 'gonzaga.edu',
  'Loyola Marymount University': 'lmu.edu',
  'University of Denver': 'du.edu',
  'Creighton University': 'creighton.edu',
  'Marquette University': 'marquette.edu',
  'University of Richmond': 'richmond.edu',
  'Texas Christian University': 'tcu.edu',
  'Baylor University': 'baylor.edu',
  'Pomona College': 'pomona.edu',
  'Middlebury College': 'middlebury.edu',
  'Carleton College': 'carleton.edu',
  'Colby College': 'colby.edu',
  'Bates College': 'bates.edu',
  'Hamilton College': 'hamilton.edu',
  'Haverford College': 'haverford.edu',
  'Vassar College': 'vassar.edu',
  'Colgate University': 'colgate.edu',
  'Davidson College': 'davidson.edu',
  'Oberlin College': 'oberlin.edu',
  'Harvey Mudd College': 'hmc.edu',
  'Claremont McKenna College': 'cmc.edu',
  'Scripps College': 'scrippscollege.edu',
  'Pitzer College': 'pitzer.edu',
  'Barnard College': 'barnard.edu',
  'Trinity College': 'trincoll.edu',
  'Bucknell University': 'bucknell.edu',
  'Lafayette College': 'lafayette.edu',
  'Dickinson College': 'dickinson.edu',
  'Franklin and Marshall College': 'fandm.edu',
  'Grinnell College': 'grinnell.edu',
  'Macalester College': 'macalester.edu',
  'Colorado College': 'coloradocollege.edu',
  'Reed College': 'reed.edu',
  'Whitman College': 'whitman.edu',
  'Occidental College': 'oxy.edu',
  'Skidmore College': 'skidmore.edu',
  'Union College': 'union.edu',
  'Sarah Lawrence College': 'sarahlawrence.edu',
  'Bard College': 'bard.edu',
  'Bryn Mawr College': 'brynmawr.edu',
  'Gettysburg College': 'gettysburg.edu',
  'Muhlenberg College': 'muhlenberg.edu',
  'University of Maryland': 'umd.edu',
  'University of Minnesota': 'umn.edu',
  'University of Georgia': 'uga.edu',
  'University of Arizona': 'arizona.edu',
  'Clemson University': 'clemson.edu',
  'Virginia Tech': 'vt.edu',
  'College of William and Mary': 'wm.edu',
  'University of Pittsburgh': 'pitt.edu',
  'University of Connecticut': 'uconn.edu',
  'University of Massachusetts Amherst': 'umass.edu',
  'University of Delaware': 'udel.edu',
  'University of Iowa': 'uiowa.edu',
  'University of Utah': 'utah.edu',
  'Colorado State University': 'colostate.edu',
  'James Madison University': 'jmu.edu',
  'University of South Carolina': 'sc.edu',
  'Louisiana State University': 'lsu.edu',
  'Drexel University': 'drexel.edu',
  'Temple University': 'temple.edu',
  'University of Vermont': 'uvm.edu',
  'Stony Brook University': 'stonybrook.edu',
  'University of Kansas': 'ku.edu',
  'Stevens Institute of Technology': 'stevens.edu',
  'Rochester Institute of Technology': 'rit.edu',
  'Babson College': 'babson.edu',
  'Bentley University': 'bentley.edu',
  'Elon University': 'elon.edu',
  'Fairfield University': 'fairfield.edu',
  'Providence College': 'providence.edu',
  'Quinnipiac University': 'quinnipiac.edu',
  'Sacred Heart University': 'sacredheart.edu',
  'Kenyon College': 'kenyon.edu',
  'Denison University': 'denison.edu',
  'College of Wooster': 'wooster.edu',
  'DePauw University': 'depauw.edu',
  'Ohio Wesleyan University': 'owu.edu',
  'Butler University': 'butler.edu',
  'Furman University': 'furman.edu',
  'Wofford College': 'wofford.edu',
  'Rhodes College': 'rhodes.edu',
  'Sewanee: The University of the South': 'sewanee.edu',
  'Centre College': 'centre.edu',
  'Trinity University': 'trinity.edu',
  'Agnes Scott College': 'agnesscott.edu',
  'Wheaton College (Massachusetts)': 'wheatonma.edu',
  'Wheaton College (Illinois)': 'wheaton.edu',
  'Hope College': 'hope.edu',
  'Allegheny College': 'allegheny.edu',
  'Hendrix College': 'hendrix.edu',
  'Howard University': 'howard.edu',
  'Spelman College': 'spelman.edu',
  'Morehouse College': 'morehouse.edu',
  'Hampton University': 'hamptonu.edu',
  'Clark Atlanta University': 'cau.edu',
  'Fisk University': 'fisk.edu',
  'UC Irvine': 'uci.edu',
  'UC Santa Cruz': 'ucsc.edu',
  'UC Riverside': 'ucr.edu',
  'Cal Poly San Luis Obispo': 'calpoly.edu',
  'NC State University': 'ncsu.edu',
  'University of Central Florida': 'ucf.edu',
  'University of South Florida': 'usf.edu',
  'Iowa State University': 'iastate.edu',
  'Kansas State University': 'k-state.edu',
  'University of Nebraska-Lincoln': 'unl.edu',
  'University of Missouri': 'missouri.edu',
  'University of Oklahoma': 'ou.edu',
  'Oklahoma State University': 'okstate.edu',
  'University of Arkansas': 'uark.edu',
  'Auburn University': 'auburn.edu',
  'University of Kentucky': 'uky.edu',
  'University of Mississippi': 'olemiss.edu',
  'Mississippi State University': 'msstate.edu',
  'University of Cincinnati': 'uc.edu',
  'Miami University Ohio': 'miamioh.edu',
  'Ohio University': 'ohio.edu',
  'University of New Hampshire': 'unh.edu',
  'University of Rhode Island': 'uri.edu',
  'Saint Louis University': 'slu.edu',
  'Loyola University Chicago': 'luc.edu',
  'DePaul University': 'depaul.edu',
  'University of Dayton': 'udayton.edu',
  'Xavier University': 'xavier.edu',
  'Seton Hall University': 'shu.edu',
  'Hofstra University': 'hofstra.edu',
  'University of Puget Sound': 'pugetsound.edu',
  'Lewis and Clark College': 'lclark.edu',
  'Seattle University': 'seattleu.edu',
  'University of San Francisco': 'usfca.edu',
  'University of San Diego': 'sandiego.edu',
  'Willamette University': 'willamette.edu',
  'University of Nevada Las Vegas': 'unlv.edu',
  'University of Nevada Reno': 'unr.edu',
  'Boise State University': 'boisestate.edu',
  'University of Idaho': 'uidaho.edu',
  'University of Wyoming': 'uwyo.edu',
  'University of New Mexico': 'unm.edu',
  'University of Hawaii at Manoa': 'hawaii.edu',
  'Colorado School of Mines': 'mines.edu',
  'Illinois Institute of Technology': 'iit.edu',
  'New Jersey Institute of Technology': 'njit.edu',
  'San Diego State University': 'sdsu.edu',
  'Cal State Long Beach': 'csulb.edu',
  'Florida International University': 'fiu.edu',
  'North Carolina A&T State University': 'ncat.edu',
  'Morgan State University': 'morgan.edu',
  'Florida A&M University': 'famu.edu',
  'Xavier University of Louisiana': 'xula.edu',
  "Saint Mary's College of California": 'stmarys-ca.edu',
  'University of Portland': 'up.edu',
  'University of the Pacific': 'pacific.edu',
  'Rollins College': 'rollins.edu',
  'Belmont University': 'belmont.edu',
  'Montana State University': 'montana.edu',
  'University of North Dakota': 'und.edu',
  'North Dakota State University': 'ndsu.edu',
  'University of Maine': 'umaine.edu',
  'Saint Anselm College': 'anselm.edu',
};

// Brand colors for prominent schools
const BRAND_COLORS: Record<string, string> = {
  'Harvard University': '#A51C30',
  'Stanford University': '#8C1515',
  'Massachusetts Institute of Technology': '#750014',
  'Yale University': '#00356B',
  'Princeton University': '#E77500',
  'Columbia University': '#1D4F91',
  'University of Pennsylvania': '#011F5B',
  'Dartmouth College': '#00693E',
  'Brown University': '#4E3629',
  'Cornell University': '#B31B1B',
  'Duke University': '#003087',
  'Northwestern University': '#4E2A84',
  'Vanderbilt University': '#866D4B',
  'University of Notre Dame': '#0C2340',
  'Georgetown University': '#041E42',
  'Emory University': '#012169',
  'University of Southern California': '#990000',
  'New York University': '#57068C',
  'University of California, Los Angeles': '#003B5C',
  'University of California, Berkeley': '#003262',
  'University of Michigan': '#00274C',
  'University of North Carolina at Chapel Hill': '#4B9CD3',
  'University of Virginia': '#232D4B',
  'Georgia Institute of Technology': '#B3A369',
  'Howard University': '#003A63',
  'Spelman College': '#002868',
  'Morehouse College': '#8B0000',
  'Hampton University': '#003A63',
  'Clark Atlanta University': '#003A63',
};

function getDeterministicColor(name: string): string {
  const first = name.charAt(0).toUpperCase();
  if (first >= 'A' && first <= 'E') return '#1d1d1f';
  if (first >= 'F' && first <= 'J') return '#003087';
  if (first >= 'K' && first <= 'O') return '#4E2A84';
  if (first >= 'P' && first <= 'T') return '#A51C30';
  return '#006341';
}

function getBgColor(name: string): string {
  return BRAND_COLORS[name] ?? getDeterministicColor(name);
}

function extractDomain(website: string): string {
  return website.replace(/^https?:\/\/(www\.)?/, '').split('/')[0];
}

const SIZE_CLASSES = {
  sm: 'w-8 h-8 rounded-lg',
  md: 'w-10 h-10 rounded-xl',
  lg: 'w-14 h-14 rounded-xl',
};

const FONT_SIZES = {
  sm: 'text-[12px]',
  md: 'text-[14px]',
  lg: 'text-[22px]',
};

export default function CollegeLogo({ name, website, size = 'md' }: CollegeLogoProps) {
  const [imgFailed, setImgFailed] = useState(false);

  const initial = name.charAt(0).toUpperCase();
  const bgColor = getBgColor(name);
  const sizeClass = SIZE_CLASSES[size];
  const fontSize = FONT_SIZES[size];

  // Resolve domain: from website prop first, then DOMAIN_MAP
  let domain: string | null = null;
  if (website) {
    domain = extractDomain(website);
  } else if (DOMAIN_MAP[name]) {
    domain = DOMAIN_MAP[name];
  }

  if (!domain || imgFailed) {
    return (
      <div
        className={`${sizeClass} flex items-center justify-center shrink-0 shadow-sm`}
        style={{ backgroundColor: bgColor }}
      >
        <span className={`text-white ${fontSize} font-[800]`}>{initial}</span>
      </div>
    );
  }

  return (
    <div
      className={`${sizeClass} overflow-hidden flex items-center justify-center shrink-0 shadow-sm`}
      style={{ backgroundColor: bgColor }}
    >
      <img
        src={`https://logo.clearbit.com/${domain}?size=80`}
        alt={name}
        className="w-full h-full object-contain p-[3px]"
        onError={() => setImgFailed(true)}
      />
    </div>
  );
}

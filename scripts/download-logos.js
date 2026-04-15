/**
 * Download university logos to public/college-logos/
 *
 * Sources (tried in order): DuckDuckGo icons, Google favicons, direct domain /favicon.ico
 * Saves each as PNG/ICO at public/college-logos/{slug}.png
 *
 * Run once: node scripts/download-logos.js
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const OUT_DIR = path.join(__dirname, '..', 'public', 'college-logos');
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

const DOMAIN_MAP = {
  'Harvard University': 'harvard.edu',
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

function slugify(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function fetchBuffer(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { timeout: 10000, headers: { 'User-Agent': 'Mozilla/5.0 due.college-logo-bot' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchBuffer(res.headers.location).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`HTTP ${res.statusCode}`));
      }
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => resolve(Buffer.concat(chunks)));
    });
    req.on('timeout', () => { req.destroy(new Error('timeout')); });
    req.on('error', reject);
  });
}

async function tryFetch(domain) {
  const sources = [
    `https://icons.duckduckgo.com/ip3/${domain}.ico`,
    `https://www.google.com/s2/favicons?domain=${domain}&sz=128`,
    `https://${domain}/favicon.ico`,
  ];
  for (const src of sources) {
    try {
      const buf = await fetchBuffer(src);
      if (buf.length >= 200) return { buf, src };
    } catch (_) {}
  }
  return null;
}

async function main() {
  const entries = Object.entries(DOMAIN_MAP);
  console.log(`Downloading ${entries.length} university logos...`);
  let ok = 0, fail = 0;
  const failures = [];

  for (const [name, domain] of entries) {
    const slug = slugify(name);
    const outPath = path.join(OUT_DIR, `${slug}.png`);
    if (fs.existsSync(outPath) && fs.statSync(outPath).size >= 200) {
      ok++;
      continue;
    }
    const result = await tryFetch(domain);
    if (result) {
      fs.writeFileSync(outPath, result.buf);
      ok++;
      process.stdout.write('.');
    } else {
      fail++;
      failures.push(name);
      process.stdout.write('x');
    }
  }

  console.log(`\n\nDone. ${ok} ok, ${fail} failed.`);
  if (failures.length) {
    console.log('Failed:', failures.join(', '));
  }
}

main().catch(console.error);

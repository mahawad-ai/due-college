-- Insert 100 more colleges
INSERT INTO colleges (id, name, common_app) VALUES
  (gen_random_uuid(), 'Wake Forest University', true),
  (gen_random_uuid(), 'University of Rochester', true),
  (gen_random_uuid(), 'Case Western Reserve University', true),
  (gen_random_uuid(), 'Brandeis University', true),
  (gen_random_uuid(), 'Rensselaer Polytechnic Institute', true),
  (gen_random_uuid(), 'Worcester Polytechnic Institute', true),
  (gen_random_uuid(), 'University of Miami', true),
  (gen_random_uuid(), 'Fordham University', true),
  (gen_random_uuid(), 'Villanova University', true),
  (gen_random_uuid(), 'Lehigh University', true),
  (gen_random_uuid(), 'Washington University in St. Louis', true),
  (gen_random_uuid(), 'University of Southern California', true),
  (gen_random_uuid(), 'Boston College', true),
  (gen_random_uuid(), 'Georgia Institute of Technology', true),
  (gen_random_uuid(), 'George Washington University', true),
  (gen_random_uuid(), 'American University', true),
  (gen_random_uuid(), 'Syracuse University', true),
  (gen_random_uuid(), 'Pepperdine University', true),
  (gen_random_uuid(), 'Santa Clara University', true),
  (gen_random_uuid(), 'Gonzaga University', true),
  (gen_random_uuid(), 'Loyola Marymount University', true),
  (gen_random_uuid(), 'University of Denver', true),
  (gen_random_uuid(), 'Creighton University', true),
  (gen_random_uuid(), 'Marquette University', true),
  (gen_random_uuid(), 'University of Richmond', true),
  (gen_random_uuid(), 'Texas Christian University', true),
  (gen_random_uuid(), 'Baylor University', true),
  (gen_random_uuid(), 'Florida State University', true),
  (gen_random_uuid(), 'Williams College', true),
  (gen_random_uuid(), 'Amherst College', true),
  (gen_random_uuid(), 'Swarthmore College', true),
  (gen_random_uuid(), 'Pomona College', true),
  (gen_random_uuid(), 'Middlebury College', true),
  (gen_random_uuid(), 'Bowdoin College', true),
  (gen_random_uuid(), 'Carleton College', true),
  (gen_random_uuid(), 'Colby College', true),
  (gen_random_uuid(), 'Bates College', true),
  (gen_random_uuid(), 'Hamilton College', true),
  (gen_random_uuid(), 'Haverford College', true),
  (gen_random_uuid(), 'Vassar College', true),
  (gen_random_uuid(), 'Colgate University', true),
  (gen_random_uuid(), 'Davidson College', true),
  (gen_random_uuid(), 'Oberlin College', true),
  (gen_random_uuid(), 'Harvey Mudd College', true),
  (gen_random_uuid(), 'Claremont McKenna College', true),
  (gen_random_uuid(), 'Scripps College', true),
  (gen_random_uuid(), 'Pitzer College', true),
  (gen_random_uuid(), 'Barnard College', true),
  (gen_random_uuid(), 'Trinity College', true),
  (gen_random_uuid(), 'Bucknell University', true),
  (gen_random_uuid(), 'Lafayette College', true),
  (gen_random_uuid(), 'Dickinson College', true),
  (gen_random_uuid(), 'Franklin and Marshall College', true),
  (gen_random_uuid(), 'Grinnell College', true),
  (gen_random_uuid(), 'Macalester College', true),
  (gen_random_uuid(), 'Colorado College', true),
  (gen_random_uuid(), 'Reed College', true),
  (gen_random_uuid(), 'Whitman College', true),
  (gen_random_uuid(), 'Occidental College', true),
  (gen_random_uuid(), 'Skidmore College', true),
  (gen_random_uuid(), 'Union College', true),
  (gen_random_uuid(), 'Sarah Lawrence College', true),
  (gen_random_uuid(), 'Bard College', true),
  (gen_random_uuid(), 'Bryn Mawr College', true),
  (gen_random_uuid(), 'Gettysburg College', true),
  (gen_random_uuid(), 'Muhlenberg College', true),
  (gen_random_uuid(), 'University of Maryland', true),
  (gen_random_uuid(), 'University of Wisconsin-Madison', true),
  (gen_random_uuid(), 'University of Minnesota', true),
  (gen_random_uuid(), 'University of Illinois Urbana-Champaign', true),
  (gen_random_uuid(), 'University of Georgia', true),
  (gen_random_uuid(), 'University of Texas at Austin', true),
  (gen_random_uuid(), 'Texas A&M University', true),
  (gen_random_uuid(), 'University of Washington', true),
  (gen_random_uuid(), 'University of Oregon', true),
  (gen_random_uuid(), 'University of Colorado Boulder', true),
  (gen_random_uuid(), 'University of Arizona', true),
  (gen_random_uuid(), 'Arizona State University', true),
  (gen_random_uuid(), 'Purdue University', true),
  (gen_random_uuid(), 'Indiana University Bloomington', true),
  (gen_random_uuid(), 'Michigan State University', true),
  (gen_random_uuid(), 'Clemson University', true),
  (gen_random_uuid(), 'Virginia Tech', true),
  (gen_random_uuid(), 'College of William and Mary', true),
  (gen_random_uuid(), 'University of Pittsburgh', true),
  (gen_random_uuid(), 'University of Connecticut', true),
  (gen_random_uuid(), 'University of Massachusetts Amherst', true),
  (gen_random_uuid(), 'Rutgers University', true),
  (gen_random_uuid(), 'University of Delaware', true),
  (gen_random_uuid(), 'University of Iowa', true),
  (gen_random_uuid(), 'University of Utah', true),
  (gen_random_uuid(), 'Colorado State University', true),
  (gen_random_uuid(), 'James Madison University', true),
  (gen_random_uuid(), 'University of South Carolina', true),
  (gen_random_uuid(), 'Louisiana State University', true),
  (gen_random_uuid(), 'Drexel University', true),
  (gen_random_uuid(), 'Temple University', true),
  (gen_random_uuid(), 'University of Vermont', true),
  (gen_random_uuid(), 'Stony Brook University', true),
  (gen_random_uuid(), 'University of Kansas', true)
ON CONFLICT (name) DO NOTHING;

-- Wake Forest University
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'ED1', '2025-11-15' FROM colleges WHERE name = 'Wake Forest University';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'EA', '2025-11-15' FROM colleges WHERE name = 'Wake Forest University';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'ED2', '2026-01-01' FROM colleges WHERE name = 'Wake Forest University';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'RD', '2026-01-01' FROM colleges WHERE name = 'Wake Forest University';

-- University of Rochester
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'ED1', '2025-11-01' FROM colleges WHERE name = 'University of Rochester';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'ED2', '2026-01-05' FROM colleges WHERE name = 'University of Rochester';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'RD', '2026-01-05' FROM colleges WHERE name = 'University of Rochester';

-- Case Western Reserve University
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'ED1', '2025-11-01' FROM colleges WHERE name = 'Case Western Reserve University';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'EA', '2025-11-01' FROM colleges WHERE name = 'Case Western Reserve University';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'ED2', '2026-01-15' FROM colleges WHERE name = 'Case Western Reserve University';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'RD', '2026-01-15' FROM colleges WHERE name = 'Case Western Reserve University';

-- Brandeis University
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'ED1', '2025-11-03' FROM colleges WHERE name = 'Brandeis University';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'ED2', '2026-01-15' FROM colleges WHERE name = 'Brandeis University';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'RD', '2026-01-15' FROM colleges WHERE name = 'Brandeis University';

-- Rensselaer Polytechnic Institute
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'ED1', '2025-11-01' FROM colleges WHERE name = 'Rensselaer Polytechnic Institute';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'EA', '2025-11-01' FROM colleges WHERE name = 'Rensselaer Polytechnic Institute';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'RD', '2026-01-15' FROM colleges WHERE name = 'Rensselaer Polytechnic Institute';

-- Worcester Polytechnic Institute
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'ED1', '2025-11-01' FROM colleges WHERE name = 'Worcester Polytechnic Institute';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'EA', '2025-11-01' FROM colleges WHERE name = 'Worcester Polytechnic Institute';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'ED2', '2026-01-01' FROM colleges WHERE name = 'Worcester Polytechnic Institute';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'RD', '2026-02-01' FROM colleges WHERE name = 'Worcester Polytechnic Institute';

-- University of Miami
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'ED1', '2025-11-01' FROM colleges WHERE name = 'University of Miami';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'EA', '2025-11-01' FROM colleges WHERE name = 'University of Miami';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'ED2', '2026-01-01' FROM colleges WHERE name = 'University of Miami';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'RD', '2026-01-01' FROM colleges WHERE name = 'University of Miami';

-- Fordham University
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'ED1', '2025-11-01' FROM colleges WHERE name = 'Fordham University';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'EA', '2025-11-01' FROM colleges WHERE name = 'Fordham University';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'RD', '2026-01-03' FROM colleges WHERE name = 'Fordham University';

-- Villanova University
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'ED1', '2025-11-01' FROM colleges WHERE name = 'Villanova University';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'EA', '2025-11-01' FROM colleges WHERE name = 'Villanova University';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'ED2', '2026-01-15' FROM colleges WHERE name = 'Villanova University';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'RD', '2026-01-15' FROM colleges WHERE name = 'Villanova University';

-- Lehigh University
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'ED1', '2025-11-01' FROM colleges WHERE name = 'Lehigh University';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'ED2', '2026-01-01' FROM colleges WHERE name = 'Lehigh University';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'RD', '2026-01-15' FROM colleges WHERE name = 'Lehigh University';

-- Washington University in St. Louis
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'ED1', '2025-11-01' FROM colleges WHERE name = 'Washington University in St. Louis';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'ED2', '2026-01-02' FROM colleges WHERE name = 'Washington University in St. Louis';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'RD', '2026-01-02' FROM colleges WHERE name = 'Washington University in St. Louis';

-- University of Southern California
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'ED1', '2025-11-01' FROM colleges WHERE name = 'University of Southern California';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'RD', '2026-01-15' FROM colleges WHERE name = 'University of Southern California';

-- Boston College
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'EA', '2025-11-01' FROM colleges WHERE name = 'Boston College';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'RD', '2026-01-01' FROM colleges WHERE name = 'Boston College';

-- Georgia Institute of Technology
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'EA', '2025-10-15' FROM colleges WHERE name = 'Georgia Institute of Technology';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'RD', '2026-01-05' FROM colleges WHERE name = 'Georgia Institute of Technology';

-- George Washington University
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'ED1', '2025-11-01' FROM colleges WHERE name = 'George Washington University';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'EA', '2025-11-01' FROM colleges WHERE name = 'George Washington University';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'ED2', '2026-01-05' FROM colleges WHERE name = 'George Washington University';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'RD', '2026-01-05' FROM colleges WHERE name = 'George Washington University';

-- American University
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'ED1', '2025-11-01' FROM colleges WHERE name = 'American University';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'EA', '2025-11-01' FROM colleges WHERE name = 'American University';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'ED2', '2026-01-15' FROM colleges WHERE name = 'American University';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'RD', '2026-01-15' FROM colleges WHERE name = 'American University';

-- Syracuse University
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'ED1', '2025-11-01' FROM colleges WHERE name = 'Syracuse University';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'EA', '2025-11-01' FROM colleges WHERE name = 'Syracuse University';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'ED2', '2026-01-01' FROM colleges WHERE name = 'Syracuse University';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'RD', '2026-01-01' FROM colleges WHERE name = 'Syracuse University';

-- Pepperdine University
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'EA', '2025-11-01' FROM colleges WHERE name = 'Pepperdine University';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'RD', '2026-01-15' FROM colleges WHERE name = 'Pepperdine University';

-- Santa Clara University
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'ED1', '2025-11-01' FROM colleges WHERE name = 'Santa Clara University';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'RD', '2026-01-07' FROM colleges WHERE name = 'Santa Clara University';

-- Gonzaga University
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'EA', '2025-11-15' FROM colleges WHERE name = 'Gonzaga University';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'RD', '2026-02-01' FROM colleges WHERE name = 'Gonzaga University';

-- Loyola Marymount University
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'ED1', '2025-11-01' FROM colleges WHERE name = 'Loyola Marymount University';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'EA', '2025-11-01' FROM colleges WHERE name = 'Loyola Marymount University';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'ED2', '2026-01-01' FROM colleges WHERE name = 'Loyola Marymount University';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'RD', '2026-01-15' FROM colleges WHERE name = 'Loyola Marymount University';

-- University of Denver
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'ED1', '2025-11-01' FROM colleges WHERE name = 'University of Denver';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'EA', '2025-11-01' FROM colleges WHERE name = 'University of Denver';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'ED2', '2026-01-01' FROM colleges WHERE name = 'University of Denver';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'RD', '2026-01-15' FROM colleges WHERE name = 'University of Denver';

-- Creighton University
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'EA', '2025-11-01' FROM colleges WHERE name = 'Creighton University';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'RD', '2026-02-01' FROM colleges WHERE name = 'Creighton University';

-- Marquette University
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'EA', '2025-11-01' FROM colleges WHERE name = 'Marquette University';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'RD', '2025-12-01' FROM colleges WHERE name = 'Marquette University';

-- University of Richmond
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'ED1', '2025-11-01' FROM colleges WHERE name = 'University of Richmond';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'EA', '2025-11-01' FROM colleges WHERE name = 'University of Richmond';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'ED2', '2026-01-15' FROM colleges WHERE name = 'University of Richmond';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'RD', '2026-01-15' FROM colleges WHERE name = 'University of Richmond';

-- Texas Christian University
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'ED1', '2025-11-01' FROM colleges WHERE name = 'Texas Christian University';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'EA', '2025-11-01' FROM colleges WHERE name = 'Texas Christian University';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'ED2', '2026-02-01' FROM colleges WHERE name = 'Texas Christian University';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'RD', '2026-02-01' FROM colleges WHERE name = 'Texas Christian University';

-- Baylor University
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'EA', '2025-11-01' FROM colleges WHERE name = 'Baylor University';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'RD', '2026-02-01' FROM colleges WHERE name = 'Baylor University';

-- Florida State University
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'EA', '2025-11-01' FROM colleges WHERE name = 'Florida State University';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'RD', '2025-12-15' FROM colleges WHERE name = 'Florida State University';

-- Williams College
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'ED1', '2025-11-15' FROM colleges WHERE name = 'Williams College';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'RD', '2026-01-05' FROM colleges WHERE name = 'Williams College';

-- Amherst College
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'ED1', '2025-11-01' FROM colleges WHERE name = 'Amherst College';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'RD', '2026-01-05' FROM colleges WHERE name = 'Amherst College';

-- Swarthmore College
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'ED1', '2025-11-15' FROM colleges WHERE name = 'Swarthmore College';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'ED2', '2026-01-02' FROM colleges WHERE name = 'Swarthmore College';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'RD', '2026-01-02' FROM colleges WHERE name = 'Swarthmore College';

-- Pomona College
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'ED1', '2025-11-01' FROM colleges WHERE name = 'Pomona College';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'ED2', '2026-01-01' FROM colleges WHERE name = 'Pomona College';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'RD', '2026-01-05' FROM colleges WHERE name = 'Pomona College';

-- Middlebury College
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'ED1', '2025-11-01' FROM colleges WHERE name = 'Middlebury College';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'ED2', '2026-01-01' FROM colleges WHERE name = 'Middlebury College';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'RD', '2026-01-01' FROM colleges WHERE name = 'Middlebury College';

-- Bowdoin College
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'ED1', '2025-11-15' FROM colleges WHERE name = 'Bowdoin College';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'ED2', '2026-01-05' FROM colleges WHERE name = 'Bowdoin College';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'RD', '2026-01-05' FROM colleges WHERE name = 'Bowdoin College';

-- Carleton College
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'ED1', '2025-11-15' FROM colleges WHERE name = 'Carleton College';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'ED2', '2026-01-15' FROM colleges WHERE name = 'Carleton College';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'RD', '2026-01-15' FROM colleges WHERE name = 'Carleton College';

-- Colby College
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'ED1', '2025-11-01' FROM colleges WHERE name = 'Colby College';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'ED2', '2026-01-01' FROM colleges WHERE name = 'Colby College';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'RD', '2026-01-01' FROM colleges WHERE name = 'Colby College';

-- Bates College
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'ED1', '2025-11-01' FROM colleges WHERE name = 'Bates College';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'ED2', '2026-01-01' FROM colleges WHERE name = 'Bates College';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'RD', '2026-01-01' FROM colleges WHERE name = 'Bates College';

-- Hamilton College
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'ED1', '2025-11-01' FROM colleges WHERE name = 'Hamilton College';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'ED2', '2026-01-01' FROM colleges WHERE name = 'Hamilton College';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'RD', '2026-01-01' FROM colleges WHERE name = 'Hamilton College';

-- Haverford College
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'ED1', '2025-11-15' FROM colleges WHERE name = 'Haverford College';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'ED2', '2026-01-15' FROM colleges WHERE name = 'Haverford College';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'RD', '2026-01-15' FROM colleges WHERE name = 'Haverford College';

-- Vassar College
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'ED1', '2025-11-15' FROM colleges WHERE name = 'Vassar College';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'ED2', '2026-01-01' FROM colleges WHERE name = 'Vassar College';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'RD', '2026-01-01' FROM colleges WHERE name = 'Vassar College';

-- Colgate University
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'ED1', '2025-11-15' FROM colleges WHERE name = 'Colgate University';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'ED2', '2026-01-15' FROM colleges WHERE name = 'Colgate University';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'RD', '2026-01-15' FROM colleges WHERE name = 'Colgate University';

-- Davidson College
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'ED1', '2025-11-15' FROM colleges WHERE name = 'Davidson College';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'EA', '2025-11-15' FROM colleges WHERE name = 'Davidson College';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'RD', '2026-01-15' FROM colleges WHERE name = 'Davidson College';

-- Oberlin College
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'ED1', '2025-11-15' FROM colleges WHERE name = 'Oberlin College';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'ED2', '2026-01-01' FROM colleges WHERE name = 'Oberlin College';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'RD', '2026-01-15' FROM colleges WHERE name = 'Oberlin College';

-- Harvey Mudd College
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'ED1', '2025-11-15' FROM colleges WHERE name = 'Harvey Mudd College';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'ED2', '2026-01-05' FROM colleges WHERE name = 'Harvey Mudd College';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'RD', '2026-01-05' FROM colleges WHERE name = 'Harvey Mudd College';

-- Claremont McKenna College
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'ED1', '2025-11-01' FROM colleges WHERE name = 'Claremont McKenna College';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'ED2', '2026-01-10' FROM colleges WHERE name = 'Claremont McKenna College';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'RD', '2026-01-10' FROM colleges WHERE name = 'Claremont McKenna College';

-- Scripps College
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'ED1', '2025-11-01' FROM colleges WHERE name = 'Scripps College';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'ED2', '2026-01-05' FROM colleges WHERE name = 'Scripps College';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'RD', '2026-01-05' FROM colleges WHERE name = 'Scripps College';

-- Pitzer College
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'ED1', '2025-11-01' FROM colleges WHERE name = 'Pitzer College';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'ED2', '2026-01-01' FROM colleges WHERE name = 'Pitzer College';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'RD', '2026-01-01' FROM colleges WHERE name = 'Pitzer College';

-- Barnard College
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'ED1', '2025-11-01' FROM colleges WHERE name = 'Barnard College';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'RD', '2026-01-01' FROM colleges WHERE name = 'Barnard College';

-- Trinity College
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'ED1', '2025-11-15' FROM colleges WHERE name = 'Trinity College';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'ED2', '2026-01-15' FROM colleges WHERE name = 'Trinity College';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'RD', '2026-01-17' FROM colleges WHERE name = 'Trinity College';

-- Bucknell University
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'ED1', '2025-11-01' FROM colleges WHERE name = 'Bucknell University';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'ED2', '2026-01-15' FROM colleges WHERE name = 'Bucknell University';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'RD', '2026-01-15' FROM colleges WHERE name = 'Bucknell University';

-- Lafayette College
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'ED1', '2025-11-15' FROM colleges WHERE name = 'Lafayette College';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'ED2', '2026-01-15' FROM colleges WHERE name = 'Lafayette College';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'RD', '2026-01-15' FROM colleges WHERE name = 'Lafayette College';

-- Dickinson College
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'ED1', '2025-11-15' FROM colleges WHERE name = 'Dickinson College';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'ED2', '2026-01-17' FROM colleges WHERE name = 'Dickinson College';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'RD', '2026-01-17' FROM colleges WHERE name = 'Dickinson College';

-- Franklin and Marshall College
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'ED1', '2025-11-01' FROM colleges WHERE name = 'Franklin and Marshall College';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'RD', '2026-01-06' FROM colleges WHERE name = 'Franklin and Marshall College';

-- Grinnell College
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'ED1', '2025-11-15' FROM colleges WHERE name = 'Grinnell College';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'ED2', '2026-01-05' FROM colleges WHERE name = 'Grinnell College';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'RD', '2026-01-05' FROM colleges WHERE name = 'Grinnell College';

-- Macalester College
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'ED1', '2025-11-01' FROM colleges WHERE name = 'Macalester College';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'ED2', '2026-01-15' FROM colleges WHERE name = 'Macalester College';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'RD', '2026-01-15' FROM colleges WHERE name = 'Macalester College';

-- Colorado College
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'ED1', '2025-11-01' FROM colleges WHERE name = 'Colorado College';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'ED2', '2026-01-15' FROM colleges WHERE name = 'Colorado College';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'RD', '2026-01-15' FROM colleges WHERE name = 'Colorado College';

-- Reed College
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'ED1', '2025-11-01' FROM colleges WHERE name = 'Reed College';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'ED2', '2026-01-01' FROM colleges WHERE name = 'Reed College';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'RD', '2026-01-15' FROM colleges WHERE name = 'Reed College';

-- Whitman College
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'ED1', '2025-11-15' FROM colleges WHERE name = 'Whitman College';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'ED2', '2026-01-15' FROM colleges WHERE name = 'Whitman College';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'RD', '2026-01-15' FROM colleges WHERE name = 'Whitman College';

-- Occidental College
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'ED1', '2025-11-01' FROM colleges WHERE name = 'Occidental College';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'ED2', '2026-01-15' FROM colleges WHERE name = 'Occidental College';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'RD', '2026-01-15' FROM colleges WHERE name = 'Occidental College';

-- Skidmore College
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'ED1', '2025-11-01' FROM colleges WHERE name = 'Skidmore College';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'ED2', '2026-01-15' FROM colleges WHERE name = 'Skidmore College';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'RD', '2026-01-15' FROM colleges WHERE name = 'Skidmore College';

-- Union College
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'ED1', '2025-11-15' FROM colleges WHERE name = 'Union College';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'ED2', '2026-01-15' FROM colleges WHERE name = 'Union College';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'RD', '2026-01-15' FROM colleges WHERE name = 'Union College';

-- Sarah Lawrence College
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'ED1', '2025-11-01' FROM colleges WHERE name = 'Sarah Lawrence College';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'ED2', '2026-01-01' FROM colleges WHERE name = 'Sarah Lawrence College';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'RD', '2026-01-15' FROM colleges WHERE name = 'Sarah Lawrence College';

-- Bard College
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'ED1', '2025-11-01' FROM colleges WHERE name = 'Bard College';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'ED2', '2026-01-01' FROM colleges WHERE name = 'Bard College';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'RD', '2026-02-01' FROM colleges WHERE name = 'Bard College';

-- Bryn Mawr College
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'ED1', '2025-11-01' FROM colleges WHERE name = 'Bryn Mawr College';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'ED2', '2026-01-15' FROM colleges WHERE name = 'Bryn Mawr College';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'RD', '2026-01-15' FROM colleges WHERE name = 'Bryn Mawr College';

-- Gettysburg College
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'ED1', '2025-11-15' FROM colleges WHERE name = 'Gettysburg College';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'ED2', '2026-01-15' FROM colleges WHERE name = 'Gettysburg College';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'RD', '2026-02-01' FROM colleges WHERE name = 'Gettysburg College';

-- Muhlenberg College
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'ED1', '2025-11-15' FROM colleges WHERE name = 'Muhlenberg College';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'RD', '2026-02-15' FROM colleges WHERE name = 'Muhlenberg College';

-- University of Maryland
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'EA', '2025-11-01' FROM colleges WHERE name = 'University of Maryland';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'RD', '2026-01-20' FROM colleges WHERE name = 'University of Maryland';

-- University of Wisconsin-Madison
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'EA', '2025-11-01' FROM colleges WHERE name = 'University of Wisconsin-Madison';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'RD', '2026-01-15' FROM colleges WHERE name = 'University of Wisconsin-Madison';

-- University of Minnesota
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'EA', '2025-11-01' FROM colleges WHERE name = 'University of Minnesota';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'RD', '2026-01-15' FROM colleges WHERE name = 'University of Minnesota';

-- University of Illinois Urbana-Champaign
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'EA', '2025-11-01' FROM colleges WHERE name = 'University of Illinois Urbana-Champaign';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'RD', '2026-01-05' FROM colleges WHERE name = 'University of Illinois Urbana-Champaign';

-- University of Georgia
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'EA', '2025-10-15' FROM colleges WHERE name = 'University of Georgia';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'RD', '2026-01-01' FROM colleges WHERE name = 'University of Georgia';

-- University of Texas at Austin
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'Scholarship', '2025-10-15' FROM colleges WHERE name = 'University of Texas at Austin';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'RD', '2025-12-01' FROM colleges WHERE name = 'University of Texas at Austin';

-- Texas A&M University
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'Scholarship', '2025-12-01' FROM colleges WHERE name = 'Texas A&M University';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'RD', '2025-12-01' FROM colleges WHERE name = 'Texas A&M University';

-- University of Washington
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'RD', '2025-11-15' FROM colleges WHERE name = 'University of Washington';

-- University of Oregon
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'EA', '2025-11-01' FROM colleges WHERE name = 'University of Oregon';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'RD', '2026-01-15' FROM colleges WHERE name = 'University of Oregon';

-- University of Colorado Boulder
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'EA', '2025-11-15' FROM colleges WHERE name = 'University of Colorado Boulder';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'RD', '2026-01-15' FROM colleges WHERE name = 'University of Colorado Boulder';

-- University of Arizona
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'EA', '2025-11-01' FROM colleges WHERE name = 'University of Arizona';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'RD', '2026-05-01' FROM colleges WHERE name = 'University of Arizona';

-- Arizona State University
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'EA', '2025-11-01' FROM colleges WHERE name = 'Arizona State University';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'RD', '2026-02-01' FROM colleges WHERE name = 'Arizona State University';

-- Purdue University
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'EA', '2025-11-01' FROM colleges WHERE name = 'Purdue University';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'RD', '2026-01-15' FROM colleges WHERE name = 'Purdue University';

-- Indiana University Bloomington
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'EA', '2025-11-01' FROM colleges WHERE name = 'Indiana University Bloomington';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'RD', '2026-02-01' FROM colleges WHERE name = 'Indiana University Bloomington';

-- Michigan State University
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'EA', '2025-11-01' FROM colleges WHERE name = 'Michigan State University';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'RD', '2026-04-01' FROM colleges WHERE name = 'Michigan State University';

-- Clemson University
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'EA', '2025-11-01' FROM colleges WHERE name = 'Clemson University';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'RD', '2026-01-15' FROM colleges WHERE name = 'Clemson University';

-- Virginia Tech
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'EA', '2025-11-01' FROM colleges WHERE name = 'Virginia Tech';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'RD', '2026-01-15' FROM colleges WHERE name = 'Virginia Tech';

-- College of William and Mary
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'ED1', '2025-11-01' FROM colleges WHERE name = 'College of William and Mary';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'ED2', '2026-01-05' FROM colleges WHERE name = 'College of William and Mary';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'RD', '2026-01-05' FROM colleges WHERE name = 'College of William and Mary';

-- University of Pittsburgh
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'EA', '2025-11-01' FROM colleges WHERE name = 'University of Pittsburgh';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'RD', '2026-01-15' FROM colleges WHERE name = 'University of Pittsburgh';

-- University of Connecticut
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'ED1', '2025-11-01' FROM colleges WHERE name = 'University of Connecticut';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'EA', '2025-11-01' FROM colleges WHERE name = 'University of Connecticut';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'RD', '2026-01-15' FROM colleges WHERE name = 'University of Connecticut';

-- University of Massachusetts Amherst
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'EA', '2025-11-05' FROM colleges WHERE name = 'University of Massachusetts Amherst';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'RD', '2026-01-15' FROM colleges WHERE name = 'University of Massachusetts Amherst';

-- Rutgers University
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'EA', '2025-11-01' FROM colleges WHERE name = 'Rutgers University';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'RD', '2025-12-01' FROM colleges WHERE name = 'Rutgers University';

-- University of Delaware
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'EA', '2025-11-01' FROM colleges WHERE name = 'University of Delaware';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'RD', '2026-01-15' FROM colleges WHERE name = 'University of Delaware';

-- University of Iowa
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'EA', '2025-11-01' FROM colleges WHERE name = 'University of Iowa';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'RD', '2026-02-01' FROM colleges WHERE name = 'University of Iowa';

-- University of Utah
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'EA', '2025-11-01' FROM colleges WHERE name = 'University of Utah';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'RD', '2026-04-01' FROM colleges WHERE name = 'University of Utah';

-- Colorado State University
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'EA', '2025-11-01' FROM colleges WHERE name = 'Colorado State University';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'RD', '2026-02-01' FROM colleges WHERE name = 'Colorado State University';

-- James Madison University
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'EA', '2025-11-01' FROM colleges WHERE name = 'James Madison University';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'RD', '2026-01-15' FROM colleges WHERE name = 'James Madison University';

-- University of South Carolina
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'EA', '2025-10-15' FROM colleges WHERE name = 'University of South Carolina';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'RD', '2025-12-01' FROM colleges WHERE name = 'University of South Carolina';

-- Louisiana State University
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'EA', '2025-11-15' FROM colleges WHERE name = 'Louisiana State University';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'RD', '2026-04-15' FROM colleges WHERE name = 'Louisiana State University';

-- Drexel University
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'ED1', '2025-11-01' FROM colleges WHERE name = 'Drexel University';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'EA', '2025-11-01' FROM colleges WHERE name = 'Drexel University';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'ED2', '2026-01-15' FROM colleges WHERE name = 'Drexel University';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'RD', '2026-01-15' FROM colleges WHERE name = 'Drexel University';

-- Temple University
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'EA', '2025-11-01' FROM colleges WHERE name = 'Temple University';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'RD', '2026-03-01' FROM colleges WHERE name = 'Temple University';

-- University of Vermont
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'ED1', '2025-11-01' FROM colleges WHERE name = 'University of Vermont';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'ED2', '2026-01-15' FROM colleges WHERE name = 'University of Vermont';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'RD', '2026-01-15' FROM colleges WHERE name = 'University of Vermont';

-- Stony Brook University
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'EA', '2025-11-01' FROM colleges WHERE name = 'Stony Brook University';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'RD', '2026-01-15' FROM colleges WHERE name = 'Stony Brook University';

-- University of Kansas
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'EA', '2025-11-01' FROM colleges WHERE name = 'University of Kansas';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'RD', '2026-02-01' FROM colleges WHERE name = 'University of Kansas';

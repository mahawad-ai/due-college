-- Insert next 100 colleges
INSERT INTO colleges (id, name, common_app) VALUES
  (gen_random_uuid(), 'Stevens Institute of Technology', true),
  (gen_random_uuid(), 'Rochester Institute of Technology', true),
  (gen_random_uuid(), 'Babson College', true),
  (gen_random_uuid(), 'Bentley University', true),
  (gen_random_uuid(), 'Elon University', true),
  (gen_random_uuid(), 'Fairfield University', true),
  (gen_random_uuid(), 'Providence College', true),
  (gen_random_uuid(), 'Quinnipiac University', true),
  (gen_random_uuid(), 'Sacred Heart University', true),
  (gen_random_uuid(), 'Kenyon College', true),
  (gen_random_uuid(), 'Denison University', true),
  (gen_random_uuid(), 'College of Wooster', true),
  (gen_random_uuid(), 'DePauw University', true),
  (gen_random_uuid(), 'Ohio Wesleyan University', true),
  (gen_random_uuid(), 'Butler University', true),
  (gen_random_uuid(), 'Furman University', true),
  (gen_random_uuid(), 'Wofford College', true),
  (gen_random_uuid(), 'Rhodes College', true),
  (gen_random_uuid(), 'Sewanee: The University of the South', true),
  (gen_random_uuid(), 'Centre College', true),
  (gen_random_uuid(), 'Trinity University', true),
  (gen_random_uuid(), 'Agnes Scott College', true),
  (gen_random_uuid(), 'Wheaton College (Massachusetts)', true),
  (gen_random_uuid(), 'Wheaton College (Illinois)', true),
  (gen_random_uuid(), 'Hope College', true),
  (gen_random_uuid(), 'Allegheny College', true),
  (gen_random_uuid(), 'Hendrix College', true),
  (gen_random_uuid(), 'Howard University', true),
  (gen_random_uuid(), 'Spelman College', true),
  (gen_random_uuid(), 'Morehouse College', true),
  (gen_random_uuid(), 'Hampton University', true),
  (gen_random_uuid(), 'Clark Atlanta University', true),
  (gen_random_uuid(), 'Fisk University', true),
  (gen_random_uuid(), 'UC San Diego', true),
  (gen_random_uuid(), 'UC Santa Barbara', true),
  (gen_random_uuid(), 'UC Davis', true),
  (gen_random_uuid(), 'UC Irvine', true),
  (gen_random_uuid(), 'UC Santa Cruz', true),
  (gen_random_uuid(), 'UC Riverside', true),
  (gen_random_uuid(), 'Cal Poly San Luis Obispo', false),
  (gen_random_uuid(), 'NC State University', true),
  (gen_random_uuid(), 'University of Central Florida', true),
  (gen_random_uuid(), 'University of South Florida', true),
  (gen_random_uuid(), 'Iowa State University', true),
  (gen_random_uuid(), 'Kansas State University', true),
  (gen_random_uuid(), 'University of Nebraska-Lincoln', true),
  (gen_random_uuid(), 'University of Missouri', true),
  (gen_random_uuid(), 'University of Oklahoma', true),
  (gen_random_uuid(), 'Oklahoma State University', true),
  (gen_random_uuid(), 'University of Arkansas', true),
  (gen_random_uuid(), 'Auburn University', true),
  (gen_random_uuid(), 'University of Kentucky', true),
  (gen_random_uuid(), 'University of Mississippi', true),
  (gen_random_uuid(), 'Mississippi State University', true),
  (gen_random_uuid(), 'University of Cincinnati', true),
  (gen_random_uuid(), 'Miami University Ohio', true),
  (gen_random_uuid(), 'Ohio University', true),
  (gen_random_uuid(), 'University of New Hampshire', true),
  (gen_random_uuid(), 'University of Rhode Island', true),
  (gen_random_uuid(), 'Saint Louis University', true),
  (gen_random_uuid(), 'Loyola University Chicago', true),
  (gen_random_uuid(), 'DePaul University', true),
  (gen_random_uuid(), 'University of Dayton', true),
  (gen_random_uuid(), 'Xavier University', true),
  (gen_random_uuid(), 'Seton Hall University', true),
  (gen_random_uuid(), 'Hofstra University', true),
  (gen_random_uuid(), 'University of Puget Sound', true),
  (gen_random_uuid(), 'Lewis and Clark College', true),
  (gen_random_uuid(), 'Seattle University', true),
  (gen_random_uuid(), 'University of San Francisco', true),
  (gen_random_uuid(), 'University of San Diego', true),
  (gen_random_uuid(), 'Willamette University', true),
  (gen_random_uuid(), 'University of Nevada Las Vegas', true),
  (gen_random_uuid(), 'University of Nevada Reno', true),
  (gen_random_uuid(), 'Boise State University', true),
  (gen_random_uuid(), 'University of Idaho', true),
  (gen_random_uuid(), 'University of Wyoming', true),
  (gen_random_uuid(), 'University of New Mexico', true),
  (gen_random_uuid(), 'University of Hawaii at Manoa', true),
  (gen_random_uuid(), 'Colorado School of Mines', true),
  (gen_random_uuid(), 'Illinois Institute of Technology', true),
  (gen_random_uuid(), 'New Jersey Institute of Technology', true),
  (gen_random_uuid(), 'San Diego State University', false),
  (gen_random_uuid(), 'Cal State Long Beach', false),
  (gen_random_uuid(), 'Florida International University', true),
  (gen_random_uuid(), 'North Carolina A&T State University', true),
  (gen_random_uuid(), 'Morgan State University', true),
  (gen_random_uuid(), 'Florida A&M University', true),
  (gen_random_uuid(), 'Xavier University of Louisiana', true),
  (gen_random_uuid(), 'Saint Mary''s College of California', true),
  (gen_random_uuid(), 'University of Portland', true),
  (gen_random_uuid(), 'University of the Pacific', true),
  (gen_random_uuid(), 'Rollins College', true),
  (gen_random_uuid(), 'Belmont University', true),
  (gen_random_uuid(), 'Montana State University', true),
  (gen_random_uuid(), 'University of North Dakota', true),
  (gen_random_uuid(), 'North Dakota State University', true),
  (gen_random_uuid(), 'University of Maine', true),
  (gen_random_uuid(), 'Saint Anselm College', true)
ON CONFLICT (name) DO NOTHING;

-- California Institute of Technology (already exists, just add deadlines)
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'REA', '2025-11-01' FROM colleges WHERE name = 'California Institute of Technology' ON CONFLICT DO NOTHING;
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'RD', '2026-01-05' FROM colleges WHERE name = 'California Institute of Technology' ON CONFLICT DO NOTHING;

-- Stevens Institute of Technology
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'ED1', '2025-11-01' FROM colleges WHERE name = 'Stevens Institute of Technology';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'EA', '2025-11-01' FROM colleges WHERE name = 'Stevens Institute of Technology';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'ED2', '2026-01-15' FROM colleges WHERE name = 'Stevens Institute of Technology';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'RD', '2026-02-15' FROM colleges WHERE name = 'Stevens Institute of Technology';

-- Rochester Institute of Technology
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'ED1', '2025-11-01' FROM colleges WHERE name = 'Rochester Institute of Technology';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'EA', '2025-11-01' FROM colleges WHERE name = 'Rochester Institute of Technology';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'ED2', '2026-01-01' FROM colleges WHERE name = 'Rochester Institute of Technology';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'RD', '2026-01-15' FROM colleges WHERE name = 'Rochester Institute of Technology';

-- Babson College
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'ED1', '2025-11-01' FROM colleges WHERE name = 'Babson College';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'EA', '2025-11-01' FROM colleges WHERE name = 'Babson College';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'ED2', '2026-01-01' FROM colleges WHERE name = 'Babson College';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'RD', '2026-01-15' FROM colleges WHERE name = 'Babson College';

-- Bentley University
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'ED1', '2025-11-15' FROM colleges WHERE name = 'Bentley University';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'ED2', '2026-01-15' FROM colleges WHERE name = 'Bentley University';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'RD', '2026-01-15' FROM colleges WHERE name = 'Bentley University';

-- Elon University
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'ED1', '2025-11-01' FROM colleges WHERE name = 'Elon University';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'EA', '2025-11-01' FROM colleges WHERE name = 'Elon University';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'RD', '2026-01-10' FROM colleges WHERE name = 'Elon University';

-- Fairfield University
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'ED1', '2025-11-15' FROM colleges WHERE name = 'Fairfield University';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'ED2', '2026-01-15' FROM colleges WHERE name = 'Fairfield University';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'RD', '2026-01-15' FROM colleges WHERE name = 'Fairfield University';

-- Providence College
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'ED1', '2025-11-01' FROM colleges WHERE name = 'Providence College';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'EA', '2025-11-01' FROM colleges WHERE name = 'Providence College';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'RD', '2026-01-15' FROM colleges WHERE name = 'Providence College';

-- Quinnipiac University
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'ED1', '2025-11-01' FROM colleges WHERE name = 'Quinnipiac University';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'EA', '2025-11-15' FROM colleges WHERE name = 'Quinnipiac University';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'RD', '2026-02-01' FROM colleges WHERE name = 'Quinnipiac University';

-- Sacred Heart University
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'EA', '2025-11-01' FROM colleges WHERE name = 'Sacred Heart University';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'RD', '2026-02-01' FROM colleges WHERE name = 'Sacred Heart University';

-- Kenyon College
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'ED1', '2025-11-15' FROM colleges WHERE name = 'Kenyon College';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'ED2', '2026-01-15' FROM colleges WHERE name = 'Kenyon College';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'RD', '2026-01-15' FROM colleges WHERE name = 'Kenyon College';

-- Denison University
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'ED1', '2025-11-01' FROM colleges WHERE name = 'Denison University';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'EA', '2025-11-15' FROM colleges WHERE name = 'Denison University';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'ED2', '2026-01-15' FROM colleges WHERE name = 'Denison University';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'RD', '2026-01-15' FROM colleges WHERE name = 'Denison University';

-- College of Wooster
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'ED1', '2025-11-01' FROM colleges WHERE name = 'College of Wooster';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'EA', '2025-11-15' FROM colleges WHERE name = 'College of Wooster';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'ED2', '2026-01-15' FROM colleges WHERE name = 'College of Wooster';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'RD', '2026-02-15' FROM colleges WHERE name = 'College of Wooster';

-- DePauw University
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'ED1', '2025-11-01' FROM colleges WHERE name = 'DePauw University';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'EA', '2025-11-01' FROM colleges WHERE name = 'DePauw University';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'RD', '2026-02-01' FROM colleges WHERE name = 'DePauw University';

-- Ohio Wesleyan University
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'ED1', '2025-11-01' FROM colleges WHERE name = 'Ohio Wesleyan University';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'RD', '2026-02-01' FROM colleges WHERE name = 'Ohio Wesleyan University';

-- Butler University
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'ED1', '2025-11-01' FROM colleges WHERE name = 'Butler University';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'EA', '2025-11-01' FROM colleges WHERE name = 'Butler University';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'RD', '2026-02-01' FROM colleges WHERE name = 'Butler University';

-- Furman University
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'ED1', '2025-11-01' FROM colleges WHERE name = 'Furman University';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'EA', '2025-11-15' FROM colleges WHERE name = 'Furman University';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'ED2', '2026-01-15' FROM colleges WHERE name = 'Furman University';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'RD', '2026-01-15' FROM colleges WHERE name = 'Furman University';

-- Wofford College
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'EA', '2025-11-01' FROM colleges WHERE name = 'Wofford College';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'RD', '2026-01-15' FROM colleges WHERE name = 'Wofford College';

-- Rhodes College
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'ED1', '2025-11-01' FROM colleges WHERE name = 'Rhodes College';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'EA', '2025-11-01' FROM colleges WHERE name = 'Rhodes College';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'ED2', '2026-01-15' FROM colleges WHERE name = 'Rhodes College';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'RD', '2026-02-01' FROM colleges WHERE name = 'Rhodes College';

-- Sewanee
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'ED1', '2025-11-15' FROM colleges WHERE name = 'Sewanee: The University of the South';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'EA', '2025-11-15' FROM colleges WHERE name = 'Sewanee: The University of the South';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'ED2', '2026-01-15' FROM colleges WHERE name = 'Sewanee: The University of the South';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'RD', '2026-02-01' FROM colleges WHERE name = 'Sewanee: The University of the South';

-- Centre College
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'EA', '2025-11-01' FROM colleges WHERE name = 'Centre College';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'ED1', '2025-12-01' FROM colleges WHERE name = 'Centre College';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'RD', '2026-02-15' FROM colleges WHERE name = 'Centre College';

-- Trinity University
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'ED1', '2025-11-01' FROM colleges WHERE name = 'Trinity University';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'EA', '2025-11-01' FROM colleges WHERE name = 'Trinity University';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'ED2', '2026-02-01' FROM colleges WHERE name = 'Trinity University';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'RD', '2026-02-01' FROM colleges WHERE name = 'Trinity University';

-- Agnes Scott College
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'ED1', '2025-11-01' FROM colleges WHERE name = 'Agnes Scott College';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'EA', '2025-11-01' FROM colleges WHERE name = 'Agnes Scott College';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'RD', '2026-03-01' FROM colleges WHERE name = 'Agnes Scott College';

-- Wheaton College (Massachusetts)
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'ED1', '2025-11-15' FROM colleges WHERE name = 'Wheaton College (Massachusetts)';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'ED2', '2026-01-15' FROM colleges WHERE name = 'Wheaton College (Massachusetts)';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'RD', '2026-01-15' FROM colleges WHERE name = 'Wheaton College (Massachusetts)';

-- Wheaton College (Illinois)
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'ED1', '2025-11-01' FROM colleges WHERE name = 'Wheaton College (Illinois)';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'EA', '2025-11-01' FROM colleges WHERE name = 'Wheaton College (Illinois)';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'RD', '2026-02-01' FROM colleges WHERE name = 'Wheaton College (Illinois)';

-- Hope College
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'EA', '2025-11-01' FROM colleges WHERE name = 'Hope College';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'RD', '2026-03-01' FROM colleges WHERE name = 'Hope College';

-- Allegheny College
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'ED1', '2025-11-15' FROM colleges WHERE name = 'Allegheny College';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'ED2', '2026-01-15' FROM colleges WHERE name = 'Allegheny College';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'RD', '2026-02-15' FROM colleges WHERE name = 'Allegheny College';

-- Hendrix College
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'EA', '2025-11-01' FROM colleges WHERE name = 'Hendrix College';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'RD', '2026-03-01' FROM colleges WHERE name = 'Hendrix College';

-- Howard University
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'EA', '2025-11-01' FROM colleges WHERE name = 'Howard University';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'RD', '2026-02-15' FROM colleges WHERE name = 'Howard University';

-- Spelman College
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'ED1', '2025-11-01' FROM colleges WHERE name = 'Spelman College';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'EA', '2025-11-01' FROM colleges WHERE name = 'Spelman College';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'RD', '2026-02-06' FROM colleges WHERE name = 'Spelman College';

-- Morehouse College
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'ED1', '2025-11-01' FROM colleges WHERE name = 'Morehouse College';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'EA', '2025-12-15' FROM colleges WHERE name = 'Morehouse College';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'RD', '2026-02-01' FROM colleges WHERE name = 'Morehouse College';

-- Hampton University
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'EA', '2025-11-01' FROM colleges WHERE name = 'Hampton University';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'RD', '2026-03-01' FROM colleges WHERE name = 'Hampton University';

-- Clark Atlanta University
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'EA', '2025-10-01' FROM colleges WHERE name = 'Clark Atlanta University';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'RD', '2026-03-01' FROM colleges WHERE name = 'Clark Atlanta University';

-- Fisk University
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'EA', '2025-11-01' FROM colleges WHERE name = 'Fisk University';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'RD', '2026-02-01' FROM colleges WHERE name = 'Fisk University';

-- UC San Diego
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'RD', '2025-11-30' FROM colleges WHERE name = 'UC San Diego';

-- UC Santa Barbara
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'RD', '2025-11-30' FROM colleges WHERE name = 'UC Santa Barbara';

-- UC Davis
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'RD', '2025-11-30' FROM colleges WHERE name = 'UC Davis';

-- UC Irvine
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'RD', '2025-11-30' FROM colleges WHERE name = 'UC Irvine';

-- UC Santa Cruz
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'RD', '2025-11-30' FROM colleges WHERE name = 'UC Santa Cruz';

-- UC Riverside
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'RD', '2025-11-30' FROM colleges WHERE name = 'UC Riverside';

-- Cal Poly San Luis Obispo
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'RD', '2025-11-30' FROM colleges WHERE name = 'Cal Poly San Luis Obispo';

-- NC State University
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'EA', '2025-11-01' FROM colleges WHERE name = 'NC State University';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'RD', '2026-01-15' FROM colleges WHERE name = 'NC State University';

-- University of Central Florida
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'EA', '2025-10-15' FROM colleges WHERE name = 'University of Central Florida';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'RD', '2026-05-01' FROM colleges WHERE name = 'University of Central Florida';

-- University of South Florida
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'Scholarship', '2026-01-15' FROM colleges WHERE name = 'University of South Florida';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'RD', '2026-03-01' FROM colleges WHERE name = 'University of South Florida';

-- Iowa State University
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'EA', '2025-11-01' FROM colleges WHERE name = 'Iowa State University';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'RD', '2026-02-01' FROM colleges WHERE name = 'Iowa State University';

-- Kansas State University
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'EA', '2025-11-01' FROM colleges WHERE name = 'Kansas State University';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'RD', '2026-02-01' FROM colleges WHERE name = 'Kansas State University';

-- University of Nebraska-Lincoln
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'EA', '2025-11-01' FROM colleges WHERE name = 'University of Nebraska-Lincoln';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'RD', '2026-05-01' FROM colleges WHERE name = 'University of Nebraska-Lincoln';

-- University of Missouri
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'EA', '2025-11-15' FROM colleges WHERE name = 'University of Missouri';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'RD', '2026-05-01' FROM colleges WHERE name = 'University of Missouri';

-- University of Oklahoma
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'EA', '2025-11-01' FROM colleges WHERE name = 'University of Oklahoma';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'Scholarship', '2025-12-15' FROM colleges WHERE name = 'University of Oklahoma';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'RD', '2026-02-01' FROM colleges WHERE name = 'University of Oklahoma';

-- Oklahoma State University
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'EA', '2025-11-01' FROM colleges WHERE name = 'Oklahoma State University';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'RD', '2026-03-01' FROM colleges WHERE name = 'Oklahoma State University';

-- University of Arkansas
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'EA', '2025-11-01' FROM colleges WHERE name = 'University of Arkansas';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'RD', '2026-06-01' FROM colleges WHERE name = 'University of Arkansas';

-- Auburn University
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'EA', '2025-11-01' FROM colleges WHERE name = 'Auburn University';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'RD', '2026-02-01' FROM colleges WHERE name = 'Auburn University';

-- University of Kentucky
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'EA', '2025-11-01' FROM colleges WHERE name = 'University of Kentucky';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'RD', '2026-02-01' FROM colleges WHERE name = 'University of Kentucky';

-- University of Mississippi
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'EA', '2025-12-01' FROM colleges WHERE name = 'University of Mississippi';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'RD', '2026-03-01' FROM colleges WHERE name = 'University of Mississippi';

-- Mississippi State University
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'EA', '2025-12-01' FROM colleges WHERE name = 'Mississippi State University';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'RD', '2026-05-01' FROM colleges WHERE name = 'Mississippi State University';

-- University of Cincinnati
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'EA', '2025-12-01' FROM colleges WHERE name = 'University of Cincinnati';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'RD', '2026-08-01' FROM colleges WHERE name = 'University of Cincinnati';

-- Miami University Ohio
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'EA', '2025-11-01' FROM colleges WHERE name = 'Miami University Ohio';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'RD', '2026-02-01' FROM colleges WHERE name = 'Miami University Ohio';

-- Ohio University
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'EA', '2025-11-01' FROM colleges WHERE name = 'Ohio University';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'RD', '2026-02-01' FROM colleges WHERE name = 'Ohio University';

-- University of New Hampshire
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'ED1', '2025-11-15' FROM colleges WHERE name = 'University of New Hampshire';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'EA', '2025-11-15' FROM colleges WHERE name = 'University of New Hampshire';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'RD', '2026-02-01' FROM colleges WHERE name = 'University of New Hampshire';

-- University of Rhode Island
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'EA', '2025-11-01' FROM colleges WHERE name = 'University of Rhode Island';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'RD', '2026-02-01' FROM colleges WHERE name = 'University of Rhode Island';

-- Saint Louis University
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'ED1', '2025-11-03' FROM colleges WHERE name = 'Saint Louis University';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'EA', '2025-12-01' FROM colleges WHERE name = 'Saint Louis University';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'ED2', '2026-01-16' FROM colleges WHERE name = 'Saint Louis University';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'RD', '2026-04-01' FROM colleges WHERE name = 'Saint Louis University';

-- Loyola University Chicago
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'EA', '2025-11-01' FROM colleges WHERE name = 'Loyola University Chicago';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'RD', '2026-02-01' FROM colleges WHERE name = 'Loyola University Chicago';

-- DePaul University
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'EA', '2025-11-15' FROM colleges WHERE name = 'DePaul University';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'RD', '2026-02-01' FROM colleges WHERE name = 'DePaul University';

-- University of Dayton
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'EA', '2025-11-15' FROM colleges WHERE name = 'University of Dayton';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'RD', '2026-03-01' FROM colleges WHERE name = 'University of Dayton';

-- Xavier University
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'EA', '2025-12-01' FROM colleges WHERE name = 'Xavier University';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'RD', '2026-02-01' FROM colleges WHERE name = 'Xavier University';

-- Seton Hall University
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'EA', '2025-11-15' FROM colleges WHERE name = 'Seton Hall University';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'RD', '2026-03-01' FROM colleges WHERE name = 'Seton Hall University';

-- Hofstra University
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'EA', '2025-11-15' FROM colleges WHERE name = 'Hofstra University';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'RD', '2026-02-15' FROM colleges WHERE name = 'Hofstra University';

-- University of Puget Sound
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'ED1', '2025-11-01' FROM colleges WHERE name = 'University of Puget Sound';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'EA', '2025-11-01' FROM colleges WHERE name = 'University of Puget Sound';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'RD', '2026-01-15' FROM colleges WHERE name = 'University of Puget Sound';

-- Lewis and Clark College
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'ED1', '2025-11-01' FROM colleges WHERE name = 'Lewis and Clark College';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'RD', '2026-01-15' FROM colleges WHERE name = 'Lewis and Clark College';

-- Seattle University
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'EA', '2025-11-01' FROM colleges WHERE name = 'Seattle University';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'RD', '2026-02-01' FROM colleges WHERE name = 'Seattle University';

-- University of San Francisco
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'ED1', '2025-11-01' FROM colleges WHERE name = 'University of San Francisco';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'EA', '2025-11-01' FROM colleges WHERE name = 'University of San Francisco';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'ED2', '2026-01-15' FROM colleges WHERE name = 'University of San Francisco';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'RD', '2026-01-15' FROM colleges WHERE name = 'University of San Francisco';

-- University of San Diego
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'ED1', '2025-11-01' FROM colleges WHERE name = 'University of San Diego';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'EA', '2025-11-15' FROM colleges WHERE name = 'University of San Diego';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'RD', '2026-01-15' FROM colleges WHERE name = 'University of San Diego';

-- Willamette University
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'ED1', '2025-11-01' FROM colleges WHERE name = 'Willamette University';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'EA', '2025-11-01' FROM colleges WHERE name = 'Willamette University';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'RD', '2026-01-15' FROM colleges WHERE name = 'Willamette University';

-- University of Nevada Las Vegas
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'EA', '2025-11-01' FROM colleges WHERE name = 'University of Nevada Las Vegas';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'RD', '2026-02-01' FROM colleges WHERE name = 'University of Nevada Las Vegas';

-- University of Nevada Reno
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'EA', '2025-11-01' FROM colleges WHERE name = 'University of Nevada Reno';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'RD', '2026-02-01' FROM colleges WHERE name = 'University of Nevada Reno';

-- Boise State University
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'EA', '2025-12-01' FROM colleges WHERE name = 'Boise State University';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'RD', '2026-05-01' FROM colleges WHERE name = 'Boise State University';

-- University of Idaho
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'EA', '2025-12-01' FROM colleges WHERE name = 'University of Idaho';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'RD', '2026-08-01' FROM colleges WHERE name = 'University of Idaho';

-- University of Wyoming
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'RD', '2026-03-01' FROM colleges WHERE name = 'University of Wyoming';

-- University of New Mexico
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'EA', '2025-11-15' FROM colleges WHERE name = 'University of New Mexico';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'RD', '2026-06-15' FROM colleges WHERE name = 'University of New Mexico';

-- University of Hawaii at Manoa
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'EA', '2025-12-01' FROM colleges WHERE name = 'University of Hawaii at Manoa';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'RD', '2026-03-01' FROM colleges WHERE name = 'University of Hawaii at Manoa';

-- Colorado School of Mines
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'EA', '2025-11-01' FROM colleges WHERE name = 'Colorado School of Mines';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'RD', '2026-01-15' FROM colleges WHERE name = 'Colorado School of Mines';

-- Illinois Institute of Technology
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'ED1', '2025-11-01' FROM colleges WHERE name = 'Illinois Institute of Technology';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'EA', '2025-11-01' FROM colleges WHERE name = 'Illinois Institute of Technology';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'RD', '2026-02-01' FROM colleges WHERE name = 'Illinois Institute of Technology';

-- New Jersey Institute of Technology
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'EA', '2025-12-01' FROM colleges WHERE name = 'New Jersey Institute of Technology';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'RD', '2026-03-01' FROM colleges WHERE name = 'New Jersey Institute of Technology';

-- San Diego State University
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'RD', '2025-11-30' FROM colleges WHERE name = 'San Diego State University';

-- Cal State Long Beach
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'RD', '2025-11-30' FROM colleges WHERE name = 'Cal State Long Beach';

-- Florida International University
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'EA', '2025-11-01' FROM colleges WHERE name = 'Florida International University';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'RD', '2026-03-01' FROM colleges WHERE name = 'Florida International University';

-- North Carolina A&T State University
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'EA', '2025-10-15' FROM colleges WHERE name = 'North Carolina A&T State University';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'RD', '2026-02-01' FROM colleges WHERE name = 'North Carolina A&T State University';

-- Morgan State University
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'EA', '2025-11-01' FROM colleges WHERE name = 'Morgan State University';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'RD', '2026-04-01' FROM colleges WHERE name = 'Morgan State University';

-- Florida A&M University
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'EA', '2025-11-01' FROM colleges WHERE name = 'Florida A&M University';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'RD', '2026-05-15' FROM colleges WHERE name = 'Florida A&M University';

-- Xavier University of Louisiana
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'EA', '2025-11-01' FROM colleges WHERE name = 'Xavier University of Louisiana';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'RD', '2026-03-01' FROM colleges WHERE name = 'Xavier University of Louisiana';

-- Saint Mary's College of California
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'ED1', '2025-11-01' FROM colleges WHERE name = 'Saint Mary''s College of California';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'EA', '2025-11-01' FROM colleges WHERE name = 'Saint Mary''s College of California';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'RD', '2026-01-15' FROM colleges WHERE name = 'Saint Mary''s College of California';

-- University of Portland
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'EA', '2025-11-01' FROM colleges WHERE name = 'University of Portland';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'RD', '2026-02-01' FROM colleges WHERE name = 'University of Portland';

-- University of the Pacific
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'ED1', '2025-11-01' FROM colleges WHERE name = 'University of the Pacific';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'EA', '2025-11-01' FROM colleges WHERE name = 'University of the Pacific';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'RD', '2026-01-15' FROM colleges WHERE name = 'University of the Pacific';

-- Rollins College
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'ED1', '2025-11-15' FROM colleges WHERE name = 'Rollins College';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'EA', '2025-11-15' FROM colleges WHERE name = 'Rollins College';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'ED2', '2026-01-15' FROM colleges WHERE name = 'Rollins College';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'RD', '2026-02-15' FROM colleges WHERE name = 'Rollins College';

-- Belmont University
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'EA', '2025-11-01' FROM colleges WHERE name = 'Belmont University';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'RD', '2026-02-01' FROM colleges WHERE name = 'Belmont University';

-- Montana State University
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'EA', '2025-12-01' FROM colleges WHERE name = 'Montana State University';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'RD', '2026-03-01' FROM colleges WHERE name = 'Montana State University';

-- University of North Dakota
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'EA', '2025-12-01' FROM colleges WHERE name = 'University of North Dakota';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'RD', '2026-08-01' FROM colleges WHERE name = 'University of North Dakota';

-- North Dakota State University
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'EA', '2025-12-01' FROM colleges WHERE name = 'North Dakota State University';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'RD', '2026-08-01' FROM colleges WHERE name = 'North Dakota State University';

-- University of Maine
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'ED1', '2025-11-01' FROM colleges WHERE name = 'University of Maine';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'EA', '2025-11-01' FROM colleges WHERE name = 'University of Maine';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'RD', '2026-02-01' FROM colleges WHERE name = 'University of Maine';

-- Saint Anselm College
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'ED1', '2025-11-15' FROM colleges WHERE name = 'Saint Anselm College';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'EA', '2025-11-15' FROM colleges WHERE name = 'Saint Anselm College';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'RD', '2026-02-01' FROM colleges WHERE name = 'Saint Anselm College';

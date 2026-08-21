-- ============================================================
-- SafetyAI — Quiz Questions Seed Data
-- Run this AFTER schema.sql in your Supabase SQL Editor.
-- Only run once! Check quiz_questions table is empty first.
-- ============================================================

INSERT INTO quiz_questions (subject, question, options, correct_answer) VALUES
-- Mathematics
('Mathematics','What is 48 + 32?',ARRAY['70','80','90','100'],'80'),
('Mathematics','Solve: 7 x 8',ARRAY['48','54','56','64'],'56'),
('Mathematics','What is the value of 150 - 65?',ARRAY['75','85','95','105'],'85'),
('Mathematics','Calculate: 120 / 4',ARRAY['20','25','30','40'],'30'),
('Mathematics','What is 9 squared?',ARRAY['18','72','81','99'],'81'),
-- Science
('Science','Which planet is known as the Red Planet?',ARRAY['Venus','Mars','Jupiter','Saturn'],'Mars'),
('Science','What is the chemical formula for water?',ARRAY['CO2','H2O','NaCl','O2'],'H2O'),
('Science','What gas do humans need to breathe in to survive?',ARRAY['Nitrogen','Carbon Dioxide','Oxygen','Hydrogen'],'Oxygen'),
('Science','Which part of the plant conducts photosynthesis?',ARRAY['Roots','Stem','Leaves','Flowers'],'Leaves'),
('Science','What state of matter has a definite shape and volume?',ARRAY['Solid','Liquid','Gas','Plasma'],'Solid'),
-- English
('English','Identify the noun in this sentence: "The dog barked loudly."',ARRAY['dog','barked','loudly','The'],'dog'),
('English','What is the past tense of the verb "go"?',ARRAY['goes','going','went','gone'],'went'),
('English','Choose the correct spelling:',ARRAY['Recieve','Receive','Receve','Recive'],'Receive'),
('English','What is a word that means the opposite of "generous"?',ARRAY['Kind','Selfish','Happy','Polite'],'Selfish'),
('English','Which of the following is a pronoun?',ARRAY['Run','She','Beautiful','Quickly'],'She'),
-- Physics
('Physics','What force pulls objects toward Earth?',ARRAY['Gravity','Friction','Magnetism','Tension'],'Gravity'),
('Physics','What is the unit of electric current?',ARRAY['Volt','Ohm','Ampere','Watt'],'Ampere'),
('Physics','Newton''s third law says for every action there is:',ARRAY['An equal and opposite reaction','No reaction','A smaller reaction','A random reaction'],'An equal and opposite reaction'),
('Physics','What form of energy is stored in a battery?',ARRAY['Thermal','Chemical','Nuclear','Kinetic'],'Chemical'),
('Physics','Which state of matter has no definite shape or volume?',ARRAY['Solid','Liquid','Gas','Crystal'],'Gas'),
-- Chemistry
('Chemistry','What is the pH of pure water?',ARRAY['1','5','7','14'],'7'),
('Chemistry','What is the chemical formula for carbon dioxide?',ARRAY['CO','CO2','H2O','O2'],'CO2'),
('Chemistry','What is the lightest chemical element?',ARRAY['Helium','Hydrogen','Oxygen','Carbon'],'Hydrogen'),
('Chemistry','What is the process of a solid turning directly into gas?',ARRAY['Evaporation','Melting','Sublimation','Condensation'],'Sublimation'),
('Chemistry','Which gas is most abundant in Earth''s atmosphere?',ARRAY['Oxygen','Nitrogen','Carbon Dioxide','Argon'],'Nitrogen'),
-- Biology
('Biology','What is known as the powerhouse of the cell?',ARRAY['Nucleus','Ribosome','Mitochondria','Vacuole'],'Mitochondria'),
('Biology','Which pigment gives plants their green color?',ARRAY['Carotenoid','Chlorophyll','Hemoglobin','Melanin'],'Chlorophyll'),
('Biology','How many bones are in an adult human body?',ARRAY['106','206','306','406'],'206'),
('Biology','What is the primary function of white blood cells?',ARRAY['Carry oxygen','Fight infections','Clot blood','Produce energy'],'Fight infections'),
('Biology','Which organ is responsible for pumping blood?',ARRAY['Lungs','Brain','Kidney','Heart'],'Heart'),
-- History
('History','Who was the first President of the United States?',ARRAY['Thomas Jefferson','George Washington','Abraham Lincoln','John Adams'],'George Washington'),
('History','Which ancient civilization built the Pyramids of Giza?',ARRAY['Romans','Greeks','Egyptians','Mayans'],'Egyptians'),
('History','In which year did World War II end?',ARRAY['1918','1939','1945','1950'],'1945'),
('History','Who wrote the plays Romeo and Juliet and Hamlet?',ARRAY['Charles Dickens','William Shakespeare','Mark Twain','Leo Tolstoy'],'William Shakespeare'),
('History','Which famous ship sank on its maiden voyage in 1912?',ARRAY['Santa Maria','Mayflower','Titanic','Lusitania'],'Titanic'),
-- Geography
('Geography','What is the largest ocean on Earth?',ARRAY['Atlantic','Indian','Arctic','Pacific Ocean'],'Pacific Ocean'),
('Geography','What is the capital city of France?',ARRAY['London','Rome','Paris','Madrid'],'Paris'),
('Geography','Which is the longest river in the world?',ARRAY['Amazon','Nile','Mississippi','Yangtze'],'Nile'),
('Geography','Which continent is also a country?',ARRAY['Asia','Africa','Antarctica','Australia'],'Australia'),
('Geography','What is the highest mountain peak in the world?',ARRAY['K2','Mount Everest','Kilimanjaro','Mount Fuji'],'Mount Everest'),
-- Social Studies
('Social Studies','What type of government is ruled by citizens who vote?',ARRAY['Monarchy','Dictatorship','Democracy','Oligarchy'],'Democracy'),
('Social Studies','Which document is the supreme law of the land in the US?',ARRAY['Declaration of Independence','Constitution','Bill of Rights','Magna Carta'],'Constitution'),
('Social Studies','What is the term for a person who makes maps?',ARRAY['Geographer','Cartographer','Astronomer','Historian'],'Cartographer'),
('Social Studies','Which branch of government makes the laws?',ARRAY['Executive','Judicial','Legislative','Administrative'],'Legislative'),
('Social Studies','What do we call the study of money, trade, and industry?',ARRAY['Civics','History','Economics','Sociology'],'Economics'),
-- SST (duplicate of Social Studies for compatibility)
('SST','What type of government is ruled by citizens who vote?',ARRAY['Monarchy','Dictatorship','Democracy','Oligarchy'],'Democracy'),
('SST','Which document is the supreme law of the land in the US?',ARRAY['Declaration of Independence','Constitution','Bill of Rights','Magna Carta'],'Constitution'),
('SST','What is the term for a person who makes maps?',ARRAY['Geographer','Cartographer','Astronomer','Historian'],'Cartographer'),
('SST','Which branch of government makes the laws?',ARRAY['Executive','Judicial','Legislative','Administrative'],'Legislative'),
('SST','What do we call the study of money, trade, and industry?',ARRAY['Civics','History','Economics','Sociology'],'Economics'),
-- Computer Science
('Computer Science','What is the main brain of a computer?',ARRAY['RAM','CPU','Hard Drive','GPU'],'CPU'),
('Computer Science','What does WWW stand for?',ARRAY['World Wide Web','Wide World Web','World Whole Web','Web World Wide'],'World Wide Web'),
('Computer Science','Which of the following is an input device?',ARRAY['Monitor','Printer','Speaker','Keyboard'],'Keyboard'),
('Computer Science','What is the binary number system base?',ARRAY['2','8','10','16'],'2'),
('Computer Science','What is the standard file format for images?',ARRAY['TXT','MP3','JPEG','PDF'],'JPEG'),
-- Art
('Art','What are the three primary colors?',ARRAY['Red, Green, Blue','Red, Yellow, Blue','Orange, Green, Purple','Black, White, Grey'],'Red, Yellow, Blue'),
('Art','Who painted the famous Mona Lisa?',ARRAY['Vincent van Gogh','Leonardo da Vinci','Pablo Picasso','Michelangelo'],'Leonardo da Vinci'),
('Art','What is a painting of elements like fruit or flowers called?',ARRAY['Portrait','Landscape','Still Life','Abstract'],'Still Life'),
('Art','Which art medium is made from clay and fired in a kiln?',ARRAY['Sculpture','Ceramics','Origami','Mosaic'],'Ceramics'),
('Art','What do you call the thickness or quality of a line in art?',ARRAY['Shading','Texture','Line Weight','Pattern'],'Line Weight'),
-- PE
('PE','How many players are on the field for one soccer team?',ARRAY['9','11','15','22'],'11'),
('PE','Which term refers to a full 360-degree flip in gymnastics?',ARRAY['Handspring','Salto','Cartwheel','Somersault'],'Salto'),
('PE','In basketball, how many points is a regular field goal?',ARRAY['1','2','3','4'],'2'),
('PE','What is the standard distance of a marathon race?',ARRAY['10 miles','13.1 miles','26.2 miles','50 miles'],'26.2 miles'),
('PE','What is the primary muscle used during breathing?',ARRAY['Diaphragm','Bicep','Quadricep','Heart'],'Diaphragm');

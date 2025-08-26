-- Add new game categories and games to reach 100+ games

-- SPORTS GAMES (15 games)
INSERT INTO public.games (name, description, category, difficulty, instructions) VALUES
('Football Manager', 'Manage your football team to victory', 'Sports', 'medium', 'Make tactical decisions and manage your team to win matches!'),
('Basketball', 'Shoot hoops and score points', 'Sports', 'easy', 'Time your shots to score baskets and beat the clock!'),
('Tennis', 'Play tennis against AI opponent', 'Sports', 'medium', 'Use timing and positioning to win tennis matches!'),
('Golf', 'Putt your way to the hole', 'Sports', 'medium', 'Calculate angles and power to sink your putts!'),
('Soccer', 'Score goals in this soccer game', 'Sports', 'easy', 'Control your player and score goals against the opponent!'),
('Baseball', 'Hit home runs and play defense', 'Sports', 'medium', 'Time your swings and field the ball to win!'),
('Hockey', 'Score goals in fast-paced hockey', 'Sports', 'medium', 'Control your stick and score goals in this ice hockey game!'),
('Volleyball', 'Spike and serve to victory', 'Sports', 'medium', 'Use timing to spike and serve your way to victory!'),
('Table Tennis', 'Play ping pong with precision', 'Sports', 'medium', 'Use quick reflexes to win ping pong matches!'),
('Bowling', 'Roll strikes and spares', 'Sports', 'easy', 'Aim and roll to knock down all the pins!'),
('Darts', 'Hit the bullseye', 'Sports', 'medium', 'Aim carefully to hit the target and score points!'),
('Pool', 'Sink balls in this pool game', 'Sports', 'medium', 'Use angles and power to sink all your balls!'),
('Archery', 'Hit targets with your bow', 'Sports', 'medium', 'Aim and shoot arrows to hit the target!'),
('Fishing', 'Catch fish in various locations', 'Sports', 'easy', 'Cast your line and catch different types of fish!'),
('Racing', 'Race against opponents', 'Sports', 'medium', 'Control your vehicle and race to the finish line!');

-- ADVENTURE GAMES (15 games)
INSERT INTO public.games (name, description, category, difficulty, instructions) VALUES
('Treasure Hunt', 'Find hidden treasures in the map', 'Adventure', 'medium', 'Explore the map and find all hidden treasures!'),
('Maze Runner', 'Navigate through complex mazes', 'Adventure', 'medium', 'Find your way through challenging mazes!'),
('Cave Explorer', 'Explore caves and find artifacts', 'Adventure', 'medium', 'Navigate through dark caves and discover ancient artifacts!'),
('Island Survival', 'Survive on a deserted island', 'Adventure', 'hard', 'Gather resources and survive on the island!'),
('Dungeon Crawler', 'Explore dungeons and defeat monsters', 'Adventure', 'medium', 'Navigate dungeons and defeat monsters to find treasure!'),
('Space Explorer', 'Explore space and discover planets', 'Adventure', 'medium', 'Travel through space and explore new worlds!'),
('Time Travel', 'Travel through time to solve puzzles', 'Adventure', 'hard', 'Use time travel to solve historical puzzles!'),
('Underwater Adventure', 'Explore the ocean depths', 'Adventure', 'medium', 'Dive deep and explore underwater worlds!'),
('Mountain Climber', 'Climb mountains and reach the peak', 'Adventure', 'medium', 'Navigate treacherous mountain paths to reach the summit!'),
('Forest Explorer', 'Explore mysterious forests', 'Adventure', 'easy', 'Discover secrets hidden in the forest!'),
('Desert Trek', 'Cross the desert and find oases', 'Adventure', 'medium', 'Navigate the desert and find water sources!'),
('Arctic Expedition', 'Explore the frozen north', 'Adventure', 'hard', 'Survive the cold and explore arctic regions!'),
('Volcano Adventure', 'Explore active volcanoes', 'Adventure', 'hard', 'Navigate dangerous volcanic terrain!'),
('Jungle Quest', 'Explore dense jungles', 'Adventure', 'medium', 'Navigate through jungle obstacles and find ancient ruins!'),
('City Explorer', 'Explore urban environments', 'Adventure', 'easy', 'Navigate through city streets and discover urban secrets!');

-- EDUCATIONAL GAMES (15 games)
INSERT INTO public.games (name, description, category, difficulty, instructions) VALUES
('Geography Quiz', 'Test your knowledge of world geography', 'Educational', 'medium', 'Answer questions about countries, capitals, and landmarks!'),
('History Timeline', 'Arrange historical events in order', 'Educational', 'medium', 'Place historical events in chronological order!'),
('Science Lab', 'Conduct virtual science experiments', 'Educational', 'medium', 'Mix chemicals and observe reactions in the virtual lab!'),
('Language Learning', 'Learn new words and phrases', 'Educational', 'easy', 'Practice vocabulary and grammar in different languages!'),
('Math Challenge', 'Solve advanced mathematical problems', 'Educational', 'hard', 'Tackle complex mathematical equations and problems!'),
('Chemistry Puzzle', 'Build molecules and compounds', 'Educational', 'medium', 'Combine atoms to create different molecules!'),
('Physics Simulator', 'Experiment with physics concepts', 'Educational', 'medium', 'Explore gravity, motion, and energy in this physics simulator!'),
('Biology Explorer', 'Learn about living organisms', 'Educational', 'medium', 'Explore cells, organs, and biological systems!'),
('Astronomy Guide', 'Learn about stars and planets', 'Educational', 'medium', 'Explore the solar system and learn about celestial bodies!'),
('Art History', 'Learn about famous artists and artworks', 'Educational', 'easy', 'Study famous paintings and learn about art history!'),
('Music Theory', 'Learn about musical notes and rhythms', 'Educational', 'medium', 'Practice reading music and understanding musical theory!'),
('Literature Quiz', 'Test knowledge of classic literature', 'Educational', 'medium', 'Answer questions about famous books and authors!'),
('Economics Game', 'Learn about supply and demand', 'Educational', 'medium', 'Manage resources and understand economic principles!'),
('Psychology Test', 'Learn about human behavior', 'Educational', 'medium', 'Explore psychological concepts and human behavior!'),
('Computer Science', 'Learn programming concepts', 'Educational', 'hard', 'Practice coding and learn programming fundamentals!');

-- CREATIVE GAMES (15 games)
INSERT INTO public.games (name, description, category, difficulty, instructions) VALUES
('Pixel Art Creator', 'Create pixel art designs', 'Creative', 'easy', 'Use pixels to create beautiful artwork!'),
('Music Composer', 'Create your own music', 'Creative', 'medium', 'Arrange notes to compose original music!'),
('Story Writer', 'Write interactive stories', 'Creative', 'medium', 'Create branching stories with multiple endings!'),
('Photo Editor', 'Edit and enhance photos', 'Creative', 'medium', 'Use tools to edit and improve your photos!'),
('Animation Studio', 'Create simple animations', 'Creative', 'medium', 'Create frame-by-frame animations!'),
('Logo Designer', 'Design logos and graphics', 'Creative', 'medium', 'Create professional logos and graphic designs!'),
('Fashion Designer', 'Design clothing and accessories', 'Creative', 'easy', 'Mix and match clothing items to create outfits!'),
('Interior Designer', 'Design room layouts', 'Creative', 'medium', 'Arrange furniture and decorate rooms!'),
('Garden Designer', 'Design beautiful gardens', 'Creative', 'easy', 'Plant flowers and arrange garden elements!'),
('Architect', 'Design buildings and structures', 'Creative', 'hard', 'Create architectural designs and floor plans!'),
('Pottery Maker', 'Create ceramic art', 'Creative', 'medium', 'Shape clay into beautiful pottery!'),
('Jewelry Designer', 'Create jewelry pieces', 'Creative', 'medium', 'Design and create beautiful jewelry!'),
('Tattoo Artist', 'Design tattoos', 'Creative', 'medium', 'Create unique tattoo designs!'),
('Graffiti Artist', 'Create street art', 'Creative', 'medium', 'Design colorful graffiti artwork!'),
('Sculptor', 'Create 3D sculptures', 'Creative', 'hard', 'Shape virtual clay into 3D sculptures!');

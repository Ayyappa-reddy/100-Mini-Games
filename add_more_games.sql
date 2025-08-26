-- Insert Rock Paper Scissors game (id 24)
insert into games (id, name, description, category, difficulty, instructions, is_active)
values (
  24,
  'Rock Paper Scissors',
  'Classic Rock Paper Scissors against AI. Play 20 rounds and see how many you can win!',
  'Strategy',
  'easy',
  'Click Rock, Paper, or Scissors to make your choice. Win 3 points, draw 1 point, lose 0 points. Play 20 rounds to complete the game.',
  true
)
on conflict (id) do update set
  name = excluded.name,
  description = excluded.description,
  category = excluded.category,
  difficulty = excluded.difficulty,
  instructions = excluded.instructions,
  is_active = excluded.is_active;

-- Insert Tetris game (id 23)
insert into games (id, name, description, category, difficulty, instructions, is_active)
values (
  23,
  'Tetris',
  'Stack tetrominoes to clear lines; hold/ghost and 7-bag randomizer included',
  'Action',
  'medium',
  '← → move, ↓ soft drop, Space hard drop, Z/X rotate, C hold, P pause, R reset.',
  true
)
on conflict (id) do update set
  name = excluded.name,
  description = excluded.description,
  category = excluded.category,
  difficulty = excluded.difficulty,
  instructions = excluded.instructions,
  is_active = excluded.is_active;
-- Insert Nonogram/Picross game (id 22)
insert into games (id, name, description, category, difficulty, instructions, is_active)
values (
  22,
  'Nonogram',
  'Fill cells to satisfy row and column clues and reveal a picture',
  'Logic',
  'medium',
  'Left click/drag to fill; right click to mark X. Complete each row and column based on numeric clues.',
  true
)
on conflict (id) do update set
  name = excluded.name,
  description = excluded.description,
  category = excluded.category,
  difficulty = excluded.difficulty,
  instructions = excluded.instructions,
  is_active = excluded.is_active;
-- Insert Memory Path game (id 21)
insert into games (id, name, description, category, difficulty, instructions, is_active)
values (
  21,
  'Memory Path',
  'Watch a path, then reproduce it in order',
  'Memory',
  'medium',
  'Watch the highlighted path, then click cells in the same order. Use Replay to preview again. Levels get longer; you have limited lives.',
  true
)
on conflict (id) do update set
  name = excluded.name,
  description = excluded.description,
  category = excluded.category,
  difficulty = excluded.difficulty,
  instructions = excluded.instructions,
  is_active = excluded.is_active;
-- Insert Lights Out game (id 20)
insert into games (id, name, description, category, difficulty, instructions, is_active)
values (
  20,
  'Lights Out',
  'Toggle cells and neighbors to turn all lights off',
  'Logic',
  'easy',
  'Click a cell to toggle it and its neighbors. Turn all lights off to win. Use Undo to revert last move.',
  true
)
on conflict (id) do update set
  name = excluded.name,
  description = excluded.description,
  category = excluded.category,
  difficulty = excluded.difficulty,
  instructions = excluded.instructions,
  is_active = excluded.is_active;
-- Insert Hangman game (id 19)
insert into games (id, name, description, category, difficulty, instructions, is_active)
values (
  19,
  'Hangman',
  'Guess the hidden word before you run out of lives',
  'Word',
  'easy',
  'Click letters or type on keyboard to guess. You have limited lives. Use Hint to reveal a letter. New Word to play again.',
  true
)
on conflict (id) do update set
  name = excluded.name,
  description = excluded.description,
  category = excluded.category,
  difficulty = excluded.difficulty,
  instructions = excluded.instructions,
  is_active = excluded.is_active;
-- Insert Word Search game (id 18)
insert into games (id, name, description, category, difficulty, instructions, is_active)
values (
  18,
  'Word Search',
  'Find all target words hidden in the letter grid',
  'Word',
  'easy',
  'Click and drag to select letters in straight lines (8 directions). Use Hint to reveal a word path briefly. Find all words to win.',
  true
)
on conflict (id) do update set
  name = excluded.name,
  description = excluded.description,
  category = excluded.category,
  difficulty = excluded.difficulty,
  instructions = excluded.instructions,
  is_active = excluded.is_active;
-- Insert Sudoku game (id 17)
insert into games (id, name, description, category, difficulty, instructions, is_active)
values (
  17,
  'Sudoku',
  'Fill the grid so every row, column, and 3×3 box contains 1–9',
  'Puzzle',
  'medium',
  'Left click a cell then choose a number. Right click a number to add/remove a hidden note in the selected cell. Notes become visible when hovering a cell. Solve the grid to win.',
  true
)
on conflict (id) do update set
  name = excluded.name,
  description = excluded.description,
  category = excluded.category,
  difficulty = excluded.difficulty,
  instructions = excluded.instructions,
  is_active = excluded.is_active;
-- Insert 2048 game (id 16)
insert into games (id, name, description, category, difficulty, instructions, is_active)
values (
  16,
  '2048',
  'Merge tiles to reach 2048 and beyond; includes one-step undo',
  'Logic',
  'medium',
  'Use arrow keys to slide tiles. Equal tiles merge. Reaching 2048 is a win, but you can continue. Press U to undo one step.',
  true
)
on conflict (id) do update set
  name = excluded.name,
  description = excluded.description,
  category = excluded.category,
  difficulty = excluded.difficulty,
  instructions = excluded.instructions,
  is_active = excluded.is_active;
-- Insert Minesweeper game (id 15)
insert into games (id, name, description, category, difficulty, instructions, is_active)
values (
  15,
  'Minesweeper',
  'Reveal all safe cells without hitting a mine',
  'Puzzle',
  'medium',
  'Left-click to reveal cells. Right-click to flag mines. Clear all safe cells to win. First click is always safe.',
  true
)
on conflict (id) do update set
  name = excluded.name,
  description = excluded.description,
  category = excluded.category,
  difficulty = excluded.difficulty,
  instructions = excluded.instructions,
  is_active = excluded.is_active;
-- Add more games to reach closer to 100 games
INSERT INTO public.games (name, description, category, difficulty, instructions) VALUES

-- PUZZLE GAMES (Adding 15 more)
('Tetris', 'Classic falling blocks puzzle game', 'Puzzle', 'medium', 'Rotate and arrange falling blocks to create complete lines!'),
('2048', 'Slide tiles to reach the 2048 tile', 'Puzzle', 'medium', 'Use arrow keys to slide tiles. Combine same numbers to reach 2048!'),
('Minesweeper', 'Find all mines without detonating them', 'Puzzle', 'hard', 'Click squares to reveal numbers. Numbers show how many mines are adjacent!'),
('Sliding Puzzle', 'Arrange tiles in numerical order', 'Puzzle', 'medium', 'Slide tiles to arrange them in order from 1 to 15!'),
('Word Search', 'Find hidden words in a letter grid', 'Puzzle', 'easy', 'Search for words hidden horizontally, vertically, or diagonally!'),
('Anagram Solver', 'Rearrange letters to form words', 'Puzzle', 'medium', 'Use the given letters to form as many words as possible!'),
('Logic Grid', 'Solve logic puzzles using deductive reasoning', 'Puzzle', 'hard', 'Use clues to fill in the grid and solve the puzzle!'),
('Picture Puzzle', 'Arrange picture pieces to complete the image', 'Puzzle', 'easy', 'Drag and drop pieces to complete the beautiful picture!'),
('Math Puzzle', 'Solve mathematical equations', 'Puzzle', 'medium', 'Fill in the missing numbers to make the equation true!'),
('Pattern Puzzle', 'Complete the pattern sequence', 'Puzzle', 'medium', 'Identify the pattern and choose the next item!'),
('Color Puzzle', 'Arrange colors in the correct pattern', 'Puzzle', 'easy', 'Match the target color pattern by arranging the blocks!'),
('Shape Puzzle', 'Fit shapes into the correct spaces', 'Puzzle', 'medium', 'Drag shapes to fit them into the matching holes!'),
('Sequence Puzzle', 'Complete the number or letter sequence', 'Puzzle', 'hard', 'Find the rule and complete the sequence!'),
('Grid Puzzle', 'Fill the grid following specific rules', 'Puzzle', 'hard', 'Use logic to fill the grid according to the given rules!'),
('Block Puzzle', 'Arrange blocks to fit the target shape', 'Puzzle', 'medium', 'Rotate and place blocks to match the target outline!'),

-- ACTION GAMES (Adding 15 more)
('Platform Runner', 'Run and jump through challenging levels', 'Action', 'medium', 'Use arrow keys to run, jump, and avoid obstacles!'),
('Fruit Ninja', 'Slice fruits with your sword', 'Action', 'easy', 'Click to slice fruits. Avoid bombs!'),
('Bubble Shooter', 'Pop bubbles by matching colors', 'Action', 'easy', 'Aim and shoot bubbles to match 3 or more of the same color!'),
('Candy Crush', 'Match candies to clear the board', 'Action', 'easy', 'Swap candies to create matches of 3 or more!'),
('Temple Run', 'Run through ancient temples avoiding obstacles', 'Action', 'medium', 'Swipe to turn, jump, and slide to avoid obstacles!'),
('Subway Surfers', 'Run through subway tunnels', 'Action', 'medium', 'Dodge trains and collect coins while running!'),
('Angry Birds', 'Launch birds to destroy structures', 'Action', 'medium', 'Pull back and release to launch birds at targets!'),
('Cut the Rope', 'Cut ropes to feed candy to the monster', 'Action', 'medium', 'Cut ropes strategically to guide candy to the monster!'),
('Doodle Jump', 'Jump on platforms to reach higher', 'Action', 'easy', 'Tilt to move and jump on platforms to climb higher!'),
('Jetpack Joyride', 'Fly through obstacles with a jetpack', 'Action', 'medium', 'Tap to fly and avoid obstacles while collecting coins!'),
('Sonic Dash', 'Run with Sonic through colorful worlds', 'Action', 'medium', 'Run, jump, and roll to collect rings and avoid enemies!'),
('Mario Run', 'Run with Mario through classic levels', 'Action', 'medium', 'Jump over enemies and collect coins in this endless runner!'),
('Geometry Dash', 'Navigate through geometric obstacles', 'Action', 'hard', 'Time your jumps and movements to navigate through obstacles!'),
('Piano Tiles', 'Tap black tiles to play music', 'Action', 'medium', 'Tap only the black tiles to play beautiful music!'),
('Stack Jump', 'Stack blocks to build higher', 'Action', 'medium', 'Time your taps to stack blocks perfectly!'),

-- STRATEGY GAMES (Adding 15 more)
('Risk', 'Conquer territories in this strategic board game', 'Strategy', 'hard', 'Deploy armies and conquer territories to dominate the world!'),
('Civilization', 'Build and expand your civilization', 'Strategy', 'hard', 'Manage resources, build cities, and advance your civilization!'),
('Age of Empires', 'Build an empire from the stone age', 'Strategy', 'hard', 'Gather resources, build armies, and conquer opponents!'),
('Chess Variant', 'Play chess with special rules', 'Strategy', 'hard', 'Master chess with unique variant rules!'),
('Go', 'Ancient Chinese board game of territory', 'Strategy', 'hard', 'Place stones to capture territory and surround opponents!'),
('Reversi', 'Flip opponent pieces to win', 'Strategy', 'medium', 'Place pieces to flip opponent pieces and control the board!'),
('Battleship', 'Sink opponent ships by guessing locations', 'Strategy', 'medium', 'Place ships and guess opponent locations to sink their fleet!'),
('Mastermind', 'Guess the secret code', 'Strategy', 'medium', 'Use logic to guess the secret color code!'),
('Tic Tac Toe 4x4', 'Play tic tac toe on a larger board', 'Strategy', 'medium', 'Get 4 in a row to win on this larger board!'),
('Dots and Boxes', 'Connect dots to claim boxes', 'Strategy', 'medium', 'Draw lines to complete boxes and score points!'),
('Nim', 'Mathematical strategy game', 'Strategy', 'hard', 'Take objects from piles. Last player to take wins!'),
('Tower Defense', 'Build towers to defend against waves', 'Strategy', 'medium', 'Place towers strategically to stop enemy waves!'),
('Resource Management', 'Manage limited resources efficiently', 'Strategy', 'hard', 'Allocate resources wisely to achieve your goals!'),
('Diplomacy', 'Negotiate and form alliances', 'Strategy', 'hard', 'Form alliances and negotiate to achieve victory!'),
('War Game', 'Command armies in tactical battles', 'Strategy', 'hard', 'Position units and use terrain to win battles!'),

-- MEMORY GAMES (Adding 15 more)
('Memory Match', 'Find matching pairs of cards', 'Memory', 'easy', 'Flip cards to find matching pairs. Remember their positions!'),
('Concentration', 'Classic memory card game', 'Memory', 'medium', 'Find pairs of matching cards in this classic game!'),
('Memory Grid', 'Remember patterns in a grid', 'Memory', 'medium', 'Watch the pattern and repeat it on the grid!'),
('Sound Memory', 'Remember and repeat sound sequences', 'Memory', 'medium', 'Listen to sounds and repeat the sequence!'),
('Number Memory', 'Remember sequences of numbers', 'Memory', 'hard', 'Memorize and repeat number sequences!'),
('Word Memory', 'Remember lists of words', 'Memory', 'medium', 'Read a list of words and recall them later!'),
('Face Memory', 'Remember faces and match them', 'Memory', 'medium', 'Study faces and match them correctly!'),
('Object Memory', 'Remember objects and their positions', 'Memory', 'medium', 'Remember where objects are placed!'),
('Color Sequence', 'Remember and repeat color sequences', 'Memory', 'medium', 'Watch colors light up and repeat the sequence!'),
('Shape Memory', 'Remember shapes and their order', 'Memory', 'medium', 'Memorize shapes and their sequence!'),
('Pattern Recall', 'Remember complex patterns', 'Memory', 'hard', 'Study patterns and reproduce them accurately!'),
('Spatial Memory', 'Remember object locations in space', 'Memory', 'medium', 'Remember where objects are positioned in 3D space!'),
('Temporal Memory', 'Remember events in time order', 'Memory', 'hard', 'Recall events in the correct chronological order!'),
('Associative Memory', 'Remember word associations', 'Memory', 'medium', 'Learn word pairs and recall the associations!'),
('Visual Memory', 'Remember visual scenes', 'Memory', 'medium', 'Study a scene and recall details later!'),

-- LOGIC GAMES (Adding 15 more)
('Logic Grid', 'Solve logic puzzles using grids', 'Logic', 'hard', 'Use clues to fill in the logic grid!'),
('Deductive Reasoning', 'Use clues to solve mysteries', 'Logic', 'hard', 'Use deductive reasoning to solve the mystery!'),
('Inductive Logic', 'Find patterns and make predictions', 'Logic', 'medium', 'Identify patterns and predict what comes next!'),
('Boolean Logic', 'Work with true/false logic', 'Logic', 'hard', 'Solve problems using Boolean logic operations!'),
('Set Theory', 'Work with mathematical sets', 'Logic', 'hard', 'Solve problems using set theory concepts!'),
('Graph Theory', 'Solve problems using graph theory', 'Logic', 'hard', 'Use graph theory to solve complex problems!'),
('Combinatorics', 'Count and arrange possibilities', 'Logic', 'hard', 'Calculate the number of possible arrangements!'),
('Probability', 'Calculate probabilities', 'Logic', 'medium', 'Solve probability problems and make predictions!'),
('Statistics', 'Analyze data and find patterns', 'Logic', 'medium', 'Use statistical methods to analyze data!'),
('Algorithm Design', 'Design efficient algorithms', 'Logic', 'hard', 'Create algorithms to solve problems efficiently!'),
('Optimization', 'Find the best solution', 'Logic', 'hard', 'Optimize solutions to find the best outcome!'),
('Constraint Satisfaction', 'Solve problems with constraints', 'Logic', 'hard', 'Find solutions that satisfy all constraints!'),
('Decision Trees', 'Make decisions using tree structures', 'Logic', 'medium', 'Use decision trees to make optimal choices!'),
('Game Theory', 'Analyze strategic interactions', 'Logic', 'hard', 'Use game theory to analyze strategic situations!'),
('Mathematical Logic', 'Work with formal logic systems', 'Logic', 'hard', 'Solve problems using formal mathematical logic!'),

-- ARCADE GAMES (Adding 15 more)
('Pac-Man', 'Eat dots while avoiding ghosts', 'Arcade', 'medium', 'Navigate the maze eating dots while avoiding ghosts!'),
('Donkey Kong', 'Climb ladders and avoid barrels', 'Arcade', 'medium', 'Jump over barrels and climb to rescue the princess!'),
('Galaga', 'Shoot down alien invaders', 'Arcade', 'medium', 'Control your ship and shoot down waves of aliens!'),
('Centipede', 'Shoot the centipede as it descends', 'Arcade', 'medium', 'Shoot the centipede before it reaches the bottom!'),
('Asteroids', 'Destroy asteroids and avoid collisions', 'Arcade', 'medium', 'Shoot asteroids and avoid being hit!'),
('Frogger', 'Help the frog cross the road', 'Arcade', 'easy', 'Guide the frog safely across the busy road!'),
('Q*bert', 'Change colors by jumping on cubes', 'Arcade', 'medium', 'Jump on cubes to change their colors!'),
('Dig Dug', 'Dig tunnels and defeat enemies', 'Arcade', 'medium', 'Dig tunnels and defeat enemies underground!'),
('BurgerTime', 'Build burgers while avoiding enemies', 'Arcade', 'medium', 'Walk on ingredients to build burgers!'),
('Joust', 'Fly on an ostrich and defeat enemies', 'Arcade', 'medium', 'Fly around and defeat enemy knights!'),
('Defender', 'Defend your planet from invaders', 'Arcade', 'hard', 'Shoot down invaders and rescue humans!'),
('Robotron', 'Rescue humans from robots', 'Arcade', 'hard', 'Navigate through robots to rescue humans!'),
('Tempest', 'Defend against geometric enemies', 'Arcade', 'hard', 'Shoot geometric enemies in this tube shooter!'),
('Missile Command', 'Defend cities from missile attacks', 'Arcade', 'medium', 'Shoot down incoming missiles to protect cities!'),
('Berzerk', 'Navigate through maze avoiding robots', 'Arcade', 'medium', 'Navigate the maze while avoiding killer robots!');

-- Water Sort (id 29)
INSERT INTO games (id, name, description, category, difficulty, instructions, is_active)
VALUES (
  29,
  'Water Sort',
  'Sort colored water so each tube contains only one color!',
  'Puzzle',
  'medium',
  'Click a tube to select it, then click another tube to pour water. You can only pour if the colors match or the receiving tube is empty. Complete all tubes to win!',
  true
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  difficulty = EXCLUDED.difficulty,
  instructions = EXCLUDED.instructions,
  is_active = EXCLUDED.is_active;

-- Pixel Art Creator (id 30)
INSERT INTO games (id, name, description, category, difficulty, instructions, is_active)
VALUES (
  30,
  'Pixel Art Creator',
  'Create beautiful pixel art masterpieces!',
  'Creative',
  'easy',
  'Choose colors from the palette and click or drag on the grid to create pixel art. Save your creations and build a gallery of your artwork!',
  true
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  difficulty = EXCLUDED.difficulty,
  instructions = EXCLUDED.instructions,
  is_active = EXCLUDED.is_active;

-- Sliding Puzzle (id 31)
INSERT INTO games (id, name, description, category, difficulty, instructions, is_active)
VALUES (
  31,
  'Sliding Puzzle',
  'Rearrange tiles to form the complete image!',
  'Puzzle',
  'medium',
  'Click tiles adjacent to the empty space to slide them. Rearrange all pieces to recreate the beautiful image!',
  true
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  difficulty = EXCLUDED.difficulty,
  instructions = EXCLUDED.instructions,
  is_active = EXCLUDED.is_active;

-- Pattern Recognition (id 32)
INSERT INTO games (id, name, description, category, difficulty, instructions, is_active)
VALUES (
  32,
  'Pattern Recognition',
  'Find the odd one out in each pattern!',
  'Brain',
  'medium',
  'Look at the items and click on the one that doesn''t belong with the others. Test your observation skills!',
  true
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  difficulty = EXCLUDED.difficulty,
  instructions = EXCLUDED.instructions,
  is_active = EXCLUDED.is_active;

-- Flappy Bird (id 33)
INSERT INTO games (id, name, description, category, difficulty, instructions, is_active)
VALUES (
  33,
  'Flappy Bird',
  'Navigate through pipes and achieve the highest score!',
  'Action',
  'medium',
  'Click or press SPACE to make the bird flap! Navigate through the pipes without touching them. The difficulty increases as you progress!',
  true
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  difficulty = EXCLUDED.difficulty,
  instructions = EXCLUDED.instructions,
  is_active = EXCLUDED.is_active;

-- Space Invaders (id 34)
INSERT INTO games (id, name, description, category, difficulty, instructions, is_active)
VALUES (
  34,
  'Classic Space Invaders',
  'Classic arcade action - bullets only go straight up!',
  'Action',
  'medium',
  'Use arrow keys to move your ship left/right. Press SPACE to shoot straight up. Position your ship directly under aliens to hit them. Destroy all aliens before they reach the bottom!',
  true
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  difficulty = EXCLUDED.difficulty,
  instructions = EXCLUDED.instructions,
  is_active = EXCLUDED.is_active;

-- Number Merge (id 35)
INSERT INTO games (id, name, description, category, difficulty, instructions, is_active)
VALUES (
  35,
  'Number Merge',
  'Drop blocks and merge numbers to create high scores!',
  'Puzzle',
  'medium',
  'Click on a column to drop the next numbered block. When blocks with the same number touch, they merge into one! Get combos by creating multiple merges in one move. Use Undo to go back one move if needed.',
  true
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  difficulty = EXCLUDED.difficulty,
  instructions = EXCLUDED.instructions,
  is_active = EXCLUDED.is_active;

-- Cross Sums (id 36)
INSERT INTO games (id, name, description, category, difficulty, instructions, is_active)
VALUES (
  36,
  'Cross Sums',
  'Strategic puzzle - remove numbers to match target sums!',
  'Puzzle',
  'medium',
  'Look at the target sums for rows (left) and columns (top). Remove numbers you don''t need and confirm the ones that fit. Toggle between Erase and Confirm modes. Game auto-confirms when ready. Complete levels to unlock more and earn stars!',
  true
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  difficulty = EXCLUDED.difficulty,
  instructions = EXCLUDED.instructions,
  is_active = EXCLUDED.is_active;

-- Number Connect (id 37)
INSERT INTO games (id, name, description, category, difficulty, instructions, is_active)
VALUES (
  37,
  'Number Connect',
  'Connect and merge numbers in chains! Slide to connect identical numbers or numbers that double the current value.',
  'Puzzle',
  'medium',
  'Click and drag to connect identical numbers or numbers that double the current value. Connect at least 2 tiles to start a chain. Longer chains give bonus combo points. New tiles spawn after each move. Game ends when no more moves are possible.',
  true
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  difficulty = EXCLUDED.difficulty,
  instructions = EXCLUDED.instructions,
  is_active = EXCLUDED.is_active;

-- Mancala (id 38)
INSERT INTO games (id, name, description, category, difficulty, instructions, is_active)
VALUES (
  38,
  'Mancala',
  'Classic Kalah variant - strategic stone distribution game with capture mechanics and extra turns.',
  'Strategy',
  'medium',
  'Click on one of your pits to pick up all stones. Stones are distributed counterclockwise, one per pit. Skip your opponent''s store when distributing. Land in your store = extra turn. Land in empty pit on your side = capture opponent''s opposite stones. Game ends when one side is empty. Most stones in store wins!',
  true
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  difficulty = EXCLUDED.difficulty,
  instructions = EXCLUDED.instructions,
  is_active = EXCLUDED.is_active;

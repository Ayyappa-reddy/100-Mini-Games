-- Update category names to match Dashboard expectations
UPDATE public.games SET category = 'Puzzle' WHERE category = 'puzzle';
UPDATE public.games SET category = 'Strategy' WHERE category = 'strategy';
UPDATE public.games SET category = 'Memory' WHERE category = 'memory';
UPDATE public.games SET category = 'Arcade' WHERE category = 'arcade';
UPDATE public.games SET category = 'Logic' WHERE category = 'math';
UPDATE public.games SET category = 'Logic' WHERE category = 'skill';
UPDATE public.games SET category = 'Action' WHERE category = 'word';

-- Add more games to fill out the categories
INSERT INTO public.games (name, description, category, difficulty, instructions) VALUES
-- Strategy Games
('Chess', 'Classic chess game with AI opponent', 'Strategy', 'hard', 'Play chess against the computer. Use strategic thinking to capture the opponent''s king!'),
('Checkers', 'Traditional checkers game with jumping mechanics', 'Strategy', 'medium', 'Move your pieces diagonally and jump over opponent pieces to capture them!'),
('Connect Four', 'Connect four pieces in a row to win', 'Strategy', 'medium', 'Drop your pieces to create a line of four in any direction!'),

-- More Action Games
('Flappy Bird', 'Navigate the bird through pipes without hitting them', 'Action', 'medium', 'Click to make the bird flap and navigate through the pipes!'),
('Runner Game', 'Run and jump to avoid obstacles', 'Action', 'medium', 'Use arrow keys to run, jump, and slide to avoid obstacles!'),
('Shooter', 'Aim and shoot targets for points', 'Action', 'easy', 'Click to shoot at the targets. Be quick and accurate!'),

-- More Memory Games
('Pattern Memory', 'Remember and repeat the pattern sequence', 'Memory', 'medium', 'Watch the pattern and repeat it in the same order!'),
('Card Memory', 'Find matching pairs of cards', 'Memory', 'easy', 'Flip cards to find matching pairs. Remember their positions!'),
('Sequence Memory', 'Remember the sequence of numbers or colors', 'Memory', 'hard', 'Memorize the sequence and repeat it back correctly!'),

-- More Logic Games
('Logic Gates', 'Connect logic gates to complete circuits', 'Logic', 'hard', 'Connect AND, OR, NOT gates to make the circuit work!'),
('Pattern Recognition', 'Identify the pattern and predict the next item', 'Logic', 'medium', 'Look at the pattern and choose what comes next!'),
('Logic Puzzle', 'Solve logical puzzles with deductive reasoning', 'Logic', 'hard', 'Use clues and logic to solve the puzzle!'),

-- More Puzzle Games
('Sudoku', 'Fill the grid with numbers following Sudoku rules', 'Puzzle', 'hard', 'Fill each row, column, and 3x3 box with numbers 1-9 without repeating!'),
('Crossword', 'Solve crossword puzzles with word clues', 'Puzzle', 'medium', 'Fill in the crossword grid using the provided clues!'),
('Jigsaw Puzzle', 'Arrange puzzle pieces to complete the picture', 'Puzzle', 'easy', 'Drag and drop pieces to complete the beautiful image!'),

-- More Arcade Games
('Breakout', 'Break all the bricks with your paddle and ball', 'Arcade', 'medium', 'Control the paddle to keep the ball in play and break all the bricks!'),
('Pong', 'Classic two-player ping pong game', 'Arcade', 'easy', 'Use your paddle to hit the ball back and forth. Don''t let it pass you!'),
('Space Invaders', 'Shoot down invading aliens from space', 'Arcade', 'medium', 'Move left and right to avoid enemy fire while shooting down the invaders!');

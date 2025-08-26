-- Add the 5 new games that were implemented but not in the database
INSERT INTO games (name, description, category, difficulty, instructions, thumbnail) VALUES
('Word Scramble', 'Unscramble letters to form words with hints provided', 'Puzzle', 'medium', 'Look at the scrambled letters and try to form the correct word. Use the hint if you need help!'),
('Quick Math', 'Solve arithmetic problems quickly within a time limit', 'Logic', 'medium', 'Solve the math problem as quickly as you can. You have limited time for each question!'),
('Simon Says', 'Repeat the sequence of flashing colors in the correct order', 'Memory', 'medium', 'Watch the sequence of colors and repeat them in the same order. The sequence gets longer each level!'),
('Whack-a-Mole', 'Click on moles that pop up randomly to score points', 'Action', 'easy', 'Click on the moles as they appear. The faster you click, the more points you get!'),
('Typing Speed', 'Type words as quickly and accurately as possible', 'Logic', 'medium', 'Type the words that appear on screen as quickly and accurately as you can. Your WPM and accuracy will be tracked!');

-- Add more games to fill out the categories (you can add more later to reach 100)
INSERT INTO games (name, description, category, difficulty, instructions, thumbnail) VALUES
-- Strategy Games
('Chess', 'Classic chess game with AI opponent', 'Strategy', 'hard', 'Play chess against the computer. Use strategic thinking to capture the opponent''s king!'),
('Checkers', 'Traditional checkers game with jumping mechanics', 'Strategy', 'medium', 'Move your pieces diagonally and jump over opponent pieces to capture them!'),
('Connect Four', 'Connect four pieces in a row to win', 'Strategy', 'medium', 'Drop your pieces to create a line of four in any direction!'),

-- Arcade Games  
('Breakout', 'Break all the bricks with your paddle and ball', 'Arcade', 'medium', 'Control the paddle to keep the ball in play and break all the bricks!'),
('Pong', 'Classic two-player ping pong game', 'Arcade', 'easy', 'Use your paddle to hit the ball back and forth. Don''t let it pass you!'),
('Space Invaders', 'Shoot down invading aliens from space', 'Arcade', 'medium', 'Move left and right to avoid enemy fire while shooting down the invaders!'),

-- More Puzzle Games
('Sudoku', 'Fill the grid with numbers following Sudoku rules', 'Puzzle', 'hard', 'Fill each row, column, and 3x3 box with numbers 1-9 without repeating!'),
('Crossword', 'Solve crossword puzzles with word clues', 'Puzzle', 'medium', 'Fill in the crossword grid using the provided clues!'),
('Jigsaw Puzzle', 'Arrange puzzle pieces to complete the picture', 'Puzzle', 'easy', 'Drag and drop pieces to complete the beautiful image!'),

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
('Logic Puzzle', 'Solve logical puzzles with deductive reasoning', 'Logic', 'hard', 'Use clues and logic to solve the puzzle!');

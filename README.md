# 100 Mini Games 🎮

A modern web application featuring a collection of 100+ mini games with user authentication, progress tracking, and a beautiful UI. Built with React, TypeScript, Tailwind CSS, and Supabase.

## ✨ Features

- **100+ Mini Games**: Diverse collection of games including puzzles, action games, strategy games, and more
- **User Authentication**: Complete signup/login system with email verification and password reset
- **Progress Tracking**: Save and track your scores across all games
- **User Profiles**: Customizable profiles with gaming statistics
- **Responsive Design**: Beautiful, modern UI that works on all devices
- **Real-time Updates**: Live score updates and progress synchronization
- **Game Categories**: Organized games by difficulty and category
- **Achievement System**: Unlock achievements and track completion rates

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Supabase account

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/100-mini-games.git
   cd 100-mini-games
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase**
   - Create a new project at [supabase.com](https://supabase.com)
   - Go to Settings > API to get your project URL and anon key
   - Copy `env.example` to `.env.local` and fill in your Supabase credentials:
   ```bash
   cp env.example .env.local
   ```

4. **Set up the database**
   Run the following SQL in your Supabase SQL editor:

   ```sql
   -- Create users table
   CREATE TABLE users (
     id UUID REFERENCES auth.users(id) PRIMARY KEY,
     email TEXT NOT NULL,
     username TEXT UNIQUE NOT NULL,
     first_name TEXT,
     last_name TEXT,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Create games table
   CREATE TABLE games (
     id SERIAL PRIMARY KEY,
     name TEXT NOT NULL,
     description TEXT,
     category TEXT NOT NULL,
     difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')),
     instructions TEXT,
     thumbnail TEXT,
     is_active BOOLEAN DEFAULT true,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Create game_progress table
   CREATE TABLE game_progress (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     user_id UUID REFERENCES users(id) ON DELETE CASCADE,
     game_id INTEGER REFERENCES games(id) ON DELETE CASCADE,
     score INTEGER DEFAULT 0,
     completed BOOLEAN DEFAULT false,
     time_spent INTEGER DEFAULT 0,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     UNIQUE(user_id, game_id)
   );

   -- Insert sample games
   INSERT INTO games (name, description, category, difficulty, instructions) VALUES
   ('Tic Tac Toe', 'Classic X and O game against AI', 'Puzzle', 'easy', 'Click on any empty cell to place your X. Try to get three in a row!'),
   ('Memory Game', 'Match pairs of cards to test your memory', 'Memory', 'easy', 'Click on cards to reveal them. Find matching pairs to clear the board.'),
   ('Snake Game', 'Classic snake game with growing mechanics', 'Action', 'medium', 'Use arrow keys to control the snake. Eat food to grow and score points.'),
   ('Color Match', 'Match the target color from multiple options', 'Logic', 'easy', 'Look at the target color and click the matching color from the options.'),
   ('Number Puzzle', 'Slide tiles to arrange numbers in order', 'Puzzle', 'medium', 'Click tiles next to the empty space to move them. Arrange numbers 1-8 in order.');

   -- Enable Row Level Security
   ALTER TABLE users ENABLE ROW LEVEL SECURITY;
   ALTER TABLE games ENABLE ROW LEVEL SECURITY;
   ALTER TABLE game_progress ENABLE ROW LEVEL SECURITY;

   -- Create policies
   CREATE POLICY "Users can view their own profile" ON users FOR SELECT USING (auth.uid() = id);
   CREATE POLICY "Users can update their own profile" ON users FOR UPDATE USING (auth.uid() = id);
   CREATE POLICY "Users can insert their own profile" ON users FOR INSERT WITH CHECK (auth.uid() = id);

   CREATE POLICY "Anyone can view active games" ON games FOR SELECT USING (is_active = true);

   CREATE POLICY "Users can view their own progress" ON game_progress FOR SELECT USING (auth.uid() = user_id);
   CREATE POLICY "Users can insert their own progress" ON game_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
   CREATE POLICY "Users can update their own progress" ON game_progress FOR UPDATE USING (auth.uid() = user_id);
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:3000`

## 🎯 Available Games

### Currently Implemented
1. **Tic Tac Toe** - Classic X and O game with AI opponent
2. **Memory Game** - Match pairs of cards to test memory
3. **Snake Game** - Classic snake game with keyboard controls
4. **Color Match** - Match target colors from multiple options
5. **Number Puzzle** - Slide puzzle to arrange numbers in order

### Coming Soon
- Word Search
- Sudoku
- Tetris
- Breakout
- And 95+ more games!

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **Notifications**: React Hot Toast

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
├── contexts/           # React contexts for state management
├── games/              # Individual game components
├── lib/                # Utility functions and configurations
├── pages/              # Page components
└── main.tsx           # Application entry point
```

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file with the following variables:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Adding New Games

1. Create a new game component in `src/games/`
2. Implement the game interface with `onComplete` and `onUpdate` props
3. Add the game to the `renderGame` function in `GamePlay.tsx`
4. Insert the game data into the Supabase `games` table

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Netlify

1. Build the project: `npm run build`
2. Upload the `dist` folder to Netlify
3. Add environment variables in Netlify dashboard

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-game`
3. Commit your changes: `git commit -am 'Add new game'`
4. Push to the branch: `git push origin feature/new-game`
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Supabase](https://supabase.com) for the backend infrastructure
- [Tailwind CSS](https://tailwindcss.com) for the styling framework
- [Lucide](https://lucide.dev) for the beautiful icons
- [Vite](https://vitejs.dev) for the fast build tool

## 📞 Support

If you have any questions or need help, please open an issue on GitHub or contact us at support@example.com.

---

Made with ❤️ for the gaming community 
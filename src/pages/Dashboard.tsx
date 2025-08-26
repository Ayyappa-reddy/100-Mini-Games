import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useGame } from '../contexts/GameContext'
import { Trophy, Target, Clock, Star, Play, TrendingUp } from 'lucide-react'

const Dashboard = () => {
  const { user } = useAuth()
  const { games, userProgress, getTotalScore, getCompletedGames } = useGame()

  const stats = [
    {
      title: 'Total Score',
      value: getTotalScore().toLocaleString(),
      icon: <Trophy className="h-6 w-6" />,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100'
    },
    {
      title: 'Games Completed',
      value: getCompletedGames(),
      icon: <Target className="h-6 w-6" />,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Games Available',
      value: games.length,
      icon: <Play className="h-6 w-6" />,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Completion Rate',
      value: games.length > 0 ? `${Math.round((getCompletedGames() / games.length) * 100)}%` : '0%',
      icon: <TrendingUp className="h-6 w-6" />,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    }
  ]

  const recentGames = userProgress
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, 5)

  const getGameName = (gameId: number) => {
    const game = games.find(g => g.id === gameId)
    return game ? game.name : `Game ${gameId}`
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.user_metadata?.first_name || 'Player'}!
        </h1>
        <p className="text-gray-600 mt-2">
          Ready to continue your gaming journey? Here's your progress summary.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className={`p-2 rounded-lg ${stat.bgColor} ${stat.color}`}>
                {stat.icon}
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Link
              to="/games"
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center">
                <Play className="h-5 w-5 text-primary-600 mr-3" />
                <span className="font-medium">Browse All Games</span>
              </div>
              <span className="text-gray-400">→</span>
            </Link>
            
            <Link
              to="/profile"
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center">
                <Star className="h-5 w-5 text-primary-600 mr-3" />
                <span className="font-medium">View Profile</span>
              </div>
              <span className="text-gray-400">→</span>
            </Link>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
          {recentGames.length > 0 ? (
            <div className="space-y-3">
              {recentGames.map((progress) => (
                <div key={progress.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{getGameName(progress.game_id)}</p>
                    <p className="text-sm text-gray-600">Score: {progress.score}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">
                      {new Date(progress.updated_at).toLocaleDateString()}
                    </p>
                    {progress.completed && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Completed
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No recent activity</p>
              <Link to="/games" className="text-primary-600 hover:text-primary-700 font-medium">
                Start playing games →
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Game Categories */}
      <div className="mt-8 bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Game Categories</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {['Puzzle', 'Action', 'Strategy', 'Memory', 'Logic', 'Arcade', 'Sports', 'Adventure', 'Educational', 'Creative'].map((category) => (
            <Link
              key={category}
              to="/games"
              className="p-4 border border-gray-200 rounded-lg text-center hover:bg-gray-50 transition-colors"
            >
              <div className="text-lg font-medium text-gray-900">{category}</div>
              <div className="text-sm text-gray-600">
                {games.filter(g => g.category === category).length} games
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Dashboard 
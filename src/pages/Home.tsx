import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Gamepad2, Trophy, Users, Star, ArrowRight, Play, Zap, Target, Heart, Sparkles, ChevronDown, Clock, User } from 'lucide-react'
import { useEffect, useState } from 'react'

const Home = () => {
  const { user } = useAuth()
  const [isVisible, setIsVisible] = useState(false)
  const [currentGame, setCurrentGame] = useState(0)

  useEffect(() => {
    setIsVisible(true)
    
    // Auto-rotate featured games
    const interval = setInterval(() => {
      setCurrentGame(prev => (prev + 1) % featuredGames.length)
    }, 3000)
    
    return () => clearInterval(interval)
  }, [])

  const features = [
    {
      icon: <Gamepad2 className="h-8 w-8" />,
      title: '100+ Mini Games',
      description: 'A diverse collection of fun and challenging mini games to keep you entertained.',
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: <Trophy className="h-8 w-8" />,
      title: 'Progress Tracking',
      description: 'Track your scores and progress across all games with detailed statistics.',
      color: 'from-yellow-500 to-yellow-600'
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: 'User Profiles',
      description: 'Create your profile, set a username, and compete with friends.',
      color: 'from-green-500 to-green-600'
    },
    {
      icon: <Star className="h-8 w-8" />,
      title: 'Achievements',
      description: 'Unlock achievements and badges as you complete games and reach milestones.',
      color: 'from-purple-500 to-purple-600'
    }
  ]

  const gameCategories = [
    { name: 'Puzzle Games', count: 25, color: 'from-blue-500 to-blue-600', icon: '🧩' },
    { name: 'Action Games', count: 20, color: 'from-red-500 to-red-600', icon: '⚡' },
    { name: 'Strategy Games', count: 15, color: 'from-green-500 to-green-600', icon: '🎯' },
    { name: 'Memory Games', count: 15, color: 'from-purple-500 to-purple-600', icon: '🧠' },
    { name: 'Logic Games', count: 15, color: 'from-yellow-500 to-yellow-600', icon: '💡' },
    { name: 'Arcade Games', count: 10, color: 'from-pink-500 to-pink-600', icon: '🎮' }
  ]

  const featuredGames = [
    { name: 'Tetris', description: 'Classic block-stacking puzzle game', icon: '🧱', color: 'from-cyan-500 to-blue-600' },
    { name: '2048', description: 'Merge tiles to reach the ultimate number', icon: '🔢', color: 'from-orange-500 to-red-600' },
    { name: 'Mancala', description: 'Strategic stone distribution game', icon: '🏺', color: 'from-emerald-500 to-green-600' },
    { name: 'Space Invaders', description: 'Defend Earth from alien invasion', icon: '👾', color: 'from-purple-500 to-indigo-600' }
  ]

  const stats = [
    { number: '100+', label: 'Games Available', icon: <Gamepad2 className="h-6 w-6" /> },
    { number: '10K+', label: 'Active Players', icon: <Users className="h-6 w-6" /> },
    { number: '50K+', label: 'Games Played', icon: <Play className="h-6 w-6" /> },
    { number: '1M+', label: 'Points Earned', icon: <Trophy className="h-6 w-6" /> }
  ]

  return (
    <div className="min-h-screen overflow-hidden">
      {/* Hero Section */}
      <section className="relative py-32 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-white opacity-10 rounded-full animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-white opacity-5 rounded-full animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/4 w-32 h-32 bg-white opacity-10 rounded-full animate-bounce delay-500"></div>
        </div>
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="inline-flex items-center bg-white/20 backdrop-blur-sm rounded-full px-6 py-3 mb-8 border border-white/30">
              <Sparkles className="h-5 w-5 mr-2 text-yellow-300" />
              <span className="text-sm font-medium">The Ultimate Gaming Experience</span>
            </div>
            
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold mb-8 bg-gradient-to-r from-white via-yellow-100 to-white bg-clip-text text-transparent">
              100 Mini Games
            </h1>
            
            <p className="text-2xl md:text-3xl mb-12 text-primary-100 max-w-4xl mx-auto leading-relaxed">
              Discover a world of endless entertainment with our collection of 
              <span className="text-yellow-300 font-semibold"> 100+ engaging mini games</span> 
              designed to challenge your mind and bring out your inner gamer!
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
              {user ? (
                <Link to="/games" className="group bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 px-10 py-4 rounded-full font-bold text-lg hover:from-yellow-300 hover:to-orange-400 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl shadow-lg inline-flex items-center">
                  <Play className="mr-3 h-6 w-6 group-hover:animate-pulse" />
                  Start Playing Now
                  <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-1 transition-transform" />
                </Link>
              ) : (
                <>
                  <Link to="/signup" className="group bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 px-10 py-4 rounded-full font-bold text-lg hover:from-yellow-300 hover:to-orange-400 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl shadow-lg">
                    🚀 Get Started Free
                  </Link>
                  <Link to="/login" className="group border-2 border-white text-white px-10 py-4 rounded-full font-bold text-lg hover:bg-white hover:text-primary-600 transition-all duration-300 transform hover:scale-105">
                    <User className="mr-2 h-5 w-5 inline" />
                    Sign In
                  </Link>
                </>
              )}
            </div>
            
            {/* Scroll Indicator */}
            <div className="animate-bounce">
              <ChevronDown className="h-8 w-8 mx-auto text-white/60" />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-white relative">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className={`text-center transition-all duration-700 delay-${index * 100} ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 text-white rounded-full mb-4 shadow-lg">
                  {stat.icon}
                </div>
                <div className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">{stat.number}</div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Games Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
              Featured Games
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Experience our most popular and addictive games that players love
            </p>
          </div>
          
          <div className="relative">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredGames.map((game, index) => (
                <div 
                  key={index} 
                  className={`bg-white rounded-2xl shadow-xl p-6 transform transition-all duration-500 hover:scale-105 hover:shadow-2xl cursor-pointer ${
                    index === currentGame ? 'ring-4 ring-primary-400' : ''
                  }`}
                  onClick={() => setCurrentGame(index)}
                >
                  <div className={`w-16 h-16 bg-gradient-to-br ${game.color} rounded-2xl mb-4 flex items-center justify-center text-3xl shadow-lg`}>
                    {game.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{game.name}</h3>
                  <p className="text-gray-600 text-sm">{game.description}</p>
                  {user && (
                    <div className="mt-4">
                      <Link to="/games" className="inline-flex items-center text-primary-600 hover:text-primary-700 font-semibold text-sm">
                        Play Now <ArrowRight className="ml-1 h-4 w-4" />
                      </Link>
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            {/* Game Navigation Dots */}
            <div className="flex justify-center mt-8 space-x-2">
              {featuredGames.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentGame(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentGame ? 'bg-primary-600 w-8' : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Live Game Preview Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
              🎮 Game Previews
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              See what our games look like and get ready to play!
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Tetris Preview */}
            <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-2xl p-6 border border-cyan-200">
              <div className="text-center mb-4">
                <div className="text-4xl mb-2">🧱</div>
                <h3 className="text-xl font-bold text-gray-800">Tetris</h3>
              </div>
              <div className="bg-gray-800 rounded-lg p-4 mb-4 mx-auto w-fit">
                <div className="grid grid-cols-4 gap-1">
                  {Array.from({ length: 16 }).map((_, i) => (
                    <div key={i} className={`w-6 h-6 rounded ${
                      i % 5 === 0 ? 'bg-cyan-400' : 
                      i % 3 === 0 ? 'bg-blue-500' : 
                      'bg-gray-600'
                    }`}></div>
                  ))}
                </div>
              </div>
              <div className="text-center">
                <Link to="/games" className="inline-flex items-center bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:from-cyan-600 hover:to-blue-700 transition-all duration-300">
                  Try Full Game <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </div>
            </div>

            {/* 2048 Preview */}
            <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-6 border border-orange-200">
              <div className="text-center mb-4">
                <div className="text-4xl mb-2">🔢</div>
                <h3 className="text-xl font-bold text-gray-800">2048</h3>
              </div>
              <div className="bg-gray-800 rounded-lg p-4 mb-4">
                <div className="grid grid-cols-3 gap-1">
                  {[2, 4, 8, 4, 8, 16, 8, 16, 32].map((num, i) => (
                    <div key={i} className="w-8 h-8 bg-orange-400 rounded flex items-center justify-center text-white text-sm font-bold">
                      {num}
                    </div>
                  ))}
                </div>
              </div>
              <div className="text-center">
                <Link to="/games" className="inline-flex items-center bg-gradient-to-r from-orange-500 to-red-600 text-white px-6 py-2 rounded-lg font-semibold hover:from-orange-600 hover:to-red-700 transition-all duration-300">
                  Try Full Game <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </div>
            </div>

            {/* Space Invaders Preview */}
            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-6 border border-purple-200">
              <div className="text-center mb-4">
                <div className="text-4xl mb-2">👾</div>
                <h3 className="text-xl font-bold text-gray-800">Space Invaders</h3>
              </div>
              <div className="bg-gray-800 rounded-lg p-4 mb-4">
                <div className="space-y-2">
                  <div className="flex justify-center space-x-1">
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  </div>
                  <div className="flex justify-center">
                    <div className="w-4 h-4 bg-blue-400 rounded"></div>
                  </div>
                </div>
              </div>
              <div className="text-center">
                <Link to="/games" className="inline-flex items-center bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-6 py-2 rounded-lg font-semibold hover:from-purple-600 hover:to-indigo-700 transition-all duration-300">
                  Try Full Game <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
              Why Choose 100 Mini Games?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We've built the ultimate gaming platform with features that make every session unforgettable
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className={`text-center p-8 rounded-2xl transition-all duration-500 hover:scale-105 hover:shadow-xl ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{transitionDelay: `${index * 100}ms`}}>
                <div className={`inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br ${feature.color} text-white rounded-2xl mb-6 shadow-lg`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-4 text-gray-800">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Game Categories */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
              Game Categories
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Explore different types of games and find your perfect match
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {gameCategories.map((category, index) => (
              <div key={index} className={`bg-white rounded-2xl shadow-lg p-8 hover:shadow-2xl transition-all duration-500 hover:scale-105 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{transitionDelay: `${index * 100}ms`}}>
                <div className={`w-16 h-16 bg-gradient-to-br ${category.color} rounded-2xl mb-6 flex items-center justify-center text-4xl shadow-lg`}>
                  {category.icon}
                </div>
                <h3 className="text-2xl font-bold mb-3 text-gray-800">{category.name}</h3>
                <p className="text-gray-600 mb-6 text-lg">{category.count} games available</p>
                {user && (
                  <Link to="/games" className="inline-flex items-center text-primary-600 hover:text-primary-700 font-semibold text-lg group">
                    Play Now 
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary-600 to-primary-800 text-white relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary-600 to-primary-800 opacity-90"></div>
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-white opacity-10 rounded-full"></div>
          <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-white opacity-10 rounded-full"></div>
        </div>
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold mb-8">
              Ready to Start Your Gaming Journey?
            </h2>
            <p className="text-xl mb-10 text-primary-100 leading-relaxed">
              Join thousands of players worldwide and start collecting achievements today! 
              <br />Every game is a new adventure waiting to be discovered.
            </p>
            
            {!user ? (
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <Link to="/signup" className="group bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 px-12 py-5 rounded-full font-bold text-xl hover:from-yellow-300 hover:to-orange-400 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl shadow-lg inline-flex items-center">
                  <Zap className="mr-3 h-6 w-6 group-hover:animate-pulse" />
                  Create Free Account
                  <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link to="/login" className="group border-2 border-white text-white px-12 py-5 rounded-full font-bold text-xl hover:bg-white hover:text-primary-600 transition-all duration-300 transform hover:scale-105">
                  Already have an account? Sign In
                </Link>
              </div>
            ) : (
              <Link to="/games" className="group bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 px-12 py-5 rounded-full font-bold text-xl hover:from-yellow-300 hover:to-orange-400 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl shadow-lg inline-flex items-center">
                <Play className="mr-3 h-6 w-6 group-hover:animate-pulse" />
                Continue Playing
                <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-1 transition-transform" />
              </Link>
            )}
            
            <div className="mt-12 flex items-center justify-center space-x-8 text-primary-100">
              <div className="flex items-center">
                <Heart className="h-5 w-5 mr-2 text-red-400" />
                <span>100% Free</span>
              </div>
              <div className="flex items-center">
                <Target className="h-5 w-5 mr-2 text-green-400" />
                <span>No Downloads</span>
              </div>
              <div className="flex items-center">
                <Clock className="h-5 w-5 mr-2 text-yellow-400" />
                <span>Instant Play</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home 
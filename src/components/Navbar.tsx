import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Gamepad2, User, LogOut, Home, Trophy, Mail, CheckCircle, XCircle } from 'lucide-react'

const Navbar = () => {
  const { user, signOut, emailVerified } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    try {
      await signOut()
      navigate('/')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2 text-xl font-bold text-primary-600">
            <Gamepad2 className="h-8 w-8" />
            <span>100 Mini Games</span>
          </Link>

          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <Link to="/dashboard" className="flex items-center space-x-1 text-gray-700 hover:text-primary-600 transition-colors">
                  <Home className="h-5 w-5" />
                  <span>Dashboard</span>
                </Link>
                <Link to="/games" className="flex items-center space-x-1 text-gray-700 hover:text-primary-600 transition-colors">
                  <Trophy className="h-5 w-5" />
                  <span>Games</span>
                </Link>
                <Link to="/profile" className="flex items-center space-x-1 text-gray-700 hover:text-primary-600 transition-colors">
                  <User className="h-5 w-5" />
                  <span>Profile</span>
                </Link>
                
                {/* Email Verification Status */}
                <div className="flex items-center space-x-1">
                  {emailVerified ? (
                    <CheckCircle className="h-4 w-4 text-green-500" title="Email Verified" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" title="Email Not Verified" />
                  )}
                  <Mail className="h-4 w-4 text-gray-400" />
                </div>
                
                <button
                  onClick={handleSignOut}
                  className="flex items-center space-x-1 text-gray-700 hover:text-red-600 transition-colors"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Sign Out</span>
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-primary">
                  Sign In
                </Link>
                <Link to="/signup" className="btn-secondary">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar 
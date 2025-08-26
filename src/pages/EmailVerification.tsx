import React, { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react'

const EmailVerification: React.FC = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [verificationStatus, setVerificationStatus] = useState<'loading' | 'success' | 'already_verified' | 'error'>('loading')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    const handleEmailVerification = async () => {
      try {
        // Get the token and type from URL parameters
        const token = searchParams.get('token')
        const type = searchParams.get('type')

        if (!token || !type) {
          setErrorMessage('Invalid verification link')
          setVerificationStatus('error')
          return
        }

        if (type === 'signup') {
          // Handle email confirmation for new signups
          const { error } = await supabase.auth.verifyOtp({
            token_hash: token,
            type: 'signup'
          })

          if (error) {
            if (error.message.includes('already confirmed')) {
              setVerificationStatus('already_verified')
            } else {
              setErrorMessage(error.message)
              setVerificationStatus('error')
            }
          } else {
            setVerificationStatus('success')
          }
        } else if (type === 'recovery') {
          // Handle password reset
          setVerificationStatus('success')
        } else {
          setErrorMessage('Invalid verification type')
          setVerificationStatus('error')
        }
      } catch (error: any) {
        setErrorMessage(error.message || 'Verification failed')
        setVerificationStatus('error')
      }
    }

    handleEmailVerification()
  }, [searchParams])

  const handleContinue = () => {
    navigate('/login')
  }

  const handleResendVerification = async () => {
    try {
      const email = searchParams.get('email')
      if (email) {
        const { error } = await supabase.auth.resend({
          type: 'signup',
          email: email
        })
        if (error) throw error
        alert('Verification email resent! Please check your inbox.')
      }
    } catch (error: any) {
      alert('Failed to resend verification email: ' + error.message)
    }
  }

  if (verificationStatus === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8 p-8">
          <div className="text-center">
            <Clock className="mx-auto h-12 w-12 text-blue-500 animate-spin" />
            <h2 className="mt-6 text-3xl font-bold text-gray-900">
              Verifying Email...
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Please wait while we verify your email address.
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (verificationStatus === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8 p-8">
          <div className="text-center">
            <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
            <h2 className="mt-6 text-3xl font-bold text-gray-900">
              Email Verified Successfully! 🎉
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Your email has been verified. You can now sign in to your account.
            </p>
            <div className="mt-6">
              <button
                onClick={handleContinue}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Continue to Sign In
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (verificationStatus === 'already_verified') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8 p-8">
          <div className="text-center">
            <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
            <h2 className="mt-6 text-3xl font-bold text-gray-900">
              Already Verified! ✅
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Your email is already verified. You can sign in to your account.
            </p>
            <div className="mt-6">
              <button
                onClick={handleContinue}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Continue to Sign In
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (verificationStatus === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8 p-8">
          <div className="text-center">
            <XCircle className="mx-auto h-12 w-12 text-red-500" />
            <h2 className="mt-6 text-3xl font-bold text-gray-900">
              Verification Failed ❌
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              {errorMessage || 'There was an error verifying your email.'}
            </p>
            <div className="mt-6 space-y-3">
              <button
                onClick={handleResendVerification}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Resend Verification Email
              </button>
              <button
                onClick={handleContinue}
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Back to Sign In
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return null
}

export default EmailVerification

import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { GoogleLogin, googleLogout } from '@react-oauth/google'
import { getAuth, signInWithCustomToken, signOut } from 'firebase/auth'
import { User } from './App'
import { bundleConfig } from './bundleConfig'
import { ChevronRightIcon, CheckIcon } from 'lucide-react'

const BACKEND_URL = 'http://localhost:3000'

interface BundlePageProps {
  user: User | null
}

interface CredentialResponse {
  credential?: string
}

interface AuthResponse {
  success: boolean
  user: User
  firebaseToken: string
  error?: string
}

function BundlePage({ user }: BundlePageProps) {
  const { bundleName } = useParams<{ bundleName: string }>()
  const navigate = useNavigate()
  const auth = getAuth()

  if (!bundleName || !bundleConfig[bundleName as keyof typeof bundleConfig]) {
    navigate('/')
    return null
  }

  const bundle = bundleConfig[bundleName as keyof typeof bundleConfig]

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    try {
      if (!credentialResponse.credential) {
        throw new Error('No credential received')
      }

      // Send the credential to your backend
      const response = await fetch(`${BACKEND_URL}/api/auth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          credential: credentialResponse.credential,
        }),
      })

      if (!response.ok) {
        throw new Error('Authentication failed')
      }

      const authData: AuthResponse = await response.json()

      if (!authData.success) {
        throw new Error(authData.error || 'Authentication failed')
      }

      // Sign in to Firebase with the custom token
      await signInWithCustomToken(auth, authData.firebaseToken)

    } catch (error) {
      console.error('Login error:', error)
      alert('Failed to sign in. Please try again.')
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut(auth)
      googleLogout()
    } catch (error) {
      console.error('Sign-out error:', error)
    }
  }

  const initiateCheckout = async (plan: string) => {
    if (!user) {
      alert('Please sign in to purchase a bundle')
      return
    }

    try {
      const response = await fetch(`${BACKEND_URL}/api/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: user.email,
          plan: plan,
          bundleId: bundleName,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create checkout session')
      }

      const data = await response.json()

      if (data.sessionUrl) {
        window.location.href = data.sessionUrl
      } else {
        throw new Error('No session URL returned')
      }
    } catch (error) {
      console.error('Error initiating checkout:', error)
      alert('An error occurred while initiating checkout. Please try again.')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden max-w-4xl w-full">
        <div className="md:flex">
          <div className="md:w-1/2 p-8">
            <h2 className="text-3xl font-bold text-indigo-600 mb-4">{bundle.name}</h2>
            <p className="text-gray-600 mb-6">{bundle.description}</p>
            <div className="space-y-4 mb-6">
              {bundle.extensions.map((ext) => (
                <div key={ext} className="flex items-center">
                  <CheckIcon className="w-5 h-5 text-green-500 mr-2" />
                  <span>{ext}</span>
                </div>
              ))}
            </div>
            {user ? (
              <div className="mb-6">
                <p className="text-sm text-gray-600 mb-2">Signed in as: {user.email}</p>
                <button
                  onClick={handleSignOut}
                  className="text-sm text-indigo-600 hover:text-indigo-800 transition-colors"
                >
                  Sign out
                </button>
              </div>
            ) : (
              <div className="mb-6">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => {
                    console.error('Login Failed')
                    alert('Failed to sign in. Please try again.')
                  }}
                  useOneTap
                />
              </div>
            )}
          </div>
          <div className="md:w-1/2 bg-indigo-600 p-8 text-white">
            <h3 className="text-2xl font-bold mb-6">Choose Your Plan</h3>
            <div className="space-y-4">
              {Object.entries(bundle.prices).map(([plan, { price, id }]) => (
                <button
                  key={plan}
                  onClick={() => initiateCheckout(plan)}
                  disabled={!user}
                  className={`w-full py-3 px-4 rounded-lg flex items-center justify-between transition-colors ${
                    user
                      ? 'bg-white text-indigo-600 hover:bg-indigo-100'
                      : 'bg-indigo-400 text-indigo-100 cursor-not-allowed'
                  }`}
                >
                  <span className="font-semibold">
                    {plan.charAt(0).toUpperCase() + plan.slice(1)} - {price}
                  </span>
                  <ChevronRightIcon className="w-5 h-5" />
                </button>
              ))}
            </div>
            {!user && (
              <p className="text-sm text-indigo-200 mt-4">
                Please sign in to purchase a bundle
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default BundlePage
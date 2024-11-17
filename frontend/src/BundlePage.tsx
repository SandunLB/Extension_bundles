'use client'

import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { GoogleLogin, googleLogout } from '@react-oauth/google'
import { getAuth, signInWithCustomToken, signOut } from 'firebase/auth'
import { User } from './App'
import { bundleConfig } from './bundleConfig'
import { ChevronRightIcon, CheckIcon, PackageIcon, LogOutIcon } from 'lucide-react'
import { motion } from 'framer-motion'

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

export default function Component({ user: initialUser }: BundlePageProps) {
  const { bundleName } = useParams<{ bundleName: string }>()
  const navigate = useNavigate()
  const auth = getAuth()
  const [user, setUser] = useState(initialUser)

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

      await signInWithCustomToken(auth, authData.firebaseToken)
      setUser(authData.user)
    } catch (error) {
      console.error('Login error:', error)
      alert('Failed to sign in. Please try again.')
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut(auth)
      googleLogout()
      setUser(null)
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
    <div className="min-h-screen bg-gradient-to-br from-purple-400 to-indigo-600 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-3xl shadow-2xl overflow-hidden max-w-5xl w-full"
      >
        <div className="md:flex">
          <div className="md:w-1/2 p-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <h2 className="text-4xl font-bold text-indigo-600 mb-4 flex items-center">
                <PackageIcon className="w-8 h-8 mr-2" />
                {bundle.name}
              </h2>
              <p className="text-gray-600 mb-6 text-lg">{bundle.description}</p>
              <div className="space-y-4 mb-6">
                {bundle.extensions.map((ext, index) => (
                  <motion.div
                    key={ext}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.1, duration: 0.5 }}
                    className="flex items-center bg-indigo-50 p-3 rounded-lg"
                  >
                    <CheckIcon className="w-5 h-5 text-green-500 mr-2" />
                    <span className="text-indigo-800">{ext}</span>
                  </motion.div>
                ))}
              </div>
              {user ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                  className="mb-6 bg-indigo-100 p-4 rounded-lg"
                >
                  <p className="text-sm text-indigo-800 mb-2">Signed in as: {user.email}</p>
                  <button
                    onClick={handleSignOut}
                    className="text-sm text-indigo-600 hover:text-indigo-800 transition-colors flex items-center"
                  >
                    <LogOutIcon className="w-4 h-4 mr-1" />
                    Sign out
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                  className="mb-6"
                >
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={() => {
                      console.error('Login Failed')
                      alert('Failed to sign in. Please try again.')
                    }}
                    useOneTap
                  />
                </motion.div>
              )}
            </motion.div>
          </div>
          <div className="md:w-1/2 bg-gradient-to-br from-indigo-600 to-purple-700 p-8 text-white">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <h3 className="text-3xl font-bold mb-6">Choose Your Plan</h3>
              <div className="space-y-4">
                {Object.entries(bundle.prices).map(([plan, { price, id }], index) => (
                  <motion.button
                    key={plan}
                    onClick={() => initiateCheckout(plan)}
                    disabled={!user}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + index * 0.1, duration: 0.5 }}
                    className={`w-full py-4 px-6 rounded-xl flex items-center justify-between transition-all transform hover:scale-105 ${
                      user
                        ? 'bg-white text-indigo-600 hover:bg-indigo-100 hover:shadow-lg'
                        : 'bg-indigo-400 text-indigo-100 cursor-not-allowed'
                    }`}
                  >
                    <span className="font-semibold text-lg">
                      {plan.charAt(0).toUpperCase() + plan.slice(1)} - {price}
                    </span>
                    <ChevronRightIcon className="w-6 h-6" />
                  </motion.button>
                ))}
              </div>
              {!user && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6, duration: 0.5 }}
                  className="text-sm text-indigo-200 mt-4"
                >
                  Please sign in to purchase a bundle
                </motion.p>
              )}
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
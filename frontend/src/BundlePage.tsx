'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { GoogleLogin, googleLogout } from '@react-oauth/google'
import { getAuth, signInWithCustomToken, signOut } from 'firebase/auth'
import { User } from './App'
import { bundleConfig } from './bundleConfig'
import { CheckIcon, PackageIcon, LogOutIcon, CreditCardIcon } from 'lucide-react'
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
  const { bundleName, plan: urlPlan } = useParams<{ bundleName: string; plan: string }>()
  const navigate = useNavigate()
  const auth = getAuth()
  const [user, setUser] = useState(initialUser)
  const [selectedPlan, setSelectedPlan] = useState<string | null>(urlPlan || null)

  useEffect(() => {
    if (urlPlan && ['monthly', 'yearly', 'lifetime'].includes(urlPlan)) {
      setSelectedPlan(urlPlan)
    }
  }, [urlPlan])

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

  const renderPlanDetails = (plan: string) => {
    const planDetails = bundle.prices[plan as keyof typeof bundle.prices]
    if (!planDetails) return null

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-lg shadow-lg p-8 mb-6"
      >
        <h3 className="text-3xl font-bold text-indigo-600 mb-4">
          {plan.charAt(0).toUpperCase() + plan.slice(1)} Plan
        </h3>
        <p className="text-gray-600 mb-6 text-xl">Price: {planDetails.price}</p>
        <div className="space-y-4 mb-6">
          {bundle.extensions.map((ext, index) => (
            <motion.div
              key={ext}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * index, duration: 0.5 }}
              className="flex items-center"
            >
              <CheckIcon className="w-6 h-6 text-green-500 mr-2" />
              <span className="text-gray-700">{ext}</span>
            </motion.div>
          ))}
        </div>
        {user ? (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => initiateCheckout(plan)}
            className="w-full py-3 px-6 rounded-full bg-indigo-600 text-white font-semibold text-lg hover:bg-indigo-700 transition-colors flex items-center justify-center"
          >
            <CreditCardIcon className="w-6 h-6 mr-2" />
            Purchase Now
          </motion.button>
        ) : (
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => {
              console.error('Login Failed')
              alert('Failed to sign in. Please try again.')
            }}
            useOneTap
          />
        )}
      </motion.div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 to-indigo-600 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-3xl shadow-2xl overflow-hidden max-w-4xl w-full"
      >
        <div className="p-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <h2 className="text-4xl font-bold text-indigo-600 mb-4 flex items-center">
              <PackageIcon className="w-10 h-10 mr-3" />
              {bundle.name}
            </h2>
            <p className="text-gray-600 mb-6 text-xl">{bundle.description}</p>
          </motion.div>
          {user && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="mb-6 bg-indigo-100 p-4 rounded-lg flex items-center justify-between"
            >
              <p className="text-sm text-indigo-800">Signed in as: {user.email}</p>
              <button
                onClick={handleSignOut}
                className="text-sm text-indigo-600 hover:text-indigo-800 transition-colors flex items-center"
              >
                <LogOutIcon className="w-4 h-4 mr-1" />
                Sign out
              </button>
            </motion.div>
          )}
          {selectedPlan ? (
            renderPlanDetails(selectedPlan)
          ) : (
            <div className="grid gap-6 md:grid-cols-3">
              {Object.entries(bundle.prices).map(([plan, { price }], index) => (
                <motion.div
                  key={plan}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index, duration: 0.5 }}
                >
                  <Link
                    to={`/${bundleName}/${plan}`}
                    className="block bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
                  >
                    <h3 className="text-2xl font-semibold text-indigo-600 mb-2">
                      {plan.charAt(0).toUpperCase() + plan.slice(1)}
                    </h3>
                    <p className="text-gray-600 text-lg">{price}</p>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}
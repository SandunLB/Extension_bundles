import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { GoogleLogin, googleLogout } from '@react-oauth/google'
import { getAuth, signInWithCustomToken, signOut } from 'firebase/auth'
import { User } from './App'
import { bundleConfig, licenseProductConfig, Product, Price } from './config'
import { CheckIcon, PackageIcon, LogOutIcon, CreditCardIcon, SparklesIcon, Loader2Icon } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3000';

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

const LoadingSpinner = () => (
  <motion.div
    animate={{ rotate: 360 }}
    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
  >
    <Loader2Icon className="w-5 h-5" />
  </motion.div>
)

export default function BundlePage({ user: initialUser }: BundlePageProps) {
  const { productName, plan: urlPlan } = useParams<{ productName: string; plan: string }>()
  const navigate = useNavigate()
  const auth = getAuth()
  const [user, setUser] = useState(initialUser)
  const [selectedPlan, setSelectedPlan] = useState<string | null>(urlPlan || null)
  const [isSigningIn, setIsSigningIn] = useState(false)
  const [isPurchasing, setIsPurchasing] = useState(false)

  useEffect(() => {
    if (urlPlan && ['monthly', 'yearly', 'lifetime'].includes(urlPlan)) {
      setSelectedPlan(urlPlan)
    }
  }, [urlPlan])

  if (!productName || !(bundleConfig[productName] || licenseProductConfig[productName])) {
    navigate('/')
    return null
  }

  const product: Product = bundleConfig[productName] || licenseProductConfig[productName]

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    setIsSigningIn(true)
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
    } finally {
      setIsSigningIn(false)
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
      alert('Please sign in to purchase a product')
      return
    }

    setIsPurchasing(true)
    try {
      const response = await fetch(`${BACKEND_URL}/api/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: user.email,
          plan: plan,
          productId: productName,
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
    } finally {
      setIsPurchasing(false)
    }
  }

  const renderPlanDetails = (plan: 'monthly' | 'yearly' | 'lifetime') => {
    const planDetails = product.prices[plan]
    if (!planDetails) return null

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-3xl shadow-2xl p-8 mb-6 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-purple-400 to-indigo-600 transform rotate-45 translate-x-20 -translate-y-20 opacity-20"></div>
        <h3 className="text-4xl font-bold text-indigo-600 mb-4 relative z-10">
          {plan.charAt(0).toUpperCase() + plan.slice(1)} Plan
        </h3>
        <p className="text-gray-600 mb-6 text-2xl font-semibold relative z-10">{planDetails.price}</p>
        {product.type === 'bundle' && (
          <div className="space-y-4 mb-8 relative z-10">
            {product.extensions?.map((ext, index) => (
              <motion.div
                key={ext}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index, duration: 0.5 }}
                className="flex items-center bg-indigo-50 p-3 rounded-lg"
              >
                <CheckIcon className="w-6 h-6 text-green-500 mr-3" />
                <span className="text-indigo-800 text-lg">{ext}</span>
              </motion.div>
            ))}
          </div>
        )}
        {user ? (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => initiateCheckout(plan)}
            disabled={isPurchasing}
            className="w-full py-4 px-6 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold text-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 flex items-center justify-center relative z-10 disabled:opacity-50"
          >
            {isPurchasing ? (
              <LoadingSpinner />
            ) : (
              <>
                <CreditCardIcon className="w-6 h-6 mr-2" />
                Purchase Now
              </>
            )}
          </motion.button>
        ) : (
          <div className="relative z-10">
            {!isSigningIn ? (
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => {
                  console.error('Login Failed')
                  alert('Failed to sign in. Please try again.')
                }}
                useOneTap
                type="standard"
                theme="filled_blue"
                size="large"
                text="signin_with"
                shape="rectangular"
              />
            ) : (
              <div className="h-10 flex items-center justify-center bg-blue-500 text-white rounded-md">
                <LoadingSpinner />
                <span className="ml-2">Signing in...</span>
              </div>
            )}
          </div>
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
        className="bg-white rounded-3xl shadow-2xl overflow-hidden max-w-6xl w-full"
      >
        <div className="md:flex">
          <div className="md:w-1/2 relative">
            <img
              src={product.image}
              alt={product.name}
              className="object-cover w-full h-full"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-70"></div>
            <div className="absolute bottom-0 left-0 p-8 text-white">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="text-4xl font-bold mb-2 flex items-center"
              >
                <PackageIcon className="w-10 h-10 mr-3" />
                {product.name}
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="text-lg"
              >
                {product.description}
              </motion.p>
            </div>
          </div>
          <div className="md:w-1/2 p-8">
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
            <AnimatePresence mode="wait">
              {selectedPlan ? (
                renderPlanDetails(selectedPlan as 'monthly' | 'yearly' | 'lifetime')
              ) : (
                <motion.div
                  key="plan-selection"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                  className="grid gap-6 md:grid-cols-3"
                >
                  {(Object.entries(product.prices) as [string, Price][]).map(([plan, priceInfo], index) => (
                    <motion.div
                      key={plan}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * index, duration: 0.5 }}
                    >
                      <Link
                        to={`/${productName}/${plan}`}
                        className="block bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                      >
                        <h3 className="text-2xl font-semibold text-indigo-600 mb-2 flex items-center">
                          <SparklesIcon className="w-5 h-5 mr-2" />
                          {plan.charAt(0).toUpperCase() + plan.slice(1)}
                        </h3>
                        <p className="text-gray-600 text-lg font-medium">{priceInfo.price}</p>
                      </Link>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  )
}


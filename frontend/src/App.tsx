import React, { useState, useEffect } from 'react'
import { GoogleOAuthProvider, GoogleLogin, CredentialResponse } from '@react-oauth/google'
import { initializeApp } from 'firebase/app'
import { getAuth, signInWithCustomToken, signOut } from 'firebase/auth'
import { BrowserRouter as Router, Routes, Route, useNavigate, useSearchParams } from 'react-router-dom'
import { ChevronRightIcon, CheckIcon } from 'lucide-react'

const GOOGLE_CLIENT_ID = '254523860171-2d6l9k860ev4s05c7hh9shmdagehgr5u.apps.googleusercontent.com'
const BACKEND_URL = 'http://localhost:3000'

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyALpr9W-FDGieugHqk1L6TP1xIrxXIWV8U",
  authDomain: "extension-bundles.firebaseapp.com",
  projectId: "extension-bundles",
  storageBucket: "extension-bundles.firebasestorage.app",
  messagingSenderId: "254523860171",
  appId: "1:254523860171:web:03a243019bcb11d00ee74e"
}

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig)
const auth = getAuth(firebaseApp)

// Configuration for bundles
const bundleConfig: { [key: string]: Bundle } = {
  'ProBundle': {
    name: 'Pro Bundle',
    extensions: ['Canvabulkbg', 'Ideobot', 'Midbot'],
    description: 'Perfect for professionals',
    image: '/img.png',
    prices: {
      monthly: { price: '$29.99', id: 'price_1Q79IwEUAhHysq2jWpJ8wFXv' },
      yearly: { price: '$299.99', id: 'price_1Q79JWEUAhHysq2jOFqMGYsU' },
      lifetime: { price: '$599.99', id: 'price_1Q79JyEUAhHysq2jtihJTIc4' },
    },
  },
  'StarterBundle': {
    name: 'Starter Bundle',
    extensions: ['Canvabulkbg', 'Ideobot'],
    description: 'Great for beginners',
    image: '/img.png',
    prices: {
      monthly: { price: '$19.99', id: 'price_1Q79IwEUAhHysq2jWpJ8wFXv' },
      yearly: { price: '$199.99', id: 'price_1Q79JWEUAhHysq2jOFqMGYsU' },
      lifetime: { price: '$399.99', id: 'price_1Q79JyEUAhHysq2jtihJTIc4' },
    },
  },
  'AdvancedBundle': {
    name: 'Advanced Bundle',
    extensions: ['Canvabulkbg', 'Ideobot', 'Midbot', 'AdvancedTool'],
    description: 'For power users',
    image: '/img.png',
    prices: {
      monthly: { price: '$39.99', id: 'price_1Q79IwEUAhHysq2jWpJ8wFXv' },
      yearly: { price: '$399.99', id: 'price_1Q79JWEUAhHysq2jOFqMGYsU' },
      lifetime: { price: '$799.99', id: 'price_1Q79JyEUAhHysq2jtihJTIc4' },
    },
  },
  'UltimateBundle': {
    name: 'Ultimate Bundle',
    extensions: ['Canvabulkbg', 'Ideobot', 'Midbot', 'AdvancedTool', 'PremiumFeature'],
    description: 'All-inclusive package',
    image: '/img.png',
    prices: {
      monthly: { price: '$49.99', id: 'price_1Q79IwEUAhHysq2jWpJ8wFXv' },
      yearly: { price: '$499.99', id: 'price_1Q79JWEUAhHysq2jOFqMGYsU' },
      lifetime: { price: '$999.99', id: 'price_1Q79JyEUAhHysq2jtihJTIc4' },
    },
  },
  'CustomBundle': {
    name: 'Custom Bundle',
    extensions: ['CustomTool1', 'CustomTool2'],
    description: 'Tailored to your needs',
    image: '/img.png',
    prices: {
      monthly: { price: '$59.99', id: 'price_1Q79IwEUAhHysq2jWpJ8wFXv' },
      yearly: { price: '$599.99', id: 'price_1Q79JWEUAhHysq2jOFqMGYsU' },
      lifetime: { price: '$1199.99', id: 'price_1Q79JyEUAhHysq2jtihJTIc4' },
    },
  },
}

// Type definitions
interface User {
  displayName: string
  email: string
  photoURL?: string
}

interface Subscription {
  status: string
  plan: string
}

interface Subscriptions {
  [key: string]: Subscription
}

interface BundlePrice {
  price: string;
  id: string;
}

interface Bundle {
  name: string;
  extensions: string[];
  description: string;
  image: string;
  prices: {
    [key: string]: BundlePrice;
  };
}

interface BundleCardProps {
  bundle: Bundle;
  bundleId: string;
  initiateCheckout: (bundleId: string, plan: string) => void;
}

// Success component
function Success() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [status, setStatus] = useState('Processing payment...')

  useEffect(() => {
    const sessionId = searchParams.get('session_id')
    if (sessionId) {
      completePayment(sessionId)
    }
  }, [searchParams])

  const completePayment = async (sessionId: string) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/payment-success`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId }),
      })

      if (response.ok) {
        setStatus('Payment successful! Redirecting...')
        setTimeout(() => navigate('/'), 2000)
      } else {
        setStatus('Something went wrong. Please contact support.')
      }
    } catch (error) {
      console.error('Error completing payment:', error)
      setStatus('Error processing payment. Please contact support.')
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4 text-center">Payment Status</h2>
        <p className="text-gray-600 text-center">{status}</p>
      </div>
    </div>
  )
}

// Cancel component
function Cancel() {
  const navigate = useNavigate()

  useEffect(() => {
    setTimeout(() => navigate('/'), 3000)
  }, [navigate])

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4 text-center">Payment Cancelled</h2>
        <p className="text-gray-600 text-center">Your payment was cancelled. Redirecting back to home...</p>
      </div>
    </div>
  )
}

// Bundle Card component
function BundleCard({ bundle, bundleId, initiateCheckout }: BundleCardProps) {
  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-lg transition-all duration-300 hover:shadow-2xl">
      <div className="relative">
        <img src={bundle.image} alt={bundle.name} className="w-full h-48 object-cover" />
        <div className="absolute top-0 right-0 bg-indigo-600 text-white px-3 py-1 rounded-bl-lg">
          {bundle.name}
        </div>
      </div>
      <div className="p-6">
        <h3 className="text-xl font-semibold mb-2">{bundle.name}</h3>
        <p className="text-gray-600 mb-4">{bundle.description}</p>
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Included Extensions:</h4>
          <ul className="space-y-1">
            {bundle.extensions.map((ext) => (
              <li key={ext} className="flex items-center text-sm text-gray-600">
                <CheckIcon className="w-4 h-4 mr-2 text-green-500" />
                {ext}
              </li>
            ))}
          </ul>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {Object.entries(bundle.prices).map(([plan, { price, id }]) => (
            <button
              key={plan}
              onClick={() => initiateCheckout(bundleId, plan)}
              className="w-full py-2 px-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 relative group"
            >
              <span className="group-hover:opacity-0 transition-opacity duration-200">
                {plan.charAt(0).toUpperCase() + plan.slice(1)}
              </span>
              <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                {price}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// Main App component
function MainApp() {
  const [user, setUser] = useState<User | null>(null)
  const [subscriptions, setSubscriptions] = useState<Subscriptions>({})

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
      if (firebaseUser && firebaseUser.email) {
        setUser({
          displayName: firebaseUser.displayName || '',
          email: firebaseUser.email,
          photoURL: firebaseUser.photoURL || undefined
        })
        checkSubscription(firebaseUser.email)
      } else {
        setUser(null)
      }
    })

    return () => unsubscribe()
  }, [])

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    try {
      if (credentialResponse.credential) {
        const response = await fetch(`${BACKEND_URL}/api/auth`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ credential: credentialResponse.credential }),
        })

        if (!response.ok) {
          throw new Error('Authentication failed')
        }

        const data = await response.json()
        
        if (data.firebaseToken) {
          await signInWithCustomToken(auth, data.firebaseToken)
          setUser(data.user)
          if (data.user.email) {
            checkSubscription(data.user.email)
          }
        }
      }
    } catch (error) {
      console.error('Sign-in error:', error)
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut(auth)
      setUser(null)
      setSubscriptions({})
    } catch (error) {
      console.error('Sign-out error:', error)
    }
  }

  const checkSubscription = async (email: string) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/check-subscription/${encodeURIComponent(email)}`)
      const data = await response.json()
      setSubscriptions(data.subscriptions)
    } catch (error) {
      console.error('Error checking subscription:', error)
    }
  }

  const initiateCheckout = async (bundleId: string, plan: string) => {
    if (!user) {
      console.error('User not logged in')
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
          bundleId: bundleId,
        }),
      })

      const data = await response.json()

      if (data.sessionUrl) {
        window.location.href = data.sessionUrl
      } else {
        throw new Error('Failed to create checkout session')
      }
    } catch (error) {
      console.error('Error initiating checkout:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-indigo-600">Extension Bundles</h1>
          {user ? (
            <div className="flex items-center space-x-4">
              {user.photoURL && (
                <img src={user.photoURL} alt={user.displayName} className="w-10 h-10 rounded-full" />
              )}
              <div>
                <p className="text-sm font-medium text-gray-900">{user.displayName}</p>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>
              <button
                onClick={handleSignOut}
                className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => {
                console.error('Login Failed')
              }}
              useOneTap
            />
          )}
        </div>
      </header>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {user ? (
          <>
            <div className="px-4 sm:px-0 mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Your Subscriptions</h2>
              {Object.entries(subscriptions).length > 0 ? (
                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                  <ul className="divide-y divide-gray-200">
                    {Object.entries(subscriptions).map(([extension, subscription]) => (
                      <li key={extension} className="px-6 py-4 flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <div className="h-10 w-10 rounded-full bg-indigo-600 flex items-center justify-center">
                              <span className="text-white font-medium">{extension[0].toUpperCase()}</span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <p className="text-sm font-medium text-gray-900">{extension}</p>
                            <p className="text-sm text-gray-500">{subscription.plan}</p>
                          </div>
                        </div>
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          subscription.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {subscription.status}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="text-gray-500">No active subscriptions</p>
              )}
            </div>
            <div className="px-4 sm:px-0">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Available Bundles</h2>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {Object.entries(bundleConfig).map(([bundleId, bundle]) => (
                  <BundleCard key={bundleId} bundle={bundle} bundleId={bundleId} initiateCheckout={initiateCheckout} />
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="text-center">
            <h2 className="mt-5 text-3xl font-extrabold text-gray-900">Welcome to Extension Bundles</h2>
            <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
              Sign in to manage your subscriptions and explore our bundle offerings.
            </p>
          </div>
        )}
      </main>
    </div>
  )
}

// Root component with routing
export default function App() {
  return (
    <Router>
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <Routes>
          <Route path="/" element={<MainApp />} />
          <Route path="/success" element={<Success />} />
          <Route path="/cancel" element={<Cancel />} />
        </Routes>
      </GoogleOAuthProvider>
    </Router>
  )
}
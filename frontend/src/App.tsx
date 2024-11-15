import React, { useState, useEffect } from 'react';
import { GoogleOAuthProvider, GoogleLogin, CredentialResponse } from '@react-oauth/google';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithCustomToken, signOut } from 'firebase/auth';
import { BrowserRouter as Router, Routes, Route, useNavigate, useSearchParams } from 'react-router-dom';

const GOOGLE_CLIENT_ID = '254523860171-2d6l9k860ev4s05c7hh9shmdagehgr5u.apps.googleusercontent.com';
const BACKEND_URL = 'http://localhost:3000';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyALpr9W-FDGieugHqk1L6TP1xIrxXIWV8U",
  authDomain: "extension-bundles.firebaseapp.com",
  projectId: "extension-bundles",
  storageBucket: "extension-bundles.firebasestorage.app",
  messagingSenderId: "254523860171",
  appId: "1:254523860171:web:03a243019bcb11d00ee74e"
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);

// Configuration for bundles
const bundleConfig = {
  'ProBundle': {
    name: 'Pro Bundle',
    extensions: ['Canvabulkbg', 'Ideobot', 'Midbot'],
    description: 'Perfect for professionals',
    image: '/placeholder.svg?height=200&width=200',
    prices: {
      monthly: 'price_1Q79IwEUAhHysq2jWpJ8wFXv',
      yearly: 'price_1Q79JWEUAhHysq2jOFqMGYsU',
      lifetime: 'price_1Q79JyEUAhHysq2jtihJTIc4',
    },
  },
  'StarterBundle': {
    name: 'Starter Bundle',
    extensions: ['Canvabulkbg', 'Ideobot'],
    description: 'Great for beginners',
    image: '/placeholder.svg?height=200&width=200',
    prices: {
      monthly: 'price_1Q79IwEUAhHysq2jWpJ8wFXv',
      yearly: 'price_1Q79JWEUAhHysq2jOFqMGYsU',
      lifetime: 'price_1Q79JyEUAhHysq2jtihJTIc4',
    },
  },
  'AdvancedBundle': {
    name: 'Advanced Bundle',
    extensions: ['Canvabulkbg', 'Ideobot', 'Midbot', 'AdvancedTool'],
    description: 'For power users',
    image: '/placeholder.svg?height=200&width=200',
    prices: {
      monthly: 'price_1Q79IwEUAhHysq2jWpJ8wFXv',
      yearly: 'price_1Q79JWEUAhHysq2jOFqMGYsU',
      lifetime: 'price_1Q79JyEUAhHysq2jtihJTIc4',
    },
  },
  'UltimateBundle': {
    name: 'Ultimate Bundle',
    extensions: ['Canvabulkbg', 'Ideobot', 'Midbot', 'AdvancedTool', 'PremiumFeature'],
    description: 'All-inclusive package',
    image: '/placeholder.svg?height=200&width=200',
    prices: {
      monthly: 'price_1Q79IwEUAhHysq2jWpJ8wFXv',
      yearly: 'price_1Q79JWEUAhHysq2jOFqMGYsU',
      lifetime: 'price_1Q79JyEUAhHysq2jtihJTIc4',
    },
  },
  'CustomBundle': {
    name: 'Custom Bundle',
    extensions: ['CustomTool1', 'CustomTool2'],
    description: 'Tailored to your needs',
    image: '/placeholder.svg?height=200&width=200',
    prices: {
      monthly: 'price_1Q79IwEUAhHysq2jWpJ8wFXv',
      yearly: 'price_1Q79JWEUAhHysq2jOFqMGYsU',
      lifetime: 'price_1Q79JyEUAhHysq2jtihJTIc4',
    },
  },
};

// Type definitions
interface User {
  displayName: string;
  email: string;
  photoURL?: string;
}

interface Subscription {
  status: string;
  plan: string;
}

interface Subscriptions {
  [key: string]: Subscription;
}

// Success component
function Success() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('Processing payment...');

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    if (sessionId) {
      completePayment(sessionId);
    }
  }, [searchParams]);

  const completePayment = async (sessionId: string) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/payment-success`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId }),
      });

      if (response.ok) {
        setStatus('Payment successful! Redirecting...');
        setTimeout(() => navigate('/'), 2000);
      } else {
        setStatus('Something went wrong. Please contact support.');
      }
    } catch (error) {
      console.error('Error completing payment:', error);
      setStatus('Error processing payment. Please contact support.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-lg sm:p-20">
          <div className="max-w-md mx-auto">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">Payment Status</h2>
              <p className="text-gray-600">{status}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Cancel component
function Cancel() {
  const navigate = useNavigate();

  useEffect(() => {
    setTimeout(() => navigate('/'), 3000);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-lg sm:p-20">
          <div className="max-w-md mx-auto">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">Payment Cancelled</h2>
              <p className="text-gray-600">Your payment was cancelled. Redirecting back to home...</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main App component
function MainApp() {
  const [user, setUser] = useState<User | null>(null);
  const [subscriptions, setSubscriptions] = useState<Subscriptions>({});
  const [selectedBundle, setSelectedBundle] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('');

  useEffect(() => {
    // Listen for Firebase auth state changes
    const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
      if (firebaseUser && firebaseUser.email) {
        setUser({
          displayName: firebaseUser.displayName || '',
          email: firebaseUser.email,
          photoURL: firebaseUser.photoURL || undefined
        });
        checkSubscription(firebaseUser.email);
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    try {
      if (credentialResponse.credential) {
        const response = await fetch(`${BACKEND_URL}/api/auth`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ credential: credentialResponse.credential }),
        });

        if (!response.ok) {
          throw new Error('Authentication failed');
        }

        const data = await response.json();
        
        if (data.firebaseToken) {
          await signInWithCustomToken(auth, data.firebaseToken);
          setUser(data.user);
          if (data.user.email) {
            checkSubscription(data.user.email);
          }
        }
      }
    } catch (error) {
      console.error('Sign-in error:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setSubscriptions({});
    } catch (error) {
      console.error('Sign-out error:', error);
    }
  };

  const checkSubscription = async (email: string) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/check-subscription/${encodeURIComponent(email)}`);
      const data = await response.json();
      setSubscriptions(data.subscriptions);
    } catch (error) {
      console.error('Error checking subscription:', error);
    }
  };

  const initiateCheckout = async (bundleId: string, plan: string) => {
    if (!user) {
      console.error('User not logged in');
      return;
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
      });

      const data = await response.json();

      if (data.sessionUrl) {
        window.location.href = data.sessionUrl;
      } else {
        throw new Error('Failed to create checkout session');
      }
    } catch (error) {
      console.error('Error initiating checkout:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
      <div className="relative py-3 sm:max-w-6xl sm:mx-auto">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-light-blue-500 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl"></div>
        <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
          <div className="max-w-5xl mx-auto">
            <div className="divide-y divide-gray-200">
              <div className="py-8 text-base leading-6 space-y-4 text-gray-700 sm:text-lg sm:leading-7">
                {user ? (
                  <>
                    <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center space-x-4">
                        {user.photoURL && (
                          <img src={user.photoURL} alt={user.displayName} className="w-10 h-10 rounded-full" />
                        )}
                        <p>Welcome, {user.displayName}!</p>
                      </div>
                      <button
                        onClick={handleSignOut}
                        className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        Sign Out
                      </button>
                    </div>
                    <div className="mb-8">
                      <h3 className="text-lg font-medium mb-2">Your Subscriptions:</h3>
                      {Object.entries(subscriptions).length > 0 ? (
                        Object.entries(subscriptions).map(([extension, subscription]) => (
                          <div key={extension} className="bg-gray-100 p-2 rounded mb-2">
                            <p>{extension}: {subscription.status} ({subscription.plan})</p>
                          </div>
                        ))
                      ) : (
                        <p>No active subscriptions</p>
                      )}
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold mb-6">Available Bundles:</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {Object.entries(bundleConfig).map(([bundleId, bundle]) => (
                          <div
                            key={bundleId}
                            className="relative overflow-hidden rounded-lg shadow-lg transition-all duration-300 transform hover:-translate-y-2"
                          >
                            <img src={bundle.image} alt={bundle.name} className="w-full h-48 object-cover" />
                            <div className="absolute inset-0 bg-black bg-opacity-60 flex flex-col justify-between p-4 text-white opacity-0 hover:opacity-100 transition-opacity duration-300">
                              <div>
                                <h4 className="text-xl font-bold mb-2">{bundle.name}</h4>
                                <p className="text-sm mb-2">{bundle.description}</p>
                                <ul className="text-sm mb-4">
                                  {bundle.extensions.map((ext) => (
                                    <li key={ext}>{ext}</li>
                                  ))}
                                </ul>
                              </div>
                              <div className="flex justify-between space-x-2">
                                {Object.keys(bundle.prices).map((plan) => (
                                  <button
                                    key={plan}
                                    onClick={() => initiateCheckout(bundleId, plan)}
                                    className="flex-1 px-2 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors duration-200"
                                  >
                                    {plan.charAt(0).toUpperCase() + plan.slice(1)}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center space-y-4">
                    <h2 className="text-2xl font-bold mb-4">Welcome to Extension Bundles</h2>
                    <p className="text-gray-600 mb-4">Sign in to manage your subscriptions</p>
                    <div className="flex justify-center">
                      <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={() => {
                          console.error('Login Failed');
                        }}
                        useOneTap
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
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
  );
}
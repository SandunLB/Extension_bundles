import React, { useState, useEffect } from 'react'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { initializeApp } from 'firebase/app'
import { getAuth, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import BundlePage from './BundlePage'
import Success from './Success'
import { bundleConfig } from './bundleConfig'

const GOOGLE_CLIENT_ID = '254523860171-2d6l9k860ev4s05c7hh9shmdagehgr5u.apps.googleusercontent.com'

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

export interface User {
  displayName: string
  email: string
  photoURL?: string
}

function App() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser && firebaseUser.email) {
        setUser({
          displayName: firebaseUser.displayName || '',
          email: firebaseUser.email,
          photoURL: firebaseUser.photoURL || undefined
        })
      } else {
        setUser(null)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/ProBundle" replace />} />
          <Route path="/:bundleName" element={<BundlePage user={user} />} />
          <Route path="/:bundleName/:plan" element={<BundlePage user={user} />} />
          <Route path="/success" element={<Success />} />
        </Routes>
      </Router>
    </GoogleOAuthProvider>
  )
}

export default App
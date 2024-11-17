import React from 'react'
import { GoogleLogin, CredentialResponse } from '@react-oauth/google'
import { useNavigate, useLocation } from 'react-router-dom'
import { getAuth, signInWithCredential, GoogleAuthProvider } from 'firebase/auth'

function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from: string } | undefined)?.from || '/'

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    try {
      const auth = getAuth()
      const credential = GoogleAuthProvider.credential(credentialResponse.credential)
      await signInWithCredential(auth, credential)
      navigate(from, { replace: true })
    } catch (error) {
      console.error('Login error:', error)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4 text-center">Login</h2>
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={() => console.error('Login Failed')}
          useOneTap
        />
      </div>
    </div>
  )
}

export default Login
import React, { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { CheckCircleIcon, XCircleIcon } from 'lucide-react'

const BACKEND_URL = 'http://localhost:3000'

function Success() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing')
  const [message, setMessage] = useState('Processing payment...')

  useEffect(() => {
    const sessionId = searchParams.get('session_id')
    if (sessionId) {
      completePayment(sessionId)
    } else {
      setStatus('error')
      setMessage('Invalid session. Please try again.')
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
        setStatus('success')
        setMessage('Payment successful! You will be redirected shortly.')
        setTimeout(() => navigate('/'), 3000)
      } else {
        throw new Error('Payment completion failed')
      }
    } catch (error) {
      console.error('Error completing payment:', error)
      setStatus('error')
      setMessage('An error occurred while processing your payment. Please contact support.')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden max-w-md w-full p-8 text-center">
        {status === 'processing' && (
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-600 mx-auto mb-4"></div>
        )}
        {status === 'success' && (
          <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
        )}
        {status === 'error' && (
          <XCircleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
        )}
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          {status === 'success' ? 'Payment Successful' : 'Payment Status'}
        </h2>
        <p className={`text-lg ${status === 'error' ? 'text-red-600' : 'text-gray-600'}`}>
          {message}
        </p>
      </div>
    </div>
  )
}

export default Success
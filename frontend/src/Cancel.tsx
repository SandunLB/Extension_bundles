import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

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

export default Cancel
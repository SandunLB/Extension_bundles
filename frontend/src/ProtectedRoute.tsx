import React from 'react'
import { Navigate } from 'react-router-dom'
import { User } from './App'

interface ProtectedRouteProps {
  user: User | null
  children: React.ReactNode
}

function ProtectedRoute({ user, children }: ProtectedRouteProps) {
  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

export default ProtectedRoute
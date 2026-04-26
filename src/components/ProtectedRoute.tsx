import { type ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { isAdminSession } from '../auth/adminSession'

interface Props {
  children: ReactNode
}

export function ProtectedRoute({ children }: Props) {
  if (!isAdminSession()) {
    return <Navigate to="/admin/login" replace />
  }
  return <>{children}</>
}

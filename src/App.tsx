import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { isAdminSession } from './auth/adminSession'
import { CatalogProvider } from './context/CatalogContext'
import { CartProvider } from './context/CartContext'
import { MainLayout } from './layouts/MainLayout'
import { AdminDashboard } from './pages/AdminDashboard'
import { AdminLogin } from './pages/AdminLogin'
import { HomePage } from './pages/HomePage'
import { ProductPage } from './pages/ProductPage'
import './App.css'

function AdminGate() {
  if (!isAdminSession()) return <Navigate to="/admin/login" replace />
  return <AdminDashboard />
}

export default function App() {
  return (
    <BrowserRouter>
      <CatalogProvider>
        <CartProvider>
          <Routes>
            <Route element={<MainLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/produto/:id" element={<ProductPage />} />
            </Route>
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminGate />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </CartProvider>
      </CatalogProvider>
    </BrowserRouter>
  )
}

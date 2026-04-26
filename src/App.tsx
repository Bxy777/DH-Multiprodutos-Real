import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { CatalogProvider } from './context/CatalogContext'
import { CartProvider } from './context/CartContext'
import { ThemeProvider } from './context/ThemeContext'
import { MainLayout } from './layouts/MainLayout'
import { ProtectedRoute } from './components/ProtectedRoute'
import { AdminDashboard } from './pages/AdminDashboard'
import { AdminLogin } from './pages/AdminLogin'
import { HomePage } from './pages/HomePage'
import { ProductPage } from './pages/ProductPage'
import './App.css'

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <CatalogProvider>
          <CartProvider>
            <Routes>
              <Route element={<MainLayout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/produto/:id" element={<ProductPage />} />
              </Route>
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </CartProvider>
        </CatalogProvider>
      </BrowserRouter>
    </ThemeProvider>
  )
}

import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import MobileNav from './components/MobileNav'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import NRIPage from './pages/NRIPage'
import TouristPage from './pages/TouristPage'
import FreelancerPage from './pages/FreelancerPage'

function ProtectedRoute({ children, user }) {
  if (!user) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  const [user, setUser] = useState(null)

  const handleLogin = (userData) => setUser(userData)
  const handleLogout = () => setUser(null)

  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col" style={{ paddingBottom: user ? 64 : 0 }}>
        <Navbar user={user} onLogout={handleLogout} />

        <main className="flex-1">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />

            <Route path="/dashboard" element={
              <ProtectedRoute user={user}>
                <DashboardPage user={user} />
              </ProtectedRoute>
            } />
            <Route path="/nri" element={
              <ProtectedRoute user={user}>
                <NRIPage />
              </ProtectedRoute>
            } />
            <Route path="/tourist" element={
              <ProtectedRoute user={user}>
                <TouristPage />
              </ProtectedRoute>
            } />
            <Route path="/freelancer" element={
              <ProtectedRoute user={user}>
                <FreelancerPage />
              </ProtectedRoute>
            } />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        <MobileNav user={user} />
      </div>
    </BrowserRouter>
  )
}

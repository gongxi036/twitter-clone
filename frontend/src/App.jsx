import { Routes, Route, Navigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'

import HomePage from './pages/home/HomePage'
import LoginPage from './pages/auth/login/LoginPage'
import SignupPage from './pages/auth/signup/SignUpPage'
import Sidebar from './components/common/Sidebar'
import RightPanel from './components/common/RightPanel'
import NotificationPage from './pages/notification/NotificationPage'
import ProfilePage from './pages/profile/ProfilePage'
import LoadingSpinner from "./components/common/LoadingSpinner"
function App() {

  const { data: authUser, isLoading } = useQuery({
    // queryKey 是可以在其他页面进行复用的
    queryKey: ['authUser'],
    queryFn: async () => {
      try {
        const res = await fetch('/api/auth/getUser')
        const data = await res.json()
        if (data.error) return null
        if (!res.ok) {
          throw new Error(data.error || 'Something went wrong')
        }
        return data
      } catch (error) {
        throw new Error(error)
      }
    },
    retry: false,
  })

  if (isLoading) {
    return (
      <div className="h-screen flex justify-center items-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="flex max-w-6xl mx-auto">
      { authUser && <Sidebar />}
      <Routes>
        <Route path="/" element={authUser ? <HomePage /> : <Navigate to='/login' />} />
        <Route path="/login" element={authUser ? <Navigate to='/' /> : <LoginPage />} />
        <Route path="/signup" element={authUser ? <Navigate to='/' /> : <SignupPage />} />
        <Route path='/notifications' element={authUser ? <NotificationPage /> : <Navigate to='/login' />} />
        <Route path="/profile/:username" element={authUser ? <ProfilePage /> : <Navigate to='/login' />} />
      </Routes>
      { authUser && <RightPanel />}
      <Toaster />
    </div>
  )
}

export default App

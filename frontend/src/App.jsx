import { Routes, Route } from 'react-router-dom'
import HomePage from './pages/home/HomePage'
import LoginPage from './pages/auth/login/LoginPage'
import SignupPage from './pages/auth/signup/SignupPage'
import Sidebar from './components/common/SideBar'
import RightPanel from './components/common/RightPanel'
import NotificationPage from './pages/notification/NotificationPage'
import ProfilePage from './pages/profile/ProfilePage'
function App() {

  return (
    <div className="flex max-w-6xl mx-auto">
      <Sidebar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path='/notifications' element={<NotificationPage />} />
        <Route path="/profile/:username" element={<ProfilePage />} />
      </Routes>
      <RightPanel />
    </div>
  )
}

export default App

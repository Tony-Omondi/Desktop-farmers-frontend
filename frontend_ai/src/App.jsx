import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Signup from './components/Signup';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import GoogleCallback from './components/GoogleCallback';
import PasswordResetRequest from './components/PasswordResetRequest';
import ResetPassword from './components/ResetPassword';
import VerifyOTP from './components/VerifyOTP';
import Profile from './components/Profile';
import Landing from './components/Landing';
import Events from './components/Events';
import MyCloset from './components/MyCloset';
import Recommendations from './components/Recommendations';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/frontend_ai/" element={<Landing />} />
        <Route path="/frontend_ai/signup" element={<Signup />} />
        <Route path="/frontend_ai/login" element={<Login />} />
        <Route path="/frontend_ai/dashboard" element={<Dashboard />} />
        <Route path="/frontend_ai/google-callback" element={<GoogleCallback />} />
        <Route path="/frontend_ai/forgot-password" element={<PasswordResetRequest />} />
        <Route path="/frontend_ai/verify-otp" element={<VerifyOTP />} />
        <Route path="/frontend_ai/reset-password" element={<ResetPassword />} />
        <Route path="/frontend_ai/profile" element={<Profile />} />
        <Route path="/frontend_ai/events" element={<Events />} />
        <Route path="/frontend_ai/closet" element={<MyCloset />} />
        <Route path="/frontend_ai/recommendations" element={<Recommendations />} />
        <Route path="*" element={<div>404 - Page Not Found</div>} />
      </Routes>
    </Router>
  );
}

export default App;

import { Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Signup from './components/Signup';
import PasswordResetRequest from './components/PasswordResetRequest';
import VerifyOTP from './components/VerifyOTP';
import Orders from './components/Orders';
import Payments from './components/Payments';
import Profile from './components/Profile';
import Cart from './components/Cart';
import Checkout from './components/Checkout';
import PaymentSuccess from './components/PaymentSuccess';

function App() {
  return (
    <Routes>
      <Route path="/frontend_ai/login" element={<Login />} />
      <Route path="/frontend_ai/dashboard" element={<Dashboard />} />
      <Route path="/frontend_ai/signup" element={<Signup />} />
      <Route path="/frontend_ai/forgot-password" element={<PasswordResetRequest />} />
      <Route path="/frontend_ai/verify-otp" element={<VerifyOTP />} />
      <Route path="/frontend_ai/profile" element={<Profile />} />
      <Route path="/frontend_ai/orders" element={<Orders />} />
      <Route path="/frontend_ai/payments" element={<Payments />} />
      <Route path="/frontend_ai/cart" element={<Cart />} />
      <Route path="/frontend_ai/checkout" element={<Checkout />} />
      <Route path="/frontend_ai/payment-success" element={<PaymentSuccess />} />
    </Routes>
  );
}

export default App;

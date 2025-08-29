
import { Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import Landing from './components/Landing';
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
import PaymentCallback from './components/PaymentCallback';
import AdaminLogin from './components/AdaminLogin';
import AdaminDashboard from './components/AdaminDashboard';
import AddCategoryForm from './components/AddCategoryForm';
import CreateOrderForm from './components/CreateOrderForm';
import AddProductForm from './components/AddProductForm';
import AdminOrderDetails from './components/AdminOrderDetails';

function App() {
  return (
    <Routes>
      <Route path="/frontend_ai/" element={<Landing />} />
      <Route path="/frontend_ai/AddCategoryForm" element={<AddCategoryForm />} />
      <Route path="/frontend_ai/AddProductForm" element={<AddProductForm />} />
      <Route path="/frontend_ai/CreateOrderForm" element={<CreateOrderForm />} />
      <Route path="/frontend_ai/admin/orders/:orderId" element={<AdminOrderDetails />} />
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
      <Route path="/frontend_ai/payment-callback" element={<PaymentCallback />} />
      <Route path="/frontend_ai/adamin/login" element={<AdaminLogin />} />
      <Route path="/frontend_ai/adamin/dashboard" element={<AdaminDashboard />} />
    </Routes>
  );
}

export default App;

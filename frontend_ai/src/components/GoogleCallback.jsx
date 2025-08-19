import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const GoogleCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/auth/google/callback/', {
          withCredentials: true,
        });
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        navigate('/frontend_ai/dashboard');
      } catch (err) {
        console.error('Google login failed:', err);
        navigate('/frontend_ai/login', { state: { error: 'Google login failed. Please try again.' } });
      }
    };

    fetchToken();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <p className="text-gray-600">Processing Google login...</p>
    </div>
  );
};

export default GoogleCallback;
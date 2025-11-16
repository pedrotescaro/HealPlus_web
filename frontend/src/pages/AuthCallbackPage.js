import React, { useEffect, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Loading from '../components/Loading'; // Assuming a loading component exists

const AuthCallbackPage = () => {
  const { handleSocialAuth } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');

    if (token) {
      handleSocialAuth(token)
        .then(() => {
          navigate('/dashboard');
        })
        .catch(err => {
          console.error('Social auth failed:', err);
          navigate('/login');
        });
    } else {
      // No token found, redirect to login
      navigate('/login');
    }
  }, [location, navigate, handleSocialAuth]);

  return <Loading />;
};

export default AuthCallbackPage;

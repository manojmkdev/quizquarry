import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setAuth } from '../store/slices/authSlice';

const OAuth2Callback = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    const fullName = params.get('fullName');
    const role = params.get('role');

    if (token && fullName && role) {
      dispatch(setAuth({
        user: { fullName, role },
        token: token
      }));
      navigate('/');
    } else {
      console.error('Missing OAuth2 parameters');
      navigate('/login');
    }
  }, [location, dispatch, navigate]);

  return (
    <div className="card" style={{ textAlign: 'center', padding: '50px' }}>
      <h2>Completing Login...</h2>
      <p>Please wait while we finalize your secure session.</p>
    </div>
  );
};

export default OAuth2Callback;

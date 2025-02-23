import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

/**
 * This page handles the redirect from Google after user consent (typically called the "callback" route).
 * In a real project, you'd parse the query params or tokens, then notify your backend to verify them.
 */
export default function GoogleLoginCallback() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Example: parse tokens from query string or fragment
    const searchParams = new URLSearchParams(location.search);
    const token = searchParams.get('token');
    
    // After processing the token or making an API call to your backend:
    if (token) {
      // Store the token somewhere (context, Redux, etc.)
      console.log('Received token from Google:', token);
    } else {
      console.warn('No token found in Google callback URL.');
    }

    // Redirect user to home or another page
    navigate('/');
  }, [location, navigate]);

  return (
    <div>
      <h2>Processing Google Login...</h2>
      <p>Verifying credentials. Please wait...</p>
    </div>
  );
}
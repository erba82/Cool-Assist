import React from 'react';

// Depending on your approach, you might use a library like react-oauth/google or redirect manually.
export default function GoogleLoginButton() {
  const handleGoogleLogin = () => {
    // Replace with the correct OAuth URL for your Google login flow
    window.location.href = 'https://accounts.google.com/o/oauth2/v2/auth?client_id=YOUR_CLIENT_ID&redirect_uri=http://localhost:3000/auth/google/callback&response_type=token&scope=email profile';
  };

  return (
    <button onClick={handleGoogleLogin}>
      Login with Google
    </button>
  );
}
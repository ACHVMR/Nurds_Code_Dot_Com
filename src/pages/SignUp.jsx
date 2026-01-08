import React from 'react';
import { SignUp as ClerkSignUp } from '@clerk/clerk-react';

export default function SignUp() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <ClerkSignUp 
        appearance={{
          elements: {
            rootBox: 'mx-auto',
            card: 'bg-gray-900 border border-white/10',
          },
        }}
      />
    </div>
  );
}

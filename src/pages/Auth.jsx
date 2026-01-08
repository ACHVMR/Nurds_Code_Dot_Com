import React from 'react';
import { SignIn } from '@clerk/clerk-react';

export default function Auth() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <SignIn 
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

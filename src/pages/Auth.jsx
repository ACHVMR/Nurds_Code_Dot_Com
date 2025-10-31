import React from 'react';
import { SignIn, SignedIn, SignedOut, UserProfile } from '@clerk/clerk-react';

function Auth() {
  return (
    <div className="min-h-screen py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="card">
            <h1 className="text-2xl font-bold mb-4 text-text">Sign In</h1>
            <SignedOut>
              <SignIn routing="hash" signUpUrl="/auth" />
            </SignedOut>
            <SignedIn>
              <p className="text-text">You're signed in. Manage your profile on the right.</p>
            </SignedIn>
          </div>
          <div className="card">
            <h2 className="text-xl font-semibold mb-4 text-text">Account</h2>
            <SignedIn>
              <UserProfile routing="hash" />
            </SignedIn>
            <SignedOut>
              <p className="text-text/60">Sign in to view and manage your account.</p>
            </SignedOut>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Auth;

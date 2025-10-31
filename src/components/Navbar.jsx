import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { SignedIn, SignedOut, UserButton } from '@clerk/clerk-react';

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-background border-b border-[#2a2a2a] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-3">
              <img 
                src="/nurd-drip-logo.svg" 
                alt="NURD Logo" 
                className="h-8 w-8"
              />
              <div className="text-2xl font-bold text-text">
                Nurds Code
              </div>
            </Link>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-text hover:text-accent transition-colors">
              Home
            </Link>
            <Link to="/pricing" className="text-text hover:text-accent transition-colors">
              Pricing
            </Link>
            <Link to="/editor" className="text-text hover:text-accent transition-colors">
              Editor
            </Link>
            <SignedIn>
              <Link to="/agents" className="text-text hover:text-accent transition-colors">
                Agents
              </Link>
              <Link to="/admin" className="text-text hover:text-accent transition-colors">
                Admin
              </Link>
            </SignedIn>
            <SignedOut>
              <Link to="/auth" className="btn-primary">
                Sign In
              </Link>
            </SignedOut>
            <SignedIn>
              <UserButton appearance={{ elements: { userButtonAvatarBox: 'ring-2 ring-accent' } }} />
            </SignedIn>
          </div>

          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-text hover:text-accent"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden bg-[#1a1a1a] border-t border-[#2a2a2a]">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link to="/" className="block px-3 py-2 text-text hover:text-accent hover:bg-[#2a2a2a]">
              Home
            </Link>
            <Link to="/pricing" className="block px-3 py-2 text-text hover:text-accent hover:bg-[#2a2a2a]">
              Pricing
            </Link>
            <Link to="/editor" className="block px-3 py-2 text-text hover:text-accent hover:bg-[#2a2a2a]">
              Editor
            </Link>
            <SignedIn>
              <Link to="/agents" className="block px-3 py-2 text-text hover:text-accent hover:bg-[#2a2a2a]">
                Agents
              </Link>
              <Link to="/admin" className="block px-3 py-2 text-text hover:text-accent hover:bg-[#2a2a2a]">
                Admin
              </Link>
            </SignedIn>
            <SignedOut>
              <Link to="/auth" className="block px-3 py-2 text-accent hover:text-neon">
                Sign In
              </Link>
            </SignedOut>
            <SignedIn>
              <div className="px-3 py-2 text-text">
                <UserButton />
              </div>
            </SignedIn>
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;

import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

function Success() {
  const [searchParams] = useSearchParams();
  const [plan, setPlan] = useState('');

  useEffect(() => {
    setPlan(searchParams.get('plan') || 'subscription');
  }, [searchParams]);

  return (
    <div className="min-h-screen py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="card text-center">
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-accent mb-6">
              <svg
                className="w-12 h-12 text-background"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h1 className="text-4xl font-bold mb-4 text-text">
              Subscription Successful!
            </h1>
            <p className="text-xl text-text mb-8">
              Welcome to Nurds Code! Your {plan} subscription is now active.
            </p>
          </div>

          <div className="bg-[#1a1a1a] border border-[#2a2a2a] p-6 mb-8">
            <h2 className="text-2xl font-bold mb-4 text-text">What's Next?</h2>
            <ul className="text-left space-y-4">
              <li className="flex items-start">
                <svg
                  className="w-6 h-6 text-accent mr-3 flex-shrink-0 mt-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div>
                  <strong className="text-text">Check your email</strong>
                  <p className="text-text/60">
                    We've sent you a confirmation with your account details
                  </p>
                </div>
              </li>
              <li className="flex items-start">
                <svg
                  className="w-6 h-6 text-accent mr-3 flex-shrink-0 mt-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div>
                  <strong className="text-text">Explore the editor</strong>
                  <p className="text-text/60">
                    Start building your first project with our powerful tools
                  </p>
                </div>
              </li>
              <li className="flex items-start">
                <svg
                  className="w-6 h-6 text-accent mr-3 flex-shrink-0 mt-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div>
                  <strong className="text-text">Join the community</strong>
                  <p className="text-text/60">
                    Connect with other developers and share your projects
                  </p>
                </div>
              </li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/editor" className="btn-primary">
              Go to Editor
            </Link>
            <Link to="/" className="btn-secondary">
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Success;

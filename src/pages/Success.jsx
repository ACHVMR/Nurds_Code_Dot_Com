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
            <div className="inline-flex items-center justify-center w-20 h-20 bg-nurd-green rounded-full mb-6">
              <svg
                className="w-12 h-12 text-white"
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
            <h1 className="text-4xl font-bold mb-4">
              Subscription Successful!
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              Welcome to Nurdscode! Your {plan} subscription is now active.
            </p>
          </div>

          <div className="bg-gray-700 rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-bold mb-4">What's Next?</h2>
            <ul className="text-left space-y-4">
              <li className="flex items-start">
                <svg
                  className="w-6 h-6 text-nurd-green mr-3 flex-shrink-0 mt-1"
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
                  <strong>Check your email</strong>
                  <p className="text-gray-400">
                    We've sent you a confirmation with your account details
                  </p>
                </div>
              </li>
              <li className="flex items-start">
                <svg
                  className="w-6 h-6 text-nurd-green mr-3 flex-shrink-0 mt-1"
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
                  <strong>Explore the editor</strong>
                  <p className="text-gray-400">
                    Start building your first project with our powerful tools
                  </p>
                </div>
              </li>
              <li className="flex items-start">
                <svg
                  className="w-6 h-6 text-nurd-green mr-3 flex-shrink-0 mt-1"
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
                  <strong>Join the community</strong>
                  <p className="text-gray-400">
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

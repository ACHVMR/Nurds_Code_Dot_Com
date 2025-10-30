import React from 'react';
import { Link } from 'react-router-dom';

function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-nurd-purple via-nurd-blue to-nurd-green bg-clip-text text-transparent">
              Welcome to Nurdscode
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
              The ACHIEVEMOR Coding Platform - Build, Learn, and Innovate with Powerful Tools
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/subscribe" className="btn-primary text-lg">
                Start Building Now
              </Link>
              <Link to="/pricing" className="btn-secondary text-lg">
                View Pricing
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-800/50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">
            Powerful Features for Modern Developers
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card text-center">
              <div className="text-4xl mb-4">🚀</div>
              <h3 className="text-2xl font-bold mb-4 text-nurd-purple">Lightning Fast</h3>
              <p className="text-gray-300">
                Built on Cloudflare's global network for unparalleled performance and reliability.
              </p>
            </div>
            <div className="card text-center">
              <div className="text-4xl mb-4">🔒</div>
              <h3 className="text-2xl font-bold mb-4 text-nurd-blue">Secure & Scalable</h3>
              <p className="text-gray-300">
                Enterprise-grade security with JWT authentication and D1 database integration.
              </p>
            </div>
            <div className="card text-center">
              <div className="text-4xl mb-4">💡</div>
              <h3 className="text-2xl font-bold mb-4 text-nurd-green">Developer-First</h3>
              <p className="text-gray-300">
                Intuitive interface and powerful tools designed for developers, by developers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Start Your Journey?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Join thousands of developers building the future with Nurdscode
          </p>
          <Link to="/subscribe" className="btn-primary text-lg">
            Get Started for Free
          </Link>
        </div>
      </section>
    </div>
  );
}

export default Home;

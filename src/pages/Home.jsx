import React from 'react';
import { Link } from 'react-router-dom';

function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="tagline mb-8">
              Think It. Prompt It. Build It.
            </h1>
            <p className="text-xl md:text-2xl text-text mb-12 max-w-3xl mx-auto">
              Build powerful applications with modern tools and workflows
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/subscribe" className="btn-primary text-lg px-8 py-4">
                Start Building Now
              </Link>
              <Link to="/pricing" className="btn-secondary text-lg px-8 py-4">
                View Pricing
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16 text-text">
            Powerful Features for Modern Developers
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card text-center">
              <div className="text-4xl mb-4">🚀</div>
              <h3 className="text-2xl font-bold mb-4 text-accent">Lightning Fast</h3>
              <p className="text-text">
                Built on Cloudflare's global network for unparalleled performance and reliability.
              </p>
            </div>
            <div className="card text-center">
              <div className="text-4xl mb-4">🔒</div>
              <h3 className="text-2xl font-bold mb-4 text-accent">Secure & Scalable</h3>
              <p className="text-text">
                Enterprise-grade security with authentication and D1 database integration.
              </p>
            </div>
            <div className="card text-center">
              <div className="text-4xl mb-4">💡</div>
              <h3 className="text-2xl font-bold mb-4 text-accent">Developer-First</h3>
              <p className="text-text">
                Intuitive interface and powerful tools designed for developers, by developers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6 text-text">
            Ready to Start Your Journey?
          </h2>
          <p className="text-xl text-text mb-8">
            Join developers building the future with Nurds Code
          </p>
          <Link to="/subscribe" className="btn-primary text-lg px-8 py-4">
            Get Started for Free
          </Link>
        </div>
      </section>
    </div>
  );
}

export default Home;

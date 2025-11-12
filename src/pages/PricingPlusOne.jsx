import React from 'react';
import { Link } from 'react-router-dom';

function PricingPlusOne() {
  return (
    <div className="min-h-screen py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">Plus One — Add Collaborators</h1>
        <p className="mb-6 text-text/70">Invite team members for $1/day. Progressive discounts apply for larger teams.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="text-center p-6 bg-[#1a1a1a] rounded-lg">
            <div className="text-4xl font-bold text-[#E68961] mb-2">$1/day</div>
            <div className="text-text/60">per collaborator</div>
          </div>
          <div className="text-center p-6 bg-[#1a1a1a] rounded-lg">
            <div className="text-4xl font-bold text-[#E68961] mb-2">50%</div>
            <div className="text-text/60">max discount (5 people)</div>
          </div>
          <div className="text-center p-6 bg-[#1a1a1a] rounded-lg">
            <div className="text-4xl font-bold text-[#E68961] mb-2">∞</div>
            <div className="text-text/60">unlimited projects</div>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">How it works</h2>
          <ol className="list-decimal list-inside text-text/70">
            <li>Click "Invite" to create a collaborator slot for $1/day.</li>
            <li>Assign the collaborator to a project.</li>
            <li>Billing is prorated daily and appears on your monthly invoice.</li>
          </ol>
        </div>

        <div className="flex gap-4">
          <Link to="/subscribe" className="btn-primary">Invite a collaborator</Link>
          <Link to="/pricing" className="btn-secondary">Back to Pricing</Link>
        </div>
      </div>
    </div>
  );
}

export default PricingPlusOne;

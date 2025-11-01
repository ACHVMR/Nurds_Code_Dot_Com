import React from 'react';
import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="bg-background border-t border-[#2a2a2a] mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Main Footer Content - Made In PLR + Branding */}
        <div className="flex flex-col items-center justify-center gap-4">
          {/* Centered Footer Branding */}
          <div className="flex items-center justify-center gap-4 md:gap-6">
            {/* Made In PLR Logo */}
            <img 
              src="/assets/logos/made-in-plr.svg" 
              alt="Made in PLR" 
              className="h-12 md:h-14 object-contain hover:opacity-80 transition-opacity"
            />
            
            {/* Divider */}
            <div className="h-8 w-px bg-gradient-to-b from-[#39FF14] to-transparent opacity-50"></div>
            
            {/* Nurds Code Branding */}
            <span className="text-text font-semibold text-sm md:text-base whitespace-nowrap">
              Nurds Code <span className="text-[#39FF14]">est. 2025</span>
            </span>
          </div>
        </div>

        {/* Copyright and Links */}
        <div className="mt-8 pt-8 border-t border-[#2a2a2a]">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {/* Column 1: Company */}
            <div>
              <h3 className="text-text font-semibold mb-3">Company</h3>
              <ul className="space-y-2 text-text/70 text-sm">
                <li><Link to="/" className="hover:text-text transition">Home</Link></li>
                <li><Link to="/pricing" className="hover:text-text transition">Pricing</Link></li>
                <li><a href="#" className="hover:text-text transition">About</a></li>
              </ul>
            </div>

            {/* Column 2: Product */}
            <div>
              <h3 className="text-text font-semibold mb-3">Product</h3>
              <ul className="space-y-2 text-text/70 text-sm">
                <li><Link to="/editor" className="hover:text-text transition">Editor</Link></li>
                <li><Link to="/agents" className="hover:text-text transition">Agent Builder</Link></li>
                <li><a href="#" className="hover:text-text transition">Documentation</a></li>
              </ul>
            </div>

            {/* Column 3: Legal */}
            <div>
              <h3 className="text-text font-semibold mb-3">Legal</h3>
              <ul className="space-y-2 text-text/70 text-sm">
                <li><a href="#" className="hover:text-text transition">Privacy</a></li>
                <li><a href="#" className="hover:text-text transition">Terms</a></li>
                <li><a href="#" className="hover:text-text transition">Contact</a></li>
              </ul>
            </div>
          </div>

          {/* Bottom Copyright */}
          <div className="text-center pt-6 border-t border-[#2a2a2a]">
            <p className="text-text/50 text-xs">
              &copy; {new Date().getFullYear()} Nurds Code. All rights reserved.
            </p>
            <p className="text-text/40 text-xs mt-2">
              Made with ❤️ for builders, by builders
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;

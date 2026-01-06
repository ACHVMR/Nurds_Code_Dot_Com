import React from 'react';
import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="bg-black/50 border-t border-white/10 mt-auto backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-center md:text-left">
            <p className="text-gray-400 text-sm font-medium">
              &copy; {new Date().getFullYear()} Nurds Code 
              <span className="mx-2 text-gray-600">|</span> 
              <span className="text-neon-green">Think It. Prompt It. Build It.</span>
            </p>
          </div>
          
          <div className="flex items-center gap-3 opacity-80 hover:opacity-100 transition-opacity">
            <span className="text-xs text-gray-500 uppercase tracking-widest font-bold">Powered by</span>
            <div className="bg-gradient-to-r from-orange-500 to-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg transform rotate-1">
              Made in PLR 🌴
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;

import React from 'react';
import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="bg-background border-t border-[#2a2a2a] mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <p className="text-text">&copy; {new Date().getFullYear()} Nurds Code | All rights reserved</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;

import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white shadow-md mt-auto">
      <div className="container mx-auto px-4 py-3 text-center text-gray-600">
        <p>&copy; {new Date().getFullYear()} Smart Food Planner. All Rights Reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;

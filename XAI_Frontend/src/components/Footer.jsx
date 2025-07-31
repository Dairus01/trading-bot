import React from "react";

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-1">
      <div className="px-4 flex justify-center items-center">
        {/* Copyright */}
        <div className="">
          <p className="text-xs">
            &copy; {new Date().getFullYear()} XAI. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

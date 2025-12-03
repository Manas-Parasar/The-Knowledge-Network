import React from "react";
import { Link } from "react-router-dom";
import logo from "../assets/The Knowledge Network.png";

const Footer = () => {
  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white shadow-2xl mx-6 md:mx-10 mb-6 md:mb-10 rounded-2xl overflow-hidden">
      <div className="w-full mx-auto px-4 md:px-8 max-w-7xl py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand Section */}
          <div className="md:col-span-2">
            <div className="flex items-center mb-4">
              <img
                src={logo}
                alt="The Knowledge Network Logo"
                className="h-8 w-8 mr-3"
              />
              <h3 className="text-xl font-bold text-accent">
                The Knowledge Network
              </h3>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed mb-4">
              Empowering minds, building futures. Connecting students, teachers,
              and communities to foster academic excellence and personal growth.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://www.instagram.com/theknowledgenetwork2025/"
                className="text-gray-400 hover:text-accent transition-colors duration-200"
                aria-label="Instagram"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">
              Quick Links
            </h4>
            <div className="space-y-3">
              <Link
                to="/"
                className="block text-gray-300 hover:text-accent transition-colors duration-200 text-sm"
              >
                Home
              </Link>
              <Link
                to="/schools"
                className="block text-gray-300 hover:text-accent transition-colors duration-20.2.0 text-sm"
              >
                Schools
              </Link>
              <Link
                to="/events"
                className="block text-gray-300 hover:text-accent transition-colors duration-200 text-sm"
              >
                Events
              </Link>
              <Link
                to="/donations"
                className="block text-gray-300 hover:text-accent transition-colors duration-200 text-sm"
              >
                Donate
              </Link>
            </div>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">
              Contact Us
            </h4>
            <div className="space-y-3">
              <div className="flex items-center text-gray-300 text-sm">
                <svg
                  className="w-4 h-4 mr-2 text-accent"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
                <a
                  href="mailto:theknowledgenetwork2025@gmail.com"
                  className="hover:text-accent transition-colors duration-200"
                >
                  theknowledgenetwork2025@gmail.com
                </a>
              </div>
              <div className="flex items-center text-gray-300 text-sm">
                <svg
                  className="w-4 h-4 mr-2 text-accent"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Available Online</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-700 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm mb-4 md:mb-0">
              © {new Date().getFullYear()} The Knowledge Network. All rights
              reserved.
            </p>
            <div className="flex space-x-6" />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

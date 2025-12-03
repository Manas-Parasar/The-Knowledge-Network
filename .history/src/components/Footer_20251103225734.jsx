import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-white/90 text-gray-900 shadow-lg rounded-2xl mx-6 md:mx-10 mb-6 md:mb-10">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold text-accent mb-4">
              Contact Us
            </h3>
            <div className="space-y-2">
              <p className="text-sm">
                <span className="font-medium">Email:</span>{" "}
                <a
                  href="mailto:theknowledgenetwork2025@gmail.com"
                  className="hover:text-accent transition-colors duration-200"
                >
                  theknowledgenetwork2025@gmail.com
                </a>
              </p>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold text-accent mb-4">
              Quick Links
            </h3>
            <div className="space-y-2">
              <Link
                to="/"
                className="block text-sm hover:text-accent transition-colors duration-200"
              >
                Home
              </Link>
              <Link
                to="/schools"
                className="block text-sm hover:text-accent transition-colors duration-200"
              >
                Schools
              </Link>
              <Link
                to="/events"
                className="block text-sm hover:text-accent transition-colors duration-200"
              >
                Events
              </Link>
              <Link
                to="/donations"
                className="block text-sm hover:text-accent transition-colors duration-200"
              >
                Donate
              </Link>
            </div>
          </div>

          {/* School Partnerships */}
          <div>
            <h3 className="text-lg font-semibold text-accent mb-4">
              School Partnerships
            </h3>
            <div className="space-y-2">
              <p className="text-sm">
                <a
                  href="#"
                  className="hover:text-accent transition-colors duration-200"
                >
                  Partnership Program
                </a>
              </p>
              <p className="text-sm">
                <a
                  href="#"
                  className="hover:text-accent transition-colors duration-200"
                >
                  Join Our Network
                </a>
              </p>
              <p className="text-sm">
                <a
                  href="#"
                  className="hover:text-accent transition-colors duration-200"
                >
                  School Resources
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-primary-300 mt-8 pt-8 text-center">
          <p className="text-sm text-gray-300">
            © {new Date().getFullYear()} The Knowledge Network. All rights
            reserved.
          </p>
          <div className="mt-2 space-x-4">
            <a
              href="#"
              className="text-xs text-gray-400 hover:text-accent transition-colors duration-200"
            >
              Privacy Policy
            </a>
            <a
              href="#"
              className="text-xs text-gray-400 hover:text-accent transition-colors duration-200"
            >
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

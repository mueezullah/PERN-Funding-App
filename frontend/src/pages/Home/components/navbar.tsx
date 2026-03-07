import { useState } from "react";
import { Menu, X, Wallet, ArrowRight } from "lucide-react";
import { Link, Navigate, useNavigate } from "react-router-dom";

export function Navbar({ isAuthenticated }: { isAuthenticated: boolean }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  // If user is already authenticated and somehow reaches here, redirect them
  const role = localStorage.getItem("role");
  const defaultTarget =
    role === "admin" ? "/admin/dashboard" : role === "user" ? "/feed" : "/";

  if (isAuthenticated) {
    return <Navigate to={defaultTarget} />;
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="bg-linear-to-br from-blue-600 to-purple-600 p-2 rounded-lg">
              <Wallet className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-semibold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              FundME
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <a
              href="#home"
              className="text-gray-700 hover:text-blue-600 transition-colors"
            >
              Home
            </a>
            <a
              href="#about"
              className="text-gray-700 hover:text-blue-600 transition-colors"
            >
              About
            </a>
            <a
              href="#campaigns"
              className="text-gray-700 hover:text-blue-600 transition-colors"
            >
              Campaigns
            </a>
            <a
              href="#how-it-works"
              className="text-gray-700 hover:text-blue-600 transition-colors"
            >
              How It Works
            </a>
            <a
              href="#contact"
              className="text-gray-700 hover:text-blue-600 transition-colors"
            >
              Contact
            </a>
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              to="/login"
              className="text-gray-600 hover:text-indigo-600 font-medium px-4 py-2 transition-colors rounded-lg hover:bg-indigo-50"
            >
              Log in
            </Link>
            <Link
              to="/signup"
              className="bg-indigo-600 text-white font-medium px-5 py-2 rounded-lg hover:bg-indigo-700 transition-all shadow-sm hover:shadow-md active:scale-95 flex items-center gap-2"
            >
              Sign up <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="w-6 h-6 text-gray-700" />
            ) : (
              <Menu className="w-6 h-6 text-gray-700" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="px-4 py-4 space-y-3">
            <a
              href="#home"
              className="block px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </a>
            <a
              href="#about"
              className="block px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              About
            </a>
            <a
              href="#campaigns"
              className="block px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Campaigns
            </a>
            <a
              href="#how-it-works"
              className="block px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              How It Works
            </a>
            <a
              href="#contact"
              className="block px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Contact
            </a>
            <div className="pt-3 space-y-2 border-t border-gray-200">
              <button
                onClick={() => navigate("/login")}
                className="w-full px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Login
              </button>
              <button
                onClick={() => navigate("/signup")}
                className="w-full bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Sign Up
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

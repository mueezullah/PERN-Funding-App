import { Link } from "react-router-dom";
import { ArrowRight, TrendingUp, Users, DollarSign } from "lucide-react";
import { ImageWithFallback } from "./images/ImageWithFallback";

export function Hero() {
  return (
    <section
      id="home"
      className="pt-24 pb-20 px-4 sm:px-6 lg:px-8 bg-linear-to-br from-blue-50 via-purple-50 to-white"
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="inline-block">
              <span className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm">
                🚀 The Future of Funding
              </span>
            </div>

            <h1 className="text-5xl lg:text-6xl leading-tight">
              Turn Your{" "}
              <span className="bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Ideas
              </span>{" "}
              Into Reality
            </h1>

            <p className="text-xl text-gray-600 leading-relaxed">
              Connect with investors who believe in your vision. Launch your
              campaign, raise funds, and bring your projects to life with
              FundFlow's premium platform.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/login"
                className="bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white cursor-pointer flex justify-center items-center gap-2 text-lg px-8 py-3 rounded-lg transition-all"
              >
                Start Your Campaign
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <Link
                to="/signup"
                className="text-lg px-8 py-3 border-2 border-gray-300 rounded-lg cursor-pointer hover:border-blue-600 hover:text-blue-600 transition-colors"
              >
                Explore Projects
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-gray-200">
              <div>
                <div className="flex items-center gap-2 text-blue-600 mb-1">
                  <DollarSign className="w-5 h-5" />
                  <span className="text-2xl">$50M+</span>
                </div>
                <p className="text-sm text-gray-600">Funds Raised</p>
              </div>
              <div>
                <div className="flex items-center gap-2 text-purple-600 mb-1">
                  <TrendingUp className="w-5 h-5" />
                  <span className="text-2xl">2,500+</span>
                </div>
                <p className="text-sm text-gray-600">Projects Funded</p>
              </div>
              <div>
                <div className="flex items-center gap-2 text-blue-600 mb-1">
                  <Users className="w-5 h-5" />
                  <span className="text-2xl">100K+</span>
                </div>
                <p className="text-sm text-gray-600">Active Users</p>
              </div>
            </div>
          </div>

          {/* Right Image */}
          <div className="relative">
            <div className="absolute inset-0 bg-linear-to-br from-blue-400 to-purple-400 rounded-3xl blur-3xl opacity-20"></div>
            <div className="relative rounded-3xl overflow-hidden shadow-2xl">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1761735486549-7a6a04e67061?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMHRlYW13b3JrJTIwZnVuZGluZyUyMGludmVzdG1lbnR8ZW58MXx8fHwxNzcyMTQwNjgxfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Business funding collaboration"
                className="w-full h-auto"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

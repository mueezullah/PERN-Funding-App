import { Link } from "react-router-dom";
import {
  ArrowRight,
  TrendingUp,
  Users,
  DollarSign,
  Clock,
  Sprout,
} from "lucide-react";

export function Hero() {
  return (
    <section id="home" className="pt-24 pb-20 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="inline-block">
              <span className="px-4 py-2 bg-blue-50 text-brand-deep rounded-full text-sm font-medium">
                🚀 The Future of Funding
              </span>
            </div>

            <h1 className="text-5xl lg:text-6xl leading-tight font-extrabold text-slate-900">
              Turn Your <span className="text-brand">Ideas</span> Into
              Reality
            </h1>

            <p className="text-xl text-slate-600 leading-relaxed">
              Connect with backers who believe in your vision. Launch your
              campaign, raise funds, and bring your projects to life with
              OnlyFunds' platform.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/login"
                className="bg-brand hover:bg-brand-deep text-white cursor-pointer flex justify-center items-center gap-2 text-lg px-8 py-3 rounded-full transition-all shadow-sm hover:shadow-md active:scale-95"
              >
                Start Your Campaign
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/signup"
                className="text-lg px-8 py-3 border-2 border-slate-300 rounded-full cursor-pointer hover:border-brand hover:text-brand text-slate-700 transition-colors text-center"
              >
                Explore Projects
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-slate-200">
              <div>
                <div className="flex items-center gap-2 text-slate-900 mb-1">
                  <div className="bg-blue-50 p-1.5 rounded-full">
                    <DollarSign className="w-4 h-4 text-brand" />
                  </div>
                  <span className="text-2xl font-bold">$50M+</span>
                </div>
                <p className="text-sm text-slate-600">Funds Raised</p>
              </div>
              <div>
                <div className="flex items-center gap-2 text-slate-900 mb-1">
                  <div className="bg-blue-50 p-1.5 rounded-full">
                    <TrendingUp className="w-4 h-4 text-brand" />
                  </div>
                  <span className="text-2xl font-bold">2,500+</span>
                </div>
                <p className="text-sm text-slate-600">Projects Funded</p>
              </div>
              <div>
                <div className="flex items-center gap-2 text-slate-900 mb-1">
                  <div className="bg-blue-50 p-1.5 rounded-full">
                    <Users className="w-4 h-4 text-brand" />
                  </div>
                  <span className="text-2xl font-bold">100K+</span>
                </div>
                <p className="text-sm text-slate-600">Active Users</p>
              </div>
            </div>
          </div>

          {/* Right: live campaign card mockup */}
          <div className="relative">
            <div className="absolute -inset-4 bg-blue-200 rounded-3xl blur-3xl opacity-30"></div>

            <div className="relative bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
              {/* Card header */}
              <div className="bg-brand-dark px-6 py-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-brand p-2 rounded-full">
                    <Sprout className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-white font-semibold leading-tight">
                      Solar Micro-Farms
                    </p>
                    <p className="text-slate-400 text-xs">
                      Clean Energy &middot; Kenya
                    </p>
                  </div>
                </div>
                <span className="text-xs font-medium text-brand bg-brand/10 px-3 py-1 rounded-full">
                  Featured
                </span>
              </div>

              {/* Card body */}
              <div className="p-6 space-y-5">
                <div>
                  <div className="flex items-end justify-between mb-2">
                    <span className="text-3xl font-extrabold text-slate-900">
                      $82,400
                    </span>
                    <span className="text-sm text-slate-500">
                      of $100,000 goal
                    </span>
                  </div>
                  <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full w-[82%] bg-brand rounded-full"></div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center -space-x-2">
                    <div className="w-8 h-8 rounded-full bg-blue-100 border-2 border-white flex items-center justify-center text-xs font-semibold text-blue-700">
                      AK
                    </div>
                    <div className="w-8 h-8 rounded-full bg-indigo-100 border-2 border-white flex items-center justify-center text-xs font-semibold text-indigo-700">
                      MR
                    </div>
                    <div className="w-8 h-8 rounded-full bg-blue-200 border-2 border-white flex items-center justify-center text-xs font-semibold text-blue-700">
                      +
                    </div>
                    <span className="pl-4 text-sm text-slate-600">
                      1,240 backers
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-slate-500">
                    <Clock className="w-4 h-4" />
                    12 days left
                  </div>
                </div>
              </div>
            </div>

            {/* Floating stat chip for depth */}
            <div className="hidden sm:flex absolute -bottom-6 -left-6 bg-white rounded-2xl shadow-xl border border-slate-200 px-5 py-3 items-center gap-3">
              <div className="bg-brand-dark p-2 rounded-full">
                <TrendingUp className="w-4 h-4 text-brand" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900 leading-tight">
                  98% success rate
                </p>
                <p className="text-xs text-slate-500">on funded campaigns</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
import React from "react";
import { Link, Navigate, Outlet } from "react-router-dom";
import { ArrowRight, Zap, Target, Users, ShieldCheck } from "lucide-react";

const Landing = ({ isAuthenticated }) => {
    // If user is already authenticated and somehow reaches here, redirect them
    const role = localStorage.getItem("role");
    const defaultTarget = role === "admin" ? "/admin/dashboard" : role === "user" ? "/feed" : "/";

    if (isAuthenticated) {
        return <Navigate to={defaultTarget} />;
    }

    return (
        <div className="min-h-screen font-sans bg-gray-50 flex flex-col">
            {/* Navigation / Header */}
            <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="bg-indigo-600 p-2 rounded-lg">
                            <Target className="text-white w-6 h-6" />
                        </div>
                        <span className="text-xl font-bold bg-gradient-to-r from-indigo-700 to-purple-600 bg-clip-text text-transparent">
                            FundME
                        </span>
                    </div>
                    <nav className="flex gap-4">
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
                    </nav>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-1">
                {/* Hero Section */}
                <section className="relative px-4 sm:px-6 lg:px-8 pb-24 pt-20 lg:pt-32 lg:pb-36 overflow-hidden">
                    {/* Background decorations */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-100 via-white to-white opacity-60"></div>
                    <div className="absolute top-20 -left-20 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
                    <div className="absolute top-40 -right-20 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
                    <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>


                    <div className="max-w-4xl mx-auto text-center">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-sm font-medium mb-8">
                            <Zap className="w-4 h-4" />
                            <span>The modern way to fund creativity.</span>
                        </div>

                        <h1 className="text-5xl lg:text-7xl font-extrabold text-gray-900 tracking-tight mb-8">
                            Fund the future. <br className="hidden sm:block" />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                                Build together.
                            </span>
                        </h1>

                        <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
                            Join thousands of creators and backers building the next generation of innovative projects. Secure, transparent, and community-driven funding.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                            <Link
                                to="/login"
                                className="w-full sm:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-indigo-500/30 transition-all transform hover:-translate-y-1"
                            >
                                Start a Project
                            </Link>
                            <Link
                                to="/login"
                                className="w-full sm:w-auto px-8 py-4 bg-white border-2 border-gray-200 hover:border-indigo-600 text-gray-700 hover:text-indigo-600 rounded-xl font-bold text-lg transition-all"
                            >
                                Discover Campaigns
                            </Link>
                        </div>

                        {/* Social Proof / Stats */}
                        <div className="mt-20 pt-10 border-t border-gray-200 grid grid-cols-2 md:grid-cols-4 gap-8">
                            {[
                                { label: "Active Creators", value: "10k+" },
                                { label: "Funds Raised", value: "$50M+" },
                                { label: "Projects Funded", value: "8,500+" },
                                { label: "Global Backers", value: "250k+" }
                            ].map((stat, i) => (
                                <div key={i} className="text-center">
                                    <h4 className="text-3xl font-black text-gray-900 mb-1">{stat.value}</h4>
                                    <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">{stat.label}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section className="bg-white py-24 px-4 sm:px-6 lg:px-8 border-t border-gray-100">
                    <div className="max-w-7xl mx-auto">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why choose FundME?</h2>
                            <p className="text-lg text-gray-600 max-w-2xl mx-auto">Everything you need to turn your big ideas into reality, backed by our supportive community.</p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-12">
                            {/* Feature 1 */}
                            <div className="group">
                                <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-600 transition-colors duration-300">
                                    <ShieldCheck className="w-7 h-7 text-blue-600 group-hover:text-white transition-colors duration-300" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">Secure Transactions</h3>
                                <p className="text-gray-600 leading-relaxed">Your funds are protected with enterprise-grade security. Backers support with confidence, creators receive funds reliably.</p>
                            </div>

                            {/* Feature 2 */}
                            <div className="group">
                                <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-purple-600 transition-colors duration-300">
                                    <Users className="w-7 h-7 text-purple-600 group-hover:text-white transition-colors duration-300" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">Community First</h3>
                                <p className="text-gray-600 leading-relaxed">Engage directly with your backers through our built-in social feed. Build a loyal following before you even launch.</p>
                            </div>

                            {/* Feature 3 */}
                            <div className="group">
                                <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-emerald-600 transition-colors duration-300">
                                    <Target className="w-7 h-7 text-emerald-600 group-hover:text-white transition-colors duration-300" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">Goal Tracking</h3>
                                <p className="text-gray-600 leading-relaxed">Set milestones, track progress transparently, and celebrate wins with intuitive project dashboards and analytics.</p>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="bg-gray-900 text-gray-400 py-10 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-2 text-white">
                        <Target className="w-6 h-6" />
                        <span className="text-xl font-bold">FundME</span>
                    </div>
                    <p>© {new Date().getFullYear()} FundME Inc. All rights reserved.</p>
                </div>
            </footer>

            {/* Render nested routes (Login/Signup modals) */}
            <Outlet />
        </div>
    );
};

export default Landing;

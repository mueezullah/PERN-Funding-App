import { Target, Shield, Zap, Heart, BadgeCheck, Lock, ShieldCheck } from 'lucide-react';

export function About() {
  const features = [
    {
      icon: <Target className="w-6 h-6" />,
      title: 'Goal-Oriented',
      description: 'Set clear funding goals and track your progress in real-time with our intuitive dashboard.',
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: 'Secure & Trusted',
      description: 'Bank-level security ensures your funds and data are always protected and encrypted.',
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: 'Fast Processing',
      description: 'Lightning-fast fund transfers and instant campaign approvals to get you started quickly.',
    },
    {
      icon: <Heart className="w-6 h-6" />,
      title: 'Community First',
      description: 'Join a supportive community of creators and backers who believe in making dreams happen.',
    }
  ];

  return (
    <section id="about" className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-blue-50 text-brand-deep border border-blue-100">
            About OnlyFunds
          </span>
          <h2 className="text-4xl lg:text-5xl mt-4 mb-6 font-extrabold text-slate-900 tracking-tight">
            Empowering Creators, <span className="text-brand">One Campaign at a Time</span>
          </h2>
          <p className="text-xl text-slate-600 leading-relaxed">
            We're revolutionizing the way ideas get funded. Our platform connects verified creators with passionate backers, making it easier than ever to bring innovative projects to life.
          </p>
        </div>

        {/* Content Grid */}
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
          {/* Trust panel */}
          <div className="order-2 lg:order-1 relative">
            <div className="absolute -inset-4 bg-brand/15 rounded-3xl blur-3xl opacity-40"></div>

            <div className="relative bg-brand-dark rounded-3xl shadow-2xl p-8 space-y-6 border border-slate-800">
              <div className="flex items-center gap-3">
                <div className="bg-brand p-2.5 rounded-full">
                  <ShieldCheck className="w-5 h-5 text-brand-dark" />
                </div>
                <div>
                  <p className="text-white font-semibold leading-tight">Verified Trust Layer</p>
                  <p className="text-slate-400 text-xs">Every campaign, checked and authenticated</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <BadgeCheck className="w-5 h-5 text-brand shrink-0 mt-0.5" />
                  <div>
                    <p className="text-white text-sm font-medium">Identity-verified creators</p>
                    <p className="text-slate-400 text-sm">Only KYC-approved users can launch and receive funding for a campaign.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Lock className="w-5 h-5 text-brand shrink-0 mt-0.5" />
                  <div>
                    <p className="text-white text-sm font-medium">Encrypted transactions</p>
                    <p className="text-slate-400 text-sm">Payments are processed securely end-to-end via Stripe.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-brand shrink-0 mt-0.5" />
                  <div>
                    <p className="text-white text-sm font-medium">Transparent fund tracking</p>
                    <p className="text-slate-400 text-sm">See real-time progress and milestone updates directly on the feed.</p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 grid grid-cols-3 gap-4">
                <div>
                  <p className="text-2xl font-extrabold text-brand">100%</p>
                  <p className="text-xs text-slate-400">KYC Verified</p>
                </div>
                <div>
                  <p className="text-2xl font-extrabold text-white">24/7</p>
                  <p className="text-xs text-slate-400">Fraud monitoring</p>
                </div>
                <div>
                  <p className="text-2xl font-extrabold text-white">256-bit</p>
                  <p className="text-xs text-slate-400">Encryption</p>
                </div>
              </div>
            </div>
          </div>

          <div className="order-1 lg:order-2 space-y-6">
            <h3 className="text-3xl font-bold text-slate-900 tracking-tight">Why Choose OnlyFunds?</h3>
            <p className="text-lg text-slate-600 leading-relaxed">
              Since our founding, we've been committed to democratizing access to funding. Whether you're launching a tech startup, creative project, or social enterprise, we provide the tools and community support you need to succeed.
            </p>
            <p className="text-lg text-slate-600 leading-relaxed">
              Our transparent fee structure, powerful analytics, social feed interactions, and dedicated support team ensure that you can focus on what matters most — bringing your vision to life.
            </p>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group p-6 rounded-2xl bg-slate-50 border border-slate-200 hover:border-brand/40 hover:bg-white hover:shadow-xl transition-all duration-300"
            >
              <div className="inline-flex p-3 rounded-xl bg-blue-50 text-brand mb-4 group-hover:bg-brand group-hover:text-white transition-all duration-300">
                {feature.icon}
              </div>
              <h4 className="text-xl font-bold text-slate-900 mb-2">{feature.title}</h4>
              <p className="text-slate-600 text-sm leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
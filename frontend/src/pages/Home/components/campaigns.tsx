import { useNavigate } from 'react-router-dom';
import { Clock, Users, TrendingUp } from 'lucide-react';
import { ImageWithFallback } from '../../../components/ImageWithFallback';

interface Campaign {
  id: number;
  title: string;
  description: string;
  image: string;
  raised: number;
  goal: number;
  backers: number;
  daysLeft: number;
  category: string;
}

export function Campaigns() {
  const navigate = useNavigate();
  const campaigns: Campaign[] = [
    {
      id: 1,
      title: 'Revolutionary AI Learning Platform',
      description: 'Transform education with personalized AI-powered learning experiences for students worldwide.',
      image: 'https://images.unsplash.com/photo-1763191213523-1489179a1088?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBvZmZpY2UlMjBjcmVhdGl2ZSUyMHdvcmtzcGFjZXxlbnwxfHx8fDE3NzIxMzc3MDF8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      raised: 245000,
      goal: 300000,
      backers: 1823,
      daysLeft: 15,
      category: 'Technology'
    },
    {
      id: 2,
      title: 'Sustainable Urban Garden Project',
      description: 'Building rooftop gardens in urban areas to promote sustainable living and community growth.',
      image: 'https://images.unsplash.com/photo-1758691736975-9f7f643d178e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkaXZlcnNlJTIwYnVzaW5lc3MlMjBwZW9wbGUlMjBtZWV0aW5nfGVufDF8fHx8MTc3MjAyOTAyOXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      raised: 87500,
      goal: 150000,
      backers: 542,
      daysLeft: 28,
      category: 'Environment'
    },
    {
      id: 3,
      title: 'Next-Gen Fitness Wearable',
      description: 'Advanced health monitoring device with real-time AI coaching and personalized workout plans.',
      image: 'https://images.unsplash.com/photo-1761735486549-7a6a04e67061?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMHRlYW13b3JrJTIwZnVuZGluZyUyMGludmVzdG1lbnR8ZW58MXx8fHwxNzcyMTQwNjgxfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      raised: 420000,
      goal: 500000,
      backers: 3156,
      daysLeft: 7,
      category: 'Health'
    }
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <section id="campaigns" className="py-24 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-blue-50 text-brand-deep border border-blue-100">
            Featured Campaigns
          </span>
          <h2 className="text-4xl lg:text-5xl mt-4 mb-6 font-extrabold text-slate-900 tracking-tight">
            Discover <span className="text-brand">Amazing Projects</span>
          </h2>
          <p className="text-xl text-slate-600 leading-relaxed">
            Support innovative ideas and be part of something extraordinary. Browse through our curated selection of trending campaigns.
          </p>
        </div>

        {/* Campaign Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {campaigns.map((campaign) => {
            const progressPercentage = (campaign.raised / campaign.goal) * 100;

            return (
              <div
                key={campaign.id}
                className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl border border-slate-200 transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between"
              >
                <div>
                  {/* Campaign Image */}
                  <div className="relative overflow-hidden h-52">
                    <ImageWithFallback
                      src={campaign.image}
                      alt={campaign.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 bg-brand-dark/85 backdrop-blur-md rounded-full text-xs font-semibold text-white shadow-sm">
                        {campaign.category}
                      </span>
                    </div>
                  </div>

                  {/* Campaign Content */}
                  <div className="p-6 space-y-4">
                    <h3 className="text-lg font-bold text-slate-900 line-clamp-2 group-hover:text-brand transition-colors">
                      {campaign.title}
                    </h3>
                    <p className="text-slate-600 text-sm line-clamp-2 leading-relaxed">
                      {campaign.description}
                    </p>

                    {/* Progress */}
                    <div className="space-y-2 pt-2">
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-brand h-2 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                        ></div>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-lg font-extrabold text-slate-900">
                          {formatCurrency(campaign.raised)}
                        </span>
                        <span className="text-xs text-slate-500">
                          of {formatCurrency(campaign.goal)}
                        </span>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                      <div className="flex items-center gap-1.5 text-xs text-slate-600">
                        <Users className="w-4 h-4 text-slate-400" />
                        <span>{campaign.backers.toLocaleString()} backers</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-600">
                        <Clock className="w-4 h-4 text-slate-400" />
                        <span>{campaign.daysLeft} days left</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-brand font-semibold">
                        <TrendingUp className="w-4 h-4" />
                        <span>{Math.round(progressPercentage)}%</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* CTA Button */}
                <div className="px-6 pb-6">
                  <button
                    onClick={() => navigate("/login")}
                    className="w-full bg-brand hover:bg-brand-deep text-white py-2.5 rounded-full transition-all font-semibold shadow-sm hover:shadow active:scale-95 text-sm"
                  >
                    Back This Project
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* View All Button */}
        <div className="text-center mt-12">
          <button
            onClick={() => navigate("/login")}
            className="text-base px-8 py-3 border-2 border-slate-300 rounded-full hover:border-brand hover:text-brand text-slate-700 transition-colors font-semibold"
          >
            View All Campaigns
          </button>
        </div>
      </div>
    </section>
  );
}
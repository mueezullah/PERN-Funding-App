import { useNavigate } from 'react-router-dom';
import { Clock, Users, TrendingUp } from 'lucide-react';
import { ImageWithFallback } from '../components/imageFallback/ImageWithFallback';

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
  const campaigns= [
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
    <section id="campaigns" className="py-24 px-4 sm:px-6 lg:px-8 bg-linear-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-blue-600 text-sm uppercase tracking-wider">Featured Campaigns</span>
          <h2 className="text-4xl lg:text-5xl mt-3 mb-6">
            Discover <span className="bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Amazing Projects</span>
          </h2>
          <p className="text-xl text-gray-600">
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
                className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
              >
                {/* Campaign Image */}
                <div className="relative overflow-hidden h-56">
                  <ImageWithFallback
                    src={campaign.image}
                    alt={campaign.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-sm">
                      {campaign.category}
                    </span>
                  </div>
                </div>

                {/* Campaign Content */}
                <div className="p-6 space-y-4">
                  <h3 className="text-xl line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {campaign.title}
                  </h3>
                  <p className="text-gray-600 text-sm line-clamp-2">
                    {campaign.description}
                  </p>

                  {/* Progress */}
                  <div className="space-y-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                      ></div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-xl bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        {formatCurrency(campaign.raised)}
                      </span>
                      <span className="text-gray-500">
                        of {formatCurrency(campaign.goal)}
                      </span>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Users className="w-4 h-4" />
                      <span>{campaign.backers.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span>{campaign.daysLeft} days left</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-blue-600">
                      <TrendingUp className="w-4 h-4" />
                      <span>{Math.round(progressPercentage)}%</span>
                    </div>
                  </div>

                  {/* CTA Button */}
                  <button onClick={() => navigate("/login")} className="w-full bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 rounded-lg transition-all font-medium">
                    Back This Project
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* View All Button */}
        <div className="text-center mt-12">
          <button onClick={() => navigate("/login")} className="text-lg px-8 py-3 border-2 border-gray-300 rounded-lg hover:border-blue-600 hover:text-blue-600 transition-colors font-medium">
            View All Campaigns
          </button>
        </div>
      </div>
    </section>
  );
}

import { Target, Shield, Zap, Heart } from 'lucide-react';
import { ImageWithFallback } from '../components/imageFallback/ImageWithFallback';

export function About() {
  const features = [
    {
      icon: <Target className="w-6 h-6" />,
      title: 'Goal-Oriented',
      description: 'Set clear funding goals and track your progress in real-time with our intuitive dashboard.',
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: 'Secure & Trusted',
      description: 'Bank-level security ensures your funds and data are always protected and encrypted.',
      color: 'from-purple-500 to-purple-600'
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: 'Fast Processing',
      description: 'Lightning-fast fund transfers and instant campaign approvals to get you started quickly.',
      color: 'from-blue-500 to-purple-600'
    },
    {
      icon: <Heart className="w-6 h-6" />,
      title: 'Community First',
      description: 'Join a supportive community of creators and backers who believe in making dreams happen.',
      color: 'from-purple-500 to-pink-600'
    }
  ];

  return (
    <section id="about" className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-blue-600 text-sm uppercase tracking-wider">About FundFlow</span>
          <h2 className="text-4xl lg:text-5xl mt-3 mb-6">
            Empowering Creators, <span className="bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">One Campaign at a Time</span>
          </h2>
          <p className="text-xl text-gray-600">
            We're revolutionizing the way ideas get funded. Our platform connects visionary creators with passionate backers, making it easier than ever to bring innovative projects to life.
          </p>
        </div>

        {/* Content Grid */}
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
          <div className="order-2 lg:order-1">
            <div className="rounded-3xl overflow-hidden shadow-2xl">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1758873272353-2ed038aa4ff9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdGFydHVwJTIwZW50cmVwcmVuZXVyJTIwc3VjY2VzcyUyMGNlbGVicmF0aW9ufGVufDF8fHx8MTc3MjE0MDY4MXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Startup success celebration"
                className="w-full h-auto"
              />
            </div>
          </div>

          <div className="order-1 lg:order-2 space-y-6">
            <h3 className="text-3xl">Why Choose FundFlow?</h3>
            <p className="text-lg text-gray-600">
              Since our founding, we've been committed to democratizing access to funding. Whether you're launching a tech startup, creative project, or social enterprise, we provide the tools and community support you need to succeed.
            </p>
            <p className="text-lg text-gray-600">
              Our transparent fee structure, powerful analytics, and dedicated support team ensure that you can focus on what matters most – bringing your vision to life.
            </p>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group p-6 rounded-2xl bg-linear-to-br from-gray-50 to-white border border-gray-200 hover:border-blue-300 hover:shadow-xl transition-all duration-300"
            >
              <div className={`inline-flex p-3 rounded-xl bg-linear-to-br ${feature.color} text-white mb-4 group-hover:scale-110 transition-transform duration-300`}>
                {feature.icon}
              </div>
              <h4 className="text-xl mb-2">{feature.title}</h4>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

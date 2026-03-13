import React from 'react';
import { TrendingUp, UserPlus, Heart, BarChart3, ChevronRight } from 'lucide-react';
import { ImageWithFallback } from './ImageFallback/ImageWithFallback';

export function RightSidebar() {
  const trending = [
    { id: 1, title: 'Clean Water Initiative', context: '12.4k raised • Environment' },
    { id: 2, title: 'Tech for Public Schools', context: '8.2k raised • Education' },
    { id: 3, title: 'Disaster Relief Fund', context: '89k raised • Emergency' },
  ];

  const suggested = [
    { id: 1, name: 'Sarah Jenkins', role: 'Community Leader', image: 'https://images.unsplash.com/photo-1649589244330-09ca58e4fa64?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjB3b21hbiUyMHBvcnRyYWl0fGVufDF8fHx8MTc3MjgzMjIyNXww&ixlib=rb-4.1.0&q=80&w=1080' },
    { id: 2, name: 'David Chen', role: 'Philanthropist', image: 'https://images.unsplash.com/flagged/photo-1596479042555-9265a7fa7983?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b3VuZyUyMG1hbiUyMHBvcnRyYWl0fGVufDF8fHx8MTc3MjkxMzU3NHww&ixlib=rb-4.1.0&q=80&w=1080' },
  ];

  return (
    <div className="w-full py-8 pr-4 flex flex-col space-y-6">
      
      {/* Analytics Card */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200/60 transition-shadow">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-50/50 rounded-xl text-indigo-600 border border-indigo-100">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-[15px] text-slate-900 tracking-tight">Your Impact</h3>
          </div>
          <button className="text-slate-400 hover:text-indigo-600 transition-colors"><ChevronRight className="w-4 h-4" /></button>
        </div>
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="font-medium text-slate-500">Total Donated</span>
              <span className="font-bold text-slate-900">$1,450</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-500 to-violet-500 h-full rounded-full" style={{ width: '65%' }}></div>
            </div>
          </div>
        </div>        
      </div>

      {/* Trending */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200/60 transition-shadow">
        <div className="flex items-center space-x-2 mb-5">
          <TrendingUp className="w-5 h-5 text-indigo-500" />
          <h3 className="font-bold text-[15px] text-slate-900 tracking-tight">Trending</h3>
        </div>
        <div className="space-y-5">
          {trending.map((item) => (
            <div key={item.id} className="group cursor-pointer">
              <p className="font-semibold text-[14px] text-slate-900 group-hover:text-indigo-600 transition-colors leading-tight mb-1">{item.title}</p>
              <p className="text-[13px] font-medium text-slate-500">{item.context}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200/60 transition-shadow">
        <div className="flex items-center space-x-2 mb-5">
          <TrendingUp className="w-5 h-5 text-indigo-500" />
          <h3 className="font-bold text-[15px] text-slate-900 tracking-tight">Trending</h3>
        </div>
        <div className="space-y-5">
          {trending.map((item) => (
            <div key={item.id} className="group cursor-pointer">
              <p className="font-semibold text-[14px] text-slate-900 group-hover:text-indigo-600 transition-colors leading-tight mb-1">{item.title}</p>
              <p className="text-[13px] font-medium text-slate-500">{item.context}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Suggested Users */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200/60 transition-shadow">
        <div className="flex items-center space-x-2 mb-5">
          <UserPlus className="w-5 h-5 text-indigo-500" />
          <h3 className="font-bold text-[15px] text-slate-900 tracking-tight">Who to follow</h3>
        </div>
        <div className="space-y-5">
          {suggested.map((user) => (
            <div key={user.id} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <ImageWithFallback src={user.image} alt={user.name} className="w-10 h-10 rounded-full object-cover border border-slate-200" />
                <div>
                  <p className="font-bold text-[14px] text-slate-900 leading-tight hover:underline cursor-pointer">{user.name}</p>
                  <p className="text-[12px] font-medium text-slate-500">{user.role}</p>
                </div>
              </div>
              <button className="text-[13px] font-bold text-slate-900 hover:text-white bg-slate-100 hover:bg-slate-900 px-4 py-1.5 rounded-full transition-colors border border-transparent">
                Follow
              </button>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
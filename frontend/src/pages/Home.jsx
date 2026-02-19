// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { handleError, handleSuccess } from "../utils";
// import { ToastContainer } from "react-toastify";

// const Home = () => {
//   const navigate = useNavigate();
//   const [loggedInUser] = useState(localStorage.getItem("loggedInUser"));
//   const [role] = useState(localStorage.getItem("role"));

//   const handleLogout = () => {
//     localStorage.removeItem("token");
//     localStorage.removeItem("loggedInUser");
//     localStorage.removeItem("role");
//     handleSuccess("User LoggedOut Successfully!");
//     setTimeout(() => {
//       navigate("/login");
//     }, 1000);
//   };

//   return (
//     <div className="flex justify-center items-center h-full w-full min-h-screen flex-col">
//       HOME PAGE
//       <h1>User Name: {loggedInUser}</h1>
//       <h2>User Role: {role}</h2>

//       <button onClick={handleLogout} className="bg-[#1877f2] border-0 text-xl text-white rounded-md px-2 py-2.5 cursor-pointer my-2.5">Logout</button>
//       <ToastContainer></ToastContainer>
//     </div>
//   );
// };

// export default Home;

import React, { useState } from 'react';
import {
  Heart,
  MessageCircle,
  Share2,
  MoreHorizontal,
  Image as ImageIcon,
  Link as LinkIcon,
  Send,
  TrendingUp,
  BadgeCheck
} from 'lucide-react';

// --- MOCK DATA ---
const currentUserId = 'user-123'; // Simulate logged-in user

const mockPosts = [
  {
    id: 'post-1',
    user: {
      id: 'u1',
      name: 'Sarah Jenkins',
      username: '@sarah_creates',
      role: 'creator', // creator | backer | user
      avatarBg: 'bg-purple-500',
    },
    timestamp: '2h ago',
    content: "Just posted a major update to our 'Sustainable Water' project! We've successfully secured the initial materials and are starting construction next week. Huge thanks to everyone who has backed us so far! 💙",
    // This post is linked directly to a campaign
    linkedCampaign: {
      id: 'c1',
      title: 'Clean Water for Rural Village',
      imageUrl: 'https://picsum.photos/seed/water/400/200', // Placeholder image
      raised: 12500,
      goal: 20000,
    },
    stats: { likes: 142, comments: 24, shares: 5 },
    likedByUser: true,
  },
  {
    id: 'post-2',
    user: {
      id: 'u2',
      name: 'Alex Chen',
      username: '@achen_invest',
      role: 'backer',
      avatarBg: 'bg-blue-500',
    },
    timestamp: '5h ago',
    content: "I've been browsing the 'Tech Innovation' category today. So many incredible ideas. Just put some funds towards the new AI educational tool. Really hoping it hits its goal!",
    // Standard post, no linked campaign
    linkedCampaign: null,
    stats: { likes: 45, comments: 8, shares: 1 },
    likedByUser: false,
  },
  {
    id: 'post-3',
    user: {
      id: 'u3',
      name: 'Community Garden Initiative',
      username: '@city_greens',
      role: 'creator',
      avatarBg: 'bg-green-600',
    },
    timestamp: '1d ago',
    content: "We are 80% funded! Only 3 days left to reach our goal to buy the new greenhouse equipment. Please share if you can!",
    linkedCampaign: {
      id: 'c2',
      title: 'Urban Community Greenhouse',
      imageUrl: null, // No image constraint check
      raised: 8000,
      goal: 10000,
    },
    stats: { likes: 320, comments: 56, shares: 89 },
    likedByUser: false,
  },
];

// --- HELPER: Progress Bar Component ---
const ProgressBar = ({ raised, goal }) => {
  const percentage = Math.min(Math.round((raised / goal) * 100), 100);
  return (
    <div className="mt-2">
      <div className="flex justify-between text-xs mb-1">
        <span className="font-semibold text-indigo-700">${raised.toLocaleString()} raised</span>
        <span className="text-gray-500">of ${goal.toLocaleString()}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div
          className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500"
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
      <div className="text-right text-xs text-gray-500 mt-1">{percentage}% funded</div>
    </div>
  );
};


// --- HELPER: Individual Post Card Component ---
const PostCard = ({ post }) => {
  // Local state for immediate UI feedback (like toggling)
  const [isLiked, setIsLiked] = useState(post.likedByUser);
  const [likeCount, setLikeCount] = useState(post.stats.likes);

  const handleLikeToggle = () => {
    // In real app: API call here
    setIsLiked(!isLiked);
    setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
  };

  const roleBadgeColor =
    post.user.role === 'creator' ? 'text-purple-700 bg-purple-100' :
      post.user.role === 'backer' ? 'text-blue-700 bg-blue-100' : 'text-gray-700 bg-gray-100';

  return (
    <article className="bg-white border-b border-gray-200 p-4 hover:bg-gray-50 transition-colors duration-150">
      <div className="flex space-x-3">
        {/* Left: Avatar */}
        <div className="flex-shrink-0">
          <div className={`h-10 w-10 rounded-full flex items-center justify-center text-white font-bold ${post.user.avatarBg}`}>
            {post.user.name.charAt(0)}
          </div>
        </div>

        {/* Right: Content Body */}
        <div className="flex-1 min-w-0">
          {/* Header: Name, Username, Time, Options */}
          <div className="flex items-center justify-between">
            <div className="flex items-center flex-wrap truncate">
              <span className="text-sm font-bold text-gray-900 mr-1 truncate">{post.user.name}</span>
              {post.user.role !== 'user' && (
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium mr-2 capitalize ${roleBadgeColor}`}>
                  {post.user.role === 'creator' && <BadgeCheck className="w-3 h-3 mr-1" />}
                  {post.user.role}
                </span>
              )}
              <span className="text-sm text-gray-500 truncate">{post.user.username}</span>
              <span className="text-gray-400 mx-1">·</span>
              <span className="text-sm text-gray-500 flex-shrink-0">{post.timestamp}</span>
            </div>
            <button className="text-gray-400 hover:text-gray-600 rounded-full p-1 hover:bg-gray-100">
              <MoreHorizontal className="h-5 w-5" />
            </button>
          </div>

          {/* Post Text Content */}
          <p className="mt-2 text-gray-900 text-[15px] leading-normal whitespace-pre-line">
            {post.content}
          </p>

          {/* --- THE "FUNDING TWIST" --- */}
          {/* Embedded Campaign Card if linked */}
          {post.linkedCampaign && (
            <div className="mt-3 border border-gray-200 rounded-xl overflow-hidden bg-gray-50 hover:border-indigo-300 transition-colors cursor-pointer">
              {post.linkedCampaign.imageUrl && (
                <div className="h-32 w-full overflow-hidden relative">
                  <img src={post.linkedCampaign.imageUrl} alt={post.linkedCampaign.title} className="w-full h-full object-cover" />
                  <div className="absolute top-2 right-2 bg-indigo-600 text-white text-xs px-2 py-1 rounded-full flex items-center">
                    <TrendingUp className="w-3 h-3 mr-1" /> Campaign
                  </div>
                </div>
              )}
              <div className="p-3">
                {!post.linkedCampaign.imageUrl && (
                  <div className="flex items-center text-indigo-600 text-xs font-semibold mb-2">
                    <TrendingUp className="w-3 h-3 mr-1" /> Linked Campaign
                  </div>
                )}
                <h4 className="font-bold text-gray-900">{post.linkedCampaign.title}</h4>
                <ProgressBar raised={post.linkedCampaign.raised} goal={post.linkedCampaign.goal} />
                <button className="mt-3 w-full py-1.5 bg-white border border-indigo-600 text-indigo-600 text-sm font-medium rounded-md hover:bg-indigo-50">
                  View Campaign
                </button>
              </div>
            </div>
          )}

          {/* Interaction Icons Bar */}
          <div className="mt-4 flex items-center justify-between max-w-md">
            <button
              onClick={handleLikeToggle}
              className={`flex items-center group transition-colors ${isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'}`}
            >
              <div className={`p-2 rounded-full group-hover:bg-red-50 transition-colors`}>
                <Heart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
              </div>
              {likeCount > 0 && <span className="text-sm ml-1">{likeCount}</span>}
            </button>

            <button className="flex items-center group text-gray-500 hover:text-blue-500 transition-colors">
              <div className="p-2 rounded-full group-hover:bg-blue-50 transition-colors">
                <MessageCircle className="h-5 w-5" />
              </div>
              {post.stats.comments > 0 && <span className="text-sm ml-1">{post.stats.comments}</span>}
            </button>

            <button className="flex items-center group text-gray-500 hover:text-green-500 transition-colors">
              <div className="p-2 rounded-full group-hover:bg-green-50 transition-colors">
                <Share2 className="h-5 w-5" />
              </div>
            </button>

            {/* Spacer for alignment */}
            <div className="w-5"></div>
          </div>
        </div>
      </div>
    </article>
  );
};


// --- MAIN COMPONENT: Social Feed Container ---
const SocialFeed = () => {
  const [postText, setPostText] = useState('');

  return (
    <div className="bg-gray-100 min-h-screen font-sans">
      {/* Top Nav - Simplified for feed view */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-200 px-4 py-3 sm:hidden">
        <h1 className="text-xl font-bold text-gray-900">Community Feed</h1>
      </div>

      <main className="max-w-2xl mx-auto sm:pt-4 pb-20">

        {/* 1. CREATE POST WIDGET */}
        <div className="bg-white sm:rounded-xl shadow-sm border border-gray-200 mb-4 overflow-hidden">
          <div className="p-4 flex space-x-4">
            <div className="flex-shrink-0">
              {/* Current User Avatar Placeholder */}
              <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-bold">
                ME
              </div>
            </div>
            <div className="flex-1">
              <textarea
                rows={2}
                className="block w-full border-transparent resize-none focus:ring-0 focus:border-transparent p-0 text-gray-900 placeholder-gray-400 text-lg"
                placeholder="What's happening in funding?"
                value={postText}
                onChange={(e) => setPostText(e.target.value)}
              />
            </div>
          </div>
          {/* Create Post Actions/Footer */}
          <div className="bg-gray-50 p-2 px-4 flex items-center justify-between border-t border-gray-100">
            <div className="flex space-x-2 text-indigo-600">
              <button className="p-2 hover:bg-indigo-100 rounded-full transition-colors">
                <ImageIcon className="h-5 w-5" />
              </button>
              <button className="p-2 hover:bg-indigo-100 rounded-full transition-colors">
                <LinkIcon className="h-5 w-5" />
              </button>
            </div>
            <button
              disabled={!postText.trim()}
              className={`inline-flex items-center px-4 py-1.5 border border-transparent text-sm font-bold rounded-full shadow-sm text-white 
                ${postText.trim() ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-indigo-300 cursor-not-allowed'}`}
            >
              <Send className="h-4 w-4 mr-2 sm:hidden" />
              <span className="hidden sm:inline">Post Update</span>
              <span className="sm:hidden">Post</span>
            </button>
          </div>
        </div>

        {/* 2. THE FEED LIST */}
        <div className="bg-white sm:rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {mockPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}

          {/* End of feed indicator */}
          <div className="p-6 text-center text-gray-500 text-sm">
            Caught up on all updates!
          </div>
        </div>
      </main>
    </div>
  );
};

export default SocialFeed;
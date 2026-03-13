import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import { FeedCard } from "./FeedCard";
import { Sparkles, Image as ImageIcon } from "lucide-react";

const generateMockPosts = (page: number) => [
  {
    id: `post-${page}-1`,
    type: "campaign" as const,
    user: {
      name: "Eleanor Martinez",
      avatar:
        "https://images.unsplash.com/photo-1672462478040-a5920e2c23d8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzbWlsaW5nJTIwcGVyc29uJTIwcG9ydHJhaXR8ZW58MXx8fHwxNzcyODY2OTYzfDA&ixlib=rb-4.1.0&q=80&w=1080",
      role: "Organizer",
      time: "2h ago",
    },
    content: {
      title:
        "Help us rebuild the community center after the storm",
      description:
        "The recent storm completely destroyed the roof of our local community center. This space has been vital for after-school programs and senior gatherings. We need your help to restore it quickly before winter sets in.",
      image:
        "https://images.unsplash.com/photo-1628243989859-db92e2de1340?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb21tdW5pdHklMjBnYXJkZW4lMjB2b2x1bnRlZXJzfGVufDF8fHx8MTc3MjgwODEyNXww&ixlib=rb-4.1.0&q=80&w=1080",
    },
    stats: {
      likes: 342,
      comments: 56,
      raised: 45000,
      goal: 100000,
    },
  },
  {
    id: `post-${page}-2`,
    type: "post" as const,
    user: {
      name: "Dr. James Wilson",
      avatar:
        "https://images.unsplash.com/flagged/photo-1596479042555-9265a7fa7983?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b3VuZyUyMG1hbiUyMHBvcnRyYWl0fGVufDF8fHx8MTc3MjkxMzU3NHww&ixlib=rb-4.1.0&q=80&w=1080",
      role: "Medical Professional",
      time: "5h ago",
    },
    content: {
      description:
        "Just completed another successful rural clinic drop-off! 🚐💉 It's amazing what we can achieve when we come together. Huge thanks to everyone who supported the previous campaign. Thread below on how these supplies are making an immediate impact. 👇",
    },
    stats: {
      likes: 890,
      comments: 124,
    },
  },
  {
    id: `post-${page}-3`,
    type: "campaign" as const,
    user: {
      name: "Tech for Good Org",
      avatar:
        "https://images.unsplash.com/photo-1649589244330-09ca58e4fa64?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjB3b21hbiUyMHBvcnRyYWl0fGVufDF8fHx8MTc3MjgzMjIyNXww&ixlib=rb-4.1.0&q=80&w=1080",
      role: "Non-profit",
      time: "1d ago",
    },
    content: {
      title: "Laptops for underprivileged high school seniors",
      description:
        "Every student deserves an equal opportunity to succeed. We are purchasing 100 refurbished laptops for graduating seniors in our district to help them prepare for college applications and future careers.",
      image:
        "https://images.unsplash.com/photo-1702468049239-49fd1cf99d20?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdGFydHVwJTIwb2ZmaWNlJTIwdGVhbXxlbnwxfHx8fDE3NzI5MDA2Mzh8MA&ixlib=rb-4.1.0&q=80&w=1080",
    },
    stats: {
      likes: 1205,
      comments: 203,
      raised: 28000,
      goal: 30000,
    },
  },
  {
    id: `post-${page}-4`,
    type: "post" as const,
    user: {
      name: "Sarah Jenkins",
      avatar:
        "https://images.unsplash.com/photo-1649589244330-09ca58e4fa64?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjB3b21hbiUyMHBvcnRyYWl0fGVufDF8fHx8MTc3MjgzMjIyNXww&ixlib=rb-4.1.0&q=80&w=1080",
      role: "Community Leader",
      time: "1d ago",
    },
    content: {
      title:
        "5 Ways to support local causes without spending a dime",
      description:
        "Not everyone has the means to donate financially, and that's okay! Here are 5 impactful ways you can help your community today:\n\n1. Volunteer your time or skills.\n2. Share active campaigns on your social media.\n3. Organize a local clean-up with neighbors.\n4. Write encouraging notes to those in need.\n5. Offer to mentor or tutor young students.",
    },
    stats: {
      likes: 3410,
      comments: 412,
    },
  },
];

export function Feed() {
  const [posts, setPosts] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);

  const observer = useRef<IntersectionObserver | null>(null);

  const lastPostElementRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prevPage) => prevPage + 1);
        }
      });

      if (node) observer.current.observe(node);
    },
    [loading, hasMore],
  );

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      const newPosts = generateMockPosts(page);
      setPosts((prev) => [...prev, ...newPosts]);
      setHasMore(page < 5);
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [page]);

  return (
    <div className="w-full max-w-[800px] mx-auto min-h-screen py-8 pr-4 pl-4 sm:pl-4 sm:pr-4">
      {/* Create Post Area */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200/60 p-5 mb-8">
        <div className="flex items-center space-x-4 mb-4">
          <div className="w-11 h-11 rounded-full bg-slate-100 flex-shrink-0 border border-slate-200 overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1672462478040-a5920e2c23d8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzbWlsaW5nJTIwcGVyc29uJTIwcG9ydHJhaXR8ZW58MXx8fHwxNzcyODY2OTYzfDA&ixlib=rb-4.1.0&q=80&w=1080"
              alt="Me"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1">
            <input
              type="text"
              placeholder="Start a new campaign, post, or thread..."
              className="w-full bg-transparent text-slate-900 placeholder-slate-400 font-medium focus:outline-none text-[16px]"
            />
          </div>
        </div>
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <div className="flex items-center space-x-2">
            <button className="flex items-center space-x-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 px-3 py-1.5 rounded-full transition-colors">
              <ImageIcon className="w-4 h-4" />
              <span className="text-[13px] font-semibold">
                Media
              </span>
            </button>
            <button className="flex items-center space-x-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 px-3 py-1.5 rounded-full transition-colors">
              <Sparkles className="w-4 h-4" />
              <span className="text-[13px] font-semibold">
                Campaign
              </span>
            </button>
          </div>
          <button className="px-5 py-1.5 bg-slate-900 text-white text-[13px] font-bold rounded-full hover:bg-slate-800 transition-colors">
            Post
          </button>
        </div>
      </div>

      {/* Feed Posts */}
      {posts.map((post, index) => {
        if (posts.length === index + 1) {
          return (
            <div ref={lastPostElementRef} key={post.id}>
              <FeedCard {...post} />
            </div>
          );
        } else {
          return <FeedCard key={post.id} {...post} />;
        }
      })}

      {/* Loading Skeletons */}
      {loading && (
        <div className="space-y-6 animate-pulse">
          {[1, 2].map((i) => (
            <div
              key={`skeleton-${i}`}
              className="bg-white rounded-3xl shadow-sm border border-slate-200/60 p-6"
            >
              <div className="flex items-center space-x-3 mb-5">
                <div className="w-12 h-12 rounded-full bg-slate-100"></div>
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-slate-100 rounded-md w-1/4"></div>
                  <div className="h-3 bg-slate-100 rounded-md w-1/5"></div>
                </div>
              </div>
              <div className="space-y-3 mb-5">
                <div className="h-5 bg-slate-100 rounded-md w-3/4"></div>
                <div className="h-4 bg-slate-100 rounded-md w-full"></div>
                <div className="h-4 bg-slate-100 rounded-md w-5/6"></div>
              </div>
              <div className="h-64 bg-slate-100 rounded-2xl mb-4"></div>
            </div>
          ))}
        </div>
      )}

      {!hasMore && (
        <div className="text-center py-8 text-slate-400 font-medium text-[15px]">
          You've caught up on all updates!
        </div>
      )}
    </div>
  );
}
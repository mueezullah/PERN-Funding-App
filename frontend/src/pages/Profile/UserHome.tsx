import React from 'react';
import { Feed } from '../Feed/components/Feed';
import { RightSidebar } from '../Feed/components/RightSidebar';

export function HomeView() {
  return (
    <div className="w-full max-w-[1100px] mx-auto flex gap-8">
      <div className="flex-1">
        <Feed />
      </div>
      <div className="hidden xl:block w-[300px] shrink-0">
        <RightSidebar />
      </div>
    </div>
  );
}
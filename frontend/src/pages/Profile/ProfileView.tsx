import React from "react";
import { ProfileFeed } from "./ProfileFeed";
import { ProfileRightSidebar } from "./RightCard";
import { useParams } from "react-router";

export function ProfileView() {
  const { username } = useParams<{ username: string }>();

  // Pass username to ProfileFeed if needed in the future
  return (
    <div className="w-full max-w-[1100px] mx-auto flex gap-8">
      <div className="flex-1">
        <ProfileFeed username={username} />
      </div>
      <div className="hidden xl:block w-[300px] shrink-0">
        <ProfileRightSidebar username={username} />
      </div>
    </div>
  );
}

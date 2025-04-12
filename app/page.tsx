// app/page.tsx or pages/page.tsx

"use client";

import { useState } from "react";
import Sidebar from "@/components/sidebar";
import Header from "@/components/header";
import SendFriendRequest from "@/components/modal/sendFriendRequest"; // Import the SendFriendRequest component

export default function Page() {
  const [userId, setUserId] = useState<string | null>(null); // Store the user ID
  const [accessToken, setAccessToken] = useState<string | null>(null); // Store the access token
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Track login state

  return (
    <div className="flex">
      {/* Sidebar column */}
      <Sidebar
        userId={userId}
        accessToken={accessToken}
        setUserId={setUserId}
        setIsLoggedIn={setIsLoggedIn}
      />
      {/* Main content column */}
      <div className="flex-1 flex flex-col">
        <Header
          userId={userId}
          accessToken={accessToken}
          setUserId={setUserId}
          setIsLoggedIn={setIsLoggedIn} // Pass setIsLoggedIn to Header
        />
        <div className="p-6">
          {/* Conditionally render SendFriendRequest only if the user is logged in */}
          {userId ? (
            <SendFriendRequest
              userId={userId}
              accessToken={accessToken}
              setUserId={setUserId} // Pass setUserId function to SendFriendRequest
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}

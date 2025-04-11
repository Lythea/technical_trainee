import { useState, useEffect } from "react";
import { FaCheck, FaTimes } from "react-icons/fa"; // Import react-icons
import supabase from "@/lib/supabaseClient"; // Your supabase client

interface SidebarProps {
  userId: string | null;
  accessToken: string | null;
  setUserId: React.Dispatch<React.SetStateAction<string | null>>;
  setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
}

const Sidebar: React.FC<SidebarProps> = ({
  userId,
  accessToken,
  setUserId,
  setIsLoggedIn,
}) => {
  const [friends, setFriends] = useState<any[]>([]);
  const [friendRequests, setFriendRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fetchFriendData = async () => {
    if (userId) {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/getUsers");
        if (!response.ok) throw new Error("Failed to fetch users");

        const usersData = await response.json();
        const users = usersData.users || [];

        const { data: friendsData, error: friendsError } = await supabase
          .from("friends")
          .select("*")
          .or(`user_id.eq.${userId},friend_id.eq.${userId}`);

        if (friendsError) throw new Error(friendsError.message);

        // Filter out accepted friends and pending requests where userId is the friend_id
        const acceptedFriends = friendsData.filter(
          (friend: any) =>
            friend.status === "accepted" &&
            (friend.user_id === userId || friend.friend_id === userId)
        );

        const pendingRequests = friendsData.filter(
          (friend: any) =>
            friend.status === "pending" && friend.friend_id === userId // Check where friend_id matches the userId for pending requests
        );

        // Fetch secret messages for accepted friends
        const acceptedFriendsWithMessages = await Promise.all(
          acceptedFriends.map(async (friend: any) => {
            const friendUserId =
              friend.friend_id === userId ? friend.user_id : friend.friend_id;

            const { data: profile, error: profileError } = await supabase
              .from("profiles")
              .select("secret_message")
              .eq("id", friendUserId)
              .single();

            const matchedUser = users.find(
              (user: any) => user.id === friendUserId
            );

            return {
              ...friend,
              secret_message: profile?.secret_message || null,
              email: matchedUser?.email || null,
            };
          })
        );

        console.log(userId, friendsData, acceptedFriendsWithMessages);
        setFriends(acceptedFriendsWithMessages);
        setFriendRequests(pendingRequests);
      } catch (error: any) {
        setError(error.message);
        console.error("Error fetching friend data:", error.message);
      } finally {
        setLoading(false);
      }
    }
  };
  useEffect(() => {
    if (userId) {
      fetchFriendData();
    } else {
      setFriends([]);
      setFriendRequests([]);
    }
  }, [userId]);

  const acceptRequest = async (requestId: string) => {
    try {
      const requestToAccept = friendRequests.find(
        (req) => req.id === requestId
      );
      if (!requestToAccept) {
        alert("Request not found.");
        return;
      }

      const { error } = await supabase
        .from("friends")
        .update({ status: "accepted" })
        .eq("id", requestId);

      if (error) throw error;

      alert("Friend request accepted!");

      setFriendRequests((prevState) =>
        prevState.filter((req) => req.id !== requestId)
      );

      setFriends((prevState) => [
        ...prevState,
        {
          ...requestToAccept,
          status: "accepted",
          username: requestToAccept.email,
        },
      ]);
    } catch (error) {
      console.error("Error accepting friend request:", error);
      alert("Error accepting friend request.");
    }
  };

  const declineRequest = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from("friends")
        .delete()
        .eq("id", requestId);

      if (error) throw error;

      alert("Friend request declined!");

      setFriendRequests((prevState) =>
        prevState.filter((req) => req.id !== requestId)
      );
      window.location.reload();
    } catch (error) {
      console.error("Error declining friend request:", error);
      alert("Error declining friend request.");
    }
  };

  return (
    <div className="w-72 h-screen bg-gray-800 text-white p-4">
      <h2 className="text-2xl font-semibold mb-4">Friends</h2>

      {loading && <p className="text-sm text-gray-400">Loading...</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}

      <div>
        <h3 className="font-semibold mb-2">Your Friends</h3>
        <ul>
          {friends.length > 0 ? (
            friends.map((friend: any) => (
              <li
                key={friend.id}
                className="mb-4 border border-gray-700 rounded-lg p-4"
              >
                <span className="text-white font-medium">{friend.email}</span>{" "}
                <br />
                <span className="text-white font-light text-sm">
                  {friend.friend_id}
                </span>
                {friend.secret_message && (
                  <p className="text-sm text-green-400 mt-2">
                    Secret Message: {friend.secret_message}
                  </p>
                )}
              </li>
            ))
          ) : (
            <p>No friends yet</p>
          )}
        </ul>
      </div>

      <div>
        <h3 className="font-semibold mb-2">Pending Requests</h3>
        <ul>
          {friendRequests.length > 0 ? (
            friendRequests.map((request: any) => (
              <li
                key={request.id}
                className="mb-4 border border-gray-700 rounded-lg p-4 hover:bg-gray-700 transition-all"
              >
                <span className="text-sm text-gray-400">{request.email}</span>
                <div style={{ whiteSpace: "normal" }}>
                  <span className="text-xs text-gray-500">
                    ID: {request.user_id}
                  </span>
                </div>
                <div className="flex justify-between gap-3">
                  <button
                    onClick={() => acceptRequest(request.id)}
                    className="px-4 py-2 w-full bg-green-500 text-white text-sm rounded-lg flex items-center justify-center gap-2 hover:bg-green-600 transition-colors duration-200"
                  >
                    <FaCheck className="text-lg" /> Accept
                  </button>
                  <button
                    onClick={() => declineRequest(request.id)}
                    className="px-4 py-2 w-full bg-red-500 text-white text-sm rounded-lg flex items-center justify-center gap-2 hover:bg-red-600 transition-colors duration-200"
                  >
                    <FaTimes className="text-lg" /> Decline
                  </button>
                </div>
              </li>
            ))
          ) : (
            <p className="text-gray-500">No pending requests</p>
          )}
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;

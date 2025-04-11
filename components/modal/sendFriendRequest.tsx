import { FC, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import supabase from "@/lib/supabaseClient";
import Cookies from "js-cookie";

interface SendFriendRequestProps {
  userId: string | null;
  accessToken: string | null;
  setUserId: React.Dispatch<React.SetStateAction<string | null>>;
}

const SendFriendRequest: FC<SendFriendRequestProps> = ({
  userId,
  accessToken,
  setUserId,
}) => {
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [friendsData, setFriendsData] = useState<any[]>([]);
  const [pendingRequests, setPendingRequests] = useState<string[]>([]);

  const router = useRouter();
  const fetchUsers = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch all users
      const response = await fetch("/api/getUsers");
      if (!response.ok) throw new Error("Failed to fetch users");

      const usersData = await response.json();
      const users = usersData.users || [];

      // Fetch all friend relations involving the current user where user_id or friend_id matches the current userId
      const { data: friendsData, error: friendsError } = await supabase
        .from("friends")
        .select("*")
        .or(`user_id.eq.${userId},friend_id.eq.${userId}`);

      if (friendsError) throw new Error(friendsError.message);

      // Filter out the current user and users who are already friends
      const filteredUsers = users.filter(
        (user: { id: string | null }) =>
          user.id !== userId && // Exclude current user
          !friendsData.some(
            (friend: { user_id: string; friend_id: string; status: string }) =>
              (friend.friend_id === user.id || friend.user_id === user.id) &&
              friend.status === "accepted"
          )
      );
      console.log(userId, users, friendsData);
      setAllUsers(users);
      setFilteredUsers(filteredUsers);
      setFriendsData(friendsData); // Set the friendsData state
    } catch (error: any) {
      console.error("❌ Error fetching users or friends:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!userId) return;

    fetchUsers();
  }, [userId]);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value.toLowerCase();
    setSearchQuery(query);

    const filtered = allUsers.filter((user) =>
      user?.user_metadata?.username?.toLowerCase().includes(query)
    );

    setFilteredUsers(filtered);
  };
  const sendFriendRequest = async (friendId: string) => {
    try {
      const currentUser = allUsers.find((user) => user.id === userId);
      const email = currentUser?.user_metadata?.email;
      if (!email) throw new Error("Current user's email not found.");

      const { error } = await supabase.from("friends").insert([
        {
          user_id: userId,
          friend_id: friendId,
          status: "pending",
          email: email,
        },
      ]);
      if (error) throw error;

      // Immediately show the button as pending
      setPendingRequests((prev) => [...prev, friendId]);

      alert("Friend request sent!");
      fetchUsers(); // You can still fetch to sync from DB after
    } catch (error) {
      console.error("Error sending friend request:", error);
      alert("Error sending friend request.");
    }
  };
  const cancelFriendRequest = async (friendId: string) => {
    try {
      const { error } = await supabase
        .from("friends")
        .delete()
        .eq("user_id", userId)
        .eq("friend_id", friendId)
        .eq("status", "pending");
      if (error) throw error;

      // Remove the ID from pending state
      setPendingRequests((prev) => prev.filter((id) => id !== friendId));

      alert("Friend request cancelled.");
      fetchUsers();
    } catch (error) {
      console.error("Error cancelling friend request:", error);
      alert("Error cancelling friend request.");
    }
  };

  return (
    <div>
      <h3 className="font-semibold mb-2">Send Friend Request</h3>
      {loading && <p className="text-sm text-gray-400">Loading...</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}

      <input
        type="text"
        placeholder="Search users"
        value={searchQuery}
        onChange={handleSearch}
        className="mb-4 p-2 w-full bg-gray-700 text-white rounded"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredUsers.length > 0 ? (
          filteredUsers.map((user) => {
            // Check if there are any pending friend requests for the current user
            const friendship = friendsData.find(
              (friend) =>
                friend.friend_id === user.id || friend.user_id === user.id
            );

            // If status is 'accepted', skip rendering this user
            const isPending =
              friendship?.status === "pending" && friendship.user_id === userId; // Only show Pending if current user sent it

            return friendship?.status === "pending" &&
              friendship.friend_id === userId ? null : (
              <div
                key={user.id}
                className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out"
              >
                <div className="mb-4">
                  <p className="text-lg font-semibold text-gray-800">
                    UID: {user.id}
                  </p>
                  <p className="text-sm text-gray-500">
                    {user.user_metadata?.email || "No email available"}
                  </p>
                </div>
                <div className="flex justify-center">
                  {isPending ? (
                    <button
                      onClick={() => cancelFriendRequest(user.id)}
                      className="px-4 py-2 bg-yellow-500 text-white text-sm rounded-lg hover:bg-yellow-600 transition-colors duration-200"
                    >
                      Pending
                    </button>
                  ) : (
                    <button
                      onClick={() => sendFriendRequest(user.id)}
                      className="px-4 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors duration-200"
                    >
                      Add Friend
                    </button>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <p className="text-center text-gray-500 col-span-full">
            No available users to send a request
          </p>
        )}
      </div>
    </div>
  );
};

export default SendFriendRequest;

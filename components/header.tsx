import { FaUserCircle } from "react-icons/fa";
import { useState, useEffect, useRef } from "react";
import Modal from "@/components/modal/auth";
import SecretMessageModal from "@/components/modal/secretmessage"; // Import SecretMessageModal
import Cookies from "js-cookie";
import supabase from "@/lib/supabaseClient";

interface HeaderProps {
  userId: string | null;
  accessToken: string | null;
  setUserId: React.Dispatch<React.SetStateAction<string | null>>;
  setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
}

const Header: React.FC<HeaderProps> = ({
  userId,
  accessToken,
  setUserId,
  setIsLoggedIn,
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false); // Control modal visibility
  const [isHovered, setIsHovered] = useState(false); // Track hover state for profile icon
  const [isMenuHovered, setIsMenuHovered] = useState(false); // Track hover state for the dropdown menu
  const [secretMessage, setSecretMessage] = useState<string | null>(null); // Store the secret message
  const [isSecretMessageModalVisible, setIsSecretMessageModalVisible] =
    useState(false); // Show secret message modal
  const [isAddMessageModalVisible, setIsAddMessageModalVisible] =
    useState(false); // Show add message modal
  const [isLoggedIn, setLoggedInState] = useState<boolean>(false); // Declare local isLoggedIn state

  const profileIconRef = useRef<any>(null);
  const menuTimeoutRef = useRef<any>(null);

  // Check if the user is logged in based on cookies and fetch user session
  useEffect(() => {
    const token = Cookies.get("access_token");

    if (token) {
      // User is logged in, check for user details from Supabase session
      supabase.auth.getSession().then(({ data, error }) => {
        if (data?.session?.user) {
          const user = data.session.user;
          setUserId(user.id); // Set userId from Supabase session
          setLoggedInState(true); // Set the login state to true
          checkForSecretMessage(user.id); // Fetch the secret message after login
        } else {
          setLoggedInState(false); // If no user found in session, set logged-in state to false
        }
      });
    } else {
      setLoggedInState(false); // If no token, user is not logged in
    }
  }, [setLoggedInState, setUserId]);

  // Fetch the secret message of the logged-in user
  const checkForSecretMessage = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("secret_message")
        .eq("id", userId)
        .maybeSingle();

      if (error) throw error;
      setSecretMessage(data?.secret_message || null); // Set secret message
    } catch (error) {
      console.error("Error fetching secret message:", error);
    }
  };

  // Handle logout action
  const handleLogout = () => {
    Cookies.remove("access_token");
    setLoggedInState(false);
    setUserId(null);
  };

  // Handle view secret message action
  const handleViewSecretMessage = () => {
    setIsSecretMessageModalVisible(true);
  };

  // Handle add secret message action
  const handleAddMessage = () => {
    setIsAddMessageModalVisible(true);
    setIsSecretMessageModalVisible(false);
  };

  // Handle account deletion
  const handleDeleteAccount = async () => {
    if (
      !confirm(
        "Are you sure you want to delete your account? This action cannot be undone."
      )
    )
      return;

    try {
      const { data, error: userError } = await supabase.auth.getUser();

      // If there's an error or no user, exit early
      if (userError || !data?.user) return;

      const userId = data.user.id; // Safe access to user.id

      // Make sure userId is valid
      if (!userId) return;

      const response = await fetch("/api/deleteAccount", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ user_id: userId }),
      });

      const result = await response.json();

      if (response.ok) {
        alert("Your account has been deleted.");
        Cookies.remove("access_token");
        setLoggedInState(false); // Update state on account deletion
        setUserId(null);
        window.location.href = "/"; // Redirect to home
      } else {
        alert("Error: " + result.error);
      }
    } catch (error) {
      alert("Failed to delete account");
    }
  };

  // Handle mouse hover for the profile icon dropdown
  const handleMouseEnter = () => {
    clearTimeout(menuTimeoutRef.current);
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    menuTimeoutRef.current = setTimeout(() => {
      if (!isMenuHovered) {
        setIsHovered(false);
      }
    }, 300);
  };

  return (
    <div className="bg-white h-16 shadow px-6 flex items-center justify-between">
      <h1 className="text-2xl font-semibold">Trainee</h1>

      <div className="flex items-center space-x-2 relative">
        <div
          ref={profileIconRef}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <FaUserCircle className="text-gray-600 text-2xl cursor-pointer" />
        </div>

        {isHovered && userId && (
          <div
            className="absolute top-full right-0 mt-2 bg-white shadow-lg border rounded-md w-48 p-2 space-y-2"
            onMouseEnter={() => setIsMenuHovered(true)}
            onMouseLeave={() => setIsMenuHovered(false)}
          >
            <button
              onClick={handleDeleteAccount}
              className="w-full text-red-600 hover:bg-red-50 py-2 text-sm text-left"
            >
              Delete my Account
            </button>
            <button
              onClick={handleViewSecretMessage}
              className="w-full text-blue-600 hover:bg-blue-50 py-2 text-sm text-left"
            >
              View Secret Message
            </button>
          </div>
        )}

        {userId ? (
          <button
            onClick={handleLogout}
            className="text-red-600 border border-red-600 px-4 py-2 rounded-md hover:bg-red-50"
          >
            Logout
          </button>
        ) : (
          <button
            onClick={() => setIsModalVisible(true)}
            className="text-blue-600 border border-blue-600 px-4 py-2 rounded-md hover:bg-blue-50"
          >
            Sign In / Sign Up
          </button>
        )}
      </div>

      {/* Secret Message Modal */}
      <SecretMessageModal
        visible={isSecretMessageModalVisible}
        onClose={() => setIsSecretMessageModalVisible(false)}
        secretMessage={secretMessage}
        setSecretMessage={setSecretMessage}
        openAddMessageModal={handleAddMessage}
        userId={userId}
      />

      {/* Authentication Modal */}
      <Modal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        setIsLoggedIn={setIsLoggedIn}
        setUserId={setUserId} // Pass setUserId function as a prop to Modal
      />
    </div>
  );
};

export default Header;

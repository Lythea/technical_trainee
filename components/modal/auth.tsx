import React, { useState } from "react";
import supabase from "@/lib/supabaseClient";
import Cookies from "js-cookie"; // Import js-cookie

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
  setUserId: React.Dispatch<React.SetStateAction<string | null>>; // Add setUserId to the props interface
}

const Modal: React.FC<ModalProps> = ({
  visible,
  onClose,
  setIsLoggedIn,
  setUserId,
}) => {
  const [isSignUp, setIsSignUp] = useState(false); // Toggle between SignIn and SignUp
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClose = () => {
    setIsSignUp(false);
    onClose();
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Check if email is confirmed
      if (data?.user?.email_confirmed_at === null) {
        alert(
          "Your email is not confirmed. Please check your inbox for the confirmation email."
        );
        return;
      }

      // Access the user session to retrieve the access token
      const accessToken = data?.session?.access_token;

      if (accessToken) {
        // Store the token in a secure cookie (set HttpOnly and Secure flags as needed)
        Cookies.set("access_token", accessToken, {
          expires: 7, // Expires in 7 days
          secure: true, // Set to true if your site uses HTTPS
          sameSite: "Strict", // Optional, recommended for security
        });

        // Update the userId in the parent state directly
        const userId = data?.user?.id;
        if (userId) {
          setUserId(userId); // Pass userId to the parent component (Header)
        }

        // Update the parent state to reflect login
        setIsLoggedIn(true);
        alert(`Welcome back, ${data?.user?.email}.`);
        onClose(); // Close modal on successful sign-in
      } else {
        alert("Token generation failed.");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Sign Up Function
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      // Optionally send a confirmation email or provide user feedback
      alert(
        `Account created for ${data?.user?.email}. Please check your inbox for a confirmation email.`
      );

      // Update the parent state to reflect login
      setIsLoggedIn(true);

      setIsSignUp(false); // Switch to Sign In after successful sign-up
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center transition-opacity ${
        visible ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      <div className="bg-white rounded-lg w-96 p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            {isSignUp ? "Sign Up" : "Sign In"}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-600 text-lg font-semibold"
          >
            &times;
          </button>
        </div>

        {/* Form */}
        <form onSubmit={isSignUp ? handleSignUp : handleSignIn}>
          <div className="mb-4">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-600"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full mt-1 p-2 border border-gray-300 rounded-md"
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-600"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full mt-1 p-2 border border-gray-300 rounded-md"
              placeholder="Enter your password"
              required
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
            disabled={loading}
          >
            {loading ? "Loading..." : isSignUp ? "Sign Up" : "Sign In"}
          </button>
        </form>

        {/* Switch between Sign In and Sign Up */}
        <div className="mt-4 text-center">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-blue-600 hover:underline"
          >
            {isSignUp
              ? "Already have an account? Sign In"
              : "Don't have an account? Sign Up"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;

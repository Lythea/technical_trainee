import { useState, useEffect } from "react";
import Cookies from "js-cookie"; // For managing the token in cookies
import supabase from "@/lib/supabaseClient"; // Import your supabase client

interface SecretMessageModalProps {
  visible: boolean;
  onClose: () => void;
  secretMessage: string | null;
  setSecretMessage: React.Dispatch<React.SetStateAction<string | null>>;
  openAddMessageModal: () => void; // Add the openAddMessageModal function here
  userId: string | null;
}

const SecretMessageModal: React.FC<SecretMessageModalProps> = ({
  visible,
  onClose,
  secretMessage,
  setSecretMessage,
  userId, // Receive userId as a prop
}) => {
  const [message, setMessage] = useState(secretMessage || ""); // Default message if there is one
  const [loading, setLoading] = useState(false); // To track loading state
  const [error, setError] = useState<string | null>(null); // For error handling
  const [isAddMessageModalVisible, setIsAddMessageModalVisible] =
    useState(false);

  useEffect(() => {
    setMessage(secretMessage || "");
  }, [secretMessage]);

  // Fetch the secret message when the modal opens
  useEffect(() => {
    const fetchSecretMessage = async () => {
      if (userId) {
        try {
          setLoading(true);
          const { data, error } = await supabase
            .from("profiles")
            .select("secret_message")
            .eq("id", userId)
            .single(); // Fetch the secret message for the specific user

          if (error) {
            throw new Error(error.message);
          }

          setSecretMessage(data?.secret_message || null); // Update state with fetched message
          setMessage(data?.secret_message || "");
        } catch (err) {
          setError("Error fetching secret message");
          console.error("Error fetching secret message", err);
        } finally {
          setLoading(false);
        }
      }
    };

    if (visible && userId) {
      fetchSecretMessage();
    }
  }, [visible, userId, setSecretMessage]);

  // Save the secret message
  const handleSaveMessage = async (newMessage: string) => {
    if (newMessage.trim() && userId) {
      try {
        setLoading(true);

        // Use the 'id' column as the conflict key
        const { error } = await supabase.from("profiles").upsert(
          { id: userId, secret_message: newMessage }, // The data you're inserting
          { onConflict: "id" } // Conflict column should be a string (not an array)
        );

        if (error) {
          throw new Error(error.message);
        }

        setSecretMessage(newMessage); // Save the message in state
        setMessage(newMessage); // Update local message state
        setIsAddMessageModalVisible(false); // Close AddMessageModal
        onClose(); // Close the secret message modal
      } catch (err) {
        setError("Error saving secret message");
        console.error("Error saving secret message", err);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleEdit = () => {
    setIsAddMessageModalVisible(true); // Trigger the AddMessageModal to edit the message
    onClose(); // Close the current modal
  };

  return (
    <>
      {/* Secret Message Modal */}
      <div
        className={`fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center transition-opacity ${
          visible ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="bg-white p-6 rounded-lg w-96">
          <h2 className="text-xl font-semibold mb-4">
            {secretMessage ? "Your Secret Message" : "Add Secret Message"}
          </h2>

          {/* If there's no secret message, show confirmation before proceeding */}
          {secretMessage === null ? (
            <div>
              <p className="mb-4">
                You don't have a secret message yet. Do you want to add one?
              </p>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setIsAddMessageModalVisible(true)} // Open the AddMessageModal
                  className="px-4 py-2 text-white bg-blue-600 rounded-md"
                >
                  Yes, Add Message
                </button>
              </div>
            </div>
          ) : (
            // Display the secret message if it is not null
            <div>
              <p className="mb-4">{secretMessage}</p>

              <div className="mt-4 flex justify-end space-x-4">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md"
                >
                  Close
                </button>

                {/* Show the Edit button only if there is a secret message */}
                <button
                  onClick={handleEdit}
                  className="px-4 py-2 text-white bg-yellow-600 rounded-md"
                >
                  Edit
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Message Modal */}
      {isAddMessageModalVisible && (
        <div
          className={`fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center transition-opacity ${
            isAddMessageModalVisible
              ? "opacity-100"
              : "opacity-0 pointer-events-none"
          }`}
        >
          <div className="bg-white p-6 rounded-lg w-96">
            <h2 className="text-xl font-semibold mb-4">
              Add Your Secret Message
            </h2>
            <textarea
              placeholder="Enter your secret message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-2"
              rows={4}
            />
            <div className="mt-4 flex justify-end space-x-4">
              <button
                onClick={() => setIsAddMessageModalVisible(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSaveMessage(message)}
                className="px-4 py-2 text-white bg-blue-600 rounded-md"
              >
                Save Message
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SecretMessageModal;

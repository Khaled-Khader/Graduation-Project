import { MessageCircle } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useChatOperations } from "../hooks/useChatOperations";
import { useAuth } from "../Auth/AuthHook";

export default function ChatButton({ providerId, onChatStarted }) {
  const { startChat, startChatLoading } = useChatOperations();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isConfirming, setIsConfirming] = useState(false);

  const handleStartChat = () => {
    // Only pet owners can start chats
    if (user?.role !== "OWNER") {
      alert("Only pet owners can start chats with veterinarians");
      setIsConfirming(false);
      return;
    }

    startChat(providerId, {
      onSuccess: (chat) => {
        setIsConfirming(false);
        if (onChatStarted) {
          onChatStarted(chat);
        }
        navigate("/app/chat", { state: { chatId: chat.id } });
      },
      onError: (error) => {
        setIsConfirming(false);
        alert(error?.message || "Failed to start chat.");
      },
    });
  };

  // Don't show button if user is not a pet owner
  if (user?.role !== "OWNER") {
    return null;
  }

  return (
    <>
      <button
        onClick={() => setIsConfirming(true)}
        disabled={startChatLoading}
        className="
          flex items-center gap-2
          bg-[#6B8CFF] hover:bg-[#6B8CFF]/80
          text-white font-semibold
          px-6 py-3
          rounded-xl
          transition
          disabled:opacity-50 disabled:cursor-not-allowed
          shadow-lg hover:shadow-[0_0_15px_#6B8CFF40]
        "
      >
        <MessageCircle className="w-5 h-5" />
        Start Chat
      </button>

      {/* Confirmation Modal */}
      {isConfirming && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#0F1538] border border-[#6B8CFF]/25 rounded-2xl p-6 max-w-sm w-full">
            <h3 className="text-[#E6ECFF] font-semibold text-lg mb-2">
              Start New Chat
            </h3>
            <p className="text-[#B8C4FF] mb-6">
              Start a private conversation with this veterinarian/clinic?
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setIsConfirming(false)}
                className="flex-1 px-4 py-2 rounded-lg border border-[#6B8CFF]/25 text-[#B8C4FF] hover:bg-[#1a2452] transition"
              >
                Cancel
              </button>
              <button
                onClick={handleStartChat}
                disabled={startChatLoading}
                className="flex-1 px-4 py-2 rounded-lg bg-[#6B8CFF] text-white hover:bg-[#6B8CFF]/80 transition disabled:opacity-50"
              >
                {startChatLoading ? "Starting..." : "Start Chat"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

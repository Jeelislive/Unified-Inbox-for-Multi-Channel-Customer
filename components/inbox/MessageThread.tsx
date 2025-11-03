"use client";

import { useState, useEffect } from "react";
import { MessageDirection } from "@prisma/client";
import { cn } from "@/lib/utils";

type Contact = any;
type User = any;
type Message = any;

interface MessageThreadProps {
  contact: Contact;
  user: User;
  onOpenContactModal: () => void;
  onToggleSidebar: () => void;
}

/**
 * Message thread display with send functionality
 */
export default function MessageThread({
  contact,
  user,
  onOpenContactModal,
  onToggleSidebar,
}: MessageThreadProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState<"SMS" | "WHATSAPP">(
    "SMS"
  );

  // Fetch messages for the selected contact
  useEffect(() => {
    async function fetchMessages() {
      try {
        const res = await fetch(`/api/messages?contactId=${contact.id}`);
        if (res.ok) {
          const data = await res.json();
          setMessages(data);
        }
      } catch (error) {
        console.error("Failed to fetch messages:", error);
      }
    }

    fetchMessages();
  }, [contact.id]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || loading) return;

    setLoading(true);
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contactId: contact.id,
          content: newMessage,
          channel: selectedChannel,
        }),
      });

      if (res.ok) {
        const message = await res.json();
        setMessages([...messages, message]);
        setNewMessage("");
      } else {
        const error = await res.json();
        alert(error.error || "Failed to send message");
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      alert("Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="h-16 border-b border-gray-200 flex items-center justify-between px-4 bg-white">
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-md hover:bg-gray-100"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>

          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
            {contact.name?.[0]?.toUpperCase() || "?"}
          </div>

          <div>
            <h2 className="text-sm font-semibold text-gray-900">
              {contact.name || contact.phoneNumber || "Unknown"}
            </h2>
            <p className="text-xs text-gray-500">
              {contact.phoneNumber || contact.email}
            </p>
          </div>
        </div>

        <button
          onClick={onOpenContactModal}
          className="p-2 rounded-md hover:bg-gray-100"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">No messages yet</p>
          </div>
        )}

        {messages.map((message: Message) => (
          <div
            key={message.id}
            className={cn(
              "flex",
              message.direction === MessageDirection.OUTBOUND
                ? "justify-end"
                : "justify-start"
            )}
          >
            <div
              className={cn(
                "max-w-md px-4 py-2 rounded-lg",
                message.direction === MessageDirection.OUTBOUND
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-900 border border-gray-200"
              )}
            >
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              <div
                className={cn(
                  "flex items-center gap-2 mt-1 text-xs",
                  message.direction === MessageDirection.OUTBOUND
                    ? "text-blue-100"
                    : "text-gray-500"
                )}
              >
                <span>{getChannelIcon(message.channel)}</span>
                <span>
                  {new Date(message.createdAt).toLocaleTimeString("en-US", {
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </span>
                {message.status && (
                  <span className="capitalize">
                    {message.status.toLowerCase()}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 p-4 bg-white">
        {/* Channel Selector */}
        <div className="flex gap-2 mb-2">
          <button
            type="button"
            onClick={() => setSelectedChannel("SMS")}
            className={cn(
              "px-3 py-1 text-sm rounded-md transition-colors",
              selectedChannel === "SMS"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            )}
          >
            📱 SMS
          </button>
          <button
            type="button"
            onClick={() => setSelectedChannel("WHATSAPP")}
            className={cn(
              "px-3 py-1 text-sm rounded-md transition-colors",
              selectedChannel === "WHATSAPP"
                ? "bg-green-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            )}
          >
            💚 WhatsApp
          </button>
        </div>

        {/* Message Input */}
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={`Type a ${selectedChannel} message...`}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !newMessage.trim()}
            className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Sending..." : "Send"}
          </button>
        </form>
      </div>
    </div>
  );
}

function getChannelIcon(channel: string) {
  const icons: Record<string, string> = {
    SMS: "📱",
    WHATSAPP: "💚",
    EMAIL: "📧",
    TWITTER: "🐦",
    FACEBOOK: "👍",
    INSTAGRAM: "📷",
  };
  return icons[channel] || "💬";
}
